"use client";
import { useRef, useState } from "react";

interface Props {
  /** Technical lead wires the real import here (parse session.json, resolve audio, open viewer). */
  onImport?: (files: File[]) => void | Promise<void>;
}

const relPath = (f: File) =>
  (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;

const btn =
  "rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] px-3 py-1.5 text-sm text-[var(--os-text)] transition hover:border-[var(--os-muted)] focus-visible:outline-2 focus-visible:outline-[#2f81f7]";

export default function UploadShell({ onImport }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  const manifest = files.find((f) => f.name === "session.json");
  const audio = files.filter((f) => f.name.toLowerCase().endsWith(".mp3"));
  const ready = !!manifest;

  const pick = (list: FileList | null, replace: boolean) => {
    if (!list) return;
    const added = Array.from(list);
    setError(null);
    setFiles(previous => replace ? added : [...previous, ...added.filter(file =>
      !previous.some(old => relPath(old) === relPath(file) && old.size === file.size && old.lastModified === file.lastModified))]);
  };

  const open = async () => {
    if (!onImport) return;
    setBusy(true);
    setError(null);
    try {
      await onImport(files);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-dashed border-[var(--os-border)] bg-[var(--os-panel)] p-6">
        <h2 className="text-base font-semibold text-[var(--os-text)]">Open a session package</h2>
        <p className="mt-1 text-sm text-[var(--os-muted)]">
          Choose the exported <code className="font-mono">.opensession</code> folder, or select
          <code className="font-mono"> session.json</code> and the audio files together.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} className={btn} onClick={() => folderRef.current?.click()}>
            Choose folder
          </button>
          <button type="button" disabled={busy} className={btn} onClick={() => filesRef.current?.click()}>
            Add files
          </button>
          <button type="button" disabled={busy} className={btn} onClick={() => { setFiles([]); setError(null); }}>Clear selection</button>
        </div>
        <p className="mt-3 text-xs text-[var(--os-muted)]">Unzip ZIP files first. Add files can be used repeatedly to select session.json, audio, and auditions from different folders. Files stay on this device.</p>
        <input
          ref={folderRef}
          type="file"
          className="hidden"
          onChange={(e) => { pick(e.target.files, true); e.target.value = ""; }}
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        />
        <input
          ref={filesRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { pick(e.target.files, false); e.target.value = ""; }}
        />
      </div>

      {files.length > 0 && (
        <div className="rounded-md border border-[var(--os-border)] bg-[var(--os-panel)] p-4">
          <ul className="space-y-1 text-sm">
            <li className={manifest ? "text-[#3fb950]" : "text-[#f85149]"}>
              {manifest ? "✓" : "✗"} session.json {manifest ? "found" : "missing"}
            </li>
            <li className={audio.length > 0 ? "text-[#3fb950]" : "text-[#d29922]"}>
              {audio.length > 0 ? "✓" : "!"} {audio.length} audio file{audio.length === 1 ? "" : "s"}{" "}
              <span className="text-[var(--os-muted)]">(a full demo has 10)</span>
            </li>
          </ul>
          <ul className="mt-3 max-h-40 overflow-y-auto border-t border-[var(--os-subtle)] pt-2 font-mono text-[0.6875rem] text-[var(--os-muted)]">
            {files.map((f) => (
              <li key={relPath(f)} className="truncate">{relPath(f)}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!ready || !onImport || busy}
          onClick={open}
          className="rounded-md bg-[#238636] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Opening…" : "Open session"}
        </button>
        {!onImport && (
          <span className="text-xs text-[var(--os-muted)]">Import isn’t connected yet.</span>
        )}
      </div>
    </div>
  );
}
