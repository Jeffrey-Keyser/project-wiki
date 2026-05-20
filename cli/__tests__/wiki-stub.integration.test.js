// Exercises the full clone → write → commit → push flow against a local bare
// git repo standing in for the GitHub wiki remote. This is the closest we can
// get to acceptance criterion #5 ("a second run is a no-op") without hitting
// the network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { writeWikiStub, renderStubBody } from '../wiki-stub.js';

function git(args, cwd) {
  const res = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed in ${cwd}: ${res.stderr}`);
  }
  return res.stdout;
}

function makeBareRemote() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-stub-remote-'));
  // Use a bare init and an initial commit so the clone phase succeeds.
  const seed = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-stub-seed-'));
  git(['init', '--initial-branch=master', '--quiet'], seed);
  git(['config', 'user.email', 'test@example.com'], seed);
  git(['config', 'user.name', 'test'], seed);
  fs.writeFileSync(path.join(seed, '.placeholder'), '');
  git(['add', '.placeholder'], seed);
  git(['commit', '-m', 'init'], seed);
  git(['init', '--bare', '--initial-branch=master', '--quiet', dir], process.cwd());
  git(['push', dir, 'master:master'], seed);
  fs.rmSync(seed, { recursive: true, force: true });
  return dir;
}


async function runStub({ remote, repo = 'dev-inbox', slug = 'Jeffrey-Keyser-dev-inbox' }) {
  const lines = [];
  await writeWikiStub({
    owner: 'Jeffrey-Keyser',
    repo,
    slug,
    fullName: `Jeffrey-Keyser/${repo}`,
    stubUrl: remote,
    log: (s) => lines.push(s),
    warn: () => {},
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  });
  return lines;
}

function readRemoteHeadFile(remote, file) {
  const out = git(['show', `master:${file}`], remote);
  return out;
}

function countCommits(remote) {
  return Number(git(['rev-list', '--count', 'master'], remote).trim());
}

test('writeWikiStub commits + pushes to a fresh remote then is a no-op on rerun', async () => {
  const remote = makeBareRemote();
  try {
    const before = countCommits(remote);
    const linesA = await runStub({ remote });
    const afterFirst = countCommits(remote);
    assert.equal(afterFirst, before + 1, 'first run should add exactly one remote commit');
    const remoteBody = readRemoteHeadFile(remote, 'Home.md');
    assert.equal(remoteBody, renderStubBody({ repo: 'dev-inbox', slug: 'Jeffrey-Keyser-dev-inbox' }));
    const linesB = await runStub({ remote });
    const afterSecond = countCommits(remote);
    assert.equal(afterSecond, afterFirst, 'second run must be a no-op (no new remote commits)');
    assert.ok(linesB.some((l) => /byte-equal/.test(l)), 'second run should report byte-equal short-circuit');
  } finally {
    fs.rmSync(remote, { recursive: true, force: true });
  }
});

test('writeWikiStub initializes an empty wiki remote on first push', async () => {
  // Simulates GitHub's "wiki tab enabled but never written" case: clone
  // succeeds against an empty bare repo, then we land the very first
  // commit + push.
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-stub-remote-empty-'));
  spawnSync('git', ['init', '--bare', '--initial-branch=master', '--quiet', remote], { encoding: 'utf8' });
  try {
    const linesA = await runStub({ remote });
    assert.ok(
      linesA.some((l) => /committed.*redirect stub/.test(l)),
      'first run against empty wiki should produce a commit',
    );
    const after = countCommits(remote);
    assert.equal(after, 1, 'first push should land exactly one commit');
    const remoteBody = readRemoteHeadFile(remote, 'Home.md');
    assert.equal(remoteBody, renderStubBody({ repo: 'dev-inbox', slug: 'Jeffrey-Keyser-dev-inbox' }));
    await runStub({ remote });
    const afterSecond = countCommits(remote);
    assert.equal(afterSecond, 1, 'rerun against now-initialized remote must be a no-op');
  } finally {
    fs.rmSync(remote, { recursive: true, force: true });
  }
});
