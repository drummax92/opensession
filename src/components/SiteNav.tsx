"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import PreferencesDialog from "./preferences/PreferencesDialog";
import { CompassIcon, FolderIcon, GearIcon, UploadIcon } from "./session/Icons";

const TABS = [
  { href: "/", label: "Explore", Icon: CompassIcon, active: (p: string) => p === "/" },
  { href: "/my-sessions", label: "My sessions", Icon: FolderIcon, active: (p: string) => p.startsWith("/my-sessions") },
  { href: "/upload", label: "Upload", Icon: UploadIcon, active: (p: string) => p.startsWith("/upload") },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--os-border)] bg-[var(--os-panel)]">
      <div className="flex h-14 items-stretch gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-[#2f81f7]">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight text-[var(--os-text)]">OpenSession</span>
        </Link>

        <nav className="flex items-stretch gap-1" aria-label="Main">
          {TABS.map(({ href, label, Icon, active }) => {
            const isActive = active(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center gap-2 px-3 text-[0.95rem] font-medium transition focus-visible:outline-2 focus-visible:outline-[#2f81f7] ${
                  isActive ? "text-[var(--os-text)]" : "text-[var(--os-muted)] hover:text-[var(--os-text)]"
                }`}
              >
                <Icon />
                {label}
                <span
                  className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition ${
                    isActive ? "bg-[var(--os-brand)]" : "bg-transparent"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPrefsOpen(true)}
            aria-label="Preferences"
            title="Preferences"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] text-[var(--os-muted)] transition hover:text-[var(--os-text)] focus-visible:outline-2 focus-visible:outline-[#2f81f7]"
          >
            <GearIcon />
          </button>
        </div>
      </div>
      {prefsOpen && <PreferencesDialog onClose={() => setPrefsOpen(false)} />}
    </header>
  );
}
