"use client";
import type { OpenSessionProject } from "@/types/session";
import FxChain from "./FxChain";
import PluginDetails from "./PluginDetails";
import { formatDb, formatPan, formatTime, trackColor } from "./format";
import type { Selection } from "./types";

interface Props {
  project: OpenSessionProject;
  selection: Selection;
  canAudition: (trackId: string, pluginId: string) => boolean;
  bypassByTrack: Record<string, string | null>;
  onSelectPlugin: (trackId: string, pluginId: string) => void;
  onClearSelection: () => void;
  onTogglePluginBypass: (trackId: string, pluginId: string) => void;
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between py-1 text-sm">
    <dt className="text-[var(--os-muted)]">{k}</dt>
    <dd className="font-mono tabular-nums text-[var(--os-text)]">{v}</dd>
  </div>
);

export default function Inspector({
  project,
  selection,
  canAudition,
  bypassByTrack,
  onSelectPlugin,
  onClearSelection,
  onTogglePluginBypass,
}: Props) {
  const idx = selection ? project.tracks.findIndex((t) => t.id === selection.trackId) : -1;
  const track = idx >= 0 ? project.tracks[idx] : null;
  const plugin = track?.plugins.find((p) => p.id === selection?.pluginId) ?? null;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-3 flex items-center gap-1 text-xs text-[var(--os-muted)]">
        <button type="button" onClick={onClearSelection} className="hover:text-[var(--os-text)] hover:underline">
          Project
        </button>
        {track && <span>/ {track.name}</span>}
        {plugin && <span>/ {plugin.name}</span>}
      </div>

      {!track && (
        <div>
          <h2 className="text-base font-semibold text-[var(--os-text)]">{project.title}</h2>
          {project.description && <p className="mt-1 text-xs text-[var(--os-muted)]">{project.description}</p>}
          <dl className="mt-3 divide-y divide-[var(--os-subtle)] border-y border-[var(--os-subtle)]">
            <Row k="Owner" v={project.owner} />
            <Row k="DAW" v={project.daw.name} />
            <Row k="Duration" v={`${project.duration.toFixed(2)}s (${formatTime(project.duration)})`} />
            <Row k="Tracks" v={String(project.tracks.length)} />
          </dl>
          <p className="mt-4 text-xs text-[var(--os-muted)]">Select a track to inspect its effects.</p>
        </div>
      )}

      {track && (
        <div className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--os-text)]">
              <span className="h-3 w-1 rounded-full" style={{ backgroundColor: trackColor(idx) }} />
              {track.name}
            </h2>
              <p className="mt-1 font-mono text-xs tabular-nums text-[var(--os-muted)]">
              Volume {formatDb(track)} · Pan {formatPan(track.pan)}
              </p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold text-[var(--os-muted)]">FX chain</h3>
            <FxChain
              track={track}
              selectedPluginId={plugin?.id ?? null}
              bypassedPluginId={bypassByTrack[track.id] ?? null}
              onSelectPlugin={(pid) => onSelectPlugin(track.id, pid)}
            />
          </div>

          {plugin && (
            <PluginDetails
              key={`${track.id}:${plugin.id}`}
              plugin={plugin}
              available={canAudition(track.id, plugin.id)}
              bypassed={bypassByTrack[track.id] === plugin.id}
              onToggleBypass={() => onTogglePluginBypass(track.id, plugin.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}
