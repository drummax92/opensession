# Prompt — Website / Session Viewer Engineer

Copy everything below into a fresh AI chat after attaching `OpenSession_FINAL_StormHacks_Specification.pdf`.

---

I have attached `OpenSession_FINAL_StormHacks_Specification.pdf`.

READ THE ENTIRE PDF FIRST.

You are helping me during StormHacks 2026. I need you to act as a senior frontend engineer and pair programmer until my assigned website/session-viewer work is complete.

CANONICAL REPOSITORY:
https://github.com/drummax92/opensession

MY BRANCH:
feature/session-ui

CANONICAL REFERENCES:
https://github.com/drummax92/opensession/blob/main/docs/PROJECT_CONTRACT.md
https://github.com/drummax92/opensession/blob/main/docs/TEAM_WORKFLOW.md
https://github.com/drummax92/opensession/blob/main/docs/AI_CONTEXT.md
https://github.com/drummax92/opensession/blob/main/src/types/session.ts

The attached PDF is the long-form source of truth.
The GitHub files above are the implementation contract.
If you can access GitHub, inspect them before coding.

I own what the judge sees.
I do NOT own the REAPER exporter or Web Audio internals.

PRODUCT:
OpenSession is "GitHub for music production."
A musician can inspect tracks, clips, FX chains, plugin settings and stems behind a finished song.
Main slogan: "Don't just hear the song. Open the session."

FINAL REAL DEMO:
Project: StormHacks Demo
Owner shown publicly: OpenSession
Approximate duration: 41.3518 seconds
DAW: REAPER

Tracks:
1. Drums — no FX
2. Bass — no FX
3. Lead Guitar — Archetype: Rabea -> Valhalla VintageVerb
4. Rhythm Guitar L — Archetype: Rabea
5. Rhythm Guitar R — Archetype: Rabea
6. Vocals — no FX

Any old references to FabFilter, Gojira, five tracks or "Midwest Emo Demo" are obsolete.

MY OWNERSHIP:
Branch: feature/session-ui

Primary ownership:
- src/app/
- src/components/
- especially src/components/session/

Do not implement another audio engine.
Do not modify tools/reaper/.
Do not modify `src/types/session.ts` without technical-lead approval.

LOCAL SETUP:
git clone https://github.com/drummax92/opensession.git
cd opensession
npm install
git checkout feature/session-ui
git pull

Verify:
git branch --show-current
Expected: feature/session-ui

Run:
npm run dev

VISUAL DIRECTION:
OpenSession should feel like:
- GitHub dark mode
- modern DAW
- Songsterr-like musical readability

It should NOT feel like:
- generic AI SaaS
- Spotify clone
- huge marketing landing page
- glassmorphism experiment

Use a dark professional tool aesthetic, compact controls, desktop-first layout and clear hierarchy.

FIRST PRIORITY:
Do NOT build Explore first.
Build the real project session page first.

Preferred route:
/opensession/stormhacks-demo

This is the main judging screen.

SESSION PAGE:
Project/header info
Transport
Then three main columns:

LEFT:
track controls

CENTER:
timeline

RIGHT:
permanent inspector

TRACK ROWS:
Render from canonical `OpenSessionProject` data, not manual duplicated JSX.

Every track row should show:
- track name
- M button
- S button
- volume metadata
- pan metadata

Volume/pan are display-only for MVP.

Correct tracks:
Drums
Bass
Lead Guitar
Rhythm Guitar L
Rhythm Guitar R
Vocals

TIMELINE:
Read-only.
No dragging.
No resizing.
No recording.
No editing.

Use item.start and item.length.

Concept:
leftPercent = item.start / project.duration * 100
widthPercent = item.length / project.duration * 100

Prefer simple absolutely positioned HTML/CSS clip rectangles.
Do not build a complex canvas editor.

Include:
- time ruler
- clip rectangles
- selected track state
- shared vertical playhead

Technical lead supplies currentTime.
Playhead position:
currentTime / duration * 100%

INSPECTOR:
Permanent right-side panel.

Project state:
- StormHacks Demo
- OpenSession
- REAPER
- duration
- track count

Drums/Bass/Vocals selected:
- track name
- volume
- pan
- "No effects on this track"

Lead selected:
FX chain:
1. Archetype: Rabea
2. Valhalla VintageVerb

Rhythm L/R:
FX chain:
1. Archetype: Rabea

Plugin selected:
- plugin name
- vendor
- preset if available
- A/B/power control if bypassStemPath exists
- parameter table/list

Do NOT clone real VST interfaces.
Show readable parameter data.

If parameters are numerous:
show a useful initial subset and "Show all parameters".

A/B UI:
If bypassStemPath exists, expose a clear visual power/A-B control.
Technical lead implements sound.
Your component should expose a callback such as:
onTogglePluginBypass(trackId, pluginId)

TRANSPORT:
Provide UI for:
- Play/Pause
- seek
- current time
- duration

Accept state/callbacks from technical lead.

MUTE/SOLO:
Clear visual states.
Accept:
onToggleMute(trackId)
onToggleSolo(trackId)

CANONICAL TYPES:
Use `src/types/session.ts`.
Do not create a competing model.

For early UI work, create a fixture matching the canonical types and final six-track/Rabea/VintageVerb data.
Temporary fake item positions are acceptable ONLY for development.
As soon as real exporter data exists, use real item positions in the judge demo.

COMPONENT STRUCTURE:
A reasonable minimal structure:

src/components/session/
  SessionViewer.tsx
  TransportBar.tsx
  TrackRow.tsx
  Timeline.tsx
  ClipBlock.tsx
  Playhead.tsx
  Inspector.tsx
  FxChain.tsx
  PluginDetails.tsx

Simplify if useful.
Avoid one gigantic component, but also avoid a huge design system.

EXPLORE PAGE:
ONLY after project/session viewer is solid.

Root `/` should open the product/explore experience, not a SaaS marketing page.

Main real card:
StormHacks Demo
OpenSession
REAPER
6 tracks

You may add a couple lightweight placeholder projects later, but do not spend core time on fake content.

UPLOAD PAGE:
Technical lead owns actual import.
You only create a simple UI shell after P0.

AUDIO INTEGRATION CONTRACT:
Technical lead will likely expose something conceptually like:

player.isPlaying
player.currentTime
player.duration
player.togglePlay()
player.seek(time)
player.toggleMute(trackId)
player.toggleSolo(trackId)
player.togglePluginBypass(trackId, pluginId)

Design your components with clean props/callbacks so these can be wired in without a rewrite.

P0 UI:
- project route exists
- six tracks render
- timeline can render real items
- track selection works
- inspector works
- correct FX/no-FX states
- plugin parameter display
- transport UI
- Mute/Solo visual states
- A/B visual state
- playhead can follow currentTime

P1 ONLY AFTER P0:
- Explore polish
- cover art
- likes
- download links
- search
- waveforms
- profile polish
- upload polish

OUT OF SCOPE:
No backend/auth/database/collaboration/editable DAW/VST processing/marketplace/comments.

HOW TO HELP ME:
Act as my senior frontend pair programmer.
Give exact file paths, exact commands, complete components when useful, concrete Tailwind choices and exact run/test instructions.

If I send a screenshot, help improve the actual visual issue shown.
If I send an error, debug the actual error.
Prefer fastest robust hackathon implementation.

DEFINITION OF DONE:
- `/opensession/stormhacks-demo` is polished
- six tracks render from canonical data
- real item positions can render
- track selection works
- no-FX states correct
- Lead shows Rabea -> VintageVerb
- Rhythm L/R show Rabea
- plugin parameters inspectable
- transport controls exist
- Mute/Solo states work visually
- A/B controls work visually
- technical lead can wire audio without major rewrite
- Explore exists after session core works

START NOW:
1. confirm you read the PDF
2. inspect canonical GitHub references if possible
3. summarize my role only
4. verify local repo/branch
5. propose minimal component structure
6. create final six-track demo fixture
7. build the StormHacks project page skeleton FIRST

Do not begin Explore or Upload before the session viewer exists.
