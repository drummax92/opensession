"use client";
import { useCallback } from "react";
import { useStored, writeStored } from "@/components/storage";

/**
 * Likes, reposts, comments and shares, kept in this browser.
 * With no backend, counts only reflect activity on this computer.
 */
export interface Comment {
  id: string;
  author: string;
  text: string;
  at: number;
}

const LIKED = "opensession:liked";
const REPOSTED = "opensession:reposted";
const SHARES = "opensession:shares";
const COMMENTS = "opensession:comments";
const NO_IDS: string[] = [];
const NO_COUNTS: Record<string, number> = {};
const NO_COMMENTS: Record<string, Comment[]> = {};

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export function useEngagement() {
  const liked = useStored(LIKED, NO_IDS);
  const reposted = useStored(REPOSTED, NO_IDS);
  const shares = useStored(SHARES, NO_COUNTS);
  const comments = useStored(COMMENTS, NO_COMMENTS);

  const toggleLike = useCallback((id: string) => writeStored(LIKED, toggle(liked, id)), [liked]);
  const toggleRepost = useCallback((id: string) => writeStored(REPOSTED, toggle(reposted, id)), [reposted]);
  const addShare = useCallback((id: string) => writeStored(SHARES, { ...shares, [id]: (shares[id] ?? 0) + 1 }), [shares]);
  const addComment = useCallback(
    (id: string, author: string, text: string) =>
      writeStored(COMMENTS, {
        ...comments,
        [id]: [...(comments[id] ?? []), { id: `c-${Date.now().toString(36)}`, author, text, at: Date.now() }],
      }),
    [comments],
  );
  const deleteComment = useCallback(
    (id: string, commentId: string) =>
      writeStored(COMMENTS, { ...comments, [id]: (comments[id] ?? []).filter((c) => c.id !== commentId) }),
    [comments],
  );

  const countsFor = useCallback(
    (id: string) => ({
      likes: liked.includes(id) ? 1 : 0,
      reposts: reposted.includes(id) ? 1 : 0,
      comments: comments[id]?.length ?? 0,
      shares: shares[id] ?? 0,
    }),
    [liked, reposted, comments, shares],
  );

  const totals = {
    likes: liked.length,
    shares: Object.values(shares).reduce((a, b) => a + b, 0),
    comments: Object.values(comments).reduce((a, b) => a + b.length, 0),
    reposts: reposted.length,
  };

  return { liked, reposted, comments, countsFor, totals, toggleLike, toggleRepost, addShare, addComment, deleteComment };
}
