# Prompt — Technical Lead / Audio Engine / Integration

Copy everything below into a fresh AI chat after attaching `OpenSession_FINAL_StormHacks_Specification.pdf`.

---

I have attached `OpenSession_FINAL_StormHacks_Specification.pdf`.

READ THE ENTIRE PDF FIRST.

You are helping me during StormHacks 2026. I am the technical lead and strongest technical member of a four-person team. I need you to act as my senior engineer and pair programmer until my assigned part is actually complete.

CANONICAL REPOSITORY:
https://github.com/drummax92/opensession

MY BRANCH:
feature/audio-integration

CANONICAL REFERENCES:
https://github.com/drummax92/opensession/blob/main/docs/PROJECT_CONTRACT.md
https://github.com/drummax92/opensession/blob/main/docs/TEAM_WORKFLOW.md
https://github.com/drummax92/opensession/blob/main/docs/AI_CONTEXT.md
https://github.com/drummax92/opensession/blob/main/src/types/session.ts

The attached PDF is the long-form source of truth. The GitHub files above are the implementation contract. If you have web/GitHub access, inspect them before coding.

Do NOT create a competing schema.
Do NOT silently modify `src/types/session.ts`.
Any schema change requires explicit approval from me.

PROJECT:
OpenSession is "GitHub for music production."
Instead of sharing only a finished song, a musician can publish an inspectable production session with tracks, clips/items, stems, FX chains and plugin settings.
Main slogan: "Don't just hear the song. Open the session."

FINAL REAL DEMO:
Project: StormHacks Demo
Owner shown publicly: OpenSession
DAW: REAPER
Approximate duration: 41.3518 seconds

Tracks:
1. Drums — no FX
2. Bass — no FX
3. Lead Guitar — Neural DSP Archetype: Rabea -> Valhalla VintageVerb
4. Rhythm Guitar L — Neural DSP Archetype: Rabea
5. Rhythm Guitar R — Neural DSP Archetype: Rabea
6. Vocals — no FX

Old references to FabFilter, Archetype: Gojira, five tracks or "Midwest Emo Demo" are obsolete.

Normal stems:
audio/drums.mp3
audio/bass.mp3
audio/lead-guitar.mp3
audio/rhythm-guitar-l.mp3
audio/rhythm-guitar-r.mp3
audio/vocals.mp3

A/B stems:
audio/auditions/lead-guitar__without-rabea.mp3
audio/auditions/lead-guitar__without-vintageverb.mp3
audio/auditions/rhythm-guitar-l__without-rabea.mp3
audio/auditions/rhythm-guitar-r__without-rabea.mp3

All stems should start at project time 0 and share the same project duration.

MY OWNERSHIP:
- src/hooks/
- src/lib/audio/
- src/lib/import/
- synchronized Web Audio playback
- Play/Pause/Resume/Seek
- currentTime/playhead state
- Mute/Solo
- plugin A/B
- local package import
- integration of exporter + UI
- final merges
- deployment
- final technical QA

Another teammate owns `tools/reaper/`.
Another owns `src/app/` and `src/components/`.
Avoid rewriting their work.

LOCAL SETUP:
git clone https://github.com/drummax92/opensession.git
cd opensession
npm install
git checkout feature/audio-integration
git pull

Always verify:
git branch --show-current
Expected: feature/audio-integration

AUDIO ARCHITECTURE:
Use one Web Audio API `AudioContext`.
Do not build the core system as six unrelated HTML audio elements started sequentially.

Decode stems to AudioBuffers.
Conceptually:
AudioBufferSourceNode -> per-track GainNode -> master GainNode -> destination

When playing, schedule every track against the same clock:
const startAt = audioContext.currentTime + 0.05
source.start(startAt, playbackOffset)

Remember AudioBufferSourceNode is one-shot.

PLAY:
- create fresh sources
- schedule with common startAt
- start at playbackOffset

PAUSE:
- calculate current project time
- store playbackOffset
- stop sources

RESUME:
- create fresh sources
- start from stored offset

SEEK:
- stop active sources
- change offset
- recreate if previously playing

CURRENT TIME:
Expose smooth currentTime for UI.
Conceptually:
currentTime = playbackOffset + (audioContext.currentTime - startedAt)
Clamp to project duration.
A simple requestAnimationFrame loop is fine.

MUTE/SOLO:
Use GainNodes.
If zero soloed tracks: all non-muted tracks play.
If one or more are soloed: only soloed and non-muted tracks play.

PLUGIN A/B:
Browser does not run Rabea/VintageVerb.
It switches between pre-rendered stems.

On Lead Guitar, normal = Rabea ON + VintageVerb ON.
Without Rabea = Rabea OFF + VintageVerb ON.
Without VintageVerb = Rabea ON + VintageVerb OFF.

Only one plugin may be bypassed per track at a time.
The primary judge demo is Lead Guitar VintageVerb ON/OFF.
Second priority is Lead Guitar Rabea ON/OFF.

If playback is at 27.300s and VintageVerb is toggled off, only Lead Guitar should switch to its alternate source starting at roughly 27.300s while other tracks continue.
A tiny safe crossfade is optional; synchronization is more important.

UI API:
Expose a clean React-facing API, ideally something like:
useSessionPlayer(project)

with:
isLoading
isReady
isPlaying
currentTime
duration
play()
pause()
togglePlay()
seek(seconds)
toggleMute(trackId)
toggleSolo(trackId)
togglePluginBypass(trackId, pluginId)
mutedTrackIds
soloTrackIds
bypassedPluginByTrack

MILESTONE ORDER:
1. Two synchronized static stems.
2. Play/Pause/Resume/Seek/currentTime.
3. All six normal stems.
4. Mute/Solo.
5. Lead VintageVerb A/B.
6. Lead Rabea A/B.
7. Rhythm A/B if time.
8. Reusable hook/API.
9. Integrate session UI.
10. Local package import.
11. Merge and deploy.

Do not start with generic import.
Bundled judge demo under `public/demo/stormhacks/` is more important.

PACKAGE IMPORT:
Only after bundled demo works.
No backend/database/auth.
Browser should select package files, find session.json, JSON.parse it, resolve stemPath/bypassStemPath to local Files, decode audio and render through the normal viewer.
If directory picker is awkward, multi-file selection is an acceptable fallback.

DEPLOYMENT:
Target Vercel.
Final public URL must work in incognito.
Verify project loads, six tracks show, Play works, Solo Lead works, Lead FX chain appears, VintageVerb A/B works, no fatal console errors.

OUT OF SCOPE:
No Supabase/Firebase/Prisma/auth/database/collaboration/comments/marketplace/VST execution/editable DAW/MIDI editor/recording/complex backend.

HOW TO HELP ME:
Act as my senior engineer and pair programmer.
For every milestone:
1. state goal
2. exact files
3. exact commands
4. complete code when useful
5. brief important reasoning
6. exact tests
7. expected behavior
8. debug actual errors/screenshots/logs I provide

Do not dump a giant untested final implementation.
Work incrementally.
If something is taking too long, explicitly recommend the safest fallback.
Working > elegant.
Reliable > general.
Demo-safe > production-perfect.

DEFINITION OF DONE:
- six stems synchronized
- Play/Pause/Resume/Seek
- currentTime/playhead
- Mute/Solo
- Lead VintageVerb A/B
- Lead Rabea A/B
- clean UI API
- real exporter data consumed
- package import or safe fallback
- teammate work integrated
- public deployment works
- judge demo runs twice consecutively without critical failure

START NOW:
1. confirm you read the PDF
2. inspect canonical GitHub files if possible
3. summarize my responsibilities only
4. verify local repo/branch
5. start ONLY Milestone 1: two synchronized stems
6. give exact file paths, commands, code and test procedure

Do not begin import or plugin A/B until basic synchronization works.
