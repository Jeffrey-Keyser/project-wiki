# project-wiki

Centralized ecosystem wiki for the Jeffrey-Keyser projects. This repository
hosts the static site generated from per-repo Markdown content collected under
`content/`.

The wiki is built with [Astro](https://astro.build) and the
[Starlight](https://starlight.astro.build) docs template. Mermaid code blocks
are rendered to inline SVG at build time via `rehype-mermaid`.

## Layout

```
content/
  index.md            # landing page
  repos/              # per-repository wiki content (added by later slices)
    _smoke/           # build smoke tests (kept out of the navigation tree)
.wiki-config.json     # repo allowlist for downstream tooling
astro.config.mjs      # Astro + Starlight + Mermaid configuration
src/content.config.ts # Starlight docs collection pointed at ../content
```

## Local development

```bash
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # static build into dist/
```

## Plan and roadmap

The end-to-end design for this wiki — including the per-repo ingestion pipeline,
allowlist semantics, and hosting decisions — lives in
`~/dev-inbox/plans/project-wiki-plan.md`. Read that plan before adding new
features to this repo so changes stay aligned with the broader roadmap.
