"use client";
import { useState, type ReactNode } from "react";
import type { ProjectOverrides } from "@/lib/projectOverrides";
import { GlobeIcon, LockIcon } from "@/components/session/Icons";
import type { Visibility } from "./drafts";
import Modal from "./Modal";
import { setupChipClass } from "./setup";
import { TAG_COLORS, TAG_COLOR_KEYS, tagChipClass, type TagColor } from "./tagColors";

export type EditResult = ProjectOverrides & { title?: string; visibility?: Visibility };

interface Props {
  title: string;
  /** Window heading. Defaults to "Edit <title>". */
  heading?: string;
  /** Show a name field (used for new/draft projects). */
  editTitle?: boolean;
  /** If given, shows a Public / Private choice. */
  visibility?: Visibility;
  detectedSetup: string[];
  initial: {
    title?: string;
    description: string;
    genres: string[];
    tagColors: Record<string, TagColor>;
    setup: string[];
    hiddenSetup: string[];
    setupNames: Record<string, string>;
    coverUrl?: string;
  };
  canReset: boolean;
  onSave: (o: EditResult) => boolean;
  onReset: () => void;
  /** If given, shows "Delete project" (with confirmation). */
  onDelete?: () => void;
  /** Extra section rendered at the bottom of the form. */
  extra?: ReactNode;
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
  "w-full rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2 text-sm text-[var(--os-text)] placeholder:text-[var(--os-faint)] focus:border-[#2f81f7] focus:outline-none";
const secondary =
  "rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] px-3 py-1.5 text-sm text-[var(--os-text)] transition hover:border-[var(--os-muted)]";
const label = "text-xs font-semibold text-[var(--os-muted)]";

export default function EditProjectDialog({
  title,
  heading,
  editTitle = false,
  visibility,
  detectedSetup,
  initial,
  canReset,
  onSave,
  onReset,
  onDelete,
  extra,
  onClose,
}: Props) {
  const [name, setName] = useState(initial.title ?? title);
  const [vis, setVis] = useState<Visibility | undefined>(visibility);
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.genres);
  const [colors, setColors] = useState(initial.tagColors);
  const [tagInput, setTagInput] = useState("");
  const [setup, setSetup] = useState(initial.setup);
  const [setupInput, setSetupInput] = useState("");
  const [hidden, setHidden] = useState(initial.hiddenSetup);
  const [names, setNames] = useState(initial.setupNames);
  const [cover, setCover] = useState(initial.coverUrl);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"discard" | "reset" | "delete" | null>(null);

  const snapshot = (o: object) => JSON.stringify(o);
  const dirty =
    snapshot({ vis, name, description, tags, colors, setup, hidden, names, cover }) !==
    snapshot({
      vis: visibility,
      name: initial.title ?? title,
      description: initial.description,
      tags: initial.genres,
      colors: initial.tagColors,
      setup: initial.setup,
      hidden: initial.hiddenSetup,
      names: initial.setupNames,
      cover: initial.coverUrl,
    });

  /** Close via ×, Escape, backdrop or Cancel: ask first if there are unsaved changes. */
  const requestClose = () => {
    if (confirm) setConfirm(null);
    else if (dirty) setConfirm("discard");
    else onClose();
  };

  const addTag = () => {
    const t = tagInput.trim().slice(0, 24);
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagInput("");
  };

  const addSetup = () => {
    const t = setupInput.trim().slice(0, 32);
    const shown = detectedSetup.map((d) => names[d]?.trim() || d);
    const taken = [...detectedSetup, ...shown, ...setup].some((x) => x.toLowerCase() === t.toLowerCase());
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
      ...(editTitle ? { title: name.trim() || "Untitled project" } : {}),
      ...(vis ? { visibility: vis } : {}),
      description: description.trim(),
      genres: tags,
      tagColors: keptColors,
      setup,
      hiddenSetup: hidden.filter((d) => detectedSetup.includes(d)),
      setupNames: Object.fromEntries(
        Object.entries(names).filter(([d, n]) => detectedSetup.includes(d) && n.trim() && n.trim() !== d),
      ),
      coverDataUrl: cover?.startsWith("data:") ? cover : undefined,
    });
    if (ok) onClose();
    else setError("The browser couldn’t save this. Try a smaller image.");
  };

  return (
    <Modal
      title={heading ?? `Edit ${title}`}
      subtitle="Changes are saved in this browser only."
      onClose={requestClose}
      footer={
        confirm ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--os-text)]">
              {confirm === "discard"
                ? "Discard your unsaved changes?"
                : confirm === "delete"
                  ? "Delete this project? This can’t be undone."
                  : "Reset everything to the original? Your description, tags, setup labels and cover will be removed."}
            </p>
            <div className="flex gap-2">
              <button type="button" autoFocus onClick={() => setConfirm(null)} className={secondary}>
                {confirm === "discard" ? "Keep editing" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm === "reset") onReset();
                  if (confirm === "delete") onDelete?.();
                  onClose();
                }}
                className="rounded-md bg-[#da3633] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#f85149]"
              >
                {confirm === "discard" ? "Discard" : confirm === "delete" ? "Delete" : "Reset"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {onDelete ? (
              <button
                type="button"
                onClick={() => setConfirm("delete")}
                className="text-xs text-[#f85149] hover:underline"
              >
                Delete project
              </button>
            ) : canReset ? (
              <button
                type="button"
                onClick={() => setConfirm("reset")}
                className="text-xs text-[var(--os-muted)] hover:text-[var(--os-text)] hover:underline"
              >
                Reset to original
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={requestClose} className={secondary}>
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
        )
      }
    >
      {editTitle && (
        <label className="block space-y-1.5">
          <span className={label}>Project name</span>
          <input
            autoFocus
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder="Untitled project"
            className={input}
          />
        </label>
      )}

      {vis && (
        <div className="space-y-1.5">
          <span className={label}>Visibility</span>
          <div role="radiogroup" aria-label="Visibility" className="flex rounded-md border border-[var(--os-border)] p-0.5">
            {(["public", "private"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={vis === v}
                onClick={() => setVis(v)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm transition [&>svg]:h-3.5 [&>svg]:w-3.5 ${
                  vis === v
                    ? "bg-[var(--os-subtle)] font-medium text-[var(--os-text)]"
                    : "text-[var(--os-muted)] hover:text-[var(--os-text)]"
                }`}
              >
                {v === "public" ? <GlobeIcon /> : <LockIcon />}
                {v === "public" ? "Public" : "Private"}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--os-faint)]">
            {vis === "public" ? "Shown on Explore and in My sessions." : "Only shown in My sessions."}
          </p>
        </div>
      )}

      <label className="block space-y-1.5">
        <span className={label}>Description</span>
        <textarea
          autoFocus={!editTitle}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${input} resize-y`}
        />
      </label>

      <div className="space-y-2">
        <span className={label}>Tags</span>
        {tags.length === 0 && <p className="text-xs text-[var(--os-faint)]">No tags yet</p>}
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
                        active ? "ring-2 ring-[var(--os-text)] ring-offset-2 ring-offset-[var(--os-panel)]" : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                aria-label={`Remove tag ${t}`}
                onClick={() => setTags(tags.filter((x) => x !== t))}
                className="flex h-6 w-6 items-center justify-center rounded text-[var(--os-muted)] hover:bg-[var(--os-border)] hover:text-[#f85149]"
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
        {detectedSetup.length > 0 && (<p className="text-xs text-[var(--os-faint)]">
          Labels read from the session can be renamed or hidden on the card. The session page always shows the real names.
        </p>)}
        <ul className="space-y-1.5">
          {detectedSetup.map((d) => {
            const isHidden = hidden.includes(d);
            return (
              <li key={d} className="flex items-center gap-2">
                <input
                  value={names[d] ?? d}
                  onChange={(e) => setNames({ ...names, [d]: e.target.value })}
                  aria-label={`Label for ${d}`}
                  disabled={isHidden}
                  className={`${input} py-1 font-mono text-xs disabled:opacity-40`}
                />
                <button
                  type="button"
                  aria-pressed={isHidden}
                  onClick={() => setHidden(isHidden ? hidden.filter((x) => x !== d) : [...hidden, d])}
                  className={`w-16 shrink-0 rounded-md border px-2 py-1 text-xs transition ${
                    isHidden
                      ? "border-[#d29922]/60 text-[#d29922]"
                      : "border-[var(--os-border)] text-[var(--os-muted)] hover:border-[var(--os-muted)]"
                  }`}
                >
                  {isHidden ? "Hidden" : "Hide"}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          {setup.map((d) => (
            <span key={d} className={`${setupChipClass} flex items-center gap-1 pr-0.5`}>
              {d}
              <button
                type="button"
                aria-label={`Remove ${d}`}
                onClick={() => setSetup(setup.filter((x) => x !== d))}
                className="flex h-4 w-4 items-center justify-center rounded text-[var(--os-muted)] hover:bg-[var(--os-border)] hover:text-[#f85149]"
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
            <img src={cover} alt="" className="h-14 w-24 rounded border border-[var(--os-border)] object-cover" />
          ) : (
            <div className="flex h-14 w-24 items-center justify-center rounded border border-dashed border-[var(--os-border)] text-[0.625rem] text-[var(--os-faint)]">
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

      {extra}

      {error && <p className="text-xs text-[#f85149]">{error}</p>}
    </Modal>
  );
}
