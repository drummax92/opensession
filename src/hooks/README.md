# Session player integration

```tsx
"use client";
import { useSessionPlayer } from "@/hooks/useSessionPlayer";
// project is the canonical OpenSessionProject; keep its object identity stable.
const player = useSessionPlayer(project, "/demo/stormhacks");
// <SessionViewer project={project} player={player} /> in the integration wrapper.
```

API: `isLoading`, `isReady`, `isPlaying`, `currentTime`, `duration`, `error`,
`warnings`, `play()`, `pause()`, `togglePlay()`, `seek(seconds)`,
`toggleMute(trackId)`, `toggleSolo(trackId)`, `togglePluginBypass(trackId, pluginId)`,
`mutedTrackIds` / `soloTrackIds` (Sets), `bypassedPluginByTrack` (record),
`availablePluginIdsByTrack` (Map of Sets).

Use manifest GUIDs, not filename aliases. Disable A/B controls whose plugin IDs
are unavailable. Show errors and nonfatal warnings. Transport actions catch errors
and expose them in `error`, so UI event handlers do not leave rejected promises.
The hook owns and closes its AudioContext; the UI must not create another player.
Unmount/project changes abort loading, dispose sources and cancel animation frames.
The effect guards React StrictMode's setup/cleanup cycle.

Use the hook's mute/solo/bypass state as the source of truth. The current teammate
viewer keeps optimistic local copies; replace those during integration. Its
`isAudible` must be `!muted.has(id) && (solo.size === 0 || solo.has(id))`.
The current UI `SessionPlayerApi` is structurally compatible with these methods;
the canonical `src/types/session.ts` is unchanged.

The exporter at 3f3802f writes post-fader stereo MP3s. Do NOT reapply
`volumeLinear`, `volumeDb`, or `pan`; they are inspector metadata. Initial mute
and solo states are applied. Duration comes from the manifest, with a 150ms
MP3 decode tolerance for normal stems; audition/normal comparison keeps the
existing 50ms tolerance. All normal assets are required; missing auditions
produce warnings and leave the normal mix available.

## Package reviewed

StormHacks-Demo.opensession.zip: 6 tracks, 6 full-length items, 4 plugins,
611 parameters, 10 distinct MP3 files. Manifest duration 41.3267800453515s;
FFmpeg decoded all ten to 41.32600907029479s. Old manual stems were ~41.3519s:
replace the complete audio folder together with session.json, do not mix sets.
Source names/order are retained, including bass before drums and Rhythm R before L.
No fictional clip splits or presets are added. Presets were unavailable in REAPER.

## Verification

`node --test src/lib/audio/proof/synchronization.test.mjs` tests the loader and
engine. `npx tsc --noEmit` and `npm run lint` check the hook. React mounting and
teammate UI integration still require browser acceptance in Milestone 9.

The isolated proof at port 3001 now offers **Load exporter session.json** and uses
the same manifest loader as the hook. Place the entire package under
`public/demo/stormhacks/`; test real GUID-based mute/solo/A-B before UI integration.

## Approved combined-bypass extension (2026-10-04)

Use `bypassedPluginIdsByTrack: Record<string, readonly string[]>` for UI badges.
The old singular record is retained for single-bypass consumers and omits combined
selections. Optional track.bypassVariants declares exact rendered combinations;
old packages without it preserve their single-bypass behavior. A declared missing
combination leaves sound and state unchanged and exposes an error.

Manual render fallback (preserves a backup of session.json, refuses audio overwrite):
`node src/lib/import/scripts/add-lead-combination.mjs PACKAGE_FOLDER BOTH_OFF_MP3`
The source must be a current full-duration render from project time zero, with both
Lead FX disabled, and the same baked volume/pan as the other stems. The helper
adds canonical plugin GUIDs automatically. Copy its resulting MP3 into the bundled
demo auditions folder as well; the demo manifest already declares that path.
The current accepted package duration is 40 seconds, superseding the earlier
package review above. Browser acceptance is required for the extra render.

## Per-track playback volume

`trackVolumeById` is a record of linear playback multipliers (default 1).
`setTrackVolume(trackId, value)` clamps finite values to 0–2. These are additional
listener controls, not a reapplication of exported volumeLinear. Mute/Solo gate
the multiplier; seek/resume and A/B retain it. UI percentages reset to 100 on click.
Values last for the mounted session and reset on reload/project replacement.

## Rendered-stem waveforms

`waveformsByTrack` contains 2048 peak bins and decoded duration per normal stem.
Both channels contribute by maximum absolute sample, preserving opposite-polarity
stereo signals and brief transients. Computed once per load; memoized clip SVGs
crop by project time. Display-only amplitude scaling improves quiet-detail visibility.
These show the rendered track mix in an item's time range, not isolated source-file
samples (overlapping items share that mix). Volume/A-B do not recompute the waveform.
