/** UI-only contract between the viewer and the audio engine (not a data model). */
export interface SessionPlayerApi {
  isReady?: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play(): void;
  pause(): void;
  seek(time: number): void;
  toggleMute(trackId: string): void;
  toggleSolo(trackId: string): void;
  togglePluginBypass(trackId: string, pluginId: string): void;
}

export type Selection = { trackId: string; pluginId: string | null } | null;
