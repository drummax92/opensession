"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OpenSessionProject } from "../types/session";
import { loadSessionAudio } from "../lib/audio/load-session";
import { buildWaveform, selectWaveforms, type WaveformBank } from "../lib/audio/waveform";
import type { StemTransport } from "../lib/audio/synchronized-stems";

function initialState(project: OpenSessionProject) {
  return {
    project, isLoading: true, isReady: false, isPlaying: false,
    currentTime: 0, duration: project.duration,
    error: null as string | null, warnings: [] as string[],
    mutedTrackIds: new Set(project.tracks.filter(track => track.muted).map(track => track.id)),
    soloTrackIds: new Set(project.tracks.filter(track => track.solo).map(track => track.id)),
    waveformVariantsByTrack: {} as WaveformBank,
    waveformsByTrack: {} as Record<string, { peaks: readonly number[]; duration: number }>,
    trackVolumeById: Object.fromEntries(project.tracks.map(track => [track.id, 1])),
    bypassedPluginByTrack: {} as Record<string, string | null>,
    bypassedPluginIdsByTrack: {} as Record<string, readonly string[]>,
    availablePluginIdsByTrack: new Map<string, Set<string>>(),
  };
}

/** Keep project identity stable. One mounted player owns one AudioContext. */
export function useSessionPlayer(project: OpenSessionProject, baseUrl = "/demo/stormhacks", audioFiles?: ReadonlyMap<string, File>) {
  const [state, setState] = useState(() => initialState(project));
  const active = useRef<{ project: OpenSessionProject; transport: StemTransport } | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let context: AudioContext | undefined;
    let transport: StemTransport | undefined;
    let frame = 0;
    void (async () => {
      // Allows StrictMode's immediate cleanup to cancel before allocating audio.
      await Promise.resolve();
      if (abort.signal.aborted) return;
      setState(initialState(project));
      try {
        context = new AudioContext();
        const loaded = await loadSessionAudio(context, project, baseUrl, abort.signal, audioFiles);
        transport = loaded.transport;
        if (abort.signal.aborted) { transport.dispose(); return; }
        const waveformVariantsByTrack: WaveformBank = {};
        for (const [id, variants] of loaded.waveformBuffersByTrack) {
          waveformVariantsByTrack[id] = {};
          for (const [key, buffer] of variants) {
            await new Promise(resolve => setTimeout(resolve, 0));
            if (abort.signal.aborted) return;
            waveformVariantsByTrack[id][key] = { peaks: buildWaveform(buffer), duration: buffer.duration };
          }
        }
        const waveformsByTrack = selectWaveforms(waveformVariantsByTrack, {});
        active.current = { project, transport };
        setState(previous => ({ ...previous, isLoading: false, isReady: true,
          waveformVariantsByTrack, waveformsByTrack, warnings: loaded.warnings, availablePluginIdsByTrack: loaded.availablePluginIdsByTrack }));
        const tick = () => {
          if (abort.signal.aborted || !transport) return;
          const currentTime = transport.currentTime, isPlaying = transport.isPlaying;
          setState(previous => previous.currentTime === currentTime && previous.isPlaying === isPlaying
            ? previous : { ...previous, currentTime, isPlaying });
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      } catch (error) {
        if (abort.signal.aborted) return;
        setState(previous => ({ ...previous, isLoading: false, isReady: false,
          error: error instanceof Error ? error.message : String(error) }));
        if (context && context.state !== "closed") void context.close().catch(() => {});
      }
    })();
    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      if (active.current?.transport === transport) active.current = null;
      transport?.dispose();
      if (context && context.state !== "closed") void context.close().catch(() => {});
    };
  }, [project, baseUrl, audioFiles]);

  const run = useCallback((action: (transport: StemTransport) => void | Promise<void>) => {
    const player = active.current;
    if (!player || player.project !== project) return;
    const sync = () => {
      if (active.current !== player) return;
      const t = player.transport;
      setState(previous => ({ ...previous, currentTime: t.currentTime, isPlaying: t.isPlaying,
        trackVolumeById: Object.fromEntries(t.trackVolumeById),
        mutedTrackIds: new Set(t.mutedTrackIds), soloTrackIds: new Set(t.soloTrackIds),
        bypassedPluginByTrack: Object.fromEntries(t.bypassedPluginByTrack),
        bypassedPluginIdsByTrack: Object.fromEntries(t.bypassedPluginIdsByTrack), error: null }));
    };
    const fail = (error: unknown) => {
      if (active.current === player) setState(previous => ({ ...previous,
        error: error instanceof Error ? error.message : String(error) }));
    };
    try {
      // Invoke synchronously so context.resume() stays inside the user gesture.
      const pending = action(player.transport);
      if (pending) void pending.then(sync, fail); else sync();
    } catch (error) { fail(error); }
  }, [project]);

  const selectedWaveforms = useMemo(() => selectWaveforms(state.waveformVariantsByTrack, state.bypassedPluginIdsByTrack),
    [state.waveformVariantsByTrack, state.bypassedPluginIdsByTrack]);

  return {
    ...(state.project === project ? state : initialState(project)),
    waveformsByTrack: state.project === project ? selectedWaveforms : {},
    play: useCallback(() => run(t => t.play()), [run]),
    pause: useCallback(() => run(t => t.pause()), [run]),
    togglePlay: useCallback(() => run(t => t.togglePlay()), [run]),
    seek: useCallback((seconds: number) => run(t => t.seek(seconds)), [run]),
    setTrackVolume: useCallback((id: string, value: number) => run(t => t.setTrackVolume(id, value)), [run]),
    toggleMute: useCallback((id: string) => run(t => t.toggleMute(id)), [run]),
    toggleSolo: useCallback((id: string) => run(t => t.toggleSolo(id)), [run]),
    togglePluginBypass: useCallback((track: string, plugin: string) => run(t => t.togglePluginBypass(track, plugin)), [run]),
  };
}
