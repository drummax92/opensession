import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../synchronized-stems.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { startSynchronizedStems, loadStaticStems, StemTransport } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);

function fakeContext(failSecondStart = false) {
  const nodes = [], sources = [];
  let clockReads = 0;
  const node = () => {
    const result = {
      disconnected: false,
      connect(destination) { this.destination = destination; },
      disconnect() { this.disconnected = true; },
    };
    nodes.push(result);
    return result;
  };
  return {
    nodes, sources, destination: {},
    state: "running",
    resume: async () => {},
    get currentTime() { return 10 + clockReads++ / 100; },
    createGain: () => Object.assign(node(), { gain: { value: 1, setTargetAtTime(value) { this.value = value; } } }),
    createBufferSource() {
      const result = Object.assign(node(), {
        start(...args) {
          if (failSecondStart && sources.indexOf(this) === 1) throw new Error("start failed");
          this.started = args;
        },
        stop() { this.stopped = true; },
      });
      sources.push(result);
      return result;
    },
  };
}
const buffers = [{ length: 48000, duration: 1 }, { length: 48000, duration: 1 }];

test("common clock/offset, gain routing, cleanup, and fresh sources on replay", () => {
  const context = fakeContext();
  const first = startSynchronizedStems(context, buffers);
  assert.equal(first.startAt, 10.05);
  for (const source of context.sources) {
    assert.deepEqual(source.started, [10.05, 0, 1]);
    assert.equal(source.destination.destination.destination, context.destination);
  }
  assert.notEqual(context.sources[0].destination, context.sources[1].destination);
  first.stop(); first.stop();
  assert.ok(context.nodes.every(node => node.disconnected));
  startSynchronizedStems(context, buffers).stop();
  assert.equal(context.sources.length, 4);
});

test("natural completion releases graph; partial start failure stops every voice", () => {
  const context = fakeContext();
  startSynchronizedStems(context, buffers);
  context.sources[0].onended();
  context.sources[1].onended();
  assert.ok(context.nodes.every(node => node.disconnected));
  const broken = fakeContext(true);
  assert.throws(() => startSynchronizedStems(broken, buffers), /start failed/);
  assert.ok(broken.sources.every(node => node.stopped));
  assert.ok(broken.nodes.every(node => node.disconnected));
});

test("missing asset reports its URL and HTTP status", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(loadStaticStems({}, ["/audio/drums.mp3"]), /drums.mp3: HTTP 404/);
  } finally { globalThis.fetch = originalFetch; }
});

function transportFixture() {
  const context = fakeContext();
  let clock = 0;
  Object.defineProperty(context, "currentTime", { get: () => clock });
  const transport = new StemTransport(context, [{ length: 480000, duration: 10 }, { length: 480000, duration: 10 }]);
  return { context, transport, at: value => { clock = value; } };
}

test("pause freezes time; resume and playing seek schedule fresh synchronized sources", async () => {
  const { context, transport, at } = transportFixture();
  await transport.play();
  assert.equal(transport.currentTime, 0); // During the 50ms scheduling lead.
  at(2.05);
  transport.pause();
  assert.ok(Math.abs(transport.currentTime - 2) < 1e-9);
  at(5);
  assert.ok(Math.abs(transport.currentTime - 2) < 1e-9);
  await transport.play();
  assert.deepEqual(context.sources[2].started, context.sources[3].started);
  assert.ok(Math.abs(context.sources[2].started[1] - 2) < 1e-9);
  await transport.seek(7);
  assert.equal(transport.currentTime, 7);
  assert.deepEqual(context.sources[4].started, [5.05, 7, 3]);
  assert.deepEqual(context.sources[5].started, [5.05, 7, 3]);
  assert.ok(context.sources.slice(0, 4).every(source => source.stopped));
});

test("paused seek stays silent, boundaries clamp, natural end can replay", async () => {
  const { context, transport, at } = transportFixture();
  await transport.seek(-5);
  assert.equal(transport.currentTime, 0);
  await transport.seek(999);
  assert.equal(transport.currentTime, 10);
  assert.equal(context.sources.length, 0);
  await assert.rejects(transport.seek(NaN), /finite/);
  await transport.play();
  assert.equal(context.sources[0].started[1], 0);
  at(20);
  assert.equal(transport.currentTime, 10);
  context.sources[0].onended(); context.sources[1].onended();
  assert.equal(transport.isPlaying, false);
  assert.equal(transport.currentTime, 10);
  await transport.play();
  assert.equal(context.sources[2].started[1], 0);
  await transport.seek(10);
  assert.equal(transport.isPlaying, false);
  transport.stop();
  assert.equal(transport.currentTime, 0);
});

test("rapid Play is idempotent; Pause cancels pending resume; disposal blocks restart", async () => {
  const { context, transport } = transportFixture();
  let resolveResume;
  context.resume = () => new Promise(resolve => { resolveResume = resolve; });
  const first = transport.play();
  await transport.play();
  transport.pause();
  resolveResume(); await first;
  assert.equal(context.sources.length, 0);
  context.resume = async () => {};
  await transport.play(); await transport.play();
  assert.equal(context.sources.length, 2);
  transport.dispose();
  assert.ok(context.nodes.every(node => node.disconnected));
  await assert.rejects(transport.play(), /disposed/);
});


test("mute/solo truth table, multiple solos, and no source restarts", async () => {
  const context = fakeContext();
  const transport = new StemTransport(context, buffers, ['drums', 'lead']);
  await transport.play();
  const levels = () => context.sources.map(source => source.destination.gain.value);
  transport.toggleMute('drums');
  assert.deepEqual(levels(), [0, 1]);
  transport.toggleSolo('drums');
  assert.deepEqual(levels(), [0, 0]); // Mute wins over Solo.
  transport.toggleMute('drums');
  assert.deepEqual(levels(), [1, 0]);
  transport.toggleSolo('lead');
  assert.deepEqual(levels(), [1, 1]);
  transport.toggleSolo('drums');
  assert.deepEqual(levels(), [0, 1]);
  transport.toggleSolo('lead');
  assert.deepEqual(levels(), [1, 1]);
  assert.equal(context.sources.length, 2);
  assert.ok(context.sources.every(source => !source.stopped));
  assert.throws(() => transport.toggleMute('missing'), /Unknown track/);
  transport.mutedTrackIds.add('lead'); // External snapshot cannot mutate engine state.
  assert.equal(transport.mutedTrackIds.size, 0);
});

test("mute and solo survive pause, seek, stop and replay", async () => {
  const { context, transport } = transportFixture();
  transport.toggleSolo('1');
  await transport.play();
  assert.deepEqual(context.sources.map(source => source.destination.gain.value), [0, 1]);
  transport.pause();
  transport.toggleMute('1');
  await transport.seek(4);
  await transport.play();
  assert.deepEqual(context.sources.slice(-2).map(source => source.destination.gain.value), [0, 0]);
  transport.toggleMute('1');
  await transport.seek(6);
  assert.deepEqual(context.sources.slice(-2).map(source => source.destination.gain.value), [0, 1]);
  transport.stop(); await transport.play();
  assert.deepEqual(context.sources.slice(-2).map(source => source.destination.gain.value), [0, 1]);
  assert.deepEqual([...transport.soloTrackIds], ['1']);
});

test('A/B changes only selected source at the shared clock position and preserves gain', async () => {
  const { context, transport, at } = transportFixture();
  const alternate = { length: 480000, duration: 10 };
  transport.registerAudition('1', 'verb', alternate);
  transport.toggleMute('1');
  await transport.play();
  at(3.05);
  const before = transport.currentTime;
  transport.togglePluginBypass('1', 'verb');
  assert.equal(context.sources.length, 3);
  assert.ok(!context.sources[0].stopped);
  assert.ok(context.sources[1].stopped);
  const replacement = context.sources[2];
  assert.equal(replacement.buffer, alternate);
  assert.ok(Math.abs(replacement.started[0] - 3.06) < 1e-9);
  assert.ok(Math.abs(replacement.started[1] - 3.01) < 1e-9);
  assert.equal(replacement.destination.gain.value, 0);
  assert.equal(transport.currentTime, before);
  transport.stop();
  assert.ok(context.sources.every(source => source.stopped));
  assert.ok(context.nodes.every(node => node.disconnected));
});

test('one bypass per track; selection survives seek/resume and rapid switches clean up', async () => {
  const { context, transport } = transportFixture();
  const verb = { length: 480000, duration: 10 }, amp = { length: 480000, duration: 10 };
  transport.registerAudition('1', 'verb', verb);
  transport.registerAudition('1', 'amp', amp);
  transport.togglePluginBypass('1', 'verb');
  transport.togglePluginBypass('1', 'amp');
  assert.equal(transport.bypassedPluginByTrack.get('1'), 'amp');
  await transport.play();
  assert.equal(context.sources[1].buffer, amp);
  transport.togglePluginBypass('1', 'verb');
  transport.togglePluginBypass('1', 'amp');
  transport.pause();
  assert.ok(context.nodes.every(node => node.disconnected));
  await transport.seek(5); await transport.play();
  assert.equal(context.sources.at(-1).buffer, amp);
  transport.togglePluginBypass('1', 'amp');
  assert.equal(transport.bypassedPluginByTrack.size, 0);
  assert.notEqual(context.sources.at(-1).buffer, amp);
  transport.dispose();
  assert.ok(context.nodes.every(node => node.disconnected));
  assert.throws(() => transport.togglePluginBypass('1', 'amp'), /disposed/);
});

test('invalid audition does not alter playback; replacement ends naturally once', async () => {
  const { context, transport, at } = transportFixture();
  assert.throws(() => transport.registerAudition('1', 'bad', {length: 1, duration: 2}), /mismatch/);
  assert.throws(() => transport.togglePluginBypass('1', 'missing'), /unavailable/);
  transport.registerAudition('1', 'verb', {length: 480000, duration: 10});
  await transport.play(); at(2);
  transport.togglePluginBypass('1', 'verb');
  context.sources[1].onended(); // Retired source must not finish the transport.
  assert.equal(transport.isPlaying, true);
  context.sources[0].onended();
  context.sources[2].onended();
  assert.equal(transport.isPlaying, false);
  assert.equal(transport.currentTime, 10);
  await transport.play();
  assert.equal(transport.isPlaying, true);
  transport.dispose();
});
