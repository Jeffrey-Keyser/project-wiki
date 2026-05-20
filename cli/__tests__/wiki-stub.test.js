import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderStubBody } from '../wiki-stub.js';

test('renderStubBody substitutes <repo> in heading, prose, and URL', () => {
  const body = renderStubBody({ repo: 'dev-inbox', slug: 'Jeffrey-Keyser-dev-inbox' });
  assert.match(body, /^# dev-inbox/);
  assert.match(body, /canonical wiki for dev-inbox/);
  assert.match(
    body,
    /https:\/\/wiki\.jeffreykeyser\.net\/repos\/Jeffrey-Keyser-dev-inbox/,
  );
  assert.match(body, /per-repo GitHub Wiki tab is intentionally a stub/);
  assert.match(body, /allowed to drift briefly behind merges\.\n$/);
});

test('renderStubBody body is byte-stable across calls with same inputs', () => {
  const a = renderStubBody({ repo: 'dev-inbox', slug: 'Jeffrey-Keyser-dev-inbox' });
  const b = renderStubBody({ repo: 'dev-inbox', slug: 'Jeffrey-Keyser-dev-inbox' });
  assert.equal(a, b);
});
