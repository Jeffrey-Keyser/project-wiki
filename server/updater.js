#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { invoke, resolveProviderConfig } from './providers.js';

export const WIKI_EVENTS_EXCHANGE = 'wiki.events';
export const WIKI_UPDATER_QUEUE = 'wiki.updater.queue';
export const WIKI_UPDATE_ROUTING_KEY = 'wiki.update.#';
export const DEFAULT_SOURCE_CHECKOUT = '/var/cache/project-wiki/source';
export const DEFAULT_REBUILD_INTERVAL_MS = 30_000;
export const EXISTING_PAGES_CHAR_LIMIT = 50 * 1024;
export const MIN_GENERATED_PAGE_LENGTH = 200;

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const PAGE_LOCKS = new Map();

const DEFAULT_UPDATER_SYSTEM_PROMPT = [
  'You update an existing project wiki in place.',
  'Return strict JSON only with this exact shape:',
  '{"trace_id":"optional-string","pages":[{"page_slug":"existing-page-slug","content":"full-markdown-page"}]}',
  'Rules:',
  '- Propose edits only for pages that already exist in the provided page set.',
  '- Do not rename pages or invent new page slugs.',
  '- Keep existing frontmatter unless the source change requires an update.',
  '- Preserve code fences, Mermaid fences, and section continuity when they still apply.',
  '- Prefer minimal, source-cited edits grounded in the merged PR metadata.',
  '- If no page should change, return {"pages":[]}.',
].join('\n');

export function getRabbitMqUrl(env = process.env) {
  const value = env.RABBITMQ_URL?.trim() || 'amqp://localhost:5672';
  let parsed;
  try {
    parsed = new URL(value);
  } catch (err) {
    throw new Error(
      `RABBITMQ_URL is invalid: ${err instanceof Error ? err.message : err}`,
    );
  }
  if (parsed.protocol !== 'amqp:' && parsed.protocol !== 'amqps:') {
    throw new Error(
      `RABBITMQ_URL must use amqp: or amqps:, got ${parsed.protocol}`,
    );
  }
  return value;
}

export function parseUpdateMessage(content) {
  const parsed = JSON.parse(Buffer.from(content).toString('utf8'));
  const sha =
    typeof parsed?.commit?.sha === 'string' ? parsed.commit.sha.trim() : '';
  const title = extractTitle(parsed);
  const repoFullName = extractRepoFullName(parsed);
  const runId = firstString(
    parsed?.run_id,
    parsed?.runId,
    parsed?.meta?.run_id,
    parsed?.metadata?.run_id,
  );
  const traceId = firstString(
    parsed?.trace_id,
    parsed?.traceId,
    parsed?.meta?.trace_id,
    parsed?.metadata?.trace_id,
  );
  const prNumber =
    typeof parsed?.pull_request?.number === 'number'
      ? parsed.pull_request.number
      : null;
  const prBody = firstString(
    parsed?.pull_request?.body,
    parsed?.pr?.body,
    parsed?.body,
  );
  const files = normalizeFiles(
    parsed?.pull_request?.files ||
      parsed?.files ||
      parsed?.changed_files ||
      parsed?.changedFiles,
  );

  return {
    raw: parsed,
    sha,
    title,
    repoFullName,
    runId,
    traceId,
    prNumber,
    prBody,
    files,
  };
}

export function buildPromptPayload({ repoFullName, repoDirName, update, existingPages }) {
  const existingPagesText = renderExistingPages(existingPages);
  return [
    `Repository: ${repoFullName}`,
    `Wiki directory: content/repos/${repoDirName}/`,
    `Merged commit sha: ${update.sha || '(missing)'}`,
    `Merged PR title: ${update.title || '(missing)'}`,
    update.prNumber != null ? `Merged PR number: #${update.prNumber}` : null,
    update.prBody ? `Merged PR body:\n${update.prBody}` : null,
    update.files.length
      ? `Changed files:\n${update.files
          .map((file) => `- ${file.path}${file.summary ? ` — ${file.summary}` : ''}`)
          .join('\n')}`
      : 'Changed files:\n- (not provided)',
    '',
    `Existing wiki pages (truncated to ${EXISTING_PAGES_CHAR_LIMIT} bytes total):`,
    existingPagesText || '(none)',
  ]
    .filter(Boolean)
    .join('\n');
}

export function parseGeneratedPages(stdout) {
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (err) {
    throw new Error(
      `generator returned invalid JSON: ${err instanceof Error ? err.message : err}`,
    );
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('generator response must be a JSON object');
  }
  if (!Array.isArray(parsed.pages)) {
    throw new Error('generator response must include a pages array');
  }
  const pages = parsed.pages.map((page, index) => {
    if (typeof page !== 'object' || page === null || Array.isArray(page)) {
      throw new Error(`pages[${index}] must be an object`);
    }
    if (typeof page.page_slug !== 'string' || !page.page_slug.trim()) {
      throw new Error(`pages[${index}].page_slug must be a non-empty string`);
    }
    if (typeof page.content !== 'string') {
      throw new Error(`pages[${index}].content must be a string`);
    }
    return {
      pageSlug: page.page_slug.trim(),
      content: page.content,
    };
  });
  return {
    traceId:
      typeof parsed.trace_id === 'string' && parsed.trace_id.trim()
        ? parsed.trace_id.trim()
        : '',
    pages,
  };
}

export function validateGeneratedPage({ repoFullName, page, existingPage }) {
  if (!existingPage) {
    return {
      ok: false,
      reason: `unknown-page:${page.pageSlug}`,
      message: `generator proposed unknown page slug "${page.pageSlug}" for ${repoFullName}`,
    };
  }

  if (Buffer.byteLength(page.content, 'utf8') < MIN_GENERATED_PAGE_LENGTH) {
    return {
      ok: false,
      reason: 'too-short',
      message: `generator proposed ${page.pageSlug} below ${MIN_GENERATED_PAGE_LENGTH} bytes`,
    };
  }

  if (hasDestructiveFenceStrip(existingPage.content, page.content)) {
    return {
      ok: false,
      reason: 'fence-strip',
      message: `generator removed fenced blocks from ${page.pageSlug}`,
    };
  }

  if (!hasSectionContinuity(existingPage.content, page.content)) {
    return {
      ok: false,
      reason: 'section-header-continuity',
      message: `generator broke section-header continuity for ${page.pageSlug}`,
    };
  }

  return { ok: true };
}

export async function ensureStickyCheckout({
  sourceCheckout = DEFAULT_SOURCE_CHECKOUT,
  remoteUrl = '',
  git = runGit,
  logger = console,
} = {}) {
  const checkoutPath = path.resolve(sourceCheckout);
  const parentDir = path.dirname(checkoutPath);
  fs.mkdirSync(parentDir, { recursive: true });

  const gitDir = path.join(checkoutPath, '.git');
  if (!fs.existsSync(gitDir)) {
    if (!remoteUrl) {
      throw new Error(
        `sticky checkout missing at ${checkoutPath} and no PROJECT_WIKI_SOURCE_REMOTE is configured`,
      );
    }
    logger.log?.(`[updater] cloning sticky checkout into ${checkoutPath}`);
    await git(['clone', remoteUrl, checkoutPath], { cwd: parentDir });
  }

  await git(['pull', '--ff-only'], { cwd: checkoutPath });
  return checkoutPath;
}

export async function pollForAstroRebuild({
  sourceCheckout,
  stateFile,
  intervalMs = DEFAULT_REBUILD_INTERVAL_MS,
  git = runGit,
  runCommand = runCommandDefault,
  logger = console,
} = {}) {
  const checkoutPath = path.resolve(sourceCheckout || DEFAULT_SOURCE_CHECKOUT);
  const statePath =
    stateFile || path.join(checkoutPath, '.wiki-updater-build-state.json');
  await git(['pull', '--ff-only'], { cwd: checkoutPath });
  const currentCommit = (await git(['rev-parse', 'HEAD'], { cwd: checkoutPath })).trim();
  const previousState = readJsonFile(statePath, { lastRenderedCommit: '' });
  const lastRenderedCommit =
    typeof previousState.lastRenderedCommit === 'string'
      ? previousState.lastRenderedCommit
      : '';

  if (currentCommit && currentCommit !== lastRenderedCommit) {
    logger.log?.(
      `[updater] source checkout advanced to ${shortSha(currentCommit)}; restarting project-wiki.service after ${Math.round(intervalMs / 1000)}s poll`,
    );
    await runCommand(['systemctl', '--user', 'restart', 'project-wiki.service'], {
      cwd: checkoutPath,
    });
    writeJsonFile(statePath, {
      lastRenderedCommit: currentCommit,
      renderedAt: new Date().toISOString(),
    });
    return { restarted: true, commit: currentCommit };
  }

  logger.log?.(
    `[updater] source checkout ${shortSha(currentCommit)} already matches last rendered build`,
  );
  return { restarted: false, commit: currentCommit };
}

export async function processWikiUpdate(message, context) {
  const {
    channel,
    logger = console,
    env = process.env,
    invokeProvider = invoke,
    git = runGit,
    runCommand = runCommandDefault,
  } = context;

  const routingKey = message.fields?.routingKey || '';
  const update = parseUpdateMessage(message.content);
  const repoKey = routingKey.replace(/^wiki\.update\./, '');
  const checkoutPath = await ensureStickyCheckout({
    sourceCheckout: env.PROJECT_WIKI_SOURCE_CHECKOUT || DEFAULT_SOURCE_CHECKOUT,
    remoteUrl: env.PROJECT_WIKI_SOURCE_REMOTE || '',
    git,
    logger,
  });
  const repoFullName = resolveRepoFullName(repoKey, update.repoFullName, checkoutPath);

  if (!repoFullName) {
    await emitEvent({
      channel,
      logger,
      type: 'wiki.update.skipped',
      payload: {
        repo: repoKey,
        reason: 'unknown-repo',
        routing_key: routingKey,
      },
    });
    return { status: 'skipped', reason: 'unknown-repo', repo: repoKey };
  }

  logger.log(`received ${routingKey} sha=${update.sha} msg=${update.title}`);

  if (!isRepoAllowlisted(checkoutPath, repoFullName)) {
    await emitEvent({
      channel,
      logger,
      type: 'wiki.update.skipped',
      payload: {
        repo: repoFullName,
        reason: 'repo-not-allowlisted',
        sha: update.sha,
        run_id: update.runId,
      },
    });
    return { status: 'skipped', reason: 'repo-not-allowlisted', repo: repoFullName };
  }

  const repoContent = loadRepoContent(checkoutPath, repoFullName);
  if (!repoContent.pages.length) {
    await emitEvent({
      channel,
      logger,
      type: 'wiki.update.skipped',
      payload: {
        repo: repoFullName,
        reason: 'no-existing-pages',
        sha: update.sha,
        run_id: update.runId,
      },
    });
    return { status: 'skipped', reason: 'no-existing-pages', repo: repoFullName };
  }

  const prompt = buildPromptPayload({
    repoFullName,
    repoDirName: repoContent.repoDirName,
    update,
    existingPages: repoContent.pages,
  });
  const providerConfig = resolveProviderConfig('generator', env);
  const systemPrompt =
    env.PROJECT_WIKI_UPDATER_SYSTEM_PROMPT?.trim() || DEFAULT_UPDATER_SYSTEM_PROMPT;
  const providerResult = await invokeProvider({
    provider: providerConfig.provider,
    model: providerConfig.model,
    prompt,
    systemPrompt,
    promptMode: 'stdin',
    cwd: checkoutPath,
    env,
    logger,
    purpose: 'wiki-update',
  });
  const parsed = parseGeneratedPages(providerResult.stdout);

  if (!parsed.pages.length) {
    await emitEvent({
      channel,
      logger,
      type: 'wiki.update.skipped',
      payload: {
        repo: repoFullName,
        reason: 'no-changes-proposed',
        sha: update.sha,
        run_id: update.runId,
      },
    });
    return { status: 'skipped', reason: 'no-changes-proposed', repo: repoFullName };
  }

  const existingBySlug = new Map(
    repoContent.pages.map((page) => [page.slug, page]),
  );
  const uniqueLocks = new Set();
  for (const page of parsed.pages) {
    const existing = existingBySlug.get(normalizePageSlug(page.pageSlug));
    if (existing) uniqueLocks.add(`${repoFullName}:${existing.slug}`);
  }

  const run = async () => {
    const changedPages = [];
    for (const page of parsed.pages) {
      const normalizedSlug = normalizePageSlug(page.pageSlug);
      const existingPage = existingBySlug.get(normalizedSlug);
      const verdict = validateGeneratedPage({
        repoFullName,
        page: { ...page, pageSlug: normalizedSlug },
        existingPage,
      });
      if (!verdict.ok) {
        await emitEvent({
          channel,
          logger,
          type: 'wiki.update.guardrail',
          payload: {
            repo: repoFullName,
            page_slug: normalizedSlug,
            reason: verdict.reason,
            message: verdict.message,
            sha: update.sha,
            run_id: update.runId,
          },
        });
        return { status: 'guardrail', reason: verdict.reason, repo: repoFullName };
      }
      if (page.content === existingPage.content) continue;
      fs.writeFileSync(existingPage.path, page.content, 'utf8');
      changedPages.push({
        slug: existingPage.slug,
        path: existingPage.path,
        relativePath: path.relative(checkoutPath, existingPage.path),
        content: page.content,
      });
    }

    if (!changedPages.length) {
      await emitEvent({
        channel,
        logger,
        type: 'wiki.update.skipped',
        payload: {
          repo: repoFullName,
          reason: 'no-changes-proposed',
          sha: update.sha,
          run_id: update.runId,
        },
      });
      return { status: 'skipped', reason: 'no-changes-proposed', repo: repoFullName };
    }

    const changedPaths = changedPages.map((page) => page.relativePath);
    await git(['add', '--', ...changedPaths], { cwd: checkoutPath });
    const traceId = parsed.traceId || update.traceId || '';
    const subject = buildCommitSubject({
      repoFullName,
      pageCount: changedPages.length,
      title: update.title,
      sha: update.sha,
    });
    const commitMessage = buildCommitMessage({
      subject,
      traceId,
      runId: update.runId,
    });
    await git(['commit', '-m', commitMessage], { cwd: checkoutPath });
    await git(['push'], { cwd: checkoutPath });

    for (const page of changedPages) {
      await emitEvent({
        channel,
        logger,
        type: 'wiki.page.updated',
        payload: {
          repo: repoFullName,
          page_slug: page.slug,
          path: page.relativePath,
          sha: update.sha,
          run_id: update.runId,
          trace_id: traceId,
        },
      });
    }

    await pollForAstroRebuild({
      sourceCheckout: env.PROJECT_WIKI_SOURCE_CHECKOUT || checkoutPath,
      stateFile: env.PROJECT_WIKI_BUILD_STATE_FILE || '',
      intervalMs: toPositiveInt(
        env.PROJECT_WIKI_REBUILD_POLL_INTERVAL_MS,
        DEFAULT_REBUILD_INTERVAL_MS,
      ),
      git,
      runCommand,
      logger,
    });

    return { status: 'updated', repo: repoFullName, changedPages };
  };

  return withPageLocks([...uniqueLocks], run);
}

export async function handleUpdateMessage(message, context) {
  if (!message) return;
  const { channel, logger = console } = context;
  const routingKey = message.fields?.routingKey || '';
  try {
    return await processWikiUpdate(message, context);
  } catch (err) {
    logger.error(
      `[updater] failed ${routingKey}: ${err instanceof Error ? err.message : err}`,
    );
    try {
      const update = safeParseMessage(message.content);
      await emitEvent({
        channel,
        logger,
        type: 'wiki.update.failed',
        payload: {
          repo: extractRepoFullName(update) || routingKey.replace(/^wiki\.update\./, ''),
          reason: err instanceof Error ? err.message : String(err),
          sha:
            typeof update?.commit?.sha === 'string' ? update.commit.sha : '',
          run_id: firstString(update?.run_id, update?.runId),
        },
      });
    } catch {
      logger.error(
        `[updater] invalid message on ${routingKey}: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }
  } finally {
    channel.ack(message);
  }
}

export async function startUpdater({
  connect: connectOverride,
  env = process.env,
  logger = console,
  registerSignalHandlers = true,
} = {}) {
  const amqp = connectOverride
    ? { connect: connectOverride }
    : await import('amqplib');
  const connection = await amqp.connect(getRabbitMqUrl(env));
  const channel = await connection.createChannel();

  await channel.assertExchange(WIKI_EVENTS_EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(WIKI_UPDATER_QUEUE, { durable: true });
  await channel.bindQueue(
    WIKI_UPDATER_QUEUE,
    WIKI_EVENTS_EXCHANGE,
    WIKI_UPDATE_ROUTING_KEY,
  );
  await channel.consume(
    WIKI_UPDATER_QUEUE,
    async (message) => {
      await handleUpdateMessage(message, { channel, logger, env });
    },
    { noAck: false },
  );

  logger.log(
    `[updater] consuming ${WIKI_UPDATER_QUEUE} from ${WIKI_EVENTS_EXCHANGE} (${WIKI_UPDATE_ROUTING_KEY})`,
  );

  let shuttingDown = false;
  const shutdown = async (signal = 'shutdown') => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.log(`[updater] ${signal} received, closing RabbitMQ connection`);
    try {
      await channel.close();
    } finally {
      await connection.close();
    }
  };

  if (registerSignalHandlers) {
    process.once('SIGINT', () => {
      void shutdown('SIGINT');
    });
    process.once('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  }

  return { connection, channel, shutdown };
}

function shortSha(value) {
  return String(value || '').trim().slice(0, 7);
}

function buildCommitSubject({ repoFullName, pageCount, title, sha }) {
  const repoName = repoFullName.split('/').at(-1) || repoFullName;
  const pagesLabel = pageCount === 1 ? '1 page' : `${pageCount} pages`;
  return `wiki(${repoName}): update ${pagesLabel} for ${title || 'merged PR'} (sha=${shortSha(
    sha,
  )})`;
}

function buildCommitMessage({ subject, traceId, runId }) {
  const suffix = [];
  if (traceId) suffix.push(`trace=${traceId}`);
  if (runId) suffix.push(`run=${runId}`);
  if (!suffix.length) return subject;
  return `${subject}\n\n${suffix.join(' ')}`;
}

async function emitEvent({ channel, logger, type, payload }) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  if (typeof channel.publish === 'function') {
    channel.publish(WIKI_EVENTS_EXCHANGE, type, body, { persistent: true });
  }
  logger.log?.(`[updater] event=${type} ${JSON.stringify(payload)}`);
}

function resolveRepoFullName(repoKey, messageRepoFullName, checkoutPath) {
  if (messageRepoFullName) return messageRepoFullName;
  const allowlist = loadAllowlist(checkoutPath);
  const normalizedKey = String(repoKey || '').trim();
  if (!normalizedKey) return '';
  const exact = allowlist.find(
    (entry) => entry.replace(/\//g, '-') === normalizedKey,
  );
  if (exact) return exact;
  if (allowlist.length === 1) return allowlist[0];
  return '';
}

function loadAllowlist(repoRoot) {
  const configPath = path.join(repoRoot, '.wiki-config.json');
  const json = readJsonFile(configPath, { allowlist: [] });
  if (!Array.isArray(json.allowlist)) return [];
  return json.allowlist.filter((value) => typeof value === 'string' && value.trim());
}

function isRepoAllowlisted(repoRoot, repoFullName) {
  return loadAllowlist(repoRoot).includes(repoFullName);
}

function loadRepoContent(repoRoot, repoFullName) {
  const repoName = repoFullName.split('/').at(-1) || repoFullName;
  const candidates = [
    path.join(repoRoot, 'content', 'repos', repoName),
    path.join(repoRoot, 'content', 'repos', repoFullName.replace(/\//g, '-')),
  ];
  const repoDir = candidates.find((candidate) => fs.existsSync(candidate));
  if (!repoDir) {
    return { repoDirName: repoName, pages: [] };
  }
  const pages = fs
    .readdirSync(repoDir)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const pagePath = path.join(repoDir, name);
      return {
        name,
        slug: normalizePageSlug(path.basename(name, '.md')),
        path: pagePath,
        content: fs.readFileSync(pagePath, 'utf8'),
      };
    });
  return { repoDirName: path.basename(repoDir), pages };
}

function normalizePageSlug(value) {
  return String(value || '')
    .trim()
    .replace(/\.md$/i, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function renderExistingPages(pages) {
  let total = 0;
  const parts = [];
  for (const page of pages) {
    const block = `## ${page.name}\n${page.content.trim()}\n`;
    const blockBytes = Buffer.byteLength(block, 'utf8');
    if (total + blockBytes > EXISTING_PAGES_CHAR_LIMIT) {
      const remaining = EXISTING_PAGES_CHAR_LIMIT - total;
      if (remaining <= 0) break;
      const truncated = truncateUtf8(block, remaining);
      parts.push(`${truncated}\n[truncated]\n`);
      total = EXISTING_PAGES_CHAR_LIMIT;
      break;
    }
    parts.push(block);
    total += blockBytes;
  }
  return parts.join('\n').trim();
}

function truncateUtf8(value, maxBytes) {
  const buffer = Buffer.from(value, 'utf8');
  if (buffer.byteLength <= maxBytes) return value;
  return buffer.subarray(0, maxBytes).toString('utf8');
}

function hasDestructiveFenceStrip(previous, next) {
  const previousFenceCount = countFences(previous);
  if (previousFenceCount === 0) return false;
  return countFences(next) < previousFenceCount;
}

function countFences(value) {
  return (String(value || '').match(/^```/gm) || []).length;
}

function hasSectionContinuity(previous, next) {
  const previousHeaders = extractHeaders(previous);
  if (!previousHeaders.length) return true;
  const nextHeaders = new Set(extractHeaders(next));
  return previousHeaders.some((header) => nextHeaders.has(header));
}

function extractHeaders(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^##\s+/.test(line))
    .map((line) => line.toLowerCase());
}

async function withPageLocks(lockKeys, fn) {
  const ordered = [...lockKeys].sort();
  const releases = [];
  for (const key of ordered) {
    releases.push(await acquirePageLock(key));
  }
  try {
    return await fn();
  } finally {
    for (const release of releases.reverse()) {
      release();
    }
  }
}

async function acquirePageLock(key) {
  const current = PAGE_LOCKS.get(key);
  if (current) await current;
  let release;
  const pending = new Promise((resolve) => {
    release = () => resolve();
  });
  PAGE_LOCKS.set(key, pending);
  return () => {
    if (PAGE_LOCKS.get(key) === pending) {
      PAGE_LOCKS.delete(key);
    }
    release();
  };
}

async function runGit(args, { cwd }) {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    encoding: 'utf8',
  });
  return stdout;
}

async function runCommandDefault(args, { cwd }) {
  await execFileAsync(args[0], args.slice(1), {
    cwd,
    encoding: 'utf8',
  });
}

function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function safeParseMessage(content) {
  try {
    return JSON.parse(Buffer.from(content).toString('utf8'));
  } catch {
    return null;
  }
}

function extractTitle(parsed) {
  return firstString(
    parsed?.pull_request?.title,
    parsed?.pr?.title,
    parsed?.commit?.message,
    parsed?.title,
  );
}

function extractRepoFullName(parsed) {
  return firstString(
    parsed?.repo,
    parsed?.repository?.full_name,
    parsed?.repository?.fullName,
    parsed?.pull_request?.base?.repo?.full_name,
    parsed?.pull_request?.head?.repo?.full_name,
  );
}

function normalizeFiles(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return { path: entry.trim(), summary: '' };
      }
      if (typeof entry !== 'object' || entry === null) return null;
      const filePath = firstString(
        entry.path,
        entry.filename,
        entry.file,
        entry.name,
      );
      if (!filePath) return null;
      return {
        path: filePath,
        summary: firstString(entry.summary, entry.patch, entry.status),
      };
    })
    .filter(Boolean);
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  startUpdater().catch((err) => {
    console.error(`[updater] fatal: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });
}
