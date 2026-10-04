# Milestone 1: two synchronized stems

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

Both exports must start at project zero, retain leading silence, and use the
same project end (approximately 41.3518 seconds). Do not trim independently.
The files are not included in this milestone. Missing files must show an error;
the test never silently substitutes generated audio.

## Browser acceptance procedure

1. Click **Verify sample alignment offline**. Expect PASS: both channel-isolated
   impulses start at sample 2400 and repeat at sample 14400, with identical output
   in both channels. This uses the real browser OfflineAudioContext and the same
   scheduling primitive as playback; it does not prove export alignment.
2. Optional: load synthetic pulses, then Play. Hear one centered pulse each second
   for eight seconds, with no left/right flam. These are diagnostic tones only.
3. Click **Load Drums + Bass**. Both decoded durations should be about 41.35s.
   A duration mismatch greater than 50ms fails visibly; matching duration alone
   does not establish that the exports retained the correct leading silence.
4. Click **Play from zero**. Hear both parts in their original musical alignment.
   Compare against REAPER, including near the end. No accumulated drift.
5. Click Stop midway and Play again. Both restart from zero. Also click Play
   while already playing: there must be no duplicate overlapping playback.
6. Let playback end naturally. Play again; both must play on the second run.
7. Check the browser console for uncaught errors. Remove one file and reload;
   expect a named HTTP 404 error and disabled Play, rather than partial playback.

Milestone 1 is accepted only after the real stems pass this browser procedure.
Node tests check scheduling and cleanup with a fake clock, not audible output.
Pause/resume, seek, React state, six-track playback, A/B, and import come later.

## Code entry points

`../synchronized-stems.ts` exports `loadStaticStems(context, urls)` and
`startSynchronizedStems(context, buffers)`. The latter returns `{ startAt, stop }`.
The caller owns one AudioContext and resumes it from a user gesture. All buffers
are ready before creating sources. Every source passes through its own GainNode
and one shared master GainNode. Gains stay at unity in this proof; volume/pan
metadata semantics will be resolved with the exporter during integration.

No manifest types are introduced or changed.
