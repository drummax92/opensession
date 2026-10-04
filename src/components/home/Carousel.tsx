"use client";
import { useRef, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/session/Icons";

const arrow =
  "absolute top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--os-border)] bg-[var(--os-panel)] text-[var(--os-text)] shadow-lg transition hover:scale-105 group-hover/row:flex";

/** Horizontal row with arrow buttons (shown on hover). */
export default function Carousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="group/row relative">
      <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} className={`${arrow} -left-4`}>
        <ChevronLeftIcon />
      </button>
      <div
        ref={ref}
        className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} className={`${arrow} -right-4`}>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
