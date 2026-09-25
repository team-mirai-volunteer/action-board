import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { FacilitationEngine } from "../core/facilitator";
import { SessionStore } from "../core/session";
import { createModelFromEnv } from "../llm";
import { createApp } from "./app";

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../..");
const webRoot = path.join(packageRoot, "web");
const meetSdkPath = path.join(
  packageRoot,
  "node_modules/@googleworkspace/meet-addons/meet.addons.mjs",
);

const store = new SessionStore();
const engine = new FacilitationEngine(createModelFromEnv(), store);

const recall =
  process.env.RECALL_API_KEY && process.env.PUBLIC_URL
    ? {
        apiKey: process.env.RECALL_API_KEY,
        region: process.env.RECALL_REGION,
        publicUrl: process.env.PUBLIC_URL,
      }
    : undefined;

const app = createApp({
  store,
  engine,
  recall,
  cloudProjectNumber: process.env.MEET_CLOUD_PROJECT_NUMBER,
});

// Meet Add-ons SDK をバンドラなしで使えるよう、そのまま配信する
app.get("/vendor/meet.addons.mjs", async (c) => {
  const source = await readFile(meetSdkPath, "utf8");
  return c.body(source, 200, {
    "Content-Type": "text/javascript; charset=utf-8",
  });
});

app.use(
  "/*",
  serveStatic({ root: path.relative(process.cwd(), webRoot) || "." }),
);
app.get("/", (c) => c.redirect("/sidepanel.html"));

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.info(`[meet-facilitator] listening on http://localhost:${info.port}`);
  console.info(`[meet-facilitator] model: ${engine.modelName}`);
  console.info(
    `[meet-facilitator] recall.ai bot: ${recall ? "configured" : "not configured (manual / replay only)"}`,
  );
});
