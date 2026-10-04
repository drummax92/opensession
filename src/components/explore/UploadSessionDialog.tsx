"use client";
import { useState } from "react";
import UploadShell from "@/components/upload/UploadShell";
import DraftEditor from "./DraftEditor";
import { packageInfo, type DraftProject } from "./drafts";
import Modal from "./Modal";

/** Step 1: pick the package. Step 2: name it, tags, cover, visibility (public by default). */
export default function UploadSessionDialog({ drafts, onClose }: { drafts: DraftProject[]; onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<"pick" | "edit">("pick");

  if (step === "edit")
    return <DraftEditor drafts={drafts} editing="new" defaultVisibility="public" pkg={packageInfo(files)} onClose={onClose} />;

  return (
    <Modal
      title="Upload session"
      subtitle="Step 1 of 2: choose the package exported from REAPER."
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] px-3 py-1.5 text-sm text-[var(--os-text)] transition hover:border-[var(--os-muted)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={files.length === 0}
            onClick={() => setStep("edit")}
            className="rounded-md bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      }
    >
      <UploadShell showOpenButton={false} onFilesChange={setFiles} />
      <p className="text-xs text-[var(--os-faint)]">
        Next you’ll name the session and add tags and a cover. It’s public by default; you can make it private.
      </p>
    </Modal>
  );
}
