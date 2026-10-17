import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { invokeGenerator, resolveGeneratorConfig, GENERATOR_ROLE } from '../model-control.js';
import { runScaffolder } from '../../cli/scaffolder.js';

const row = { role: GENERATOR_ROLE, provider: 'codex', model: 'gpt-6.1-sol', thinking_level: 'ultra',
  auto_fallback: true, updated_at: '2026-10-17T00:00:00.000Z' };
const response = (data = row) => async () => ({ status: 200, ok: true, json: async () => ({ success: true, data }) });

test('central selection replaces the entire legacy tuple and is read each time', async () => {
  const env = { PROJECT_WIKI_GENERATOR_PROVIDER: 'claude', PROJECT_WIKI_GENERATOR_MODEL: 'opus' };
  assert.deepEqual(await resolveGeneratorConfig(env, response()), {
    role: 'generator', provider: 'codex', model: 'gpt-6.1-sol', thinkingLevel: 'ultra', source: 'central', revision: row.updated_at,
  });
  const next = await resolveGeneratorConfig(env, response({ ...row, provider: 'kimi', model: '', thinking_level: null }));
  assert.equal(next.model, '');
  assert.equal(next.provider, 'kimi');
  assert.equal(next.thinkingLevel, '');
});

test('missing/unavailable registry preserves defaults; operator override performs no lookup', async () => {
  for (const fetcher of [async () => ({ status: 404 }), async () => ({ status: 503 }), async () => { throw new Error('offline'); }]) {
    assert.equal((await resolveGeneratorConfig({}, fetcher)).provider, 'claude');
  }
  const config = await resolveGeneratorConfig({ PROJECT_WIKI_MODEL_SOURCE: 'env', PROJECT_WIKI_SCAFFOLDER_PROVIDER: 'kimi' },
    () => { assert.fail('must not fetch'); });
  assert.equal(config.source, 'operator-override');
  assert.equal(config.provider, 'kimi');
});

test('malformed or unsupported central rows fail closed', async () => {
  for (const data of [null, { ...row, role: 'worker' }, { ...row, provider: 'opencode' },
    { ...row, provider: 'claude' }, { ...row, model: 42 }, { ...row, updated_at: '' },
    { ...row, thinking_level: 'invented' }, { ...row, provider: 'kimi', thinking_level: 'high' }]) {
    await assert.rejects(resolveGeneratorConfig({}, response(data)));
  }
  await assert.rejects(resolveGeneratorConfig({}, async () => ({ status: 401, ok: false })));
});

test('real adapter forwards model/effort for all supported CLIs; failures never retry another CLI', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wiki-model-invoke-'));
  try {
    for (const provider of ['claude', 'codex', 'kimi']) {
      await fs.writeFile(path.join(dir, provider), `#!/usr/bin/env node
const fs = require('fs'); const input = fs.readFileSync(0, 'utf8');
if (process.env.FIXTURE_FAIL) process.exit(7);
process.stdout.write(JSON.stringify({args: process.argv.slice(2), input}));
`, { mode: 0o755 });
    }
    const env = { PATH: `${dir}:${process.env.PATH}`, PROJECT_WIKI_MODEL_STATUS_DIR: path.join(dir, 'status') };
    for (const [provider, model, effort] of [['claude', 'sonnet', 'high'], ['codex', 'gpt-6.1-sol', 'ultra'], ['kimi', 'kimi-code/k3', '']]) {
      const result = await invokeGenerator({ prompt: 'PRIVATE fixture', env, cwd: dir, promptMode: 'stdin', logger: { log() {} } },
        { fetcher: response({ ...row, provider, model, thinking_level: effort }) });
      const capture = JSON.parse(result.stdout);
      assert.equal(capture.input, 'PRIVATE fixture');
      assert.ok(capture.args.includes(model));
      if (provider === 'claude') assert.ok(capture.args.includes('--effort') && capture.args.includes(effort));
      if (provider === 'codex') assert.ok(capture.args.includes('model_reasoning_effort="ultra"'));
      const status = await fs.readFile(path.join(env.PROJECT_WIKI_MODEL_STATUS_DIR, `${GENERATOR_ROLE}.json`), 'utf8');
      assert.doesNotMatch(status, /PRIVATE/);
      assert.equal(JSON.parse(status).invocation.state, 'finished');
    }
    let calls = 0;
    await assert.rejects(invokeGenerator({ prompt: 'fixture', env, logger: {} }, { fetcher: response(),
      invokeProvider: async () => { calls++; throw new Error('provider failed'); } }));
    assert.equal(calls, 1);
    const receipt = JSON.parse(await fs.readFile(path.join(env.PROJECT_WIKI_MODEL_STATUS_DIR, `${GENERATOR_ROLE}.json`), 'utf8'));
    assert.equal(receipt.invocation.state, 'failed');
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('onboarding scaffolder resolves the central row through HTTP before invoking the selected CLI', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wiki-scaffold-model-'));
  const server = http.createServer((req, res) => {
    assert.equal(req.url, `/api/v1/dispatch-config/${GENERATOR_ROLE}`);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ success: true, data: row }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await fs.writeFile(path.join(dir, 'codex'), '#!/usr/bin/env node\nrequire("fs").readFileSync(0); process.stdout.write(JSON.stringify(process.argv.slice(2)));', { mode: 0o755 });
    const output = await runScaffolder({ owner: 'fixture', repo: 'fixture', slug: 'fixture', fullName: 'fixture/fixture', cwd: dir,
      env: { PATH: `${dir}:${process.env.PATH}`, PROJECT_WIKI_MODEL_STATUS_DIR: path.join(dir, 'status'),
        PROJECT_WIKI_AGENCY_URL: `http://127.0.0.1:${server.address().port}` }, log() {}, warn() {} });
    assert.ok(JSON.parse(output).includes(row.model));
    assert.ok(JSON.parse(output).includes('model_reasoning_effort="ultra"'));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await fs.rm(dir, { recursive: true, force: true }); }
});
