import type {
  OpenSessionPluginParameter as Param,
  OpenSessionProject,
} from "@/types/session";

/**
 * DEV FIXTURE — matches the final six-track StormHacks Demo.
 * Item positions, volumes, pans and plugin parameters are PLACEHOLDERS
 * until the REAPER exporter's real session.json replaces this file.
 * (Lead Guitar item positions come from the spec's example.)
 */
const vol = (db: number) => ({ volumeLinear: 10 ** (db / 20), volumeDb: db });
const p = (index: number, name: string, n: number, display: string): Param => ({
  index,
  name,
  normalizedValue: n,
  displayValue: display,
});

const DURATION = 41.3518;

export const stormhacksDemo: OpenSessionProject = {
  schemaVersion: "0.1",
  id: "stormhacks-demo",
  slug: "stormhacks-demo",
  title: "StormHacks Demo",
  owner: "OpenSession",
  description:
    "A short metal demo recorded during StormHacks to showcase an inspectable session.",
  genres: ["Metal"],
  duration: DURATION,
  daw: { name: "REAPER" },
  tracks: [
    {
      id: "drums",
      name: "Drums",
      ...vol(-3.0),
      pan: 0,
      muted: false,
      solo: false,
      stemPath: "audio/drums.mp3",
      items: [{ id: "drums-1", name: "Drums", start: 0, length: DURATION }],
      plugins: [],
    },
    {
      id: "bass",
      name: "Bass",
      ...vol(-4.5),
      pan: 0,
      muted: false,
      solo: false,
      stemPath: "audio/bass.mp3",
      items: [
        { id: "bass-1", name: "Bass A", start: 2.0, length: 17.0 },
        { id: "bass-2", name: "Bass B", start: 20.5, length: 20.8 },
      ],
      plugins: [],
    },
    {
      id: "lead-guitar",
      name: "Lead Guitar",
      ...vol(-6.0),
      pan: 0,
      muted: false,
      solo: false,
      stemPath: "audio/lead-guitar.mp3",
      items: [
        { id: "lead-1", name: "Lead 1", start: 4.2, length: 7.8 },
        { id: "lead-2", name: "Lead 2", start: 14.9, length: 18.4 },
        { id: "lead-3", name: "Lead 3", start: 35.1, length: 5.4 },
      ],
      plugins: [
        {
          id: "lead-guitar-rabea",
          name: "Archetype: Rabea",
          vendor: "Neural DSP",
          preset: "Dev placeholder",
          bypassStemPath: "audio/auditions/lead-guitar__without-rabea.mp3",
          parameters: [
            p(0, "Input Gain", 0.5, "0.0 dB"),
            p(1, "Gate Threshold", 0.3, "-48 dB"),
            p(2, "Gain", 0.72, "7.2"),
            p(3, "Bass", 0.55, "5.5"),
            p(4, "Mid", 0.6, "6.0"),
            p(5, "Treble", 0.5, "5.0"),
            p(6, "Presence", 0.45, "4.5"),
            p(7, "Master", 0.65, "6.5"),
            p(8, "Cab Mic Position", 0.35, "Edge"),
            p(9, "Output Level", 0.5, "0.0 dB"),
          ],
        },
        {
          id: "lead-guitar-vintageverb",
          name: "Valhalla VintageVerb",
          vendor: "Valhalla DSP",
          preset: "Dev placeholder",
          bypassStemPath: "audio/auditions/lead-guitar__without-vintageverb.mp3",
          parameters: [
            p(0, "Mix", 0.28, "28%"),
            p(1, "PreDelay", 0.12, "24 ms"),
            p(2, "Decay", 0.4, "2.1 s"),
            p(3, "Size", 0.55, "55%"),
            p(4, "Attack", 0.3, "30%"),
            p(5, "BassMult", 0.5, "1.0x"),
            p(6, "BassXover", 0.35, "420 Hz"),
            p(7, "HighShelf", 0.6, "-3.2 dB"),
            p(8, "HighXover", 0.5, "4.5 kHz"),
            p(9, "ModRate", 0.2, "0.4 Hz"),
            p(10, "ModDepth", 0.25, "25%"),
            p(11, "EarlyDiff", 0.7, "70%"),
            p(12, "LateDiff", 0.8, "80%"),
            p(13, "Color Mode", 0.33, "1970s"),
          ],
        },
      ],
    },
    ...(["l", "r"] as const).map((side) => {
      const S = side.toUpperCase();
      return {
        id: `rhythm-guitar-${side}`,
        name: `Rhythm Guitar ${S}`,
        ...vol(-7.5),
        pan: side === "l" ? -1 : 1,
        muted: false,
        solo: false,
        stemPath: `audio/rhythm-guitar-${side}.mp3`,
        items: [
          { id: `rhythm-${side}-1`, name: "Rhythm 1", start: 3.0, length: 16.0 },
          { id: `rhythm-${side}-2`, name: "Rhythm 2", start: 20.0, length: 21.3 },
        ],
        plugins: [
          {
            id: `rhythm-guitar-${side}-rabea`,
            name: "Archetype: Rabea",
            vendor: "Neural DSP",
            preset: "Dev placeholder",
            bypassStemPath: `audio/auditions/rhythm-guitar-${side}__without-rabea.mp3`,
            parameters: [
              p(0, "Input Gain", 0.5, "0.0 dB"),
              p(1, "Gain", 0.8, "8.0"),
              p(2, "Bass", 0.6, "6.0"),
              p(3, "Mid", 0.45, "4.5"),
              p(4, "Treble", 0.55, "5.5"),
              p(5, "Presence", 0.5, "5.0"),
              p(6, "Master", 0.6, "6.0"),
            ],
          },
        ],
      };
    }),
    {
      id: "vocals",
      name: "Vocals",
      ...vol(-5.0),
      pan: 0,
      muted: false,
      solo: false,
      stemPath: "audio/vocals.mp3",
      items: [
        { id: "vox-1", name: "Verse", start: 8.0, length: 10.5 },
        { id: "vox-2", name: "Chorus", start: 22.0, length: 12.0 },
        { id: "vox-3", name: "Outro", start: 36.0, length: 4.5 },
      ],
      plugins: [],
    },
  ],
};
