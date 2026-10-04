"use client";
import ClipWaveform from "./ClipWaveform";
import type { OpenSessionProject } from "@/types/session";
import { formatTime, trackColor } from "./format";

export const RULER_H = "h-8";
export const ROW_H = "h-14";

interface Props {
  project: OpenSessionProject;
  selectedTrackId: string | null;
  isAudible: (trackId: string) => boolean;
  currentTime: number;
  waveformsByTrack: Record<string, { peaks: readonly number[]; duration: number }>;
  onSelectTrack: (trackId: string) => void;
  onSeek: (t: number) => void;
}

export default function Timeline({
  project,
  selectedTrackId,
  isAudible,
  currentTime,
  waveformsByTrack,
  onSelectTrack,
  onSeek,
}: Props) {
  const { duration } = project;
  const step = duration > 60 ? 10 : 5;
  const ticks = Array.from({ length: Math.floor(duration / step) + 1 }, (_, i) => i * step);

  return (
    <div className="relative min-w-[35rem]">
      {/* ruler — click to seek */}
      <div
        className={`relative ${RULER_H} cursor-pointer border-b border-[var(--os-border)] bg-[var(--os-panel)]`}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - r.left) / r.width) * duration);
        }}
      >
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute top-0 h-full border-l border-[var(--os-border)] pl-1 font-mono text-[0.625rem] leading-8 text-[var(--os-muted)]"
            style={{ left: `${(t / duration) * 100}%` }}
          >
            {t / duration < 0.95 ? formatTime(t) : null}
          </div>
        ))}
      </div>

      {/* lanes */}
      {project.tracks.map((track, i) => {
        const selected = track.id === selectedTrackId;
        const audible = isAudible(track.id);
        return (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track.id)}
            className={`relative ${ROW_H} cursor-pointer border-b border-[var(--os-border)] ${
              selected ? "bg-[var(--os-selected)]" : "bg-[var(--os-bg)]"
            }`}
          >
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-0 h-full border-l border-[var(--os-subtle)]"
                style={{ left: `${(t / duration) * 100}%` }}
              />
            ))}
            {track.items.map((item) => (
              <div
                key={item.id}
                title={`${item.name ?? track.name} · ${item.start.toFixed(2)}s → ${(item.start + item.length).toFixed(2)}s`}
                className="absolute bottom-1.5 top-1.5 overflow-hidden rounded-md border shadow-sm transition-[filter] hover:brightness-125"
                style={{
                  left: `${(item.start / duration) * 100}%`,
                  width: `${(item.length / duration) * 100}%`,
                  background: `linear-gradient(180deg, ${trackColor(i)}30, ${trackColor(i)}0d)`,
                  color: trackColor(i),
                  borderColor: trackColor(i),
                  opacity: audible ? 1 : 0.5,
                }}
              >
                <span className="relative z-[1] block truncate border-b border-black/10 bg-black/15 px-1.5 text-[9px] font-semibold leading-[14px] text-[var(--os-text)]">
                  {item.name ?? track.name}
                </span>
                {waveformsByTrack[track.id] && <ClipWaveform
                  peaks={waveformsByTrack[track.id].peaks}
                  stemDuration={waveformsByTrack[track.id].duration}
                  start={item.start} length={item.length}
                />}
              </div>
            ))}
          </div>
        );
      })}

      {/* shared playhead */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#f85149]"
        style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
      >
        <div className="absolute -left-[4px] top-0 h-0 w-0 border-x-[4.5px] border-t-[7px] border-x-transparent border-t-[#f85149]" />
      </div>
    </div>
  );
}
