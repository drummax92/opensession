# Milestone 4: Mute / Solo

Run from the repository root on `feature/audio-integration`:

```bash
git branch --show-current
npm install
npx next typegen
npx tsc --noEmit
npm run lint
node --test src/lib/audio/proof/synchronization.test.mjs
node src/lib/audio/proof/server.mjs
```

Open http://localhost:3001. This local-only test server does not change the
teammate-owned Next.js UI. Stop it with Ctrl+C.

## Real audio prerequisite

Place the team's original full-length exports at:

- `public/demo/stormhacks/audio/drums.mp3`
- `public/demo/stormhacks/audio/bass.mp3`
- `public/demo/stormhacks/audio/lead-guitar.mp3`
- `public/demo/stormhacks/audio/rhythm-guitar-l.mp3`
- `public/demo/stormhacks/audio/rhythm-guitar-r.mp3`
- `public/demo/stormhacks/audio/vocals.mp3`

All six exports must start at project zero, retain leading silence, and use the
same project end (approximately 41.3518 seconds). Do not trim independently.
The files are not included in this milestone. Missing files must show an error;
the test never silently substitutes generated audio.

## Browser acceptance procedure

1. Click **Verify sample alignment offline**. Expect PASS for offsets zero and
   0.250 seconds. All six channel-isolated test buffers must align at the sample level.
2. Click **Load all 6 stems** (or explicitly select synthetic diagnostic pulses).
3. Click **Play / Resume**. Time should increase smoothly; both stems stay aligned.
4. Around 5 seconds click **Pause**. Audio and the time readout must stop. Wait
   several seconds, then Play / Resume: both continue from the paused position.
5. While playing, move the slider to around 20 seconds. On release, both tracks
   must jump together and continue. The 50ms scheduling gap is intentional.
6. Pause, move the slider to 10 seconds. Stay silent until Play / Resume is clicked;
   then both stems start at 10 seconds.
7. Click Play repeatedly: no doubled audio or restarts. Stop resets time to zero.
8. Seek to the right edge: stop at duration, with no error. Play restarts at zero.
9. Let playback finish naturally, then play a second time. Verify no console errors.
10. Missing files must produce a visible named error with transport controls disabled.

Node tests use an advancing fake clock to cover pause/resume/seek, clamping,
replay, duplicate Play, cancellation of pending resume, and graph cleanup.
Browser offline checks use native Web Audio; real listening checks are still
required. The user confirmed Milestone 1 real Drums + Bass playback and repeat
runs. Milestone 2 was confirmed working by the user. Milestone 3 awaits the above
procedure with all six real stems. Confirm every named duration is listed, the
full arrangement matches REAPER, and playback works twice consecutively.

## Code entry points

`../synchronized-stems.ts` exports `loadStaticStems(context, urls)` and
`startSynchronizedStems(context, buffers, offset?, duration?, onEnded?)`. The latter returns `{ startAt, stop }`.
The caller owns one AudioContext and resumes it from a user gesture. All buffers
are ready before creating sources. Every source passes through its own GainNode
and one shared master GainNode. Gains stay at unity in this proof; volume/pan
metadata semantics will be resolved with the exporter during integration.

No manifest types are introduced or changed.

`StemTransport(context, buffers)` adds `play()`, `pause()`, `seek(seconds)`,
`stop()`, `dispose()`, and read-only `isPlaying`, `currentTime`, `duration`.
`play` and `seek` return promises; callers handle errors. The proof page reads
currentTime via requestAnimationFrame. Duration currently comes from the longest
buffer; canonical project duration will be connected during session integration.
The caller owns the AudioContext; disposing a transport does not close it.
No hook, plugin A/B, import, or teammate UI changes are included in this milestone.

## Milestone 4 acceptance

The user confirmed all six real stems and transport work (Milestone 3).
Load all six stems. Track buttons display their state via aria-pressed.

1. Play and Solo Lead Guitar: only Lead is enabled; project time keeps advancing.
2. Also Solo Drums: hear Lead + Drums. Remove Lead Solo: only Drums remains.
3. Mute the soloed Drums: silence. Remove Drums Solo: all non-muted tracks return.
4. Remove Drums Mute: full mix returns.
5. With no Solo active, Mute Vocals and unmute: only Vocals changes.
6. Solo Lead, pause/resume, seek, Stop/Play: Solo persists and synchronization holds.
7. Turn Solo off: full mix returns at the current position, with no restart.

Mute/Solo change only GainNodes, with a 5ms time constant to reduce clicks.
States persist through transport actions; loading a different set resets them.
`StemTransport(context, buffers, trackIds?)` now exposes `toggleMute(trackId)`,
`toggleSolo(trackId)`, `mutedTrackIds`, and `soloTrackIds` (defensive snapshots).
During integration, pass canonical manifest track IDs in the same order as buffers.
No session schema changes. The proof uses filename stems as temporary test IDs.
