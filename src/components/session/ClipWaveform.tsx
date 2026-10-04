"use client";
import { memo, useMemo } from "react";
import { waveformHeight } from "@/lib/audio/waveform";

/** The package provides full rendered stems, so crop by project time, not sourceFile. */
export default memo(function ClipWaveform({ peaks, stemDuration, start, length, gain }: {
  peaks: readonly number[]; stemDuration: number; start: number; length: number; gain: number;
}) {
  const path = useMemo(() => {
    if (!peaks.length || stemDuration <= 0 || length <= 0) return "";
    const first = Math.max(0, Math.floor(start / stemDuration * peaks.length));
    const end = Math.min(peaks.length, Math.ceil((start + length) / stemDuration * peaks.length));
    const points: [number, number][] = [];
    for (let i = first; i < end; i++) {
      const time = (i + 0.5) / peaks.length * stemDuration;
      const x = Math.max(0, Math.min(1000, (time - start) / length * 1000));
      // Display-only scaling keeps quiet details legible; never changes playback gain.
      points.push([x, waveformHeight(peaks[i], gain)]);
    }
    if (!points.length) return "";
    return `M0 14 ${points.map(([x, h]) => `L${x.toFixed(2)} ${(14 - h).toFixed(2)}`).join(" ")} L1000 14 ${points.slice().reverse().map(([x, h]) => `L${x.toFixed(2)} ${(14 + h).toFixed(2)}`).join(" ")} Z`;
  }, [peaks, stemDuration, start, length, gain]);
  return <svg aria-hidden="true" viewBox="0 0 1000 28" preserveAspectRatio="none"
    className="pointer-events-none absolute inset-x-0 bottom-0 h-[26px] w-full">
    <path d="M0 14 H1000" stroke="currentColor" strokeOpacity="0.2" vectorEffect="non-scaling-stroke" />
    <path d={path} fill="currentColor" fillOpacity="0.8" />
  </svg>;
});
