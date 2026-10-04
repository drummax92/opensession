"use client";
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
  return (
    <div className="flex h-12 items-center gap-4 border-b border-[#30363d] bg-[#161b22] px-4">
      <button
        type="button"
        disabled={!isReady}
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f81f7] text-white transition hover:bg-[#4493f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f81f7] disabled:opacity-40"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="w-28 font-mono text-sm tabular-nums text-[#e6edf3]">
        {formatTime(currentTime)}
        <span className="text-[#8b949e]"> / {formatTime(duration)}</span>
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
