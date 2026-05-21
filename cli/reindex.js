import fs from 'node:fs';
import path from 'node:path';
import { runOnboard } from './onboard.js';

export async function runReindex({
  targets,
  all,
  flags,
  repoRoot,
  stdout,
  stderr,
  env,
}) {
  const configPath = path.join(repoRoot, '.wiki-config.json');
  const allowlist = readAllowlist(configPath);

  let resolved;
  if (all) {
    if (targets.length > 0) {
      throw new Error('reindex: --all is incompatible with positional arguments');
    }
    resolved = allowlist.slice();
    if (resolved.length === 0) {
      stdout.write('project-wiki reindex --all: allowlist empty, nothing to do\n');
      return;
    }
  } else {
    if (targets.length === 0) {
      throw new Error('reindex: expected <owner>/<repo> or --all');
    }
    for (const t of targets) {
      if (!allowlist.includes(t)) {
        throw new Error(
          `reindex: "${t}" not in .wiki-config.json allowlist — run \`project-wiki onboard ${t}\` first`,
        );
      }
    }
    resolved = targets.slice();
  }

  stdout.write(`project-wiki reindex: ${resolved.length} repo(s)\n`);
  for (const fullName of resolved) stdout.write(`  - ${fullName}\n`);

  const onboardFlags = {
    dryRun: flags.dryRun,
    scaffoldOnly: true,
    stubOnly: false,
  };

  for (const fullName of resolved) {
    const match = /^([^\/\s]+)\/([^\/\s]+)$/.exec(fullName);
    if (!match) {
      stderr.write(`reindex: skipping malformed allowlist entry "${fullName}"\n`);
      continue;
    }
    stdout.write(`\n=== reindex ${fullName} ===\n`);
    await runOnboard({
      owner: match[1],
      repo: match[2],
      flags: onboardFlags,
      repoRoot,
      stdout,
      stderr,
      env,
    });
  }
  stdout.write(`\nproject-wiki reindex: done${flags.dryRun ? ' (dry-run)' : ''}\n`);
}

function readAllowlist(configPath) {
  if (!fs.existsSync(configPath)) return [];
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!Array.isArray(raw.allowlist)) return [];
  return raw.allowlist.filter((x) => typeof x === 'string' && x.length > 0);
}
