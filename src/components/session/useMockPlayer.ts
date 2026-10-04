"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SessionPlayerApi } from "./types";

/** Dev-only stand-in so the UI moves before the audio engine is wired. */
export function useMockPlayer(duration: number): SessionPlayerApi {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null) {
        timeRef.current = Math.min(duration, timeRef.current + (now - last) / 1000);
        setCurrentTime(timeRef.current);
        if (timeRef.current >= duration) {
          setIsPlaying(false);
          return;
        }
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, duration]);

  const play = useCallback(() => {
    if (timeRef.current >= duration) {
      timeRef.current = 0;
      setCurrentTime(0);
    }
    setIsPlaying(true);
  }, [duration]);
  const pause = useCallback(() => setIsPlaying(false), []);
  const seek = useCallback(
    (t: number) => {
      timeRef.current = Math.min(duration, Math.max(0, t));
      setCurrentTime(timeRef.current);
    },
    [duration],
  );
  const noop = useCallback(() => {}, []);

  return useMemo(
    () => ({
      isReady: true,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      seek,
      toggleMute: noop,
      toggleSolo: noop,
      togglePluginBypass: noop,
    }),
    [isPlaying, currentTime, duration, play, pause, seek, noop],
  );
}
