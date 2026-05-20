import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runScaffolder } from './scaffolder.js';
import { parsePayload, SEED_PAGES } from './parser.js';
import { updateAllowlist } from './allowlist.js';
import { writeWikiStub } from './wiki-stub.js';
import { resolveProviderConfig } from '../server/providers.js';

export async function runOnboard({
  owner,
  repo,
  flags,
  repoRoot,
  stdout,
  stderr,
  env,
}) {
  const slug = `${owner}-${repo}`;
  const fullName = `${owner}/${repo}`;
  const contentDir = path.join(repoRoot, 'content', 'repos', slug);
  const configPath = path.join(repoRoot, '.wiki-config.json');

  const log = (line) => stdout.write(line + '\n');
  const warn = (line) => stderr.write(line + '\n');

  log(`project-wiki onboard ${fullName}`);
  log(`  slug=${slug}`);
  log(`  contentDir=${path.relative(repoRoot, contentDir) || contentDir}`);
  log(`  configPath=${path.relative(repoRoot, configPath) || configPath}`);
  if (flags.dryRun) log(`  mode=dry-run`);
  if (flags.scaffoldOnly) log(`  mode=scaffold-only`);
  if (flags.stubOnly) log(`  mode=stub-only`);

  const doScaffold = !flags.stubOnly;
  const doStub = !flags.scaffoldOnly;

  if (doScaffold) {
    await runScaffoldPhase({
      owner,
      repo,
      slug,
      fullName,
      contentDir,
      configPath,
      flags,
      repoRoot,
      env,
      log,
      warn,
    });
  } else {
    log(`[scaffold] skipped (--stub-only)`);
  }

  if (doStub) {
    await runStubPhase({
      owner,
      repo,
      slug,
      fullName,
      flags,
      log,
      warn,
      env,
    });
  } else {
    log(`[stub] skipped (--scaffold-only)`);
  }

  log(`project-wiki onboard ${fullName}: done${flags.dryRun ? ' (dry-run)' : ''}`);
}

async function runScaffoldPhase({
  owner,
  repo,
  slug,
  fullName,
  contentDir,
  configPath,
  flags,
  repoRoot,
  env,
  log,
  warn,
}) {
  const scaffolderConfig = resolveProviderConfig('generator', env);
  log(
    `[scaffold] provider=${scaffolderConfig.provider}` +
      (scaffolderConfig.model ? ` model=${scaffolderConfig.model}` : ''),
  );

  const scaffolderCwd = resolveScaffolderCwd({ owner, repo, env });
  log(`[scaffold] inspecting source at ${scaffolderCwd}`);

  let pages;
  if (flags.dryRun) {
    log(`[scaffold] dry-run: would invoke scaffolder and write ${SEED_PAGES.length} files under ${path.relative(repoRoot, contentDir) || contentDir}`);
    for (const page of SEED_PAGES) {
      const target = path.join(contentDir, page);
      const existsLabel = fs.existsSync(target) ? 'overwrite' : 'create';
      log(`[scaffold]   ${existsLabel} ${path.relative(repoRoot, target) || target}`);
    }
  } else {
    const payload = await runScaffolder({
      owner,
      repo,
      slug,
      fullName,
      cwd: scaffolderCwd,
      env,
      log,
      warn,
    });
    const debugDumpDir = env.PROJECT_WIKI_SCAFFOLDER_DEBUG_DIR;
    if (debugDumpDir) {
      try {
        fs.mkdirSync(debugDumpDir, { recursive: true });
        const dumpPath = path.join(debugDumpDir, `${slug}-payload-${Date.now()}.txt`);
        fs.writeFileSync(dumpPath, payload, 'utf8');
        log(`[scaffold] raw payload saved to ${dumpPath}`);
      } catch (err) {
        warn(`[scaffold] failed to save raw payload: ${err.message || err}`);
      }
    }
    try {
      pages = parsePayload(payload, { fullName });
    } catch (err) {
      // Always preserve the raw payload on parse failure so the operator can
      // hand-recover the LLM's work rather than re-pay for another full run.
      try {
        const failPath = path.join(
          os.tmpdir(),
          `project-wiki-scaffold-${slug}-${Date.now()}.txt`,
        );
        fs.writeFileSync(failPath, payload, 'utf8');
        warn(`[scaffold] payload preserved at ${failPath} for recovery`);
      } catch (dumpErr) {
        warn(`[scaffold] could not preserve failed payload: ${dumpErr.message || dumpErr}`);
      }
      throw err;
    }
    fs.mkdirSync(contentDir, { recursive: true });
    let writtenCount = 0;
    let unchangedCount = 0;
    for (const page of SEED_PAGES) {
      const body = pages[page];
      const target = path.join(contentDir, page);
      const next = ensureTrailingNewline(body);
      if (fs.existsSync(target)) {
        const current = fs.readFileSync(target, 'utf8');
        if (current === next) {
          unchangedCount++;
          continue;
        }
      }
      fs.writeFileSync(target, next, 'utf8');
      writtenCount++;
      log(`[scaffold]   wrote ${path.relative(repoRoot, target) || target}`);
    }
    log(`[scaffold] ${writtenCount} written, ${unchangedCount} byte-equal (no rewrite)`);
  }

  // Allowlist update.
  if (flags.dryRun) {
    const status = previewAllowlist(configPath, fullName);
    log(`[config] ${status}`);
  } else {
    const result = updateAllowlist(configPath, fullName);
    if (result.changed) {
      log(`[config] added ${fullName} to ${path.relative(repoRoot, configPath) || configPath}`);
    } else {
      log(`[config] ${fullName} already present (no rewrite)`);
    }
  }
}

async function runStubPhase({
  owner,
  repo,
  slug,
  fullName,
  flags,
  log,
  warn,
  env,
}) {
  const stubUrl = `https://github.com/${owner}/${repo}.wiki.git`;
  log(`[stub] target=${stubUrl}`);
  if (flags.dryRun) {
    log(`[stub] dry-run: would clone, write Home.md, commit "chore(wiki): redirect stub for project-wiki" if changed, and push`);
    return;
  }
  await writeWikiStub({
    owner,
    repo,
    slug,
    fullName,
    stubUrl,
    log,
    warn,
    env,
  });
}

function ensureTrailingNewline(body) {
  if (typeof body !== 'string') return '';
  return body.endsWith('\n') ? body : body + '\n';
}

function previewAllowlist(configPath, fullName) {
  let raw;
  try {
    raw = fs.readFileSync(configPath, 'utf8');
  } catch {
    return `would create ${path.basename(configPath)} with allowlist=[${fullName}]`;
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return `would rewrite malformed ${path.basename(configPath)} to include ${fullName}`;
  }
  const list = Array.isArray(json.allowlist) ? json.allowlist : [];
  if (list.includes(fullName)) {
    return `${fullName} already present in allowlist (no rewrite)`;
  }
  return `would append ${fullName} to allowlist`;
}

function resolveScaffolderCwd({ owner, repo, env }) {
  if (env.PROJECT_WIKI_SCAFFOLDER_CWD) return env.PROJECT_WIKI_SCAFFOLDER_CWD;
  const home = os.homedir();
  const sibling = path.join(home, repo);
  if (fs.existsSync(sibling) && fs.statSync(sibling).isDirectory()) {
    return sibling;
  }
  const owned = path.join(home, `${owner}-${repo}`);
  if (fs.existsSync(owned) && fs.statSync(owned).isDirectory()) {
    return owned;
  }
  return process.cwd();
}
