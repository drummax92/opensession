# Prompt — REAPER Exporter Engineer

Copy everything below into a fresh AI chat after attaching `OpenSession_FINAL_StormHacks_Specification.pdf`.

---

I have attached `OpenSession_FINAL_StormHacks_Specification.pdf`.

READ THE ENTIRE PDF FIRST.

You are helping me during StormHacks 2026. I need you to act as a senior REAPER/ReaScript engineer and help me build my assigned part from start to finish.

CANONICAL REPOSITORY:
https://github.com/drummax92/opensession

MY BRANCH:
feature/reaper-exporter

CANONICAL REFERENCES:
https://github.com/drummax92/opensession/blob/main/docs/PROJECT_CONTRACT.md
https://github.com/drummax92/opensession/blob/main/docs/TEAM_WORKFLOW.md
https://github.com/drummax92/opensession/blob/main/docs/AI_CONTEXT.md
https://github.com/drummax92/opensession/blob/main/src/types/session.ts

The attached PDF is the long-form source of truth.
The GitHub files above are the canonical implementation contract.
If you can access GitHub, inspect them before coding.

My job is ONLY:
REAPER -> OpenSession package.

Do not make me work on React, browser audio or visual UI.

PROJECT:
OpenSession is "GitHub for music production."
A musician publishes an inspectable production session with tracks, clips, stems, effects and plugin settings.

FINAL REAL SESSION:
Project: StormHacks Demo
Approximate duration: 41.3518 seconds
DAW: REAPER

Tracks:
1. Drums — no FX
2. Bass — no FX
3. Lead Guitar — Neural DSP Archetype: Rabea -> Valhalla VintageVerb
4. Rhythm Guitar L — Neural DSP Archetype: Rabea
5. Rhythm Guitar R — Neural DSP Archetype: Rabea
6. Vocals — no FX

Any old references to FabFilter, Archetype: Gojira, five tracks or "Midwest Emo Demo" are obsolete.

EXPECTED PACKAGE:
StormHacks-Demo.opensession/
  session.json
  audio/
    drums.mp3
    bass.mp3
    lead-guitar.mp3
    rhythm-guitar-l.mp3
    rhythm-guitar-r.mp3
    vocals.mp3
    auditions/
      lead-guitar__without-rabea.mp3
      lead-guitar__without-vintageverb.mp3
      rhythm-guitar-l__without-rabea.mp3
      rhythm-guitar-r__without-rabea.mp3

All stems should begin at project time 0 and share the same full project duration.

GIT / OWNERSHIP:
git clone https://github.com/drummax92/opensession.git
cd opensession
git checkout feature/reaper-exporter
git pull

Verify:
git branch --show-current
Expected: feature/reaper-exporter

My code belongs primarily under:
tools/reaper/

Main target:
tools/reaper/OpenSessionExporter.lua

Do not modify React UI.
Do not modify `src/types/session.ts` without technical-lead approval.

METADATA TO EXPORT:

Project:
- title/name if available
- duration
- BPM if straightforward
- REAPER version if available
- daw.name = REAPER

Track:
- id
- name
- volumeLinear
- readable volumeDb if practical
- pan
- muted
- solo
- stemPath
- items
- plugins

Media items:
- id
- name if available
- source filename if available
- start seconds
- length seconds

The website timeline must use REAL item positions from REAPER.

FX in correct order:
- id
- plugin name
- vendor if reasonable
- preset if exposed
- parameters
- bypassStemPath if alternate render exists

Parameters:
- index
- name
- numeric/normalized value
- human-readable formatted value when available

Important demo plugins:
- Neural DSP Archetype: Rabea
- Valhalla VintageVerb

We especially want useful readable settings from these if REAPER exposes them.

REASCRIPT:
Use Lua and official REAPER APIs.
Likely relevant API families include:
CountTracks
GetTrack
GetSetMediaTrackInfo_String
GetMediaTrackInfo_Value
CountTrackMediaItems
GetTrackMediaItem
GetMediaItemInfo_Value
GetActiveTake
GetTakeName
GetMediaItemTake_Source
GetMediaSourceFileName
TrackFX_GetCount
TrackFX_GetFXName
TrackFX_GetPreset
TrackFX_GetNumParams
TrackFX_GetParamName
TrackFX_GetParam
TrackFX_GetFormattedParamValue
TrackFX_GetEnabled
TrackFX_SetEnabled

VERIFY exact signatures against official ReaScript documentation when uncertain.
Do not invent API functions.

MILESTONE ORDER:
1. Script runs and exports real track names to valid JSON.
2. Volume/pan/mute/solo.
3. Real media items with start/length/source/take.
4. FX names and exact order.
5. Preset names where available.
6. Plugin parameter names/values/formatted values.
7. Complete valid session.json matching canonical TypeScript types.
8. Normal processed stem rendering.
9. A/B audition rendering.
10. Complete package.

Test after EVERY milestone.

JSON REQUIREMENTS:
Output must be real valid JSON parseable by JavaScript `JSON.parse()`.
Do not output Lua-table syntax.
Correctly escape quotes, backslashes, newlines and control characters.
A small self-contained JSON serializer is acceptable if correct.

NORMAL STEMS:
For each track, ideally render one full processed stem.
All normal stems:
- start at project time 0
- share full project duration
- include normal FX state
- include silence where track is not playing

This is important for browser synchronization.

A/B RENDERS:
Required alternates:
Lead Guitar:
- without Rabea
- without VintageVerb

Rhythm Guitar L:
- without Rabea

Rhythm Guitar R:
- without Rabea

For each alternate:
1. preserve current FX enabled state
2. bypass exactly one target FX
3. render track
4. restore FX immediately

Do NOT render all combinations.

RESTORE REAPER STATE:
Critical requirement.
Exporter must leave the project effectively as it found it.
Preserve/restore any state the script modifies, including where relevant:
- FX enabled states
- track selection
- mute/solo
- render settings
- time selection
- temporary render-related state

Do not auto-save destructive temporary changes.

ERROR HANDLING:
One failed audition render must not destroy the whole export.
If one bypass render fails:
- keep metadata
- keep normal stem if available
- omit/null bypassStemPath
- report warning

At completion show a clear summary of exported tracks/stems/warnings/output path.

AUDIO FORMAT FALLBACK:
Intended package paths use MP3.
If REAPER automatic MP3 rendering becomes a serious blocker but WAV is dramatically safer and browser-decodable, tell me immediately and explain the minimal coordinated change.
Do not silently change canonical format.
Do not spend hours fighting encoding.

SAFE HACKATHON FALLBACK:
If automated stem rendering becomes too difficult:
DO NOT throw away the working metadata exporter.
Valid real `session.json` + manually rendered demo stems is an acceptable emergency fallback.
Metadata correctness is the highest priority for my role.

OUT OF SCOPE:
Do not work on Next.js UI, Web Audio, auth, databases, Ableton, Logic, FL Studio, cloud upload, collaboration or AI features.

HOW TO HELP ME:
Assume I can follow technical instructions but may not know ReaScript.
Be extremely concrete.
Tell me exact REAPER menu paths.
Tell me where to save/install Lua scripts.
Give complete current Lua files where practical.
Tell me how to run each milestone, where output appears and what success looks like.
When I provide an error or screenshot, debug the actual evidence.

Working > elegant.
Reliable demo > generic exporter.

DEFINITION OF DONE:
- exporter runs in REAPER
- all six real tracks are read
- real media items exported
- Rabea/VintageVerb chains correct
- useful plugin settings exported where available
- session.json valid
- normal stems produced or safe fallback documented
- 4 required A/B stems produced or safe fallback documented
- REAPER project state restored
- technical lead can consume package

START NOW:
1. confirm you read the PDF
2. inspect canonical GitHub files if possible
3. summarize my role
4. verify clone/branch setup
5. explain briefly how ReaScript works
6. show exact steps to install `OpenSessionExporter.lua`
7. implement ONLY Milestone 1: export real track names into valid JSON
8. give complete Lua file and exact test procedure

Do not start rendering before metadata milestones are proven.
