/** Shared audio primitives; the canonical session schema remains unchanged. */
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
  offset = 0,
  duration = Math.max(...buffers.map(buffer => buffer.duration)) - offset,
  onEnded?: () => void,
  levels: readonly number[] = buffers.map(() => 1),
) {
  if (buffers.length === 0 || buffers.some((buffer) => buffer.length === 0)) {
    throw new Error("Load non-empty stems before starting playback.");
  }

  if (!Number.isFinite(offset) || offset < 0 || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("Invalid playback range.");
  }
  const playable = buffers.map((buffer, index) => ({ buffer, index }))
    .filter(({ buffer }) => buffer.duration > offset);
  if (!playable.length) throw new Error("Playback offset is past every stem.");

  const master = context.createGain();
  master.connect(context.destination);
  const voices: { source: AudioBufferSourceNode; gain: GainNode; index: number }[] = [];
  let stopped = false;
  let remaining = playable.length;

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
    for (const { buffer, index } of playable) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      voices.push({ source, gain, index });
      gain.gain.value = levels[index] ?? 1;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(master);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        if (--remaining === 0) { stop(); onEnded?.(); }
      };
    }
    // Build every voice BEFORE reading the clock. No awaits between starts.
    const startAt = context.currentTime + 0.05;
    for (const { source } of voices) source.start(startAt, offset, Math.min(duration, source.buffer!.duration - offset));
    return {
      startAt, stop,
      setTrackGain(index: number, value: number) {
        if (stopped) return;
        const voice = voices.find(voice => voice.index === index);
        // A short gain smoothing avoids clicks, without replacing any sources.
        voice?.gain.gain.setTargetAtTime(value, context.currentTime, 0.005);
      },
    };
  } catch (error) {
    stop();
    throw error;
  }
}

/** Transport owns sources, but the caller owns and closes the single AudioContext. */
export class StemTransport {
  readonly duration: number;
  private offset = 0;
  private startedAt = 0;
  private playback?: ReturnType<typeof startSynchronizedStems>;
  private pending = false;
  private revision = 0;
  private disposed = false;
  private readonly context: AudioContext;
  private readonly buffers: readonly AudioBuffer[];

  private readonly trackIds: readonly string[];
  private readonly muted = new Set<string>();
  private readonly soloed = new Set<string>();

  constructor(context: AudioContext, buffers: readonly AudioBuffer[], trackIds = buffers.map((_, index) => String(index))) {
    if (!buffers.length || buffers.some(buffer => !Number.isFinite(buffer.duration) || buffer.duration <= 0)) {
      throw new Error("Load non-empty stems before creating the transport.");
    }
    if (trackIds.length !== buffers.length || new Set(trackIds).size !== trackIds.length) {
      throw new Error("Track IDs must be unique and match the buffer count.");
    }
    this.trackIds = [...trackIds];
    this.context = context;
    this.buffers = [...buffers];
    this.duration = Math.max(...buffers.map(buffer => buffer.duration));
  }

  get mutedTrackIds(): ReadonlySet<string> { return new Set(this.muted); }
  get soloTrackIds(): ReadonlySet<string> { return new Set(this.soloed); }

  private level(trackId: string): number {
    return !this.muted.has(trackId) && (this.soloed.size === 0 || this.soloed.has(trackId)) ? 1 : 0;
  }

  private toggle(trackId: string, set: Set<string>): void {
    if (this.disposed) throw new Error("Transport has been disposed.");
    if (!this.trackIds.includes(trackId)) throw new Error(`Unknown track: ${trackId}`);
    if (set.has(trackId)) set.delete(trackId); else set.add(trackId);
    this.trackIds.forEach((id, index) => this.playback?.setTrackGain(index, this.level(id)));
  }

  toggleMute(trackId: string): void { this.toggle(trackId, this.muted); }
  toggleSolo(trackId: string): void { this.toggle(trackId, this.soloed); }

  get isPlaying() { return !!this.playback; }
  get currentTime() {
    const elapsed = this.playback ? Math.max(0, this.context.currentTime - this.startedAt) : 0;
    return Math.min(this.duration, this.offset + elapsed);
  }

  async play(): Promise<void> {
    if (this.disposed) throw new Error("Transport has been disposed.");
    if (this.playback || this.pending) return;
    this.pending = true;
    const revision = ++this.revision;
    try {
      await this.context.resume();
      if (revision !== this.revision || this.disposed) return;
      if (this.context.state !== "running") throw new Error("Audio context is not running. Click Play again.");
      if (this.offset >= this.duration) this.offset = 0;
      this.playback = startSynchronizedStems(
        this.context, this.buffers, this.offset, this.duration - this.offset,
        () => {
          if (revision !== this.revision) return;
          this.playback = undefined;
          this.offset = this.duration;
        },
        this.trackIds.map(id => this.level(id)),
      );
      this.startedAt = this.playback.startAt;
    } finally {
      if (revision === this.revision) this.pending = false;
    }
  }

  pause(): void {
    this.offset = this.currentTime;
    ++this.revision; // Invalidates a pending resume() or stale ended callback.
    this.pending = false;
    this.playback?.stop();
    this.playback = undefined;
  }

  async seek(seconds: number): Promise<void> {
    if (this.disposed) throw new Error("Transport has been disposed.");
    if (!Number.isFinite(seconds)) throw new Error("Seek time must be finite.");
    const resume = this.isPlaying || this.pending;
    this.pause();
    this.offset = Math.max(0, Math.min(this.duration, seconds));
    if (resume && this.offset < this.duration) await this.play();
  }

  stop(): void { this.pause(); this.offset = 0; }
  dispose(): void { this.stop(); this.disposed = true; }
}
