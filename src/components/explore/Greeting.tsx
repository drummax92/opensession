"use client";
import { useState } from "react";
import PreferencesDialog from "@/components/preferences/PreferencesDialog";
import { usePreferences } from "@/components/preferences/usePreferences";

/** Big "Hello, <name>!" at the top of Explore. Name comes from Preferences. */
export default function Greeting() {
  const { prefs } = usePreferences();
  const [open, setOpen] = useState(false);
  const name = prefs.name.trim();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--os-text)]">
        {name ? `Hello, ${name}!` : "Hello!"}
      </h1>
      {!name && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 text-sm text-[#2f81f7] hover:underline"
        >
          Add your name
        </button>
      )}
      {open && <PreferencesDialog onClose={() => setOpen(false)} />}
    </div>
  );
}
