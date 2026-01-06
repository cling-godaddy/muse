import { Hono } from "hono";
import { createMediaClient, getIamJwt } from "@muse/media";
import { requireAuth } from "../middleware/auth";

export const searchRoute = new Hono();

searchRoute.use("/*", requireAuth);

searchRoute.get("/images", async (c) => {
  const query = c.req.query("q");

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  const client = createMediaClient({
    gettyJwt: getIamJwt,
  });

  const results = await client.search({
    query,
    provider: "getty",
    count: 12,
  });

  return c.json(results);
});
