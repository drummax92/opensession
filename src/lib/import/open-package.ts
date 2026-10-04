import type { OpenSessionProject } from "../../types/session";

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing or invalid ${label}`);
}
function number(value: unknown, label: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid ${label}`);
}
function array(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`Invalid ${label}`);
}
function path(value: unknown): asserts value is string {
  text(value, "audio path");
  if (value.startsWith("/") || /[\\:?#]/.test(value) || value.split("/").some(p => !p || p === "." || p === "..")) {
    throw new Error(`Audio path must be package-relative: ${value}`);
  }
}

/** Runtime checks for the canonical contract, not a separate manifest schema. */
export function validateProject(value: unknown): asserts value is OpenSessionProject {
  const p = record(value, "session.json");
  if (p.schemaVersion !== "0.1") throw new Error("Unsupported schemaVersion; expected 0.1");
  for (const key of ["id", "slug", "title", "owner"]) text(p[key], key);
  number(p.duration, "duration");
  if (p.duration <= 0) throw new Error("Duration must be positive");
  text(record(p.daw, "daw").name, "daw.name");
  array(p.genres, "genres"); p.genres.forEach(g => text(g, "genre"));
  array(p.tracks, "tracks");
  if (!p.tracks.length) throw new Error("The session has no tracks");
  const ids = new Set<string>();
  for (const value of p.tracks) {
    const t = record(value, "track"); text(t.id, "track.id"); text(t.name, "track.name");
    if (ids.has(t.id)) throw new Error(`Duplicate track ID: ${t.id}`); ids.add(t.id);
    number(t.volumeLinear, "volumeLinear"); number(t.pan, "pan");
    if (t.volumeLinear < 0 || Math.abs(t.pan) > 1) throw new Error(`Invalid volume/pan: ${t.name}`);
    if (typeof t.muted !== "boolean" || typeof t.solo !== "boolean") throw new Error(`Invalid mute/solo: ${t.name}`);
    path(t.stemPath); array(t.items, "items"); array(t.plugins, "plugins");
    const itemIds = new Set<string>(), pluginIds = new Set<string>();
    for (const value of t.items) {
      const item = record(value, "item"); text(item.id, "item.id");
      if (itemIds.has(item.id)) throw new Error(`Duplicate item ID: ${item.id}`); itemIds.add(item.id);
      number(item.start, "item.start"); number(item.length, "item.length");
      if (item.start < 0 || item.length < 0 || item.start + item.length > p.duration + 0.15) throw new Error(`Item outside project duration: ${item.id}`);
      for (const key of ["name", "sourceFile"]) if (item[key] !== undefined && typeof item[key] !== "string") throw new Error(`Invalid item.${key}`);
    }
    for (const value of t.plugins) {
      const fx = record(value, "plugin"); text(fx.id, "plugin.id"); text(fx.name, "plugin.name");
      if (pluginIds.has(fx.id)) throw new Error(`Duplicate plugin ID: ${fx.id}`); pluginIds.add(fx.id);
      if (fx.bypassStemPath !== undefined) path(fx.bypassStemPath);
      for (const key of ["vendor", "preset"]) if (fx[key] !== undefined && typeof fx[key] !== "string") throw new Error(`Invalid plugin.${key}`);
      array(fx.parameters, "parameters");
      const indices = new Set<number>();
      for (const value of fx.parameters) {
        const param = record(value, "parameter"); number(param.index, "parameter.index"); text(param.name, "parameter.name");
        if (!Number.isInteger(param.index) || param.index < 0 || indices.has(param.index)) throw new Error("Invalid/duplicate parameter index");
        indices.add(param.index);
        if (param.normalizedValue !== undefined) {
          number(param.normalizedValue, "normalizedValue");
          if (param.normalizedValue < 0 || param.normalizedValue > 1) throw new Error("normalizedValue outside 0–1");
        }
        if (param.displayValue !== undefined && typeof param.displayValue !== "string") throw new Error("Invalid displayValue");
      }
    }
    if (t.volumeDb !== undefined) number(t.volumeDb, "volumeDb");
  }
  for (const key of ["description", "key", "coverUrl"]) if (p[key] !== undefined && typeof p[key] !== "string") throw new Error(`Invalid ${key}`);
  for (const key of ["bpm"]) if (p[key] !== undefined) number(p[key], key);
  if (record(p.daw, "daw").version !== undefined && typeof record(p.daw, "daw").version !== "string") throw new Error("Invalid daw.version");
}

export async function openPackage(files: readonly File[]) {
  const manifests = files.filter(file => file.name === "session.json");
  if (manifests.length !== 1) throw new Error("Select exactly one session.json and its audio files. Unzip ZIP packages first.");
  const manifest = manifests[0];
  if (manifest.size > 5 * 1024 * 1024) throw new Error("session.json exceeds 5 MB");
  let project: unknown;
  try { project = JSON.parse(await manifest.text()); }
  catch { throw new Error("session.json is not valid JSON"); }
  validateProject(project);
  const root = manifest.webkitRelativePath ? manifest.webkitRelativePath.slice(0, -manifest.name.length) : "";
  const byPath = new Map<string, File>();
  const flat = new Map<string, File[]>();
  for (const file of files) {
    if (file.webkitRelativePath) {
      if (!file.webkitRelativePath.startsWith(root)) continue;
      const relative = file.webkitRelativePath.slice(root.length);
      if (byPath.has(relative)) throw new Error(`Duplicate package path: ${relative}`);
      byPath.set(relative, file);
    } else {
      const matches = flat.get(file.name) ?? []; matches.push(file); flat.set(file.name, matches);
    }
  }
  const resolve = (relative: string): File | undefined => {
    if (root) return byPath.get(relative);
    const matches = flat.get(relative.split("/").at(-1)!) ?? [];
    if (matches.length > 1) throw new Error(`Ambiguous filename: ${relative}. Use Choose folder.`);
    return matches[0];
  };
  const audioFiles = new Map<string, File>();
  for (const track of project.tracks) {
    const file = resolve(track.stemPath);
    if (!file) throw new Error(`Missing stem: ${track.stemPath}. Add the audio files or choose the full package folder.`);
    audioFiles.set(track.stemPath, file);
    for (const plugin of track.plugins) {
      if (!plugin.bypassStemPath) continue;
      const alternate = resolve(plugin.bypassStemPath);
      if (alternate) audioFiles.set(plugin.bypassStemPath, alternate);
    }
  }
  return { project, audioFiles };
}
