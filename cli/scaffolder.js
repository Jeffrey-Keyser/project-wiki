import { SEED_PAGES } from './parser.js';
import { invoke, resolveProviderConfig } from '../server/providers.js';

// Shells out to a local provider CLI so the agent inspects the target repo's
// source from `cwd` and emits a parseable stdout payload that parser.js splits
// into the six seed pages.

export async function runScaffolder({ owner, repo, slug, fullName, cwd, env, log, warn }) {
  const prompt = buildPrompt({ owner, repo, slug, fullName });
  const { provider, model } = resolveProviderConfig('generator', env);
  const result = await invoke({
    provider,
    model,
    prompt,
    promptMode: 'stdin',
    cwd,
    env,
    logger: { log },
    purpose: 'scaffold',
  });
  warn(`[scaffold] completed via ${result.command} in ${Math.round(result.durationMs)}ms`);
  return result.stdout;
}

function buildPrompt({ owner, repo, slug, fullName }) {
  const fileList = SEED_PAGES.map((p) => `  - ${p}`).join('\n');
  return `You are a wiki-scaffold scout for the Jeffrey-Keyser project-wiki.

Target repo: ${fullName}
You are running with cwd set to a local checkout of that repo. Read its
README, CLAUDE.md, package.json, top-level source files, and any obvious
entry points to build an accurate high-level overview.

Produce SIX seed wiki pages for this repo. The exact file list and order:

${fileList}

Page intent (from project-wiki concept plan §7.2):
  - Home.md: per-repo overview — what is this repo, who uses it, how does
    work move through it. Include a short bullet list "At a glance" and a
    "Wiki pages" section that links to the other five pages with relative
    slugs (./architecture/, ./iteration-loop/, ./services-and-dependencies/,
    ./operations/, ./glossary/).
  - Architecture.md: internal module/service layout. Include a single
    Mermaid diagram (flowchart or graph) of the major internal components,
    plus narrative role contracts citing the source files that define each
    role.
  - Iteration-Loop.md: the typical change cycle — how features move from
    idea to merge inside THIS repo. Include a single Mermaid sequenceDiagram
    or flowchart of that cycle, with the steps cited back to source.
  - Services-and-Dependencies.md: inbound and outbound integrations. What
    this repo depends on (libraries, services, exchanges, cron targets) and
    what depends on it. Group as "Depends on" / "Consumed by" lists with
    citations.
  - Operations.md: deploy, runtime, observability, on-call notes. If the
    repo is a pure library with no deployable surface, say so explicitly and
    cite the README/package.json signal that established that. Otherwise
    cover start command, port, systemd unit (if any), logs, health probe.
  - Glossary.md: repo-specific terms with one-paragraph definitions and a
    cite per term back to the source file that defines it.

Citation contract:
  - Every nontrivial claim must end with a markdown link to a specific
    file:line on GitHub, e.g.
    ([README.md:12](https://github.com/${fullName}/blob/main/README.md#L12))
    or ([CLAUDE.md:6-12](https://github.com/${fullName}/blob/main/CLAUDE.md#L6-L12)).
  - Use main as the branch ref unless the repo's default is clearly
    different from its README/CONTRIBUTING.

Frontmatter (required, top of each file):
  ---
  title: <human title>
  description: <one-sentence summary>
  ---

Output format — STRICT, the wiki CLI parses this verbatim. Emit each file
inside a delimited block, in any order, with no commentary outside the
blocks:

  <<<FILE Home.md>>>
  ---
  title: ...
  description: ...
  ---

  ...page body...
  <<<ENDFILE>>>

  <<<FILE Architecture.md>>>
  ...
  <<<ENDFILE>>>

  ... (and so on for the remaining four pages)

Rules:
  - Do NOT emit any text outside <<<FILE ...>>> / <<<ENDFILE>>> blocks.
  - Do NOT emit additional pages — exactly the six listed above.
  - Do NOT emit code fences around the entire payload.
  - Each page must contain at least one citation link.
  - Keep pages concise: ~300-1200 words each.
  - The slug used by the central wiki for this repo is "${slug}" — when you
    need to link cross-repo to other wiki pages on
    https://wiki.jeffreykeyser.net/repos/<other-slug>/, use that slug shape.

Begin emitting blocks now.
`;
}
