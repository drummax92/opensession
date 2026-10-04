export const TAG_COLORS = {
  default: { label: "Grey", chip: "border-[#30363d] text-[#8b949e]", swatch: "bg-[#6e7681]" },
  blue: { label: "Blue", chip: "border-[#1f6feb]/60 bg-[#1f6feb]/10 text-[#58a6ff]", swatch: "bg-[#2f81f7]" },
  yellow: { label: "Yellow", chip: "border-[#d29922]/60 bg-[#d29922]/10 text-[#e3b341]", swatch: "bg-[#d29922]" },
  red: { label: "Red", chip: "border-[#f85149]/60 bg-[#f85149]/10 text-[#ff7b72]", swatch: "bg-[#f85149]" },
} as const;

export type TagColor = keyof typeof TAG_COLORS;
export const TAG_COLOR_KEYS = Object.keys(TAG_COLORS) as TagColor[];

export const tagChipClass = (color: TagColor = "default") =>
  `rounded-full border px-2.5 py-0.5 text-xs ${TAG_COLORS[color].chip}`;
