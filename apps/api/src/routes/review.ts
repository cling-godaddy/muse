import { Hono } from "hono";
import { createImageAnalyzer } from "@muse/ai";
import { embed } from "@muse/ai/rag";
import { createLogger } from "@muse/logger";
import {
  createImageBankStore,
  type ImageBankStore,
  type BankListOptions,
  type Review,
  type AccuracyRating,
  type ReviewStatus,
} from "@muse/media/bank";

const logger = createLogger();
let store: ImageBankStore | null = null;
let storePromise: Promise<ImageBankStore | null> | null = null;

async function getStore(forceReload = false): Promise<ImageBankStore | null> {
  if (!forceReload && store) return store;
  if (!forceReload && storePromise) return storePromise;

  // Clear cache on force reload
  if (forceReload) {
    store = null;
    storePromise = null;
  }

  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!bucket || !region || !openaiKey) {
    logger.debug("review_store_disabled", { reason: "Missing env vars" });
    return null;
  }

  const analyze = createImageAnalyzer(openaiKey);

  storePromise = (async () => {
    const s = createImageBankStore({
      bucket,
      region,
      embed,
      analyze,
      logger: logger.child({ agent: "review" }),
    });
    await s.load();
    store = s;
    return s;
  })().catch((err) => {
    logger.error("review_store_init_failed", { error: err instanceof Error ? err.message : String(err) });
    return null;
  });

  return storePromise;
}

export const reviewRoute = new Hono();

// GET /entries - list entries with filters
reviewRoute.get("/entries", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const opts: BankListOptions = {
    status: (c.req.query("status") as ReviewStatus | "all") || "all",
    accuracy: (c.req.query("accuracy") as AccuracyRating | "unrated" | "all") || "all",
    sort: (c.req.query("sort") as BankListOptions["sort"]) || "oldest",
    limit: parseInt(c.req.query("limit") || "50", 10),
    offset: parseInt(c.req.query("offset") || "0", 10),
  };

  const { entries, total } = s.listEntries(opts);

  // Map entries to include image URLs
  const items = entries.map(entry => ({
    id: entry.id,
    previewUrl: s.getImageUrl(entry, "preview"),
    displayUrl: s.getImageUrl(entry, "display"),
    caption: entry.metadata.caption,
    subjects: entry.metadata.subjects,
    style: entry.metadata.style,
    status: entry.review?.status ?? "pending",
    accuracy: entry.review?.accuracy ?? null,
    searchTests: entry.review?.searchTests ?? [],
    createdAt: entry.createdAt,
  }));

  return c.json({ entries: items, total });
});

// GET /entries/:id - single entry
reviewRoute.get("/entries/:id", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const id = decodeURIComponent(c.req.param("id"));
  const entry = s.getEntry(id);

  if (!entry) {
    return c.json({ error: "Entry not found" }, 404);
  }

  return c.json({
    id: entry.id,
    previewUrl: s.getImageUrl(entry, "preview"),
    displayUrl: s.getImageUrl(entry, "display"),
    caption: entry.metadata.caption,
    subjects: entry.metadata.subjects,
    style: entry.metadata.style,
    colors: entry.metadata.colors,
    mood: entry.metadata.mood,
    context: entry.metadata.context,
    composition: entry.metadata.composition,
    lighting: entry.metadata.lighting,
    review: entry.review ?? {
      accuracy: null,
      accuracyAt: null,
      searchTests: [],
      status: "pending",
      notes: null,
    },
    blacklisted: entry.blacklisted ?? false,
    createdAt: entry.createdAt,
  });
});

// POST /entries/:id/search - execute search test
reviewRoute.post("/entries/:id/search", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const id = decodeURIComponent(c.req.param("id"));
  const entry = s.getEntry(id);
  if (!entry) {
    return c.json({ error: "Entry not found" }, 404);
  }

  const { query } = await c.req.json<{ query: string }>();
  if (!query) {
    return c.json({ error: "Query required" }, 400);
  }

  // Execute search
  const { entries: results } = await s.search(query, { limit: 10 });

  // Find rank of this entry in results
  const rank = results.findIndex(e => e.id === id);
  const found = rank >= 0;

  // Log the test
  const test = {
    query,
    found,
    rank: found ? rank + 1 : null, // 1-indexed
    testedAt: new Date().toISOString(),
  };

  // Update entry review with new test
  const review: Review = entry.review ?? {
    accuracy: null,
    accuracyAt: null,
    searchTests: [],
    status: "pending",
    notes: null,
  };
  review.searchTests.push(test);
  s.updateReview(id, review);

  // Sync in background
  s.sync().catch(err => logger.error("sync_failed", { error: String(err) }));

  return c.json({
    test,
    results: results.slice(0, 5).map(e => ({
      id: e.id,
      previewUrl: s.getImageUrl(e, "preview"),
      caption: e.metadata.caption,
    })),
  });
});

// POST /entries/:id/accuracy - submit accuracy rating
reviewRoute.post("/entries/:id/accuracy", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const id = decodeURIComponent(c.req.param("id"));
  const entry = s.getEntry(id);
  if (!entry) {
    return c.json({ error: "Entry not found" }, 404);
  }

  const { accuracy, notes, status } = await c.req.json<{
    accuracy: AccuracyRating
    notes?: string
    status?: ReviewStatus
  }>();

  if (!accuracy || !["accurate", "partial", "wrong"].includes(accuracy)) {
    return c.json({ error: "Valid accuracy rating required" }, 400);
  }

  // Update review
  const review: Review = entry.review ?? {
    accuracy: null,
    accuracyAt: null,
    searchTests: [],
    status: "pending",
    notes: null,
  };

  review.accuracy = accuracy;
  review.accuracyAt = new Date().toISOString();
  review.notes = notes ?? review.notes;
  review.status = status ?? (accuracy === "wrong" ? "flagged" : "approved");

  s.updateReview(id, review);

  // Sync in background
  s.sync().catch(err => logger.error("sync_failed", { error: String(err) }));

  return c.json({ success: true, review });
});

// POST /entries/:id/blacklist - toggle blacklist status
reviewRoute.post("/entries/:id/blacklist", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const id = decodeURIComponent(c.req.param("id"));
  const entry = s.getEntry(id);
  if (!entry) {
    return c.json({ error: "Entry not found" }, 404);
  }

  const { blacklisted } = await c.req.json<{ blacklisted: boolean }>();

  s.setBlacklisted(id, blacklisted);

  // Sync in background
  s.sync().catch(err => logger.error("sync_failed", { error: String(err) }));

  return c.json({ success: true, blacklisted });
});

// GET /stats - dashboard stats
reviewRoute.get("/stats", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const stats = s.getStats();
  return c.json(stats);
});

// POST /refresh - reload store from S3
reviewRoute.post("/refresh", async (c) => {
  const s = await getStore(true);
  if (!s) return c.json({ error: "Store not available" }, 503);

  const stats = s.getStats();
  return c.json({ success: true, total: stats.total });
});

// GET /next - get next entry to review
reviewRoute.get("/next", async (c) => {
  const s = await getStore();
  if (!s) return c.json({ error: "Store not available" }, 503);

  const afterId = c.req.query("after");

  // Get pending entries
  const { entries } = s.listEntries({ status: "pending", accuracy: "unrated", limit: 100 });

  if (entries.length === 0) {
    return c.json({ entry: null, remaining: 0 });
  }

  // Find next after current
  let nextEntry = entries[0];
  if (afterId) {
    const idx = entries.findIndex(e => e.id === afterId);
    if (idx >= 0 && idx < entries.length - 1) {
      nextEntry = entries[idx + 1];
    }
  }

  if (!nextEntry) {
    return c.json({ entry: null, remaining: 0 });
  }

  return c.json({
    entry: {
      id: nextEntry.id,
      previewUrl: s.getImageUrl(nextEntry, "preview"),
      displayUrl: s.getImageUrl(nextEntry, "display"),
      caption: nextEntry.metadata.caption,
      subjects: nextEntry.metadata.subjects,
      style: nextEntry.metadata.style,
      colors: nextEntry.metadata.colors,
      mood: nextEntry.metadata.mood,
      context: nextEntry.metadata.context,
      blacklisted: nextEntry.blacklisted ?? false,
      review: nextEntry.review,
    },
    remaining: entries.length - 1,
  });
});
