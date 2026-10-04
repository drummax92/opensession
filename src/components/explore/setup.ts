import type { OpenSessionProject } from "@/types/session";

/** Setup labels read from the session itself (DAW + plugins). Not editable. */
export const detectedSetup = (p: OpenSessionProject) => [
  ...new Set([p.daw.name, ...p.tracks.flatMap((t) => t.plugins.map((pl) => pl.name))]),
];

export const setupChipClass =
  "rounded border border-[#30363d] bg-[#0d1117] px-1.5 py-0.5 font-mono text-[10px] text-[#8b949e]";
