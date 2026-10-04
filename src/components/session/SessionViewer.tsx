"use client";
import Link from "next/link";
import { useState } from "react";
import type { OpenSessionProject } from "@/types/session";
import Inspector from "./Inspector";
import Timeline, { RULER_H } from "./Timeline";
import TrackRow from "./TrackRow";
import TransportBar from "./TransportBar";
import type { Selection } from "./types";
import { useSessionPlayer } from "@/hooks/useSessionPlayer";

interface Props {
  project: OpenSessionProject;
  audioFiles?: ReadonlyMap<string, File>;

}

export default function SessionViewer({ project, audioFiles }: Props) {
  const p = useSessionPlayer(project, "/demo/stormhacks", audioFiles);
  const [selection, setSelection] = useState<Selection>(null);
  const muted = p.mutedTrackIds, solo = p.soloTrackIds, bypass = p.bypassedPluginIdsByTrack;
  const toggleMute = p.toggleMute, toggleSolo = p.toggleSolo, toggleBypass = p.togglePluginBypass;
  const isAudible = (id: string) => !muted.has(id) && (solo.size === 0 || solo.has(id));

  return (
    <div className="flex h-full flex-col bg-[var(--os-bg)] text-[var(--os-text)]">
      <header className="flex items-baseline gap-3 border-b border-[var(--os-border)] px-4 py-2.5">
        <span className="text-sm text-[var(--os-muted)]">
          <Link href="/" className="hover:text-[var(--os-text)] hover:underline">{project.owner}</Link> / <span className="font-semibold text-[var(--os-text)]">{project.slug}</span>
        </span>
        <h1 className="sr-only">{project.title}</h1>
        <span className="text-xs text-[var(--os-muted)]">
          {project.daw.name} · {project.tracks.length} tracks · {project.duration.toFixed(2)}s
        </span>
        <span className="ml-auto hidden text-xs text-[var(--os-muted)] lg:inline">
          Pakimoni Pikachu Chu Chu.
        </span>
      </header>

      {p.isLoading && <p role="status" className="px-4 py-2 text-sm">Loading session audio…</p>}
      {p.error && <p role="alert" className="px-4 py-2 text-sm text-red-400">{p.error}</p>}
      {p.warnings.length > 0 && <details className="px-4 py-2 text-sm text-amber-400"><summary>Some effect auditions are unavailable</summary>{p.warnings.map(warning => <p key={warning}>{warning}</p>)}</details>}
      <TransportBar
        isPlaying={p.isPlaying}
        isReady={p.isReady}
        currentTime={p.currentTime}
        duration={p.duration}
        onPlay={p.play}
        onPause={p.pause}
        onSeek={p.seek}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="w-80 shrink-0 border-r border-[var(--os-border)]">
          <div className={`${RULER_H} border-b border-[var(--os-border)] bg-[var(--os-panel)] px-3 text-xs leading-8 text-[var(--os-muted)]`}>
            Tracks
          </div>
          {project.tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              selected={selection?.trackId === t.id}
              audible={isAudible(t.id)}
              disabled={!p.isReady}
              muted={muted.has(t.id)}
              solo={solo.has(t.id)}
              volume={p.trackVolumeById[t.id] ?? 1}
              onVolumeChange={value => p.setTrackVolume(t.id, value)}
              onSelect={() => setSelection({ trackId: t.id, pluginId: null })}
              onToggleMute={() => toggleMute(t.id)}
              onToggleSolo={() => toggleSolo(t.id)}
            />
          ))}
        </aside>

        <main className="min-w-0 flex-1 overflow-x-auto">
          <Timeline
            trackVolumeById={p.trackVolumeById}
            waveformsByTrack={p.waveformsByTrack}
            project={project}
            selectedTrackId={selection?.trackId ?? null}
            isAudible={isAudible}
            currentTime={p.currentTime}
            onSelectTrack={(id) => setSelection({ trackId: id, pluginId: null })}
            onSeek={p.seek}
          />
        </main>

        <aside className="w-80 shrink-0 border-l border-[var(--os-border)] bg-[var(--os-bg)]">
          <Inspector
            project={project}
            selection={selection}
            bypassByTrack={bypass}
            canAudition={(track, plugin) => p.isReady && !!p.availablePluginIdsByTrack.get(track)?.has(plugin)}
            onSelectPlugin={(trackId, pluginId) => setSelection({ trackId, pluginId })}
            onClearSelection={() => setSelection(null)}
            onTogglePluginBypass={toggleBypass}
          />
        </aside>
      </div>
    </div>
  );
}
