import type { OpenSessionProject } from "@/types/session";

/** Setup labels read from the session itself (DAW + plugins). Not editable. */
export const detectedSetup = (p: OpenSessionProject) => [
  ...new Set([p.daw.name, ...p.tracks.flatMap((t) => t.plugins.map((pl) => pl.name))]),
];

export const setupChipClass =
  "rounded border border-[#30363d] bg-[#0d1117] px-2 py-0.5 font-mono text-xs text-[#8b949e]";

/** Labels to show on the card: detected ones (minus hidden, with renames) + user-added ones. */
export const visibleSetup = (
  detected: string[],
  o: { setup: string[]; hiddenSetup: string[]; setupNames: Record<string, string> },
) => [
  ...new Set([
    ...detected.filter((d) => !o.hiddenSetup.includes(d)).map((d) => o.setupNames[d]?.trim() || d),
    ...o.setup,
  ]),
];
