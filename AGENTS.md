<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# OpenSession Agent Rules

Before making product or architecture changes, read:

1. `docs/PROJECT_CONTRACT.md`
2. `docs/TEAM_WORKFLOW.md`
3. `docs/AI_CONTEXT.md`
4. `src/types/session.ts`

The attached FINAL StormHacks PDF, when available, is the long-form source of truth.

## Frozen demo facts

- Project: StormHacks Demo
- Owner: OpenSession
- Tracks: Drums, Bass, Lead Guitar, Rhythm Guitar L, Rhythm Guitar R, Vocals
- Lead FX: Archetype: Rabea -> Valhalla VintageVerb
- Rhythm L/R FX: Archetype: Rabea
- Drums/Bass/Vocals: no FX

Do not use obsolete concepts involving FabFilter, Archetype: Gojira, five tracks, or Midwest Emo Demo.

## Scope control

Do not add authentication, databases, collaboration, version-control features, marketplace features, cloud storage, DAW editing, or VST execution in browser for the hackathon MVP.

Do not silently modify `src/types/session.ts`. Schema changes require technical-lead approval.

Work only in the role's assigned branch and ownership area unless explicitly coordinating integration.
