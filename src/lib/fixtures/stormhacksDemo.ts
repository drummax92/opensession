import type { OpenSessionProject } from "@/types/session";
import exported from "./exported-session.json";

// Preserve exporter IDs, items, FX and settings. Only public labels/order are normalized.
const labels = [
  ["audio/drums.mp3", "Drums"],
  ["audio/bass.mp3", "Bass"],
  ["audio/lead-guitar.mp3", "Lead Guitar"],
  ["audio/rhythm-guitar-l.mp3", "Rhythm Guitar L"],
  ["audio/rhythm-guitar-r.mp3", "Rhythm Guitar R"],
  ["audio/vocals.mp3", "Vocals"],
];
export const stormhacksDemo: OpenSessionProject = {
  ...exported, schemaVersion: "0.1",
  tracks: labels.map(([path, name]) => {
    const track = exported.tracks.find(track => track.stemPath === path);
    if (!track) throw new Error(`Missing demo track: ${path}`);
    return { ...track, name };
  }),
};
