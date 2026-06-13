import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  DEFAULT_REBUILD_INTERVAL_MS,
  DEFAULT_SOURCE_CHECKOUT,
  EXISTING_PAGES_CHAR_LIMIT,
  MIN_GENERATED_PAGE_LENGTH,
  WIKI_EVENTS_EXCHANGE,
  WIKI_UPDATER_QUEUE,
  WIKI_UPDATE_ROUTING_KEY,
  buildPromptPayload,
  getRabbitMqUrl,
  handleUpdateMessage,
  parseGeneratedPages,
  parseUpdateMessage,
  pollForAstroRebuild,
  startUpdater,
} from '../updater.js';

const FIXTURE_PAGE = `---
title: dev-inbox
description: Fixture wiki page
---

## At a glance

dev-inbox coordinates task planning and execution across isolated worktrees.

## References

- Existing reference to \`scripts/manager-standalone.sh\`

\`\`\`mermaid
flowchart TD
  A[Planner] --> B[Worker]
\`\`\`
`;

test('getRabbitMqUrl defaults to local RabbitMQ and validates protocol', () => {
  assert.equal(getRabbitMqUrl({}), 'amqp://localhost:5672');
  assert.throws(
    () => getRabbitMqUrl({ RABBITMQ_URL: 'http://localhost:5672' }),
    /must use amqp: or amqps:/,
  );
});

test('parseUpdateMessage extracts merged PR metadata when present', () => {
  const parsed = parseUpdateMessage(
    Buffer.from(
      JSON.stringify({
        repository: { full_name: 'Jeffrey-Keyser/dev-inbox' },
        run_id: 'run-123',
        trace_id: 'trace-123',
        commit: { sha: 'abc1234567', message: 'fallback subject' },
        pull_request: {
          number: 42,
          title: 'Wire the wiki updater',
          body: 'Merged via orchestrated slice.',
          files: [{ path: 'server/updater.js', summary: 'Adds replay-safe updater logic' }],
        },
      }),
      'utf8',
    ),
  );

  assert.equal(parsed.repoFullName, 'Jeffrey-Keyser/dev-inbox');
  assert.equal(parsed.runId, 'run-123');
  assert.equal(parsed.traceId, 'trace-123');
  assert.equal(parsed.prNumber, 42);
  assert.equal(parsed.title, 'Wire the wiki updater');
  assert.equal(parsed.files[0].path, 'server/updater.js');
});

test('buildPromptPayload truncates existing pages near the 50KB cap', () => {
  const payload = buildPromptPayload({
    repoFullName: 'Jeffrey-Keyser/dev-inbox',
    repoDirName: 'dev-inbox',
    update: {
      sha: 'abc123',
      title: 'Prompt payload test',
      prNumber: 9,
      prBody: 'PR body',
      files: [{ path: 'server/updater.js', summary: 'updated updater' }],
    },
    existingPages: [
      { name: 'Home.md', content: 'x'.repeat(EXISTING_PAGES_CHAR_LIMIT) },
      { name: 'Architecture.md', content: 'y'.repeat(1024) },
    ],
  });

  assert.ok(payload.includes('Repository: Jeffrey-Keyser/dev-inbox'));
  assert.ok(payload.includes('[truncated]'));
  assert.ok(!payload.includes('Architecture.md'));
});

test('parseGeneratedPages parses strict JSON object output', () => {
  assert.deepEqual(parseGeneratedPages('{"trace_id":"abc","pages":[]}'), {
    traceId: 'abc',
    pages: [],
  });
});

test('parseGeneratedPages recovers JSON wrapped in prose or code fences', () => {
  // chatty model: prose preamble + fenced JSON
  assert.deepEqual(
    parseGeneratedPages('Based on the change, here is the update:\n\n```json\n{"trace_id":"x","pages":[]}\n```'),
    { traceId: 'x', pages: [] },
  );
  // prose preamble + bare JSON object, no fence
  assert.deepEqual(
    parseGeneratedPages('Here you go: {"pages":[{"page_slug":"home","content":"hi"}]}'),
    { traceId: '', pages: [{ pageSlug: 'home', content: 'hi' }] },
  );
  // genuinely no JSON object -> still throws
  assert.throws(
    () => parseGeneratedPages('I could not complete this request.'),
    /generator returned invalid JSON/,
  );
});

test('startUpdater declares the durable queue/binding and consumes with manual ack', async () => {
  const calls = [];
  let consumeHandler = null;
  const channel = {
    async assertExchange(name, type, options) {
      calls.push(['assertExchange', name, type, options]);
    },
    async assertQueue(name, options) {
      calls.push(['assertQueue', name, options]);
    },
    async bindQueue(queue, exchange, routingKey) {
      calls.push(['bindQueue', queue, exchange, routingKey]);
    },
    async consume(queue, handler, options) {
      calls.push(['consume', queue, options]);
      consumeHandler = handler;
    },
    ack(message) {
      calls.push(['ack', message]);
    },
    publish(exchange, routingKey, body) {
      calls.push(['publish', exchange, routingKey, JSON.parse(body.toString('utf8'))]);
    },
    async close() {
      calls.push(['channel.close']);
    },
  };
  const connection = {
    async createChannel() {
      calls.push(['createChannel']);
      return channel;
    },
    async close() {
      calls.push(['connection.close']);
    },
  };
  const logs = [];
  const logger = {
    log: (line) => logs.push(line),
    error: (line) => logs.push(`ERR:${line}`),
  };

  const updater = await startUpdater({
    connect: async (url) => {
      calls.push(['connect', url]);
      return connection;
    },
    env: { RABBITMQ_URL: 'amqp://guest:guest@localhost:5672' },
    logger,
    registerSignalHandlers: false,
  });

  assert.deepEqual(calls.slice(0, 5), [
    ['connect', 'amqp://guest:guest@localhost:5672'],
    ['createChannel'],
    ['assertExchange', WIKI_EVENTS_EXCHANGE, 'topic', { durable: true }],
    ['assertQueue', WIKI_UPDATER_QUEUE, { durable: true }],
    ['bindQueue', WIKI_UPDATER_QUEUE, WIKI_EVENTS_EXCHANGE, WIKI_UPDATE_ROUTING_KEY],
  ]);
  assert.deepEqual(calls[5], ['consume', WIKI_UPDATER_QUEUE, { noAck: false }]);
  assert.ok(
    logs.includes(
      `[updater] consuming ${WIKI_UPDATER_QUEUE} from ${WIKI_EVENTS_EXCHANGE} (${WIKI_UPDATE_ROUTING_KEY})`,
    ),
  );
  assert.equal(typeof consumeHandler, 'function');

  await updater.shutdown('test');
  assert.deepEqual(calls.slice(-2), [['channel.close'], ['connection.close']]);
});

test('handleUpdateMessage skips repos not on the allowlist without mutating content', async () => {
  await withStickyRepo(async ({ checkoutPath, env, message, events, logger }) => {
    fs.writeFileSync(
      path.join(checkoutPath, '.wiki-config.json'),
      JSON.stringify({ allowlist: ['Jeffrey-Keyser/other-repo'] }, null, 2) + '\n',
      'utf8',
    );

    await handleUpdateMessage(message, {
      channel: createChannelRecorder(events),
      logger,
      env,
      invokeProvider: async () => {
        throw new Error('provider should not run');
      },
      git: createGitStub(checkoutPath),
      runCommand: async () => {},
    });

    assert.equal(events.acked, 1);
    assert.equal(events.published[0].routingKey, 'wiki.event.skipped');
    assert.equal(events.published[0].payload.reason, 'repo-not-allowlisted');
    assert.equal(
      fs.readFileSync(path.join(checkoutPath, 'content', 'repos', 'dev-inbox', 'Home.md'), 'utf8'),
      FIXTURE_PAGE,
    );
  });
});

test('handleUpdateMessage treats empty or byte-identical proposals as no-op skips', async () => {
  await withStickyRepo(async ({ checkoutPath, env, message, events, logger }) => {
    const gitCalls = [];
    await handleUpdateMessage(message, {
      channel: createChannelRecorder(events),
      logger,
      env,
      invokeProvider: async () => ({
        stdout: JSON.stringify({
          pages: [{ page_slug: 'home', content: FIXTURE_PAGE }],
        }),
      }),
      git: createGitStub(checkoutPath, gitCalls),
      runCommand: async () => {},
    });

    assert.equal(events.acked, 1);
    assert.equal(events.published.at(-1).routingKey, 'wiki.event.skipped');
    assert.equal(events.published.at(-1).payload.reason, 'no-changes-proposed');
    assert.ok(!gitCalls.some((call) => call[0] === 'commit'));
  });
});

test('handleUpdateMessage rejects destructive fence stripping with a guardrail event and no commit', async () => {
  await withStickyRepo(async ({ checkoutPath, env, message, events, logger }) => {
    const gitCalls = [];
    await handleUpdateMessage(message, {
      channel: createChannelRecorder(events),
      logger,
      env,
      invokeProvider: async () => ({
        stdout: JSON.stringify({
          pages: [
            {
              page_slug: 'home',
              content: `---
title: dev-inbox
description: broken
---

## At a glance

${'x'.repeat(MIN_GENERATED_PAGE_LENGTH)}
`,
            },
          ],
        }),
      }),
      git: createGitStub(checkoutPath, gitCalls),
      runCommand: async () => {},
    });

    assert.equal(events.acked, 1);
    assert.equal(events.published.at(-1).routingKey, 'wiki.event.guardrail');
    assert.equal(events.published.at(-1).payload.reason, 'fence-strip');
    assert.ok(!gitCalls.some((call) => call[0] === 'commit'));
  });
});

test('synthetic merged PR flow updates dev-inbox page once, commits, emits page event, and skips replay', async () => {
  await withStickyRepo(async ({ checkoutPath, env, message, events, logger, stateFile }) => {
    const gitCalls = [];
    const restartCalls = [];
    const updatedPage = `---
title: dev-inbox
description: Fixture wiki page
---

## At a glance

dev-inbox coordinates task planning and execution across isolated worktrees.
Recent merged change: \`server/updater.js\` now keeps RabbitMQ acking replay-safe and logs wiki lifecycle events.

## References

- Existing reference to \`scripts/manager-standalone.sh\`
- New citation: \`server/updater.js\`

\`\`\`mermaid
flowchart TD
  A[Planner] --> B[Worker]
\`\`\`
`;

    const invokeProvider = async () => ({
      stdout: JSON.stringify({
        trace_id: 'trace-from-provider',
        pages: [{ page_slug: 'home', content: updatedPage }],
      }),
    });

    const git = createGitStub(checkoutPath, gitCalls);
    const runCommand = async (args) => {
      restartCalls.push(args);
    };

    await handleUpdateMessage(message, {
      channel: createChannelRecorder(events),
      logger,
      env: {
        ...env,
        PROJECT_WIKI_BUILD_STATE_FILE: stateFile,
      },
      invokeProvider,
      git,
      runCommand,
    });

    assert.equal(events.acked, 1);
    assert.equal(
      fs.readFileSync(path.join(checkoutPath, 'content', 'repos', 'dev-inbox', 'Home.md'), 'utf8'),
      updatedPage,
    );
    assert.ok(
      gitCalls.some(
        (call) =>
          call[0] === 'commit' &&
          call[2].includes('wiki(dev-inbox): update 1 page for Synthetic merged dev-inbox change (sha=abc1234)'),
      ),
    );
    assert.equal(events.published.filter((event) => event.routingKey === 'wiki.page.updated').length, 1);
    assert.equal(events.published.find((event) => event.routingKey === 'wiki.page.updated').payload.page_slug, 'home');
    assert.deepEqual(restartCalls, [['systemctl', '--user', 'restart', 'project-wiki.service']]);

    const replayEvents = { published: [], acked: 0 };
    await handleUpdateMessage(message, {
      channel: createChannelRecorder(replayEvents),
      logger,
      env: {
        ...env,
        PROJECT_WIKI_BUILD_STATE_FILE: stateFile,
      },
      invokeProvider,
      git,
      runCommand,
    });

    assert.equal(replayEvents.acked, 1);
    assert.equal(replayEvents.published.at(-1).routingKey, 'wiki.event.skipped');
    assert.equal(replayEvents.published.at(-1).payload.reason, 'no-changes-proposed');
    assert.equal(replayEvents.published.filter((event) => event.routingKey === 'wiki.page.updated').length, 0);
  });
});

test('pollForAstroRebuild restarts only when the pulled source checkout is newer than the last rendered build', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-build-'));
  try {
    const stateFile = path.join(dir, 'build-state.json');
    const gitCalls = [];
    const systemCalls = [];
    let currentHead = '1111111111111111111111111111111111111111';
    const git = async (args) => {
      gitCalls.push(args);
      if (args[0] === 'pull') return '';
      if (args[0] === 'rev-parse') return `${currentHead}\n`;
      throw new Error(`unexpected git call ${args.join(' ')}`);
    };
    const runCommand = async (args) => {
      systemCalls.push(args);
    };

    const first = await pollForAstroRebuild({
      sourceCheckout: dir,
      stateFile,
      intervalMs: DEFAULT_REBUILD_INTERVAL_MS,
      git,
      runCommand,
      logger: { log() {} },
    });
    assert.equal(first.restarted, true);
    assert.deepEqual(systemCalls, [['systemctl', '--user', 'restart', 'project-wiki.service']]);

    currentHead = '1111111111111111111111111111111111111111';
    const second = await pollForAstroRebuild({
      sourceCheckout: dir,
      stateFile,
      intervalMs: DEFAULT_REBUILD_INTERVAL_MS,
      git,
      runCommand,
      logger: { log() {} },
    });
    assert.equal(second.restarted, false);
    assert.equal(systemCalls.length, 1);
    assert.equal(gitCalls.filter((args) => args[0] === 'pull').length, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function createChannelRecorder(events) {
  return {
    ack() {
      events.acked += 1;
    },
    publish(exchange, routingKey, body) {
      events.published.push({
        exchange,
        routingKey,
        payload: JSON.parse(body.toString('utf8')),
      });
    },
  };
}

function createGitStub(checkoutPath, calls = []) {
  return async (args) => {
    calls.push(args);
    if (args[0] === 'pull') return '';
    if (args[0] === 'rev-parse') return '9999999999999999999999999999999999999999\n';
    if (args[0] === 'add') return '';
    if (args[0] === 'commit') return '';
    if (args[0] === 'push') return '';
    if (args[0] === 'clone') {
      throw new Error(`clone should not be needed in fixture repo ${checkoutPath}`);
    }
    throw new Error(`unexpected git call ${args.join(' ')}`);
  };
}

async function withStickyRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-updater-'));
  const checkoutPath = path.join(dir, 'source');
  fs.mkdirSync(path.join(checkoutPath, 'content', 'repos', 'dev-inbox'), {
    recursive: true,
  });
  fs.mkdirSync(path.join(checkoutPath, '.git'));
  fs.writeFileSync(
    path.join(checkoutPath, '.wiki-config.json'),
    JSON.stringify({ allowlist: ['Jeffrey-Keyser/dev-inbox'] }, null, 2) + '\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(checkoutPath, 'content', 'repos', 'dev-inbox', 'Home.md'),
    FIXTURE_PAGE,
    'utf8',
  );
  const stateFile = path.join(dir, 'build-state.json');
  const message = {
    fields: { routingKey: 'wiki.update.Jeffrey-Keyser-dev-inbox' },
    content: Buffer.from(
      JSON.stringify({
        repository: { full_name: 'Jeffrey-Keyser/dev-inbox' },
        run_id: 'run-synthetic',
        trace_id: 'trace-request',
        commit: {
          sha: 'abc1234567890',
          message: 'Synthetic merged dev-inbox change',
        },
        pull_request: {
          number: 77,
          title: 'Synthetic merged dev-inbox change',
          body: 'Updates the updater and event pipeline.',
          files: [{ path: 'server/updater.js', summary: 'Adds wiki lifecycle handling' }],
        },
      }),
      'utf8',
    ),
  };
  const env = {
    PROJECT_WIKI_SOURCE_CHECKOUT: checkoutPath,
    PROJECT_WIKI_SOURCE_REMOTE: '',
    PROJECT_WIKI_REBUILD_POLL_INTERVAL_MS: '1',
    PROJECT_WIKI_UPDATER_SYSTEM_PROMPT: 'Test system prompt',
  };
  const events = { published: [], acked: 0 };
  const logger = { log() {}, error() {} };

  try {
    await fn({ dir, checkoutPath, env, message, events, logger, stateFile });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
