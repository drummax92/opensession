/** Shared audio primitives; the canonical session schema remains unchanged. */
export async function loadStaticStems(
  context: AudioContext,
  urls: readonly string[],
  signal?: AbortSignal,
): Promise<AudioBuffer[]> {
  return Promise.all(urls.map(async (url) => {
    const response = await fetch(url, { signal });
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
  const retiring = new Set<AudioBufferSourceNode>();
  let stopped = false;
  let remaining = playable.length;
  const active = new Set(playable.map(({ index }) => index));

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
    for (const source of retiring) {
      source.onended = null;
      try { source.stop(); } catch { /* Already ended. */ }
      source.disconnect();
    }
    retiring.clear();
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
        active.delete(index);
        if (--remaining === 0) { stop(); onEnded?.(); }
      };
    }
    // Build every voice BEFORE reading the clock. No awaits between starts.
    const startAt = context.currentTime + 0.05;
    for (const { source } of voices) source.start(startAt, offset, Math.min(duration, source.buffer!.duration - offset));
    return {
      startAt, stop,
      replaceBuffer(index: number, buffer: AudioBuffer) {
        if (stopped) return;
        const voice = voices.find(voice => voice.index === index);
        if (!voice || !active.has(index)) return;
        const switchAt = Math.max(startAt, context.currentTime + 0.01);
        const projectOffset = offset + (switchAt - startAt);
        const length = Math.min(offset + duration, buffer.duration) - projectOffset;
        if (length <= 0) return; // At the end, only remember the selection for replay.
        const replacement = context.createBufferSource();
        replacement.buffer = buffer;
        replacement.connect(voice.gain);
        try { replacement.start(switchAt, projectOffset, length); }
        catch (error) { replacement.disconnect(); throw error; }
        const previous = voice.source;
        replacement.onended = () => {
          replacement.disconnect(); voice.gain.disconnect();
          active.delete(index);
          if (--remaining === 0) { stop(); onEnded?.(); }
        };
        previous.onended = () => { previous.disconnect(); retiring.delete(previous); };
        retiring.add(previous);
        previous.stop(switchAt);
        voice.source = replacement;
      },
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
  private readonly auditions = new Map<string, Map<string, AudioBuffer>>();
  private readonly bypassed = new Map<string, string>();

  constructor(context: AudioContext, buffers: readonly AudioBuffer[], trackIds = buffers.map((_, index) => String(index)), projectDuration = Math.max(...buffers.map(buffer => buffer.duration))) {
    if (!buffers.length || buffers.some(buffer => !Number.isFinite(buffer.duration) || buffer.duration <= 0)) {
      throw new Error("Load non-empty stems before creating the transport.");
    }
    if (trackIds.length !== buffers.length || new Set(trackIds).size !== trackIds.length) {
      throw new Error("Track IDs must be unique and match the buffer count.");
    }
    if (!Number.isFinite(projectDuration) || projectDuration <= 0) throw new Error("Invalid project duration.");
    this.trackIds = [...trackIds];
    this.context = context;
    this.buffers = [...buffers];
    this.duration = projectDuration;
  }

  get mutedTrackIds(): ReadonlySet<string> { return new Set(this.muted); }
  get soloTrackIds(): ReadonlySet<string> { return new Set(this.soloed); }

  get bypassedPluginByTrack(): ReadonlyMap<string, string> { return new Map(this.bypassed); }

  registerAudition(trackId: string, pluginId: string, buffer: AudioBuffer): void {
    if (this.disposed) throw new Error("Transport has been disposed.");
    const index = this.trackIds.indexOf(trackId);
    if (index < 0) throw new Error(`Unknown track: ${trackId}`);
    if (!buffer.length || !Number.isFinite(buffer.duration) || Math.abs(buffer.duration - this.buffers[index].duration) > 0.05) {
      throw new Error(`Audition duration mismatch: ${trackId} / ${pluginId}`);
    }
    let plugins = this.auditions.get(trackId);
    if (!plugins) { plugins = new Map(); this.auditions.set(trackId, plugins); }
    plugins.set(pluginId, buffer);
  }

  togglePluginBypass(trackId: string, pluginId: string): void {
    if (this.disposed) throw new Error("Transport has been disposed.");
    const alternate = this.auditions.get(trackId)?.get(pluginId);
    if (!alternate) throw new Error(`Audition unavailable: ${trackId} / ${pluginId}`);
    const restore = this.bypassed.get(trackId) === pluginId;
    const index = this.trackIds.indexOf(trackId);
    this.playback?.replaceBuffer(index, restore ? this.buffers[index] : alternate);
    if (restore) this.bypassed.delete(trackId); else this.bypassed.set(trackId, pluginId);
  }

  private selectedBuffers(): AudioBuffer[] {
    return this.trackIds.map((id, index) => {
      const plugin = this.bypassed.get(id);
      return (plugin ? this.auditions.get(id)?.get(plugin) : undefined) ?? this.buffers[index];
    });
  }

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
        this.context, this.selectedBuffers(), this.offset, this.duration - this.offset,
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

  togglePlay(): void | Promise<void> {
    if (this.playback || this.pending) this.pause(); else return this.play();
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
