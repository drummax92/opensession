/** Milestone 1 primitives. No session schema or React state is defined here. */
export async function loadStaticStems(
  context: AudioContext,
  urls: readonly string[],
): Promise<AudioBuffer[]> {
  return Promise.all(urls.map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Stem ${url}: HTTP ${response.status}`);
    try {
      return await context.decodeAudioData(await response.arrayBuffer());
    } catch {
      throw new Error(`Could not decode stem: ${url}`);
    }
  }));
}

/** Caller resumes its ONE AudioContext from a user gesture before calling this. */
export function startSynchronizedStems(
  context: BaseAudioContext,
  buffers: readonly AudioBuffer[],
) {
  if (buffers.length === 0 || buffers.some((buffer) => buffer.length === 0)) {
    throw new Error("Load non-empty stems before starting playback.");
  }

  const master = context.createGain();
  master.connect(context.destination);
  const voices: { source: AudioBufferSourceNode; gain: GainNode }[] = [];
  let stopped = false;
  let remaining = buffers.length;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    for (const { source, gain } of voices) {
      source.onended = null;
      // stop() can throw if setup failed before this source was started.
      try { source.stop(); } catch { /* Already silent/unstarted. */ }
      source.disconnect();
      gain.disconnect();
    }
    master.disconnect();
  };

  try {
    for (const buffer of buffers) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      voices.push({ source, gain });
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(master);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (--remaining === 0) stop();
      };
    }
    // Build every voice BEFORE reading the clock. No awaits between starts.
    const startAt = context.currentTime + 0.05;
    for (const { source } of voices) source.start(startAt, 0);
    return { startAt, stop };
  } catch (error) {
    stop();
    throw error;
  }
}
