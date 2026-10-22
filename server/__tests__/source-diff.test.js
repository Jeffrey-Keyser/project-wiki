import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { capPatch, fetchSourceDiff, resolveDiffRange } from '../source-diff.js';

const HEAD = 'a'.repeat(40);
const BEFORE = 'b'.repeat(40);

test('resolveDiffRange diffs the whole push when the event carries before', () => {
  assert.deepEqual(resolveDiffRange({ sha: HEAD, raw: { before: BEFORE } }),
    { base: BEFORE, head: HEAD, fetch: [BEFORE, HEAD], depth: 1 });
});

test('resolveDiffRange falls back to the first parent for new branches and missing before', () => {
  const parent = { base: `${HEAD}^`, head: HEAD, fetch: [HEAD], depth: 2 };
  assert.deepEqual(resolveDiffRange({ sha: HEAD, raw: { before: '0'.repeat(40) } }), parent);
  assert.deepEqual(resolveDiffRange({ sha: HEAD, raw: {} }), parent);
  assert.equal(resolveDiffRange({ sha: 'abc123', raw: {} }), null);
});

test('capPatch truncates large files and names files that do not fit', () => {
  const file = (name, size) => `diff --git a/${name} b/${name}\n${'+'.repeat(size)}\n`;
  const result = capPatch(file('big.js', 500) + file('small.js', 10) + file('late.js', 300),
    { total: 400, perFile: 200 });
  assert.match(result.patch, /a\/big\.js[\s\S]*file diff truncated/);
  assert.match(result.patch, /a\/small\.js/);
  assert.deepEqual(result.omitted, ['late.js']);
  assert.equal(result.truncated, true);
  assert.deepEqual(capPatch(file('one.js', 5)), { patch: file('one.js', 5), omitted: [], truncated: false });
});

test('capPatch spends the budget on source files before tests', () => {
  const file = (name) => `diff --git a/${name} b/${name}\n${'+'.repeat(100)}\n`;
  const result = capPatch(file('src/__tests__/a.test.ts') + file('src/b.ts') + file('cmd/c_test.go') + file('src/d.ts'),
    { total: 440, perFile: 200 });
  assert.match(result.patch, /^diff --git a\/src\/b\.ts[\s\S]*a\/src\/d\.ts/);
  assert.deepEqual(result.omitted, ['cmd/c_test.go']);
});

test('fetchSourceDiff partially fetches the change into a per-repo cache and diffs it', async () => {
  const cache = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-diff-'));
  try {
    const calls = [];
    const git = async (args, { cwd }) => {
      calls.push([path.relative(cache, cwd), ...args]);
      if (args[0] === 'init') fs.writeFileSync(path.join(cwd, 'HEAD'), '');
      if (args[0] === 'diff' && args[1].startsWith('--stat')) return ' x.js | 2 +-\n';
      if (args[0] === 'diff') return 'diff --git a/x.js b/x.js\n-old\n+new\n';
      return '';
    };
    const update = { sha: HEAD, raw: {} };
    const env = { PROJECT_WIKI_SOURCE_DIFF_CACHE: cache };
    const diff = await fetchSourceDiff({ repoFullName: 'Jeffrey-Keyser/dev-inbox', update, env, git });

    assert.equal(diff.label, `${HEAD.slice(0, 12)}^..${HEAD.slice(0, 12)}`);
    assert.equal(diff.stat, ' x.js | 2 +-');
    assert.match(diff.patch, /\+new/);
    const repo = 'Jeffrey-Keyser__dev-inbox.git';
    assert.deepEqual(calls.slice(0, 5).map((c) => c.slice(0, 3)), [
      [repo, 'init', '--quiet'],
      [repo, 'remote', 'add'],
      [repo, 'config', 'remote.origin.promisor'],
      [repo, 'config', 'remote.origin.partialclonefilter'],
      [repo, 'fetch', '--quiet'],
    ]);
    assert.deepEqual(calls[1].slice(1), ['remote', 'add', 'origin', 'git@github.com:Jeffrey-Keyser/dev-inbox.git']);
    assert.deepEqual(calls[4].slice(3), ['--depth=2', '--filter=blob:none', 'origin', HEAD]);

    calls.length = 0;
    await fetchSourceDiff({ repoFullName: 'Jeffrey-Keyser/dev-inbox', update, env, git });
    assert.equal(calls[0][1], 'fetch', 'an existing cache is reused');

    assert.equal(await fetchSourceDiff({ repoFullName: 'Jeffrey-Keyser/dev-inbox', update,
      env: { ...env, PROJECT_WIKI_SOURCE_DIFF: 'off' }, git }), null);
    assert.equal(await fetchSourceDiff({ repoFullName: '../escape', update, env, git }), null);
  } finally {
    fs.rmSync(cache, { recursive: true, force: true });
  }
});
