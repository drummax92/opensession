"use client";
import { useState } from "react";
import type { OpenSessionProject } from "@/types/session";
import Inspector from "./Inspector";
import Timeline, { RULER_H } from "./Timeline";
import TrackRow from "./TrackRow";
import TransportBar from "./TransportBar";
import type { Selection, SessionPlayerApi } from "./types";
import { useMockPlayer } from "./useMockPlayer";

interface Props {
  project: OpenSessionProject;
  /** Pass the real audio engine here. Omit to use the dev mock clock. */
  player?: SessionPlayerApi;
}

export default function SessionViewer({ project, player }: Props) {
  const mock = useMockPlayer(project.duration);
  const p = player ?? mock;

  const [selection, setSelection] = useState<Selection>(null);
  const [muted, setMuted] = useState(
    () => new Set(project.tracks.filter((t) => t.muted).map((t) => t.id)),
  );
  const [solo, setSolo] = useState(
    () => new Set(project.tracks.filter((t) => t.solo).map((t) => t.id)),
  );
  // at most one bypassed plugin per track (spec §9)
  const [bypass, setBypass] = useState<Record<string, string | null>>({});

  const toggleIn = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (!next.delete(id)) next.add(id);
    return next;
  };
  const toggleMute = (id: string) => {
    setMuted((s) => toggleIn(s, id));
    p.toggleMute(id);
  };
  const toggleSolo = (id: string) => {
    setSolo((s) => toggleIn(s, id));
    p.toggleSolo(id);
  };
  const toggleBypass = (trackId: string, pluginId: string) => {
    setBypass((b) => ({ ...b, [trackId]: b[trackId] === pluginId ? null : pluginId }));
    p.togglePluginBypass(trackId, pluginId);
  };

  const isAudible = (id: string) => (solo.size > 0 ? solo.has(id) : !muted.has(id));

  return (
    <div className="flex h-screen flex-col bg-[#0d1117] text-[#e6edf3]">
      <header className="flex items-baseline gap-3 border-b border-[#30363d] px-4 py-2.5">
        <span className="text-sm text-[#8b949e]">
          {project.owner} / <span className="font-semibold text-[#e6edf3]">{project.slug}</span>
        </span>
        <h1 className="sr-only">{project.title}</h1>
        <span className="text-xs text-[#8b949e]">
          {project.daw.name} · {project.tracks.length} tracks · {project.duration.toFixed(2)}s
        </span>
        <span className="ml-auto hidden text-xs text-[#8b949e] lg:inline">
          Pakimoni Pikachu Chu Chu.
        </span>
      </header>

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
        <aside className="w-64 shrink-0 border-r border-[#30363d]">
          <div className={`${RULER_H} border-b border-[#30363d] bg-[#161b22] px-3 text-xs leading-8 text-[#8b949e]`}>
            Tracks
          </div>
          {project.tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              selected={selection?.trackId === t.id}
              audible={isAudible(t.id)}
              muted={muted.has(t.id)}
              solo={solo.has(t.id)}
              onSelect={() => setSelection({ trackId: t.id, pluginId: null })}
              onToggleMute={() => toggleMute(t.id)}
              onToggleSolo={() => toggleSolo(t.id)}
            />
          ))}
        </aside>

        <main className="min-w-0 flex-1 overflow-x-auto">
          <Timeline
            project={project}
            selectedTrackId={selection?.trackId ?? null}
            isAudible={isAudible}
            currentTime={p.currentTime}
            onSelectTrack={(id) => setSelection({ trackId: id, pluginId: null })}
            onSeek={p.seek}
          />
        </main>

        <aside className="w-80 shrink-0 border-l border-[#30363d] bg-[#0d1117]">
          <Inspector
            project={project}
            selection={selection}
            bypassByTrack={bypass}
            onSelectPlugin={(trackId, pluginId) => setSelection({ trackId, pluginId })}
            onClearSelection={() => setSelection(null)}
            onTogglePluginBypass={toggleBypass}
          />
        </aside>
      </div>
    </div>
  );
}
