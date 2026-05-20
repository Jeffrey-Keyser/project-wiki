import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Manages the per-repo GitHub Wiki redirect stub (Home.md on <repo>.wiki.git)
// per project-wiki concept plan §6.4 / §6.4.2:
//
//   1. Clone <stubUrl> into a temp dir (may fail because the wiki is
//      uninitialized; we recover by initializing an empty repo with the
//      same remote).
//   2. Render the canonical preamble body with <repo> substitution.
//   3. If Home.md is byte-equal to the rendered body, skip commit and push.
//   4. Otherwise commit with the canonical subject line and push to origin.
//      The first push to an uninitialized wiki uses --set-upstream so the
//      remote initializes.
//
// The canonical stub body lives below as STUB_TEMPLATE and is sourced from
// project-wiki-plan.md §6.4 item 2. Editing the template requires updating
// the plan too — they must stay in sync.

const COMMIT_SUBJECT = 'chore(wiki): redirect stub for project-wiki';
const STUB_FILENAME = 'Home.md';

const STUB_TEMPLATE = `# {{REPO_DISPLAY}}

This repository's canonical wiki lives on the central project wiki.
The per-repo GitHub Wiki tab is intentionally a stub so all wikis
for the ecosystem can be read and searched in one place.

**→ [Open canonical wiki for {{REPO_DISPLAY}}](https://wiki.jeffreykeyser.net/repos/{{SLUG}})**

Source of truth is the repository's code; the canonical wiki is a
high-level guide and is allowed to drift briefly behind merges.
`;

export function renderStubBody({ repo, slug }) {
  return STUB_TEMPLATE
    .replaceAll('{{REPO_DISPLAY}}', repo)
    .replaceAll('{{SLUG}}', slug);
}

export async function writeWikiStub({ owner, repo, slug, fullName, stubUrl, log, warn, env }) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `project-wiki-stub-${repo}-`));
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  };

  try {
    const body = renderStubBody({ repo, slug });
    const cloneResult = tryClone(stubUrl, tmpDir, env);
    let cloneDir;
    let wikiInitialized;
    if (cloneResult.ok) {
      cloneDir = path.join(tmpDir, 'clone');
      wikiInitialized = true;
      log(`[stub] cloned ${stubUrl}`);
    } else {
      // Wiki has not been initialized yet on GitHub. Bootstrap an empty
      // repo with the remote so the first push initializes it.
      cloneDir = path.join(tmpDir, 'init');
      fs.mkdirSync(cloneDir, { recursive: true });
      runGit(['init', '--initial-branch=master'], cloneDir, env);
      runGit(['remote', 'add', 'origin', stubUrl], cloneDir, env);
      wikiInitialized = false;
      log(`[stub] remote wiki uninitialized (clone said: ${cloneResult.error}); bootstrapping empty repo`);
    }

    ensureGitIdentity(cloneDir, env);

    const stubPath = path.join(cloneDir, STUB_FILENAME);
    let existingBody = null;
    if (fs.existsSync(stubPath)) {
      existingBody = fs.readFileSync(stubPath, 'utf8');
    }

    if (existingBody === body && wikiInitialized) {
      log(`[stub] ${STUB_FILENAME} is byte-equal to canonical body; skipping commit + push`);
      return;
    }

    fs.writeFileSync(stubPath, body, 'utf8');
    runGit(['add', STUB_FILENAME], cloneDir, env);

    const statusOut = runGit(['status', '--porcelain'], cloneDir, env).stdout.trim();
    if (!statusOut && wikiInitialized) {
      log(`[stub] no git changes after write; nothing to commit`);
      return;
    }

    runGit(['commit', '-m', COMMIT_SUBJECT], cloneDir, env);
    log(`[stub] committed "${COMMIT_SUBJECT}"`);

    const branch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], cloneDir, env).stdout.trim();
    const pushArgs = wikiInitialized
      ? ['push', 'origin', branch]
      : ['push', '--set-upstream', 'origin', branch];
    runGit(pushArgs, cloneDir, env);
    log(`[stub] pushed to ${stubUrl} (branch=${branch})`);
  } finally {
    cleanup();
  }
}

function tryClone(stubUrl, parentDir, env) {
  const target = path.join(parentDir, 'clone');
  const res = spawnSync('git', ['clone', '--quiet', stubUrl, target], {
    env,
    encoding: 'utf8',
  });
  if (res.status === 0) return { ok: true };
  const err = (res.stderr || '').trim();
  return { ok: false, error: err.split(/\n/).slice(-1)[0] || `exit ${res.status}` };
}

function ensureGitIdentity(cwd, env) {
  const name = runGit(['config', '--get', 'user.name'], cwd, env, { allowFail: true }).stdout.trim();
  const email = runGit(['config', '--get', 'user.email'], cwd, env, { allowFail: true }).stdout.trim();
  if (!name) {
    runGit(['config', 'user.name', env.GIT_AUTHOR_NAME || 'project-wiki'], cwd, env);
  }
  if (!email) {
    runGit(['config', 'user.email', env.GIT_AUTHOR_EMAIL || 'project-wiki@local'], cwd, env);
  }
}

function runGit(args, cwd, env, { allowFail = false } = {}) {
  const res = spawnSync('git', args, { cwd, env, encoding: 'utf8' });
  if (res.status !== 0 && !allowFail) {
    const stderr = (res.stderr || '').trim();
    throw new Error(`git ${args.join(' ')} failed (exit ${res.status}): ${stderr || '(no stderr)'}`);
  }
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}
