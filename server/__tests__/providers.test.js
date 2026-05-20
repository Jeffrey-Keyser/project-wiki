import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { invoke, resolveProviderConfig } from '../providers.js';

async function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-providers-'));
  try {
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeExecutable(dir, name, body) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, body, 'utf8');
  fs.chmodSync(file, 0o755);
  return file;
}

function fixtureEnv(dir, extra = {}) {
  return {
    ...process.env,
    ...extra,
    PATH: `${dir}:${process.env.PATH || ''}`,
  };
}

test('invoke uses claude inline mode with a temp system prompt file and cleans it up', async () => {
  await withTempDir(async (dir) => {
    const capturePath = path.join(dir, 'claude-capture.json');
    writeExecutable(
      dir,
      'claude',
      `#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
const systemIndex = args.indexOf('--system-prompt-file');
const systemPath = systemIndex >= 0 ? args[systemIndex + 1] : '';
const stdin = fs.readFileSync(0, 'utf8');
fs.writeFileSync(${JSON.stringify(capturePath)}, JSON.stringify({
  args,
  stdin,
  systemPath,
  systemExistsDuringRun: systemPath ? fs.existsSync(systemPath) : false,
  systemBody: systemPath ? fs.readFileSync(systemPath, 'utf8') : '',
}, null, 2));
process.stdout.write('hello from claude\\n');
`,
    );

    const logs = [];
    const result = await invoke({
      provider: 'claude',
      model: 'opus',
      prompt: 'Say hello.',
      systemPrompt: 'System prompt body.',
      promptMode: 'inline',
      cwd: dir,
      env: fixtureEnv(dir),
      logger: { log: (line) => logs.push(line) },
      purpose: 'unit-test',
    });

    const capture = JSON.parse(fs.readFileSync(capturePath, 'utf8'));
    assert.equal(result.stdout, 'hello from claude\n');
    assert.equal(result.exitCode, 0);
    assert.match(logs[0], /\[providers\] purpose=unit-test provider=claude binary=claude mode=inline model=opus/);
    assert.deepEqual(capture.stdin, '');
    assert.ok(capture.args.includes('--print'));
    assert.ok(capture.args.includes('--dangerously-skip-permissions'));
    assert.ok(capture.args.includes('--permission-mode'));
    assert.ok(capture.args.includes('--system-prompt-file'));
    assert.equal(capture.systemExistsDuringRun, true);
    assert.equal(capture.systemBody, 'System prompt body.');
    assert.equal(fs.existsSync(capture.systemPath), false);
    assert.equal(capture.args.at(-1), 'Say hello.');
  });
});

test('invoke uses codex stdin mode and includes the trailing dash sentinel', async () => {
  await withTempDir(async (dir) => {
    const capturePath = path.join(dir, 'codex-capture.json');
    writeExecutable(
      dir,
      'codex',
      `#!/usr/bin/env node
const fs = require('fs');
fs.writeFileSync(${JSON.stringify(capturePath)}, JSON.stringify({
  args: process.argv.slice(2),
  stdin: fs.readFileSync(0, 'utf8'),
}, null, 2));
process.stdout.write('codex ok\\n');
`,
    );

    const result = await invoke({
      provider: 'codex',
      model: 'gpt-5.4',
      prompt: 'Prompt via stdin',
      promptMode: 'stdin',
      cwd: dir,
      env: fixtureEnv(dir),
      logger: { log() {} },
    });

    const capture = JSON.parse(fs.readFileSync(capturePath, 'utf8'));
    assert.equal(result.stdout, 'codex ok\n');
    assert.deepEqual(capture.stdin, 'Prompt via stdin');
    assert.deepEqual(capture.args.slice(0, 4), [
      'exec',
      '--dangerously-bypass-approvals-and-sandbox',
      '--skip-git-repo-check',
      '-m',
    ]);
    assert.equal(capture.args.at(-1), '-');
  });
});

test('invoke measures wall-clock duration within a practical tolerance', async () => {
  await withTempDir(async (dir) => {
    writeExecutable(
      dir,
      'kimi',
      `#!/usr/bin/env bash
sleep 0.25
printf 'kimi ok\\n'
`,
    );

    const result = await invoke({
      provider: 'kimi',
      prompt: 'Short prompt',
      promptMode: 'inline',
      cwd: dir,
      env: fixtureEnv(dir),
      logger: { log() {} },
    });

    assert.equal(result.stdout, 'kimi ok\n');
    assert.ok(result.durationMs >= 50, `expected duration >= 50ms, got ${result.durationMs}`);
    assert.ok(result.durationMs <= 450, `expected duration <= 450ms, got ${result.durationMs}`);
  });
});

test('invoke includes the stderr tail when a provider exits non-zero', async () => {
  await withTempDir(async (dir) => {
    writeExecutable(
      dir,
      'kimi',
      `#!/usr/bin/env bash
for n in $(seq 1 12); do
  echo "stderr line $n" >&2
done
exit 7
`,
    );

    await assert.rejects(
      () =>
        invoke({
          provider: 'kimi',
          prompt: 'fail',
          promptMode: 'stdin',
          cwd: dir,
          env: fixtureEnv(dir),
          logger: { log() {} },
        }),
      (err) => {
        assert.match(err.message, /provider "kimi" exited with code 7/);
        assert.doesNotMatch(err.message, /\nstderr line 1\n/);
        assert.doesNotMatch(err.message, /\nstderr line 2\n/);
        assert.match(err.message, /stderr line 12/);
        return true;
      },
    );
  });
});

test('resolveProviderConfig honors new env vars and keeps scaffold aliases as fallback only', () => {
  const env = {
    PROJECT_WIKI_AGENT_PROVIDER: 'kimi',
    PROJECT_WIKI_GENERATOR_PROVIDER: 'codex',
    PROJECT_WIKI_GENERATOR_MODEL: 'gpt-5.4',
    PROJECT_WIKI_SCAFFOLDER_PROVIDER: 'claude',
    PROJECT_WIKI_SCAFFOLDER_MODEL: 'opus',
    PROJECT_WIKI_REVIEWER_PROVIDER: 'claude',
    PROJECT_WIKI_REVIEWER_MODEL: 'sonnet',
    PROJECT_WIKI_BULK_PROVIDER: 'kimi',
  };

  assert.deepEqual(resolveProviderConfig('generator', env), {
    role: 'generator',
    provider: 'codex',
    model: 'gpt-5.4',
  });
  assert.deepEqual(resolveProviderConfig('reviewer', env), {
    role: 'reviewer',
    provider: 'claude',
    model: 'sonnet',
  });
  assert.deepEqual(resolveProviderConfig('bulk', env), {
    role: 'bulk',
    provider: 'kimi',
    model: '',
  });
  assert.deepEqual(resolveProviderConfig('agent', env), {
    role: 'agent',
    provider: 'kimi',
    model: '',
  });
});
