import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { updateAllowlist } from '../allowlist.js';

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-allowlist-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('updateAllowlist appends a new entry and writes canonical JSON', () => {
  withTempDir((dir) => {
    const p = path.join(dir, '.wiki-config.json');
    fs.writeFileSync(p, JSON.stringify({ allowlist: ['X/Y'] }, null, 2) + '\n');
    const res = updateAllowlist(p, 'A/B');
    assert.equal(res.changed, true);
    assert.deepEqual(res.allowlist, ['X/Y', 'A/B']);
    const reread = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.deepEqual(reread.allowlist, ['X/Y', 'A/B']);
  });
});

test('updateAllowlist is a no-op when entry already present and file canonical', () => {
  withTempDir((dir) => {
    const p = path.join(dir, '.wiki-config.json');
    const initial = JSON.stringify({ allowlist: ['X/Y', 'A/B'] }, null, 2) + '\n';
    fs.writeFileSync(p, initial);
    const before = fs.statSync(p).mtimeMs;
    const res = updateAllowlist(p, 'A/B');
    assert.equal(res.changed, false);
    const after = fs.statSync(p).mtimeMs;
    assert.equal(after, before, 'file mtime should not change on no-op');
    assert.equal(fs.readFileSync(p, 'utf8'), initial);
  });
});

test('updateAllowlist creates the config file when missing', () => {
  withTempDir((dir) => {
    const p = path.join(dir, '.wiki-config.json');
    const res = updateAllowlist(p, 'A/B');
    assert.equal(res.changed, true);
    const reread = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.deepEqual(reread.allowlist, ['A/B']);
  });
});

test('updateAllowlist heals a malformed config file', () => {
  withTempDir((dir) => {
    const p = path.join(dir, '.wiki-config.json');
    fs.writeFileSync(p, 'not json at all');
    const res = updateAllowlist(p, 'A/B');
    assert.equal(res.changed, true);
    const reread = JSON.parse(fs.readFileSync(p, 'utf8'));
    assert.deepEqual(reread.allowlist, ['A/B']);
  });
});
