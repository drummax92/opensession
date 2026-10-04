# Prompt — Product / QA / Pitch / Devpost (Non-Technical)

Copy everything below into a fresh AI chat after attaching `OpenSession_FINAL_StormHacks_Specification.pdf`.

---

I have attached `OpenSession_FINAL_StormHacks_Specification.pdf`.

READ THE ENTIRE PDF FIRST.

I am participating in StormHacks 2026 with three teammates.

IMPORTANT:
I am not an experienced programmer and I am not very confident using computers.
My assigned role intentionally does NOT require core coding.

Please guide me very clearly, including click-by-click instructions when needed.
Do not assume I know Git, terminals, programming, Figma or video editing.
Prefer browser-based tools whenever possible.

CANONICAL PUBLIC REPOSITORY:
https://github.com/drummax92/opensession

CANONICAL PRODUCT CONTRACT:
https://github.com/drummax92/opensession/blob/main/docs/PROJECT_CONTRACT.md

If you can access those public links, read them.
The attached PDF is the long-form source of truth.

PRODUCT:
OpenSession is "GitHub for music production."

Instead of sharing only a finished song, a musician can publish an inspectable production session.
Other musicians can inspect:
- tracks
- clips
- stems
- effects/plugins
- plugin settings

They can solo tracks and hear what individual effects contribute.

Main slogan:
"Don't just hear the song. Open the session."

FINAL REAL DEMO:
Project: StormHacks Demo
Owner shown publicly: OpenSession
Approximate duration: 41.3518 seconds

Tracks:
1. Drums — no effects
2. Bass — no effects
3. Lead Guitar — Archetype: Rabea -> Valhalla VintageVerb
4. Rhythm Guitar L — Archetype: Rabea
5. Rhythm Guitar R — Archetype: Rabea
6. Vocals — no effects

Any old references to FabFilter, Gojira, five tracks or Midwest Emo are obsolete.

Main judge demo should include:
- play real song
- solo Lead Guitar
- inspect Rabea + VintageVerb
- toggle VintageVerb A/B so judges hear the difference
- inspect real settings
- show that REAPER/exporter produced the session information

MY ROLE:
I own:
- product clarity
- QA
- pitch
- Devpost
- demo preparation
- final submission checklist

I do NOT need to write core code.

My purpose is to remove work from developers and make the project easy for judges to understand.

TASK 1 — UNDERSTAND THE PRODUCT

Teach me OpenSession in simple language.
I need to explain it in:
- one sentence
- 15 seconds
- 30 seconds
- 2 minutes

Correct me if I misunderstand anything.

TASK 2 — FINAL WEBSITE COPY

Help create concise final text for:
- StormHacks Demo project description
- Explore card
- Upload page instructions
- no-effects state
- short project tagline
- useful labels if developers request them

Do NOT use personal team-member names publicly unless team explicitly asks.
Avoid generic corporate/SaaS wording.

TASK 3 — OPTIONAL COVER

Only if the team needs one:
Help me make ONE simple StormHacks Demo cover using an easy browser tool such as Canva.
Give click-by-click instructions.
Hard limit: 30–45 minutes.
Do not let me spend the night on branding.

TASK 4 — QA

When developers give me a public or local URL, test it like a judge.

HOME / EXPLORE:
- page opens
- OpenSession name visible
- StormHacks Demo easy to find
- no obviously broken primary buttons

PROJECT:
- StormHacks Demo opens
- six correct tracks visible

TIMELINE:
- clips visible
- no severe overlap/broken layout
- playhead moves if implemented

PLAYBACK:
- Play
- Pause
- Seek
- no obvious desynchronization

MUTE / SOLO:
- controls work
- Solo Lead Guitar isolates Lead Guitar

INSPECTOR:
Lead shows:
- Archetype: Rabea
- Valhalla VintageVerb

Rhythm L/R show:
- Archetype: Rabea

Drums/Bass/Vocals correctly show no effects.

PLUGIN SETTINGS:
- Rabea settings readable
- VintageVerb settings readable
- no obviously broken values/layout

A/B:
- VintageVerb ON/OFF audibly changes Lead Guitar
- visual state makes sense
- playback does not crash

BUG REPORT FORMAT:

SEVERITY:
P0 / P1 / P2

PAGE:
where

ACTION:
what I clicked

EXPECTED:
what should happen

ACTUAL:
what happened

SCREENSHOT:
attach if useful

P0 = judge demo breaks
P1 = important but demo survives
P2 = cosmetic/minor

Report P0 immediately.
Do not distract developers with P2 while core features are broken.

TASK 5 — LIVE PITCH

Help me create and rehearse a natural 2–3 minute pitch.

Core story:
Software developers can inspect open-source code.
Musicians usually cannot inspect how a song was produced.
OpenSession makes the session inspectable.

Recommended flow:
1. problem
2. one-sentence OpenSession explanation
3. Explore
4. open StormHacks Demo
5. play real song
6. mention the team recorded it during the hackathon
7. Solo Lead Guitar
8. inspect Lead Guitar
9. show Rabea + VintageVerb
10. toggle VintageVerb OFF
11. let judges hear difference
12. turn it ON again
13. show real settings
14. explain metadata was not manually entered
15. show REAPER exporter/import if working
16. future vision
17. end with:
   "Don't just hear the song. Open the session."

Make it sound like students presenting a cool product, not a corporate speech.

TASK 6 — BACKUP DEMO

Prepare:
PLAN A: live demo
PLAN B: stable already-open tab/page
PLAN C: short screen recording of the core working demo

Give simple step-by-step preparation instructions.

TASK 7 — DEMO VIDEO

Help plan and record a simple submission video.
Prefer screen recording over complicated editing.

Possible timeline:
0:00–0:10 title/problem
0:10–0:25 Explore
0:25–0:45 play session
0:45–1:05 Solo Lead
1:05–1:30 inspect Rabea/VintageVerb
1:30–1:50 VintageVerb A/B
1:50–2:15 exporter/import if working
2:15–end future vision + slogan

Adjust to what developers confirm actually works.

TASK 8 — DEVPOST

Prepare drafts for:
- Inspiration
- What it does
- How we built it
- Challenges we ran into
- Accomplishments
- What we learned
- What's next

NEVER invent working features.

Before finalizing, ask team for:
WORKING:
PARTIAL:
NOT WORKING:

Only claim WORKING features as completed.
Ableton/Logic/FL Studio are future vision unless explicitly implemented.

TASK 9 — JUDGING STORY

Make sure pitch visibly demonstrates:

TECHNICAL COMPLEXITY:
- REAPER extraction
- OpenSession format
- synchronized multitrack browser audio
- FX A/B

DESIGN:
- understandable DAW-like inspection UI

ORIGINALITY:
- GitHub/open-source metaphor applied to production knowledge

PITCH:
- clear problem
- simple solution
- short working demo

Do not invent complexity just to sound technical.

TASK 10 — FINAL SUBMISSION CHECKLIST

Own this checklist:
- public URL works
- project title correct
- team details correct
- description ready
- screenshots ready
- demo video uploaded/linked if required
- repository linked if required
- technologies accurate
- all team members added
- no placeholder text
- main demo has no known P0 issue
- pitch rehearsed
- backup demo available

BEGINNER COMPUTER GUIDANCE:
Because I am not confident with computers:
- use plain language
- one operation at a time
- exact buttons/menu names when possible
- tell me what I should see after each click
- avoid terminal commands
- do not make me install developer tools
- if I send a screenshot, tell me exactly where to click

PRIORITY:
1. understand product
2. final copy
3. QA checklist
4. test site
5. report P0 bugs
6. pitch
7. Devpost
8. demo video
9. submission checklist

My job is to REDUCE developer workload.

DEFINITION OF DONE:
- I can explain OpenSession clearly
- final product copy exists
- main demo QA-tested
- P0 bugs clearly reported
- 2–3 minute pitch exists
- demo sequence documented
- backup plan exists
- Devpost draft exists
- video plan/recording prepared
- final submission checklist checked

START NOW:
1. confirm you read the attached PDF
2. explain OpenSession to me in very simple language
3. explain MY role simply
4. give me only my first three tasks
5. immediately guide me through Task 1

Remember: I am not a programmer. Do not overwhelm me with technical work.
