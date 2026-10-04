"use client";
import { useBackground, usePreferences } from "./usePreferences";

/** Full-screen background picture behind the whole app (set in Preferences). */
export default function BackgroundLayer() {
  const { background } = useBackground();
  const { prefs } = usePreferences();
  if (!background) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
          filter: `blur(${prefs.blur}px)`,
          transform: "scale(1.1)", // hides the soft edges blur creates
        }}
      />
    </div>
  );
}
