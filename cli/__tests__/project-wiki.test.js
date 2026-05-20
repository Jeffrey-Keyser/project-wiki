import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const cliPath = path.join(repoRoot, 'bin', 'project-wiki');

test('test-provider shells through the shared provider abstraction and prints output', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-cli-'));
  try {
    const scriptPath = path.join(dir, 'claude');
    fs.writeFileSync(
      scriptPath,
      `#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
const systemIndex = args.indexOf('--system-prompt-file');
const systemPath = systemIndex >= 0 ? args[systemIndex + 1] : '';
if (!systemPath || !fs.existsSync(systemPath)) {
  process.stderr.write('missing system prompt file\\n');
  process.exit(2);
}
process.stdout.write('provider smoke ok\\n');
`,
      'utf8',
    );
    fs.chmodSync(scriptPath, 0o755);

    const res = spawnSync('node', [cliPath, 'test-provider', 'claude'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH || ''}`,
        PROJECT_WIKI_AGENT_PROVIDER: 'kimi',
      },
    });

    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /\[providers\] purpose=test-provider provider=claude binary=claude mode=inline/);
    assert.match(res.stdout, /provider smoke ok/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
