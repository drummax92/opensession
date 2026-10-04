"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import type { OpenSessionProject } from "@/types/session";
import Logo from "@/components/Logo";
import { GlobeIcon, HeartIcon, LockIcon, ShareIcon } from "@/components/session/Icons";
import MiniTimeline from "./MiniTimeline";
import type { Visibility } from "./drafts";
import { useLikes } from "./likes";
import { setupChipClass } from "./setup";
import { tagChipClass, type TagColor } from "./tagColors";

export const cardHover =
  "relative transition duration-200 hover:z-10 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-[var(--os-muted)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.5)]";
export const iconBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--os-border)] bg-[var(--os-subtle)] text-[var(--os-muted)] transition hover:border-[var(--os-muted)] hover:text-[var(--os-text)] focus-visible:outline-2 focus-visible:outline-[#2f81f7]";

export interface CardTag {
  label: string;
  color?: TagColor;
}

/** Cover: uploaded image, else the session's mini timeline, else the logo. */
export function CardCover({ coverUrl, project, className = "h-28" }: { coverUrl?: string; project?: OpenSessionProject; className?: string }) {
  if (coverUrl)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverUrl} alt="" className={`${className} w-full border-b border-[var(--os-border)] object-cover`} />;
  if (project) return <MiniTimeline project={project} className={`${className} border-b border-[var(--os-border)]`} />;
  return (
    <div className={`${className} flex items-center justify-center border-b border-[var(--os-border)] bg-[var(--os-bg)]`}>
      <Logo className="h-10 w-10 opacity-30" />
    </div>
  );
}

export function VisibilityBadge({ visibility, onToggle }: { visibility: Visibility; onToggle?: () => void }) {
  const pub = visibility === "public";
  const cls = `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium [&>svg]:h-3 [&>svg]:w-3 ${
    pub ? "border-[#3fb950]/50 text-[#3fb950]" : "border-[var(--os-border)] text-[var(--os-muted)]"
  }`;
  const body = (
    <>
      {pub ? <GlobeIcon /> : <LockIcon />}
      {pub ? "Public" : "Private"}
    </>
  );
  return onToggle ? (
    <button type="button" onClick={onToggle} title={pub ? "Make private" : "Make public"} className={`${cls} transition hover:brightness-125`}>
      {body}
    </button>
  ) : (
    <span className={cls}>{body}</span>
  );
}

/** Heart with count + share (share is visual only for now). */
export function LikeShare({ id, title }: { id: string; title: string }) {
  const { liked, toggleLike } = useLikes();
  const isLiked = liked.includes(id);
  return (
    <>
      <button
        type="button"
        onClick={() => toggleLike(id)}
        aria-pressed={isLiked}
        aria-label={`${isLiked ? "Unlike" : "Like"} ${title}`}
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition hover:bg-[var(--os-subtle)] ${
          isLiked ? "text-[#f85149]" : "text-[var(--os-muted)] hover:text-[var(--os-text)]"
        }`}
      >
        <HeartIcon filled={isLiked} />
        <span className="tabular-nums">{isLiked ? 1 : 0}</span>
      </button>
      <button
        type="button"
        aria-label={`Share ${title}`}
        title="Share (coming soon)"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-[var(--os-muted)] transition hover:bg-[var(--os-subtle)] hover:text-[var(--os-text)]"
      >
        <ShareIcon />
        Share
      </button>
    </>
  );
}

interface Props {
  cover: ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  description?: string;
  tags: CardTag[];
  setup: string[];
  badge?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export default function SessionCard({ cover, title, subtitle, href, description, tags, setup, badge, actions, footer }: Props) {
  const heading = (
    <>
      <h2 className="truncate text-base font-semibold text-[var(--os-text)] group-hover:text-[#2f81f7]">{title}</h2>
      <p className="truncate text-xs text-[var(--os-muted)]">{subtitle}</p>
    </>
  );
  return (
    <article className={`group flex flex-col overflow-hidden rounded-md border border-[var(--os-border)] bg-[var(--os-panel)] ${cardHover}`}>
      {href ? (
        <Link href={href} tabIndex={-1} aria-hidden className="block">
          {cover}
        </Link>
      ) : (
        cover
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {href ? (
              <Link href={href} className="block focus-visible:outline-2 focus-visible:outline-[#2f81f7]">
                {heading}
              </Link>
            ) : (
              heading
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-1.5">{actions}</div>}
        </div>
        {badge && <div>{badge}</div>}
        {description && <p className="line-clamp-2 text-sm text-[var(--os-muted)]">{description}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((t) => (
              <span key={t.label} className={tagChipClass(t.color)}>{t.label}</span>
            ))}
          </div>
        )}
        {setup.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-t border-[var(--os-subtle)] pt-2.5">
            <span className="mr-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--os-faint)]">Setup</span>
            {setup.map((d) => (
              <span key={d} className={setupChipClass}>{d}</span>
            ))}
          </div>
        )}
        {footer && <div className="mt-auto flex items-center gap-1 border-t border-[var(--os-subtle)] pt-2">{footer}</div>}
      </div>
    </article>
  );
}
