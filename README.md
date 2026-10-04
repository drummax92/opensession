# OpenSession

**GitHub for music production.**

> Don't just hear the song. Open the session.

OpenSession is a StormHacks 2026 hackathon project for publishing inspectable music-production sessions: tracks, clips, stems, FX chains, plugin settings, and audible A/B effect comparisons.

## Repository Map

Read these before coding:

- [Frozen Project Contract](docs/PROJECT_CONTRACT.md)
- [Team Workflow](docs/TEAM_WORKFLOW.md)
- [AI Agent Context](docs/AI_CONTEXT.md)
- [Canonical Session Types](src/types/session.ts)

## Real Demo

**StormHacks Demo**

- DAW: REAPER
- Approx. duration: 41.3518 s
- Tracks: Drums, Bass, Lead Guitar, Rhythm Guitar L, Rhythm Guitar R, Vocals
- Lead Guitar FX: Archetype: Rabea -> Valhalla VintageVerb
- Rhythm Guitar L/R FX: Archetype: Rabea

Old references to FabFilter, Archetype: Gojira, five tracks, or "Midwest Emo Demo" are obsolete.

## Branches

- `main` — integration/demo
- `feature/audio-integration` — technical lead / Web Audio / import / deployment
- `feature/reaper-exporter` — REAPER exporter
- `feature/session-ui` — website/session viewer

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Web Audio API
- REAPER ReaScript (Lua)
- Vercel

## Local Setup

```bash
git clone https://github.com/drummax92/opensession.git
cd opensession
npm install
npm run dev
```

Then switch to your assigned branch.

See `docs/TEAM_WORKFLOW.md` for ownership and Git rules.
