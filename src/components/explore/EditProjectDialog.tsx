"use client";
import { useState } from "react";
import type { ProjectOverrides } from "@/lib/projectOverrides";
import Modal from "./Modal";
import { setupChipClass } from "./setup";
import { TAG_COLORS, TAG_COLOR_KEYS, tagChipClass, type TagColor } from "./tagColors";

interface Props {
  title: string;
  detectedSetup: string[];
  initial: {
    description: string;
    genres: string[];
    tagColors: Record<string, TagColor>;
    setup: string[];
    coverUrl?: string;
  };
  canReset: boolean;
  onSave: (o: ProjectOverrides) => boolean;
  onReset: () => void;
  onClose: () => void;
}

/** Shrinks an image so it fits comfortably in browser storage. */
async function fileToCover(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, 800 / img.width);
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const input =
  "w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#6e7681] focus:border-[#2f81f7] focus:outline-none";
const secondary =
  "rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-sm text-[#e6edf3] transition hover:border-[#8b949e]";
const label = "text-xs font-semibold text-[#8b949e]";

export default function EditProjectDialog({ title, detectedSetup, initial, canReset, onSave, onReset, onClose }: Props) {
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.genres);
  const [colors, setColors] = useState(initial.tagColors);
  const [tagInput, setTagInput] = useState("");
  const [setup, setSetup] = useState(initial.setup);
  const [setupInput, setSetupInput] = useState("");
  const [cover, setCover] = useState(initial.coverUrl);
  const [error, setError] = useState<string | null>(null);

  const addTag = () => {
    const t = tagInput.trim().slice(0, 24);
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagInput("");
  };

  const addSetup = () => {
    const t = setupInput.trim().slice(0, 32);
    const taken = [...detectedSetup, ...setup].some((x) => x.toLowerCase() === t.toLowerCase());
    if (t && !taken) setSetup([...setup, t]);
    setSetupInput("");
  };

  const pickCover = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setCover(await fileToCover(file));
    } catch {
      setError("That image couldn’t be read. Try a JPG or PNG.");
    }
  };

  const save = () => {
    const keptColors = Object.fromEntries(
      Object.entries(colors).filter(([t, c]) => tags.includes(t) && c !== "default"),
    );
    const ok = onSave({
      description: description.trim(),
      genres: tags,
      tagColors: keptColors,
      setup,
      coverDataUrl: cover?.startsWith("data:") ? cover : undefined,
    });
    if (ok) onClose();
    else setError("The browser couldn’t save this. Try a smaller image.");
  };

  return (
    <Modal
      title={`Edit ${title}`}
      subtitle="Changes are saved in this browser only."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between">
          {canReset ? (
            <button
              type="button"
              onClick={() => {
                onReset();
                onClose();
              }}
              className="text-xs text-[#8b949e] hover:text-[#e6edf3] hover:underline"
            >
              Reset to original
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={secondary}>
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
            >
              Save
            </button>
          </div>
        </div>
      }
    >
      <label className="block space-y-1.5">
        <span className={label}>Description</span>
        <textarea
          autoFocus
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${input} resize-y`}
        />
      </label>

      <div className="space-y-2">
        <span className={label}>Tags</span>
        {tags.length === 0 && <p className="text-xs text-[#6e7681]">No tags yet</p>}
        <ul className="space-y-1.5">
          {tags.map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className={`${tagChipClass(colors[t])} min-w-0 flex-1 truncate`}>{t}</span>
              <div className="flex gap-1.5" role="radiogroup" aria-label={`Colour for ${t}`}>
                {TAG_COLOR_KEYS.map((c) => {
                  const active = (colors[t] ?? "default") === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={TAG_COLORS[c].label}
                      title={TAG_COLORS[c].label}
                      onClick={() => setColors({ ...colors, [t]: c })}
                      className={`h-4 w-4 rounded-full ${TAG_COLORS[c].swatch} ${
                        active ? "ring-2 ring-[#e6edf3] ring-offset-2 ring-offset-[#161b22]" : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                aria-label={`Remove tag ${t}`}
                onClick={() => setTags(tags.filter((x) => x !== t))}
                className="flex h-6 w-6 items-center justify-center rounded text-[#8b949e] hover:bg-[#30363d] hover:text-[#f85149]"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag, e.g. Djent"
            className={input}
          />
          <button type="button" onClick={addTag} className={secondary}>
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className={label}>Setup</span>
        <p className="text-xs text-[#6e7681]">What you used to make it. Items marked “from session” are read from the project.</p>
        <div className="flex flex-wrap gap-1.5">
          {detectedSetup.map((d) => (
            <span key={d} className={`${setupChipClass} opacity-70`} title="Read from the session, can’t be removed">
              {d} <span className="text-[#6e7681]">· from session</span>
            </span>
          ))}
          {setup.map((d) => (
            <span key={d} className={`${setupChipClass} flex items-center gap-1 pr-0.5`}>
              {d}
              <button
                type="button"
                aria-label={`Remove ${d}`}
                onClick={() => setSetup(setup.filter((x) => x !== d))}
                className="flex h-4 w-4 items-center justify-center rounded text-[#8b949e] hover:bg-[#30363d] hover:text-[#f85149]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={setupInput}
            onChange={(e) => setSetupInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSetup();
              }
            }}
            placeholder="Add gear or software, e.g. Focusrite Scarlett"
            className={input}
          />
          <button type="button" onClick={addSetup} className={secondary}>
            Add
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className={label}>Cover image</span>
        <div className="flex items-center gap-3">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-14 w-24 rounded border border-[#30363d] object-cover" />
          ) : (
            <div className="flex h-14 w-24 items-center justify-center rounded border border-dashed border-[#30363d] text-[10px] text-[#6e7681]">
              Timeline
            </div>
          )}
          <label className={`${secondary} cursor-pointer`}>
            Choose image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => pickCover(e.target.files?.[0])} />
          </label>
          {cover && (
            <button type="button" onClick={() => setCover(undefined)} className="text-xs text-[#f85149] hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-[#f85149]">{error}</p>}
    </Modal>
  );
}
