// Isolated local proof, not a production backend or a Next.js route.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const root = new URL("../../../../", import.meta.url);
const routes = new Map([
  ["/", [new URL("index.html", import.meta.url), "text/html"]],
  ["/engine.js", [new URL("../synchronized-stems.ts", import.meta.url), "text/javascript"]],
  ...["drums", "bass", "lead-guitar", "rhythm-guitar-l", "rhythm-guitar-r", "vocals"].map((name) => [
    `/demo/stormhacks/audio/${name}.mp3`,
    [new URL(`public/demo/stormhacks/audio/${name}.mp3`, root), "audio/mpeg"],
  ]),
]);

createServer(async (request, response) => {
  const route = routes.get(new URL(request.url, "http://localhost").pathname);
  if (!route) { response.writeHead(404).end("Not found"); return; }
  try {
    let body = await readFile(route[0]);
    if (route[1] === "text/javascript") {
      body = ts.transpileModule(body.toString(), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 },
      }).outputText;
    }
    response.writeHead(200, { "Content-Type": route[1], "Cache-Control": "no-store" }).end(body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500).end("Missing/unreadable proof asset");
  }
}).listen(3001, "127.0.0.1", () => console.log("Audio proof: http://localhost:3001"));
