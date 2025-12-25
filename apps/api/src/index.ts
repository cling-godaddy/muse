import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../.env") });
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { chatRoute } from "./routes/chat";
import { generateRoute } from "./routes/generate";

const app = new Hono();

app.use("/*", cors());
app.route("/api/chat", chatRoute);
app.route("/api/generate", generateRoute);

app.get("/health", c => c.json({ ok: true }));

const port = Number(process.env.PORT) || 3001;

console.log(`api server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
