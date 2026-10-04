# REAPER Exporter

Owned by the REAPER-exporter role.

Primary target:

`tools/reaper/OpenSessionExporter.lua`

The exporter should read the real REAPER session and produce the OpenSession package defined in `docs/PROJECT_CONTRACT.md`.

## Arbitrary track names (2026-10-04)

A/B planning detects Rabea and VintageVerb in each track's FX chain, regardless
of track names. Original non-empty names are preserved; blank names get Track N.
Known demo names retain their filenames; other tracks use track-N, and duplicate
roles get unique suffixes. Each supported FX instance has a single-bypass render.
Exactly one Rabea plus one VintageVerb on any track also gets a combined render.
Repeated targets omit the ambiguous combination with a warning, keeping singles.
No schema changes. Only successful renders are linked in the JSON.

Stop playback and enable the effects intended for the normal mix before export.
Use a fresh output folder per project (rename the old StormHacks-Demo.opensession
folder first): old unreferenced files are not deleted automatically. For the
Cadillac project expect 6 normal, 4 auditions, 1 combined, all 129 seconds.
The output folder/title are still StormHacks Demo; naming the published project
is separate from detection of tracks and effects.

Planning regression test with Lua 5.4 from the repository root:
`lua tools/reaper/tests/planning.lua`
This tests production planning functions and restoration with mocked REAPER calls;
an actual REAPER render and browser listening check are still required.
