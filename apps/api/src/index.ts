import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../.env") });
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { chatRoute } from "./routes/chat";
import { generateRoute } from "./routes/generate";
import { uploadRoute } from "./routes/upload";
import { searchRoute } from "./routes/search";
import { reviewRoute } from "./routes/review";

const app = new Hono();

app.use("/*", cors());
app.route("/api/chat", chatRoute);
app.route("/api/generate", generateRoute);
app.route("/api/upload", uploadRoute);
app.route("/api/search", searchRoute);
app.route("/api/review", reviewRoute);

app.get("/health", c => c.json({ ok: true }));

const port = Number(process.env.PORT) || 3001;

console.log(`api server running on http://localhost:${port}`);

const server = serve({ fetch: app.fetch, port });

function shutdown() {
  console.log("\nshutting down...");
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
