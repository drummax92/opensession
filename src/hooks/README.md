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
