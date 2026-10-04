import type { OpenSessionTrack } from "@/types/session";

export const TRACK_COLORS = [
  "#f0883e",
  "#a371f7",
  "#2f81f7",
  "#3fb950",
  "#39c5cf",
  "#db61a2",
];
export const trackColor = (i: number) => TRACK_COLORS[i % TRACK_COLORS.length];

export function formatTime(s: number) {
  const t = Math.max(0, s);
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function formatDb(t: OpenSessionTrack) {
  const db = t.volumeDb ?? 20 * Math.log10(Math.max(t.volumeLinear, 1e-6));
  return `${db > 0 ? "+" : ""}${db.toFixed(1)} dB`;
}

export function formatPan(pan: number) {
  if (Math.abs(pan) < 0.005) return "C";
  return `${Math.round(Math.abs(pan) * 100)}${pan < 0 ? "L" : "R"}`;
}
