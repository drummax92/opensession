"use client";

import { useEffect, useRef, useState } from "react";
import { openPackage } from "@/lib/import/open-package";
import SessionViewer from "@/components/session/SessionViewer";
import UploadShell from "./UploadShell";

export default function ImportSession() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof openPackage>> | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  if (session) return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-4 border-b border-[var(--os-border)] px-4 py-2 text-sm">
        <span>Local session · available until refresh</span>
        <button className="text-blue-400 hover:underline" onClick={() => setSession(null)}>Open another package</button>
      </div>
      <div className="min-h-0 flex-1"><SessionViewer project={session.project} audioFiles={session.audioFiles} /></div>
    </div>
  );
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold">Upload</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--os-muted)]">Open an exported package locally. Nothing is uploaded to a server; the session disappears when you refresh.</p>
      <UploadShell onImport={async files => {
        const loaded = await openPackage(files);
        if (mounted.current) setSession(loaded);
      }} />
    </main>
  );
}
