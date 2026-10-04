"use client";
import { useRef, useState } from "react";

interface Props {
  /** Technical lead wires the real import here (parse session.json, resolve audio, open viewer). */
  onImport?: (files: File[]) => void | Promise<void>;
}

const relPath = (f: File) =>
  (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;

const btn =
  "rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-sm text-[#e6edf3] transition hover:border-[#8b949e] focus-visible:outline-2 focus-visible:outline-[#2f81f7]";

export default function UploadShell({ onImport }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const folderRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  const manifest = files.find((f) => f.name === "session.json");
  const audio = files.filter((f) => f.name.toLowerCase().endsWith(".mp3"));
  const ready = !!manifest;

  const pick = (list: FileList | null) => setFiles(list ? Array.from(list) : []);

  const open = async () => {
    if (!onImport) return;
    setBusy(true);
    try {
      await onImport(files);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-dashed border-[#30363d] bg-[#161b22] p-6">
        <h2 className="text-base font-semibold text-[#e6edf3]">Open a session package</h2>
        <p className="mt-1 text-sm text-[#8b949e]">
          Choose the exported <code className="font-mono">.opensession</code> folder, or select
          <code className="font-mono"> session.json</code> and the audio files together.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => folderRef.current?.click()}>
            Choose folder
          </button>
          <button type="button" className={btn} onClick={() => filesRef.current?.click()}>
            Choose files
          </button>
        </div>
        <input
          ref={folderRef}
          type="file"
          className="hidden"
          onChange={(e) => pick(e.target.files)}
          {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        />
        <input
          ref={filesRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => pick(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="rounded-md border border-[#30363d] bg-[#161b22] p-4">
          <ul className="space-y-1 text-sm">
            <li className={manifest ? "text-[#3fb950]" : "text-[#f85149]"}>
              {manifest ? "✓" : "✗"} session.json {manifest ? "found" : "missing"}
            </li>
            <li className={audio.length > 0 ? "text-[#3fb950]" : "text-[#d29922]"}>
              {audio.length > 0 ? "✓" : "!"} {audio.length} audio file{audio.length === 1 ? "" : "s"}{" "}
              <span className="text-[#8b949e]">(a full demo has 10)</span>
            </li>
          </ul>
          <ul className="mt-3 max-h-40 overflow-y-auto border-t border-[#21262d] pt-2 font-mono text-[11px] text-[#8b949e]">
            {files.map((f) => (
              <li key={relPath(f)} className="truncate">{relPath(f)}</li>
            ))}
          </ul>
        </div>
      )}

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
          <span className="text-xs text-[#8b949e]">Import isn’t connected yet.</span>
        )}
      </div>
    </div>
  );
}
