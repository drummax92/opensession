"use client";
import { useDrafts } from "@/components/explore/drafts";
import { useEngagement } from "@/components/explore/engagement";

/** Totals for YOUR sessions only (the ones in My sessions), like an artist dashboard. */
export default function StatsStrip() {
  const drafts = useDrafts();
  const { countsFor } = useEngagement();

  const totals = drafts.reduce(
    (t, d) => {
      const n = countsFor(d.id);
      return { likes: t.likes + n.likes, shares: t.shares + n.shares, comments: t.comments + n.comments, reposts: t.reposts + n.reposts };
    },
    { likes: 0, shares: 0, comments: 0, reposts: 0 },
  );

  const stats = [
    { label: "Likes", value: totals.likes },
    { label: "Shares", value: totals.shares },
    { label: "Comments", value: totals.comments },
    { label: "Reposts", value: totals.reposts },
  ];

  return (
    <section className="rounded-2xl border border-[var(--os-border)] bg-[var(--os-panel)] px-6 py-6 sm:px-8">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Your studio</h2>
        <p className="text-sm text-[var(--os-muted)]">
          Activity on your {drafts.length} {drafts.length === 1 ? "session" : "sessions"}, recorded in this browser.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-[var(--os-border)]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 text-center">
            <dd className="order-1 text-3xl font-semibold tabular-nums text-[var(--os-text)]">{s.value}</dd>
            <dt className="order-2 text-sm font-medium text-[var(--os-muted)]">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
