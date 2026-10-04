"use client";
import { useState } from "react";
import { PlusIcon } from "@/components/session/Icons";
import UploadShell from "@/components/upload/UploadShell";
import DraftCard from "./DraftCard";
import { deleteDraft, newDraftId, saveDraft, useDrafts, type DraftProject } from "./drafts";
import EditProjectDialog from "./EditProjectDialog";

/** The user's local draft projects, plus the "+ New project" tile. Renders inside the Explore grid. */
export default function DraftCards() {
  const drafts = useDrafts();
  const [editing, setEditing] = useState<DraftProject | "new" | null>(null);
  const current = editing === "new" ? null : editing;

  return (
    <>
      {drafts.map((d) => (
        <DraftCard key={d.id} draft={d} onEdit={() => setEditing(d)} />
      ))}

      <button
        type="button"
        onClick={() => setEditing("new")}
        className="group flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[var(--os-border)] text-[var(--os-muted)] transition hover:border-[var(--os-muted)] hover:bg-[var(--os-panel)] hover:text-[var(--os-text)] focus-visible:outline-2 focus-visible:outline-[#2f81f7]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--os-border)] bg-[var(--os-subtle)] transition group-hover:border-[var(--os-muted)] [&>svg]:h-6 [&>svg]:w-6">
          <PlusIcon />
        </span>
        <span className="text-sm font-medium">New project</span>
      </button>

      {editing && (
        <EditProjectDialog
          title={current?.title ?? "Untitled project"}
          heading={current ? `Edit ${current.title}` : "New project"}
          editTitle
          detectedSetup={[]}
          initial={{
            title: current?.title ?? "",
            description: current?.description ?? "",
            genres: current?.genres ?? [],
            tagColors: current?.tagColors ?? {},
            setup: current?.setup ?? [],
            hiddenSetup: [],
            setupNames: {},
            coverUrl: current?.coverDataUrl,
          }}
          canReset={false}
          onSave={(o) =>
            saveDraft(
              {
                id: current?.id ?? newDraftId(),
                title: o.title || "Untitled project",
                description: o.description ?? "",
                genres: o.genres ?? [],
                tagColors: o.tagColors ?? {},
                setup: o.setup ?? [],
                coverDataUrl: o.coverDataUrl,
                createdAt: current?.createdAt ?? Date.now(),
              },
              drafts,
            )
          }
          onReset={() => {}}
          onDelete={current ? () => deleteDraft(current.id, drafts) : undefined}
          extra={
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[var(--os-muted)]">Session package</span>
              <UploadShell />
            </div>
          }
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
