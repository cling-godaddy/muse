import { Hono } from "hono";
import { createMediaClient } from "@muse/media";
import { requireAuth } from "../middleware/auth";

export const searchRoute = new Hono();

searchRoute.use("/*", requireAuth);

searchRoute.get("/images", async (c) => {
  const query = c.req.query("q");
  const provider = c.req.query("provider") as "unsplash" | "pexels" | undefined;

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const client = createMediaClient({
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY,
    pexelsKey: process.env.PEXELS_API_KEY,
  });

  const results = await client.search({
    query,
    provider: provider || "unsplash",
    count: 12,
  });

  return c.json(results);
});
