import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const SOURCE_DIFF_CHAR_LIMIT = 40 * 1024;
export const SOURCE_DIFF_FILE_CHAR_LIMIT = 8 * 1024;
const GIT_TIMEOUT_MS = 60_000;
const FULL_SHA = /^[0-9a-f]{40}$/;
const NULL_SHA = /^0{40}$/;
const REPO_NAME = /^[A-Za-z0-9][\w-]*\/[A-Za-z0-9_][\w.-]*$/;

// Generated or vendored files that would only crowd real changes out of the cap.
const EXCLUDED_PATHS = [
  '**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml', '**/go.sum', '**/Cargo.lock',
  '**/dist/**', '**/build/**', '**/vendor/**', '**/*.min.js', '**/*.min.css', '**/*.map', '**/*.snap',
].map((glob) => `:(exclude,glob)${glob}`);

const execFileAsync = promisify(execFile);

async function runGit(args, { cwd }) {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  return stdout;
}

/**
 * The range to diff for an update: the push's `before` when the event carries
 * it (covers every commit in the push), else the head commit's first parent
 * (for a merge commit that is the whole merged branch).
 */
export function resolveDiffRange(update) {
  const head = update.sha;
  if (!FULL_SHA.test(head || '')) return null;
  const before = update.raw?.before;
  if (FULL_SHA.test(before || '') && !NULL_SHA.test(before)) {
    return { base: before, head, fetch: [before, head], depth: 1 };
  }
  return { base: `${head}^`, head, fetch: [head], depth: 2 };
}

/**
 * Fetch the pushed change into a per-repo bare partial clone (commits and
 * trees only; diffed blobs load lazily) and return its diffstat and patch.
 * Returns null when the update has no usable sha or diffs are switched off;
 * throws when git fails, so the caller can carry on without a diff.
 */
export async function fetchSourceDiff({ repoFullName, update, env = process.env, git = runGit }) {
  if (env.PROJECT_WIKI_SOURCE_DIFF === 'off') return null;
  const range = resolveDiffRange(update);
  if (!range || !REPO_NAME.test(repoFullName || '')) return null;

  const cacheRoot = env.PROJECT_WIKI_SOURCE_DIFF_CACHE ||
    path.join(os.homedir(), '.cache/project-wiki/source-diffs');
  const repoDir = path.join(cacheRoot, `${repoFullName.replace('/', '__')}.git`);
  if (!fs.existsSync(path.join(repoDir, 'HEAD'))) {
    fs.mkdirSync(repoDir, { recursive: true });
    await git(['init', '--quiet', '--bare'], { cwd: repoDir });
    await git(['remote', 'add', 'origin', `git@github.com:${repoFullName}.git`], { cwd: repoDir });
    await git(['config', 'remote.origin.promisor', 'true'], { cwd: repoDir });
    await git(['config', 'remote.origin.partialclonefilter', 'blob:none'], { cwd: repoDir });
  }

  await git(['fetch', '--quiet', `--depth=${range.depth}`, '--filter=blob:none', 'origin', ...range.fetch], { cwd: repoDir });
  const diffArgs = [range.base, range.head, '--', '.', ...EXCLUDED_PATHS];
  const stat = await git(['diff', '--stat=120', ...diffArgs], { cwd: repoDir });
  const patch = await git(['diff', '--no-color', '--no-ext-diff', ...diffArgs], { cwd: repoDir });
  const short = (rev) => rev.endsWith('^') ? `${rev.slice(0, 12)}^` : rev.slice(0, 12);
  return {
    base: range.base,
    head: range.head,
    label: `${short(range.base)}..${short(range.head)}`,
    stat: stat.trimEnd(),
    ...capPatch(patch),
  };
}

function isTestFile(chunk) {
  const file = chunk.match(/^diff --git a\/(.+?) b\//)?.[1] || '';
  return /(^|\/)(__tests__|tests?|spec)\/|\.(test|spec)\.[^/]+$|_test\.go$/.test(file);
}

/**
 * Cap each file's hunk and the total so one large file cannot hide the rest;
 * files that do not fit are named so the generator knows they changed.
 */
export function capPatch(patch, { total = SOURCE_DIFF_CHAR_LIMIT, perFile = SOURCE_DIFF_FILE_CHAR_LIMIT } = {}) {
  // Git orders files by path, which puts __tests__/ ahead of the code it
  // tests; source files say more about behaviour, so they get the budget first.
  const files = patch.split(/^(?=diff --git )/m).filter((chunk) => chunk.trim())
    .map((chunk, index) => ({ chunk, index, test: isTestFile(chunk) }))
    .sort((a, b) => a.test - b.test || a.index - b.index)
    .map(({ chunk }) => chunk);
  const kept = [];
  const omitted = [];
  let used = 0;
  let truncated = false;
  for (const chunk of files) {
    let body = chunk;
    if (body.length > perFile) {
      body = `${body.slice(0, perFile)}\n… (file diff truncated)\n`;
      truncated = true;
    }
    if (used + body.length > total) {
      omitted.push(chunk.match(/^diff --git a\/(.+?) b\//)?.[1] || '(unknown)');
      truncated = true;
      continue;
    }
    kept.push(body);
    used += body.length;
  }
  return { patch: kept.join(''), omitted, truncated };
}
