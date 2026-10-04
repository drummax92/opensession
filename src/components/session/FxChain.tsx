"use client";
import type { OpenSessionTrack } from "@/types/session";

interface Props {
  track: OpenSessionTrack;
  selectedPluginId: string | null;
  bypassedPluginId: string | null;
  onSelectPlugin: (pluginId: string) => void;
}

export default function FxChain({ track, selectedPluginId, bypassedPluginId, onSelectPlugin }: Props) {
  if (track.plugins.length === 0) {
    return <p className="text-sm text-[var(--os-muted)]">No effects on this track</p>;
  }
  return (
    <ol className="space-y-1">
      {track.plugins.map((pl, i) => {
        const selected = pl.id === selectedPluginId;
        const bypassed = pl.id === bypassedPluginId;
        return (
          <li key={pl.id}>
            <button
              type="button"
              onClick={() => onSelectPlugin(pl.id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-[#2f81f7] ${
                selected
                  ? "border-[#2f81f7] bg-[var(--os-selected-accent)]"
                  : "border-[var(--os-border)] bg-[var(--os-bg)] hover:border-[var(--os-muted)]"
              }`}
            >
              <span className="w-4 font-mono text-xs text-[var(--os-muted)]">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-[var(--os-text)]">{pl.name}</span>
                {pl.vendor && <span className="block truncate text-[0.6875rem] text-[var(--os-muted)]">{pl.vendor}</span>}
              </span>
              {bypassed && (
                <span className="rounded bg-[#d29922]/20 px-1.5 py-0.5 text-[0.625rem] font-semibold text-[#d29922]">
                  Bypassed
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
