import type { OpenSessionProject } from "../../types/session";
import { loadStaticStems, StemTransport } from "./synchronized-stems";

/** Resolve package-relative paths, never sourceFile (a REAPER-local metadata path). */
export function stemUrl(baseUrl: string, path: string): string {
  if (!path || path.startsWith("/") || path.includes("\\") || /[:?#]/.test(path) ||
      path.split("/").some(part => !part || part === "." || part === "..")) {
    throw new Error(`Invalid package audio path: ${path}`);
  }
  return `${baseUrl.replace(/\/$/, "")}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function loadSessionAudio(
  context: AudioContext,
  project: OpenSessionProject,
  baseUrl = "/demo/stormhacks",
  signal?: AbortSignal,
  audioFiles?: ReadonlyMap<string, File>,
) {
  if (project.schemaVersion !== "0.1" || !project.tracks.length ||
      !Number.isFinite(project.duration) || project.duration <= 0) {
    throw new Error("Invalid OpenSession project metadata.");
  }
  const ids = project.tracks.map(track => track.id);
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate track IDs.");
  for (const track of project.tracks) {
    const pluginIds = track.plugins.map(plugin => plugin.id);
    if (new Set(pluginIds).size !== pluginIds.length) throw new Error(`Duplicate FX IDs: ${track.name}`);
  }
  const decode = async (path: string): Promise<AudioBuffer> => {
    signal?.throwIfAborted();
    if (!audioFiles) return (await loadStaticStems(context, [stemUrl(baseUrl, path)], signal))[0];
    const file = audioFiles.get(path);
    if (!file) throw new Error(`Missing local audio: ${path}`);
    try {
      const bytes = await file.arrayBuffer();
      signal?.throwIfAborted();
      return await context.decodeAudioData(bytes);
    } catch (error) {
      signal?.throwIfAborted();
      throw new Error(`Cannot decode ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  signal?.throwIfAborted();
  const buffers = await Promise.all(project.tracks.map(track => decode(track.stemPath)));
  signal?.throwIfAborted();
  buffers.forEach((buffer, index) => {
    // REAPER exporter permits MP3 encoder padding. Use manifest duration for the clock.
    if (Math.abs(buffer.duration - project.duration) > 0.15) {
      throw new Error(`Stem duration mismatch: ${project.tracks[index].name} (${buffer.duration.toFixed(4)}s vs ${project.duration.toFixed(4)}s)`);
    }
  });
  const transport = new StemTransport(context, buffers, ids, project.duration);
  const warnings: string[] = [];
  const availablePluginIdsByTrack = new Map<string, Set<string>>();
  try {
    for (const track of project.tracks) {
      // The exporter bakes volume and pan into its MP3s. Gain stays at unity.
      if (track.muted) transport.toggleMute(track.id);
      if (track.solo) transport.toggleSolo(track.id);
      const available = new Set<string>();
      availablePluginIdsByTrack.set(track.id, available);
      if (track.bypassVariants?.length) transport.enableCombinations(track.id);
      for (const plugin of track.plugins) {
        if (!plugin.bypassStemPath) continue;
        try {
          const buffer = await decode(plugin.bypassStemPath);
          signal?.throwIfAborted();
          transport.registerAudition(track.id, plugin.id, buffer);
          available.add(plugin.id);
        } catch (error) {
          signal?.throwIfAborted();
          warnings.push(`${track.name} / ${plugin.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      for (const variant of track.bypassVariants ?? []) {
        try {
          if (variant.bypassedPluginIds.some(id => !track.plugins.some(plugin => plugin.id === id))) throw new Error("Unknown plugin in bypass combination");
          const buffer = await decode(variant.stemPath);
          signal?.throwIfAborted();
          transport.registerBypassVariant(track.id, variant.bypassedPluginIds, buffer);
        } catch (error) {
          signal?.throwIfAborted();
          warnings.push(`${track.name} / FX combination: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    signal?.throwIfAborted();
    return { transport, warnings, availablePluginIdsByTrack };
  } catch (error) {
    transport.dispose();
    throw error;
  }
}
