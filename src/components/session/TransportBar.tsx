"use client";
import { useEffect } from "react";
import { PauseIcon, PlayIcon } from "./Icons";
import { formatTime } from "./format";

interface Props {
  isPlaying: boolean;
  isReady?: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (t: number) => void;
}

export default function TransportBar({
  isPlaying,
  isReady = true,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
}: Props) {
  // Space bar plays/pauses anywhere on the page, except while typing or in a dialog.
  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.isContentEditable ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        (t instanceof HTMLInputElement && t.type !== "range"));
    const ignore = (e: KeyboardEvent) =>
      e.code !== "Space" || typing(e.target) || !!document.querySelector('[aria-modal="true"]');

    const onDown = (e: KeyboardEvent) => {
      if (ignore(e)) return;
      e.preventDefault(); // no page scroll, no clicking the focused button
      e.stopPropagation();
      if (!e.repeat && isReady) (isPlaying ? onPause : onPlay)();
    };
    const onUp = (e: KeyboardEvent) => {
      if (!ignore(e)) e.preventDefault();
    };
    window.addEventListener("keydown", onDown, true);
    window.addEventListener("keyup", onUp, true);
    return () => {
      window.removeEventListener("keydown", onDown, true);
      window.removeEventListener("keyup", onUp, true);
    };
  }, [isPlaying, isReady, onPlay, onPause]);

  return (
    <div className="flex h-12 items-center gap-4 border-b border-[var(--os-border)] bg-[var(--os-panel)] px-4">
      <button
        type="button"
        disabled={!isReady}
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}
        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f81f7] text-white transition hover:bg-[#4493f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f81f7] disabled:opacity-40"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="w-28 font-mono text-sm tabular-nums text-[var(--os-text)]">
        {formatTime(currentTime)}
        <span className="text-[var(--os-muted)]"> / {formatTime(duration)}</span>
      </span>
      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={duration}
        step={0.01}
        value={Math.min(currentTime, duration)}
        disabled={!isReady}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-[#2f81f7]"
      />
    </div>
  );
}
