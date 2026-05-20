import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePayload, SEED_PAGES } from '../parser.js';

function buildBlock(name, body) {
  return `<<<FILE ${name}>>>\n${body}\n<<<ENDFILE>>>\n`;
}

function buildValidPayload(extra = '') {
  return SEED_PAGES.map((name) =>
    buildBlock(
      name,
      `---\ntitle: ${name}\ndescription: test\n---\n\nSee ([README.md:1](https://github.com/X/Y/blob/main/README.md#L1)).`,
    ),
  ).join('\n') + extra;
}

test('parsePayload returns all six pages when payload is well-formed', () => {
  const pages = parsePayload(buildValidPayload(), { fullName: 'X/Y' });
  for (const name of SEED_PAGES) {
    assert.ok(pages[name], `expected page ${name}`);
    assert.match(pages[name], /https:\/\//);
  }
});

test('parsePayload tolerates non-block text between blocks', () => {
  const payload =
    'preamble noise\n' +
    buildValidPayload() +
    '\nepilogue noise\n';
  const pages = parsePayload(payload, { fullName: 'X/Y' });
  assert.equal(Object.keys(pages).length, SEED_PAGES.length);
});

test('parsePayload throws on missing page', () => {
  const blocks = SEED_PAGES.slice(0, 5)
    .map((name) =>
      buildBlock(
        name,
        `---\ntitle: t\n---\nbody ([f.md:1](https://github.com/x/y/blob/main/f.md#L1))`,
      ),
    )
    .join('\n');
  assert.throws(
    () => parsePayload(blocks, { fullName: 'X/Y' }),
    /missing required pages.*Glossary\.md/,
  );
});

test('parsePayload throws on unexpected page', () => {
  const payload = buildValidPayload() + buildBlock('Surprise.md', 'unwanted https://e.com');
  assert.throws(
    () => parsePayload(payload, { fullName: 'X/Y' }),
    /unexpected pages: Surprise\.md/,
  );
});

test('parsePayload throws when a page is missing a citation link', () => {
  const blocks = SEED_PAGES.slice(0, 5)
    .map((name) =>
      buildBlock(
        name,
        `---\ntitle: t\n---\nbody ([f.md:1](https://github.com/x/y/blob/main/f.md#L1))`,
      ),
    )
    .join('\n');
  const payload =
    blocks +
    buildBlock('Glossary.md', '---\ntitle: g\n---\nplain prose without citations at all just words to pad past forty characters total length');
  assert.throws(
    () => parsePayload(payload, { fullName: 'X/Y' }),
    /no markdown link citations/,
  );
});

test('parsePayload throws on unclosed block', () => {
  const payload = '<<<FILE Home.md>>>\nbody without an end marker';
  assert.throws(
    () => parsePayload(payload, { fullName: 'X/Y' }),
    /never closed/,
  );
});

test('parsePayload throws on duplicate file blocks', () => {
  const payload =
    buildValidPayload() +
    buildBlock('Home.md', '---\ntitle: t\n---\nbody ([f.md:1](https://github.com/x/y/blob/main/f.md#L1))');
  assert.throws(
    () => parsePayload(payload, { fullName: 'X/Y' }),
    /duplicate file "Home\.md"/,
  );
});

test('parsePayload throws on empty input', () => {
  assert.throws(
    () => parsePayload('', { fullName: 'X/Y' }),
    /empty output/,
  );
});
