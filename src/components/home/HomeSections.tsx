"use client";
import Link from "next/link";
import type { OpenSessionProject } from "@/types/session";
import { useDrafts, visibilityOf } from "@/components/explore/drafts";
import { useEngagement } from "@/components/explore/engagement";
import { CardCover, VisibilityBadge } from "@/components/explore/SessionCard";
import { usePreferences } from "@/components/preferences/usePreferences";
import { HeartIcon, MessageIcon, RepeatIcon } from "@/components/session/Icons";
import { projectHref } from "@/lib/projects";
import Carousel from "./Carousel";
import Tile from "./Tile";

function Section({ title, link, children }: { title: string; link?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {link && (
          <Link href={link.href} className="text-sm font-medium text-[var(--os-muted)] hover:text-[var(--os-text)] hover:underline">
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

const statLine = "inline-flex items-center gap-1 [&>svg]:h-3.5 [&>svg]:w-3.5";

export default function HomeSections({ projects }: { projects: OpenSessionProject[] }) {
  const drafts = useDrafts();
  const { countsFor } = useEngagement();
  const { prefs } = usePreferences();
  const ownerName = prefs.name.trim() || "You";

  // Trending: public sessions ranked by activity (reposts and comments count double).
  const trending = [
    ...projects.map((p) => ({ id: p.id, title: p.title, owner: p.owner, href: projectHref(p), cover: <CardCover project={p} /> })),
    ...drafts
      .filter((d) => visibilityOf(d) === "public")
      .map((d) => ({ id: d.id, title: d.title, owner: ownerName, href: "/explore", cover: <CardCover coverUrl={d.coverDataUrl} /> })),
  ]
    .map((t) => {
      const n = countsFor(t.id);
      return { ...t, n, score: n.likes + n.shares + 2 * (n.reposts + n.comments) };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const recent = [...drafts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

  return (
    <>
      <Section title="Trending" link={{ href: "/explore", label: "See all" }}>
        <Carousel>
          {trending.map((t) => (
            <Tile
              key={t.id}
              href={t.href}
              cover={t.cover}
              title={t.title}
              subtitle={
                <span className="flex items-center gap-3">
                  <span className={statLine}>
                    <HeartIcon /> {t.n.likes}
                  </span>
                  <span className={statLine}>
                    <MessageIcon /> {t.n.comments}
                  </span>
                  <span className={statLine}>
                    <RepeatIcon /> {t.n.reposts}
                  </span>
                </span>
              }
            />
          ))}
        </Carousel>
      </Section>

      <Section title="My recent sessions" link={{ href: "/my-sessions", label: "View all" }}>
        {recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--os-border)] p-8 text-center">
            <p className="text-sm text-[var(--os-muted)]">You haven’t created or uploaded any sessions yet.</p>
            <Link href="/my-sessions" className="mt-2 inline-block text-sm text-[#2f81f7] hover:underline">
              Create your first session
            </Link>
          </div>
        ) : (
          <Carousel>
            {recent.map((d) => (
              <Tile
                key={d.id}
                href="/my-sessions"
                cover={<CardCover coverUrl={d.coverDataUrl} />}
                title={d.title}
                subtitle={
                  <span className="flex items-center gap-2">
                    <VisibilityBadge visibility={visibilityOf(d)} />
                    {new Date(d.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                }
              />
            ))}
          </Carousel>
        )}
      </Section>
    </>
  );
}
