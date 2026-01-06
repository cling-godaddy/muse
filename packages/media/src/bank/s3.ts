import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";

export interface S3Config {
  bucket: string
  region: string
  prefix?: string
}

export interface S3Operations {
  downloadJson<T>(key: string): Promise<T | null>
  uploadJson(key: string, data: unknown): Promise<void>
  downloadBuffer(key: string): Promise<Buffer | null>
  uploadBuffer(key: string, data: Buffer, contentType: string): Promise<void>
  exists(key: string): Promise<boolean>
  getPublicUrl(key: string): string
}

export function createS3Operations(config: S3Config): S3Operations {
  const { bucket, region, prefix = "" } = config;

  const client = new S3Client({ region, credentials: fromEnv() });

  function fullKey(key: string): string {
    return prefix ? `${prefix}${key}` : key;
  }

  return {
    async downloadJson<T>(key: string): Promise<T | null> {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: fullKey(key),
        });
        const response = await client.send(command);
        const body = await response.Body?.transformToString();
        if (!body) return null;
        return JSON.parse(body) as T;
      }
      catch (err) {
        if ((err as { name?: string }).name === "NoSuchKey") {
          return null;
        }
        throw err;
      }
    },

    async uploadJson(key: string, data: unknown): Promise<void> {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fullKey(key),
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json",
      });
      await client.send(command);
    },

    async downloadBuffer(key: string): Promise<Buffer | null> {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: fullKey(key),
        });
        const response = await client.send(command);
        const bytes = await response.Body?.transformToByteArray();
        if (!bytes) return null;
        return Buffer.from(bytes);
      }
      catch (err) {
        if ((err as { name?: string }).name === "NoSuchKey") {
          return null;
        }
        throw err;
      }
    },

    async uploadBuffer(key: string, data: Buffer, contentType: string): Promise<void> {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fullKey(key),
        Body: data,
        ContentType: contentType,
      });
      await client.send(command);
    },

    async exists(key: string): Promise<boolean> {
      try {
        const command = new HeadObjectCommand({
          Bucket: bucket,
          Key: fullKey(key),
        });
        await client.send(command);
        return true;
      }
      catch {
        return false;
      }
    },

    getPublicUrl(key: string): string {
      return `https://${bucket}.s3.${region}.amazonaws.com/${fullKey(key)}`;
    },
  };
}
