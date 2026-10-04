export interface OpenSessionProject {
  schemaVersion: "0.1";

  id: string;
  slug: string;

  title: string;
  owner: string;

  description?: string;
  genres: string[];

  bpm?: number;
  key?: string;

  duration: number;

  daw: {
    name: string;
    version?: string;
  };

  coverUrl?: string;

  tracks: OpenSessionTrack[];
}

export interface OpenSessionTrack {
  id: string;
  name: string;

  volumeLinear: number;
  volumeDb?: number;

  pan: number;

  muted: boolean;
  solo: boolean;

  stemPath: string;

  items: OpenSessionItem[];
  plugins: OpenSessionPlugin[];
}

export interface OpenSessionItem {
  id: string;

  name?: string;
  sourceFile?: string;

  start: number;
  length: number;
}

export interface OpenSessionPlugin {
  id: string;

  name: string;
  vendor?: string;
  preset?: string;

  bypassStemPath?: string;

  parameters: OpenSessionPluginParameter[];
}

export interface OpenSessionPluginParameter {
  index: number;

  name: string;

  normalizedValue?: number;
  displayValue?: string;
}
