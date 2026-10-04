"use client";
import Modal from "@/components/explore/Modal";
import { usePreferences, type FontSize, type Theme } from "./usePreferences";

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
    </Modal>
  );
}
