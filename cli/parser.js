// Parses the scaffolder agent's stdout payload into the six seed-page files.
//
// The agent is asked to emit one block per file, delimited by sentinel lines:
//
//   <<<FILE Home.md>>>
//   ---
//   title: ...
//   ---
//   ...body...
//   <<<ENDFILE>>>
//
// Order is not significant; missing pages cause an error so the worker can
// retry with a clearer prompt rather than silently shipping a half-built
// taxonomy.

export const SEED_PAGES = [
  'Home.md',
  'Architecture.md',
  'Iteration-Loop.md',
  'Services-and-Dependencies.md',
  'Operations.md',
  'Glossary.md',
];

// LLMs occasionally wrap delimiter lines in surrounding whitespace or
// backticks (e.g. `<<<FILE Home.md>>>`). Strip those before matching so a
// stray formatting flourish doesn't lose us the whole block.
const START_RE = /^\s*`?<<<FILE\s+([A-Za-z0-9._-]+\.md)>>>`?\s*$/;
const END_RE = /^\s*`?<<<ENDFILE>>>`?\s*$/;

export function parsePayload(payload, { fullName }) {
  if (typeof payload !== 'string' || !payload.trim()) {
    throw new Error('scaffolder produced empty output');
  }

  const pages = {};
  const lines = payload.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const startMatch = START_RE.exec(line);
    if (!startMatch) { i++; continue; }
    const name = startMatch[1];
    const bodyLines = [];
    i++;
    let closed = false;
    while (i < lines.length) {
      if (END_RE.test(lines[i])) { closed = true; i++; break; }
      // Allow nested <<<FILE>>> markers to terminate the previous block so
      // partial-write recovery is forgiving when the agent forgets ENDFILE.
      if (START_RE.test(lines[i])) { closed = true; break; }
      bodyLines.push(lines[i]);
      i++;
    }
    if (!closed) {
      throw new Error(`scaffolder block "${name}" was never closed (missing <<<ENDFILE>>>)`);
    }
    if (pages[name] !== undefined) {
      throw new Error(`scaffolder emitted duplicate file "${name}"`);
    }
    pages[name] = trimOuterBlankLines(bodyLines.join('\n'));
  }

  const missing = SEED_PAGES.filter((p) => pages[p] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `scaffolder payload missing required pages: ${missing.join(', ')}. ` +
      `Expected six pages from the seed taxonomy for ${fullName}.`,
    );
  }
  const extras = Object.keys(pages).filter((p) => !SEED_PAGES.includes(p));
  if (extras.length > 0) {
    throw new Error(
      `scaffolder payload contained unexpected pages: ${extras.join(', ')}. ` +
      `Only the six-page seed taxonomy is allowed.`,
    );
  }
  for (const page of SEED_PAGES) {
    const body = pages[page];
    if (!body || body.trim().length < 40) {
      throw new Error(`scaffolder page "${page}" is too short (<40 chars after trim)`);
    }
    if (!/\[[^\]]+\]\(https?:\/\//.test(body)) {
      throw new Error(
        `scaffolder page "${page}" has no markdown link citations. ` +
        `The six-page taxonomy requires per-page source citations.`,
      );
    }
  }
  return pages;
}

function trimOuterBlankLines(s) {
  return s.replace(/^\s*\n/, '').replace(/\s*\n\s*$/, '');
}
