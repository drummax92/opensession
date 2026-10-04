"use client";
import { useState } from "react";
import Modal from "@/components/explore/Modal";
import { downscaleImage } from "@/components/images";
import { useBackground, usePreferences, type FontSize, type Theme } from "./usePreferences";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-[var(--os-muted)]">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-md border border-[var(--os-border)] p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded px-3 py-1.5 text-sm transition ${
              value === o.value
                ? "bg-[var(--os-subtle)] font-medium text-[var(--os-text)] shadow-sm"
                : "text-[var(--os-muted)] hover:text-[var(--os-text)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PreferencesDialog({ onClose }: { onClose: () => void }) {
  const { prefs, update } = usePreferences();
  const { background, mode, setBackground, resetToDefault, setNone } = useBackground();
  const [bgError, setBgError] = useState<string | null>(null);

  const pickBackground = async (file: File | undefined) => {
    if (!file) return;
    setBgError(null);
    try {
      if (!setBackground(await downscaleImage(file, 1920))) setBgError("That image is too large. Try a smaller one.");
    } catch {
      setBgError("That image couldn’t be read. Try a JPG or PNG.");
    }
  };

  return (
    <Modal
      title="Preferences"
      subtitle="Saved automatically in this browser."
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043]"
          >
            Done
          </button>
        </div>
      }
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-[var(--os-muted)]">Your name</span>
        <input
          autoFocus
          value={prefs.name}
          maxLength={40}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Shown as “Hello, …!” in the top bar"
          className="w-full rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2 text-sm text-[var(--os-text)] placeholder:text-[var(--os-faint)] focus:border-[#2f81f7] focus:outline-none"
        />
      </label>
      <Segmented<Theme>
        label="Theme"
        value={prefs.theme}
        onChange={(theme) => update({ theme })}
        options={[
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
        ]}
      />
      <Segmented<FontSize>
        label="Text size"
        value={prefs.fontSize}
        onChange={(fontSize) => update({ fontSize })}
        options={[
          { value: "small", label: "Small" },
          { value: "default", label: "Default" },
          { value: "large", label: "Large" },
        ]}
      />

      <div className="space-y-2">
        <span className="text-xs font-semibold text-[var(--os-muted)]">
          Background{" "}
          <span className="font-normal text-[var(--os-faint)]">
            · {mode === "default" ? "OpenSession default" : mode === "custom" ? "your image" : "none"}
          </span>
        </span>
        <div className="flex items-center gap-3">
          {background ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={background} alt="" className="h-14 w-24 rounded border border-[var(--os-border)] object-cover" />
          ) : (
            <div className="flex h-14 w-24 items-center justify-center rounded border border-dashed border-[var(--os-border)] text-[0.625rem] text-[var(--os-faint)]">
              None
            </div>
          )}
          <label className="cursor-pointer rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] px-3 py-1.5 text-sm text-[var(--os-text)] transition hover:border-[var(--os-muted)]">
            Choose image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => pickBackground(e.target.files?.[0])} />
          </label>
          <div className="flex flex-col items-start gap-1">
            {mode !== "default" && (
              <button type="button" onClick={resetToDefault} className="text-xs text-[#2f81f7] hover:underline">
                Use default
              </button>
            )}
            {mode !== "none" && (
              <button type="button" onClick={setNone} className="text-xs text-[#f85149] hover:underline">
                No background
              </button>
            )}
          </div>
        </div>
        {background && (
          <label className="block space-y-1">
            <span className="flex justify-between text-xs text-[var(--os-muted)]">
              <span>Blur</span>
              <span className="font-mono tabular-nums">{prefs.blur}px</span>
            </span>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={prefs.blur}
              onChange={(e) => update({ blur: Number(e.target.value) })}
              className="w-full cursor-pointer accent-[#2f81f7]"
            />
          </label>
        )}
        {bgError && <p className="text-xs text-[#f85149]">{bgError}</p>}
      </div>
    </Modal>
  );
}
