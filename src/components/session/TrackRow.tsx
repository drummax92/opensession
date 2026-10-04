"use client";
import type { OpenSessionTrack } from "@/types/session";
import { HeadphonesIcon, SpeakerOffIcon } from "./Icons";
import { formatDb, formatPan, trackColor } from "./format";

interface Props {
  track: OpenSessionTrack;
  index: number;
  selected: boolean;
  audible: boolean;
  muted: boolean;
  solo: boolean;
  onSelect: () => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
}

const btn =
  "flex h-10 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border text-[0.625rem] font-semibold leading-none transition [&>svg]:h-3.5 [&>svg]:w-3.5 focus-visible:outline-2 focus-visible:outline-[#2f81f7]";

export default function TrackRow({
  track,
  index,
  selected,
  audible,
  muted,
  solo,
  onSelect,
  onToggleMute,
  onToggleSolo,
}: Props) {
  const stop =
    (fn: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      fn();
    };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex h-14 cursor-pointer select-none items-center gap-3 border-b border-[var(--os-border)] px-3 transition ${
        selected
          ? "bg-[var(--os-selected)] shadow-[inset_3px_0_0_#2f81f7]"
          : "hover:bg-[var(--os-panel)]"
      }`}
    >
      <span
        className="h-8 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: trackColor(index), opacity: audible ? 1 : 0.3 }}
      />
      <div className={`min-w-0 flex-1 ${audible ? "" : "opacity-50"}`}>
        <div className="truncate text-sm font-medium text-[var(--os-text)]">{track.name}</div>
        <div className="font-mono text-[0.6875rem] tabular-nums text-[var(--os-muted)]">
          {formatDb(track)} · pan {formatPan(track.pan)}
        </div>
      </div>
      <button
        type="button"
        aria-label={muted ? `Unmute ${track.name}` : `Mute ${track.name}`}
        aria-pressed={muted}
        title={muted ? "Unmute this track" : "Mute: silence this track"}
        onClick={stop(onToggleMute)}
        className={`${btn} ${
          muted
            ? "border-[#d29922] bg-[#d29922] text-[#0d1117]"
            : "border-[var(--os-border)] text-[var(--os-muted)] hover:border-[var(--os-muted)] hover:text-[var(--os-text)]"
        }`}
      >
        <SpeakerOffIcon />
        <span>Mute</span>
      </button>
      <button
        type="button"
        aria-label={solo ? `Unsolo ${track.name}` : `Solo ${track.name}`}
        aria-pressed={solo}
        title={solo ? "Stop soloing" : "Solo: hear only this track"}
        onClick={stop(onToggleSolo)}
        className={`${btn} ${
          solo
            ? "border-[#3fb950] bg-[#3fb950] text-[#0d1117]"
            : "border-[var(--os-border)] text-[var(--os-muted)] hover:border-[var(--os-muted)] hover:text-[var(--os-text)]"
        }`}
      >
        <HeadphonesIcon />
        <span>Solo</span>
      </button>
    </div>
  );
}
