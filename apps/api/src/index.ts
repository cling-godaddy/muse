import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../.env") });
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth";
import { chatRoute } from "./routes/chat";
import { generateRoute } from "./routes/generate";
import { searchRoute } from "./routes/search";
import { sitesRoute } from "./routes/sites";
import { messagesRoute } from "./routes/messages";
import { a2aRoute, agentCardRoute } from "./routes/a2a";

const app = new Hono();

app.use("/*", cors());
app.use("/api/*", clerkMiddleware());

app.get("/health", c => c.json({ ok: true }));

app.route("/api/chat", chatRoute);
app.route("/api/generate", generateRoute);
app.route("/api/search", searchRoute);
app.route("/api/sites", sitesRoute);
app.route("/api/messages", messagesRoute);

// A2A Protocol endpoints (no auth - uses protocol-level auth)
app.route("/.well-known", agentCardRoute);
app.route("/a2a", a2aRoute);

const port = Number(process.env.PORT) || 3001;

console.log(`api server running on http://localhost:${port}`);

const server = serve({ fetch: app.fetch, port });

function shutdown() {
  console.log("\nshutting down...");
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
