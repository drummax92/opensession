"use client";
import { useState } from "react";
import type { OpenSessionPlugin } from "@/types/session";
import { PowerIcon } from "./Icons";

const INITIAL_COUNT = 6;

interface Props {
  plugin: OpenSessionPlugin;
  bypassed: boolean;
  onToggleBypass: () => void;
}

export default function PluginDetails({ plugin, bypassed, onToggleBypass }: Props) {
  const [showAll, setShowAll] = useState(false);
  const params = showAll ? plugin.parameters : plugin.parameters.slice(0, INITIAL_COUNT);
  const hidden = plugin.parameters.length - INITIAL_COUNT;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#e6edf3]">{plugin.name}</h3>
        <p className="text-xs text-[#8b949e]">
          {plugin.vendor ?? "Unknown vendor"}
          {plugin.preset ? ` · Preset: ${plugin.preset}` : ""}
        </p>
      </div>

      {plugin.bypassStemPath && (
        <button
          type="button"
          aria-pressed={!bypassed}
          onClick={onToggleBypass}
          className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-[#2f81f7] ${
            bypassed
             ? "border-[#d29922] bg-[#d29922]/10 text-[#d29922]"
              : "border-[#3fb950] bg-[#3fb950]/15 text-[#3fb950]"
          }`}
        >
          <span className="flex items-center gap-2">
            <PowerIcon />
            {bypassed ? "Bypassed" : "Effect on"}
          </span>
          <span className="text-xs">A/B</span>
        </button>
      )}

      <div>
        <div className="mb-1 flex justify-between text-[11px] text-[#8b949e]">
          <span>Parameter</span>
          <span>Value</span>
        </div>
        <ul className="divide-y divide-[#21262d] rounded-md border border-[#30363d]">
          {params.map((pr) => (
            <li key={pr.index} className="px-2.5 py-1">
              <div className="flex justify-between gap-2 text-xs">
                <span className="truncate text-[#e6edf3]">{pr.name}</span>
                <span className="font-mono tabular-nums text-[#8b949e]">
                  {pr.displayValue ?? (pr.normalizedValue != null ? pr.normalizedValue.toFixed(2) : "—")}
                </span>
              </div>
              {pr.normalizedValue != null && (
                <div className="mt-1 h-0.5 rounded bg-[#21262d]">
                  <div
                    className="h-full rounded bg-[#2f81f7]"
                    style={{ width: `${Math.min(1, Math.max(0, pr.normalizedValue)) * 100}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-2 text-xs text-[#2f81f7] hover:underline"
          >
            {showAll ? "Show fewer parameters" : `Show all parameters (${plugin.parameters.length})`}
          </button>
        )}
      </div>
    </section>
  );
}
