"use client";
import { useState } from "react";
import { usePreferences } from "@/components/preferences/usePreferences";
import { useEngagement } from "./engagement";
import Modal from "./Modal";

const timeAgo = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(t).toLocaleDateString();
};

export default function CommentsDialog({ id, title, onClose }: { id: string; title: string; onClose: () => void }) {
  const { comments, addComment, deleteComment } = useEngagement();
  const { prefs } = usePreferences();
  const [text, setText] = useState("");
  const list = comments[id] ?? [];

  const post = () => {
    const t = text.trim();
    if (!t) return;
    addComment(id, prefs.name.trim() || "You", t.slice(0, 500));
    setText("");
  };

  return (
    <Modal
      title={`Comments · ${title}`}
      subtitle="Saved in this browser only."
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <textarea
            autoFocus
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post();
            }}
            placeholder="Write a comment… (⌘+Enter to post)"
            className="flex-1 resize-none rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] px-3 py-2 text-sm text-[var(--os-text)] placeholder:text-[var(--os-faint)] focus:border-[#2f81f7] focus:outline-none"
          />
          <button
            type="button"
            onClick={post}
            disabled={!text.trim()}
            className="self-end rounded-md bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:opacity-40"
          >
            Post
          </button>
        </div>
      }
    >
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--os-muted)]">No comments yet. Be the first.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id} className="group rounded-md border border-[var(--os-border)] bg-[var(--os-bg)] p-3">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[var(--os-text)]">{c.author}</span>
                <span className="flex items-center gap-2 text-[var(--os-faint)]">
                  {timeAgo(c.at)}
                  <button
                    type="button"
                    onClick={() => deleteComment(id, c.id)}
                    aria-label="Delete comment"
                    className="text-[var(--os-faint)] opacity-0 transition hover:text-[#f85149] group-hover:opacity-100 focus:opacity-100"
                  >
                    ×
                  </button>
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-[var(--os-text)]">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
