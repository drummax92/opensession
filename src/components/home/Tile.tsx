import Link from "next/link";
import type { ReactNode } from "react";

/** Square-cover tile for Home rows. */
export default function Tile({ href, cover, title, subtitle }: { href: string; cover: ReactNode; title: string; subtitle: ReactNode }) {
  return (
    <Link
      href={href}
      className="group w-44 shrink-0 snap-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f81f7] sm:w-52"
    >
      <div className="aspect-square overflow-hidden rounded-lg border border-[var(--os-border)] bg-[var(--os-bg)] [&>*]:h-full [&>*]:border-b-0">
        {cover}
      </div>
      <p className="mt-2.5 truncate text-base font-semibold text-[var(--os-text)] group-hover:text-[#2f81f7]">{title}</p>
      <div className="truncate text-sm font-medium text-[var(--os-muted)]">{subtitle}</div>
    </Link>
  );
}
