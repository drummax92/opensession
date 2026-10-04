# OpenSession — Frozen Project Contract

This file contains implementation constants shared by every team member and AI agent.

## Repository

- Repository: https://github.com/drummax92/opensession
- Default branch: `main`
- Public product name: **OpenSession**
- Core pitch: **GitHub for music production**
- Slogan: **Don't just hear the song. Open the session.**

## Real StormHacks Demo

- Project title: **StormHacks Demo**
- Owner shown publicly: **OpenSession**
- Slug: `stormhacks-demo`
- Preferred route: `/opensession/stormhacks-demo`
- Approximate final-mix duration: **41.3518 seconds**
- DAW: **REAPER**

### Tracks

1. **Drums**
   - FX: none
2. **Bass**
   - FX: none
3. **Lead Guitar**
   - FX chain:
     1. Neural DSP Archetype: Rabea
     2. Valhalla VintageVerb
4. **Rhythm Guitar L**
   - FX:
     1. Neural DSP Archetype: Rabea
5. **Rhythm Guitar R**
   - FX:
     1. Neural DSP Archetype: Rabea
6. **Vocals**
   - FX: none

Old concepts using FabFilter, Archetype: Gojira, five tracks, or a "Midwest Emo Demo" are obsolete and must not be used.

## Audio Package

Normal stems:

- `audio/drums.mp3`
- `audio/bass.mp3`
- `audio/lead-guitar.mp3`
- `audio/rhythm-guitar-l.mp3`
- `audio/rhythm-guitar-r.mp3`
- `audio/vocals.mp3`

Audition/A-B stems:

- `audio/auditions/lead-guitar__without-rabea.mp3`
- `audio/auditions/lead-guitar__without-vintageverb.mp3`
- `audio/auditions/rhythm-guitar-l__without-rabea.mp3`
- `audio/auditions/rhythm-guitar-r__without-rabea.mp3`

All rendered stems should start at project time 0 and use the same project duration so browser playback can stay synchronized.

## Plugin A/B Rule

A track can be in one of two states:

- normal
- exactly one plugin audition-bypassed

Do not support multiple simultaneous bypasses on one track in the hackathon MVP.

Primary judge demo:

1. Play StormHacks Demo.
2. Solo Lead Guitar.
3. Inspect Rabea -> VintageVerb.
4. Toggle VintageVerb A/B.
5. Optionally toggle Rabea A/B.
6. Show real plugin parameters.
7. Show that REAPER exporter generated the session metadata/package.

## Canonical Schema

The only shared TypeScript contract is:

`src/types/session.ts`

No team member or AI agent may silently create a competing schema.

Schema changes require technical-lead approval.

## P0

Must work before optional polish:

- real REAPER metadata exporter
- real item positions
- real FX chains
- plugin parameters where REAPER exposes them
- normal stem export or a safe manual-render fallback
- required A/B stems or a safe fallback
- DAW-like read-only session viewer
- synchronized browser playback
- play/pause/resume/seek
- mute/solo
- plugin A/B
- deployed public demo

## P1 Only After P0

- Explore polish
- local likes
- downloads
- search
- waveform visualization
- profile polish
- upload-page polish

## Explicitly Out of Scope

Do not build during this hackathon:

- authentication
- database
- collaboration
- commits/branches/version control
- comments
- marketplace
- cloud storage
- DAW editing in browser
- VST execution in browser
- Ableton/Logic/FL Studio adapters

These may appear only as future vision.
