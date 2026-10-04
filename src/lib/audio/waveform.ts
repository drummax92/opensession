/** Peak envelope of the rendered stem. Both stereo channels contribute, without cancellation. */
export function buildWaveform(buffer: AudioBuffer, bins = 2048): readonly number[] {
  const count = Math.max(1, Math.min(buffer.length, Math.floor(bins)));
  const peaks = new Array<number>(count).fill(0);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let bin = 0; bin < count; bin++) {
      const start = Math.floor(bin * buffer.length / count);
      const end = Math.floor((bin + 1) * buffer.length / count);
      let peak = peaks[bin];
      for (let i = start; i < end; i++) peak = Math.max(peak, Math.abs(samples[i]));
      peaks[bin] = peak;
    }
  }
  return peaks;
}
