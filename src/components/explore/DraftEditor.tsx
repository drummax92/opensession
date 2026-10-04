"use client";
import { useState } from "react";
import UploadShell from "@/components/upload/UploadShell";
import {
  deleteDraft,
  newDraftId,
  packageInfo,
  saveDraft,
  visibilityOf,
  type DraftProject,
  type PackageInfo,
  type Visibility,
} from "./drafts";
import EditProjectDialog from "./EditProjectDialog";

/** Edit window for a new or existing session of yours. */
export default function DraftEditor({
  drafts,
  editing,
  onClose,
  defaultVisibility = "private",
  pkg: startPkg,
}: {
  drafts: DraftProject[];
  editing: DraftProject | "new";
  onClose: () => void;
  defaultVisibility?: Visibility;
  /** Package already picked (from the Upload flow). */
  pkg?: PackageInfo;
}) {
  const current = editing === "new" ? null : editing;
  const [pkg, setPkg] = useState<PackageInfo | undefined>(
    current?.packageName ? { name: current.packageName, fileCount: current.fileCount ?? 0 } : startPkg,
  );

  return (
    <EditProjectDialog
      title={current?.title ?? "Untitled session"}
      heading={current ? `Edit ${current.title}` : startPkg ? "Upload session" : "New session"}
      editTitle
      visibility={current ? visibilityOf(current) : defaultVisibility}
      detectedSetup={[]}
      initial={{
        title: current?.title ?? startPkg?.name ?? "",
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
            title: o.title || "Untitled session",
            description: o.description ?? "",
            genres: o.genres ?? [],
            tagColors: o.tagColors ?? {},
            setup: o.setup ?? [],
            coverDataUrl: o.coverDataUrl,
            createdAt: current?.createdAt ?? Date.now(),
            visibility: o.visibility ?? defaultVisibility,
            packageName: pkg?.name,
            fileCount: pkg?.fileCount,
          },
          drafts,
        )
      }
      onReset={() => {}}
      onDelete={current ? () => deleteDraft(current.id, drafts) : undefined}
      extra={
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[var(--os-muted)]">Session package</span>
          {pkg ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--os-border)] px-3 py-2 text-sm">
              <span className="truncate font-mono text-xs">
                {pkg.name} · {pkg.fileCount} files
              </span>
              <button type="button" onClick={() => setPkg(undefined)} className="text-xs text-[#2f81f7] hover:underline">
                Replace
              </button>
            </div>
          ) : (
            <UploadShell showOpenButton={false} onFilesChange={(files) => files.length && setPkg(packageInfo(files))} />
          )}
        </div>
      }
      onClose={onClose}
    />
  );
}
