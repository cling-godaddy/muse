import { Hono } from "hono";
import { createS3Operations } from "@muse/media/s3";
import sharp from "sharp";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 2048;

function getS3() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET not configured");
  return createS3Operations({
    bucket,
    region: process.env.AWS_REGION || "us-west-2",
  });
}

export const uploadRoute = new Hono();

uploadRoute.post("/image", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: "Invalid file type. Allowed: jpg, png, webp, gif" }, 400);
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: "File too large. Max 10MB" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Process with sharp: resize if needed, convert to webp, optimize
  const processed = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  // Upload to S3
  // TODO: replace hardcoded user with actual user ID when auth is implemented
  const userId = "czling";
  const id = randomUUID();
  const key = `users/${userId}/images/${id}.webp`;

  const s3 = getS3();
  await s3.uploadBuffer(key, processed, "image/webp");

  const url = s3.getPublicUrl(key);

  return c.json({
    url,
    alt: file.name.replace(/\.[^.]+$/, ""), // filename without extension
    provider: "upload",
    providerId: id,
  });
});
