# OpenSession Team Workflow

## Branches

- `main` — integration and demo branch
- `feature/audio-integration` — technical lead: audio engine, import, integration, deployment
- `feature/reaper-exporter` — REAPER Lua exporter
- `feature/session-ui` — website/session viewer UI

The Product/QA/Pitch teammate does not need a coding branch.

## Ownership

### Technical Lead / Audio / Integration

Primary ownership:

- `src/hooks/`
- `src/lib/audio/`
- `src/lib/import/`
- integration work
- deployment
- final merges

### REAPER Exporter Engineer

Primary ownership:

- `tools/reaper/`

Do not modify React UI unless coordinated.

### Session UI Engineer

Primary ownership:

- `src/app/`
- `src/components/`

Do not implement a second audio engine.

### Shared File

- `src/types/session.ts`

Do not modify without technical-lead approval.

## Local Setup

```bash
git clone https://github.com/drummax92/opensession.git
cd opensession
npm install
```

Then switch to the assigned branch.

## Before Starting Work

Always:

```bash
git checkout <your-branch>
git pull
```

## During Work

Commit small working milestones:

```bash
git add -A
git commit -m "feat: concise description"
git push
```

Do not push unfinished experimental rewrites into `main`.

## Main Branch

The technical lead owns final integration into `main`.

Other developers should finish work on their feature branch and report:

- branch name
- latest commit SHA
- what is working
- what is partial
- what is not working
- any schema/interface assumptions

## Checkpoints

Every 60–90 minutes, show working output instead of only describing progress.

Expected early proof:

- Audio: two stems synchronized.
- REAPER: real track names/items/FX exported to JSON.
- UI: six-track session viewer with timeline and inspector.
- Product/QA: copy + QA checklist + pitch outline.

## Hackathon Rule

Prefer:

- working over elegant
- reliable over general
- demo-safe over production-complete

After feature freeze, only fix bugs, integrate, deploy, test, and prepare presentation/submission.
