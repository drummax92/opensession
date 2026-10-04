import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../synchronized-stems.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2020 },
}).outputText;
const { startSynchronizedStems, loadStaticStems } = await import(
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
    get currentTime() { return 10 + clockReads++ / 100; },
    createGain: node,
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
const buffers = [{ length: 48000 }, { length: 48000 }];

test("common clock/offset, gain routing, cleanup, and fresh sources on replay", () => {
  const context = fakeContext();
  const first = startSynchronizedStems(context, buffers);
  assert.equal(first.startAt, 10.05);
  for (const source of context.sources) {
    assert.deepEqual(source.started, [10.05, 0]);
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
