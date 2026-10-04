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
    return <p className="text-sm text-[#8b949e]">No effects on this track</p>;
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
                  ? "border-[#2f81f7] bg-[#1f2d45]"
                  : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
              }`}
            >
              <span className="w-4 font-mono text-xs text-[#8b949e]">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-[#e6edf3]">{pl.name}</span>
                {pl.vendor && <span className="block truncate text-[11px] text-[#8b949e]">{pl.vendor}</span>}
              </span>
              {bypassed && (
                <span className="rounded bg-[#d29922]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#d29922]">
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
