import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { invokeGenerator, aiProxyMode, errorKind, GENERATOR_ROLE } from '../model-control.js';
import { invokeAiProxy } from '../providers.js';

const row = (provider = 'claude', model = 'claude-haiku-5-5') => ({ role: GENERATOR_ROLE, provider, model,
  thinking_level: provider === 'claude' ? 'high' : null, auto_fallback: true, updated_at: '2026-10-20T00:05:39.177Z' });
const registry = (data) => async () => ({ status: 200, ok: true, json: async () => ({ success: true, data }) });
const quiet = { log() {}, warn() {} };

async function fixture(mode) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wiki-lane-'));
  await fs.writeFile(path.join(dir, 'key'), 'wiki-app-key\n');
  const env = { PROJECT_WIKI_AI_PROXY: mode, PROJECT_WIKI_AI_PROXY_KEY_FILE: path.join(dir, 'key'),
    PROJECT_WIKI_AI_PROXY_URL: 'http://proxy.test', PROJECT_WIKI_MODEL_STATUS_DIR: path.join(dir, 'status') };
  const runs = async () => (await fs.readFile(path.join(dir, 'status/runs.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
  return { dir, env, runs };
}
const okReply = (text, finish = 'stop') => ({ ok: true, status: 200,
  json: async () => ({ model: 'claude-haiku-5-5', choices: [{ message: { content: text }, finish_reason: finish }], usage: { prompt_tokens: 900, completion_tokens: 40 } }) });

test('lane mode defaults to off and ignores unknown values', () => {
  assert.equal(aiProxyMode({}), 'off');
  assert.equal(aiProxyMode({ PROJECT_WIKI_AI_PROXY: 'bogus' }), 'off');
  assert.equal(aiProxyMode({ PROJECT_WIKI_AI_PROXY: ' Primary ' }), 'primary');
});

test('proxy adapter sends system, prompt, alias-mapped model and effort; never the key in the body', async () => {
  const { dir, env } = await fixture('primary');
  try {
    const result = await invokeAiProxy({ prompt: 'PAGES', systemPrompt: 'SYS', model: 'sonnet', thinkingLevel: 'high', env, logger: quiet,
      fetcher: async (url, options) => {
        assert.equal(url, 'http://proxy.test/v1/chat');
        assert.equal(options.headers.authorization, 'Bearer wiki-app-key');
        assert.equal(options.headers['x-model-source'], 'request');
        const body = JSON.parse(options.body);
        assert.equal(body.model, 'claude-sonnet-5-5');
        assert.equal(body.reasoning_effort, 'high');
        assert.deepEqual(body.messages, [{ role: 'system', content: 'SYS' }, { role: 'user', content: 'PAGES' }]);
        assert.ok(!options.body.includes('wiki-app-key'));
        return okReply('{"pages":[]}');
      } });
    assert.equal(result.stdout, '{"pages":[]}');
    assert.equal(result.transport, 'ai-proxy');
    await assert.rejects(invokeAiProxy({ prompt: 'x', env, logger: quiet, fetcher: async () => okReply('cut', 'length') }), /no usable text/);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('primary lane answers through the proxy and logs the run with usage, repo and sha', async () => {
  const { dir, env, runs } = await fixture('primary');
  try {
    const result = await invokeGenerator({ prompt: 'p', env, logger: quiet, purpose: 'wiki-update', meta: { repo: 'Jeffrey-Keyser/dev-inbox', sha: 'abc' } },
      { fetcher: registry(row()), invokeProvider: () => assert.fail('CLI must not run'),
        invokeProxy: async () => ({ stdout: 'ok', usage: { prompt_tokens: 900, completion_tokens: 40 } }) });
    assert.equal(result.stdout, 'ok');
    const [entry] = await runs();
    assert.equal(entry.schema, 'project-wiki-run/v1');
    assert.equal(entry.kind, 'invocation');
    assert.equal(entry.transport, 'ai-proxy');
    assert.equal(entry.state, 'finished');
    assert.equal(entry.repo, 'Jeffrey-Keyser/dev-inbox');
    assert.equal(entry.sha, 'abc');
    assert.deepEqual(entry.usage, { prompt_tokens: 900, completion_tokens: 40 });
    const receipt = JSON.parse(await fs.readFile(path.join(dir, `status/${GENERATOR_ROLE}.json`), 'utf8'));
    assert.equal(receipt.invocation.transport, 'ai-proxy');
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('primary lane falls back to the claude CLI when the proxy refuses, recording why without the message', async () => {
  const { dir, env, runs } = await fixture('primary');
  try {
    const result = await invokeGenerator({ prompt: 'SECRET PROMPT', env, logger: quiet },
      { fetcher: registry(row()), invokeProvider: async (opts) => { assert.equal(opts.provider, 'claude'); return { stdout: 'from cli' }; },
        invokeProxy: async () => { throw new Error('ai-proxy returned HTTP 429 ANTHROPIC_BUDGET_EXHAUSTED: SECRET PROMPT'); } });
    assert.equal(result.stdout, 'from cli');
    const entries = await runs();
    assert.deepEqual(entries.map((e) => [e.transport, e.state, e.errorKind ?? null, e.fallbackFrom]),
      [['ai-proxy', 'failed', 'http-429-ANTHROPIC_BUDGET_EXHAUSTED', null], ['cli', 'finished', null, 'ai-proxy']]);
    assert.ok(!JSON.stringify(entries).includes('SECRET'));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('the lane applies only to claude selections; other CLIs run alone and their failures propagate', async () => {
  const { dir, env } = await fixture('fallback');
  try {
    await assert.rejects(invokeGenerator({ prompt: 'p', env, logger: quiet },
      { fetcher: registry(row('codex', 'gpt-6.1-sol')), invokeProvider: async () => { throw new Error('provider "codex" exited with code 7'); },
        invokeProxy: () => assert.fail('proxy must not run for codex') }), /exited with code 7/);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('errorKind classifies failures coarsely', () => {
  assert.equal(errorKind(new Error('ai-proxy returned HTTP 402 PROVIDER_CREDITS_EXHAUSTED')), 'http-402-PROVIDER_CREDITS_EXHAUSTED');
  assert.equal(errorKind(new Error('provider "claude" exited with code 1. stderr tail: x')), 'exit-1');
  assert.equal(errorKind(new Error('The operation was aborted due to timeout')), 'timeout');
  assert.equal(errorKind('weird'), 'error');
});
