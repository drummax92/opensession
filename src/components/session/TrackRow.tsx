"use client";
import type { OpenSessionTrack } from "@/types/session";
import { HeadphonesIcon, SpeakerOffIcon } from "./Icons";
import { trackColor } from "./format";

interface Props {
  track: OpenSessionTrack;
  index: number;
  selected: boolean;
  audible: boolean;
  disabled?: boolean;
  muted: boolean;
  solo: boolean;
  volume: number;
  onVolumeChange: (value: number) => void;
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
  disabled = false,
  muted,
  solo,
  volume,
  onVolumeChange,
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
        if (e.target !== e.currentTarget) return;
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
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <input
            type="range" min={0} max={200} step={1}
            value={Math.round(volume * 100)} disabled={disabled}
            aria-label={`Volume ${track.name}`} aria-valuetext={`${Math.round(volume * 100)} percent`}
            title="Playback volume: 100% is the exported mix"
            onChange={e => onVolumeChange(Number(e.target.value) / 100)}
            className="h-4 min-w-0 flex-1 cursor-pointer accent-[#2f81f7] disabled:opacity-40"
          />
          <button type="button" disabled={disabled} onClick={() => onVolumeChange(1)}
            aria-label={`Reset volume ${track.name} to 100 percent`} title="Reset to 100%"
            className="w-10 shrink-0 text-right font-mono text-[0.625rem] text-[var(--os-muted)] hover:text-[var(--os-text)]">
            {Math.round(volume * 100)}%
          </button>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
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
        disabled={disabled}
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
