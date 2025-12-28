#!/usr/bin/env tsx
import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import faiss from "faiss-node";
import OpenAI from "openai";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  createKBAuditor,
  generateReport,
  formatRecommendationsJson,
  distinctivenessTest,
  qualityTest,
  marginalValueTest,
  similarityTest,
  searchabilityTest,
  executePrune,
  parseApprovedRecommendations,
  autoApprove,
  type AuditorLoaders,
  type KBEntry,
  type PruneCallbacks,
  type SearchResult,
} from "../src/audit";
import { createSearchQueryGenerator } from "../src/vision";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../../.env") });

const { IndexFlatIP } = faiss;

// S3 keys
const BANK_DATA_KEY = "bank/entries.json";
const BANK_INDEX_KEY = "bank/index.faiss";
const EMBEDDING_DIM = 1536;

interface BankData {
  version: number
  entries: BankEntry[]
}

interface BankEntry extends KBEntry {
  provider: string
  providerId: string
  title: string
  width: number
  height: number
  previewKey: string
  displayKey: string
  attribution?: { name?: string }
  metadata: {
    caption: string
    subjects: string[]
    colors: { dominant: string[], mood: string }
    style: string[]
    mood: string[]
    context: string[]
  }
  vectors: {
    caption: number
    queries: number[]
    expansions: number[]
  }
}

// State for loaded data
let bankData: BankData | null = null;
let bankIndex: InstanceType<typeof IndexFlatIP> | null = null;
const entriesMap: Map<string, BankEntry> = new Map();

// S3 client
function createS3Client() {
  const region = process.env.AWS_REGION || process.env.S3_REGION;
  if (!region) throw new Error("AWS_REGION or S3_REGION not set");
  return new S3Client({ region });
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET not set");
  return bucket;
}

async function downloadJson<T>(key: string): Promise<T | null> {
  const client = createS3Client();
  const bucket = getBucket();

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await client.send(command);
    const body = await response.Body?.transformToString();
    if (!body) return null;
    return JSON.parse(body) as T;
  }
  catch (err) {
    if ((err as { name?: string }).name === "NoSuchKey") return null;
    throw err;
  }
}

async function downloadBuffer(key: string): Promise<Buffer | null> {
  const client = createS3Client();
  const bucket = getBucket();

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await client.send(command);
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) return null;
    return Buffer.from(bytes);
  }
  catch (err) {
    if ((err as { name?: string }).name === "NoSuchKey") return null;
    throw err;
  }
}

async function uploadJson(key: string, data: unknown): Promise<void> {
  const client = createS3Client();
  const bucket = getBucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: "application/json",
  });
  await client.send(command);
}

async function uploadBuffer(key: string, data: Buffer): Promise<void> {
  const client = createS3Client();
  const bucket = getBucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: "application/octet-stream",
  });
  await client.send(command);
}

// OpenAI client for embeddings
function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey });
}

function normalize(vec: Float32Array): void {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
}

async function embed(text: string): Promise<Float32Array> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  const vec = new Float32Array(response.data[0].embedding);
  normalize(vec);
  return vec;
}

// Cache for embeddings to avoid re-computing
const embeddingCache = new Map<string, Float32Array>();

// Image URL helper
function getImageUrl(entry: BankEntry): string {
  const bucket = getBucket();
  const region = process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
  // displayKey is the full S3 key for the display-size image
  return `https://${bucket}.s3.${region}.amazonaws.com/${entry.displayKey}`;
}

// Search function for searchability test
async function searchKB(query: string): Promise<SearchResult> {
  if (!bankIndex || entriesMap.size === 0) {
    throw new Error("Index or entries not loaded");
  }

  const queryVec = await embed(query);
  const k = Math.min(10, bankIndex.ntotal());
  const result = bankIndex.search(Array.from(queryVec), k);

  // Map indices back to entry IDs
  // In caption-only mode, each entry has exactly one vector
  const entryList = Array.from(entriesMap.values());
  const entries: { id: string }[] = [];

  for (const idx of result.labels) {
    if (idx >= 0 && idx < entryList.length) {
      const entry = entryList[idx];
      if (entry) {
        entries.push({ id: entry.id });
      }
    }
  }

  return { entries };
}

// Loaders for the auditor
function createBankLoaders(): AuditorLoaders<BankEntry> {
  return {
    async loadEntries(): Promise<Map<string, BankEntry>> {
      if (entriesMap.size > 0) return entriesMap;

      console.log("Downloading entries from S3...");
      bankData = await downloadJson<BankData>(BANK_DATA_KEY);

      if (!bankData) {
        throw new Error("No bank data found in S3");
      }

      for (const entry of bankData.entries) {
        entriesMap.set(entry.id, entry);
      }

      console.log(`Loaded ${entriesMap.size} entries`);
      return entriesMap;
    },

    async loadIndex(): Promise<InstanceType<typeof IndexFlatIP>> {
      if (bankIndex) return bankIndex;

      console.log("Downloading FAISS index from S3...");
      const buffer = await downloadBuffer(BANK_INDEX_KEY);

      if (!buffer) {
        throw new Error("No index found in S3");
      }

      bankIndex = faiss.Index.fromBuffer(buffer) as InstanceType<typeof IndexFlatIP>;
      console.log(`Loaded index with ${bankIndex.ntotal()} vectors`);
      return bankIndex;
    },

    getVectors(entry: BankEntry): { vectors: Float32Array[], types: ("caption" | "query" | "expansion")[] } {
      // Return cached caption embedding if available
      const cached = embeddingCache.get(entry.id);
      if (cached) {
        // We only have caption vector from cache
        // For full vector analysis, we'd need to store/rebuild all vectors
        return {
          vectors: [cached],
          types: ["caption"],
        };
      }

      return { vectors: [], types: [] };
    },

    async getEmbedding(text: string): Promise<Float32Array> {
      return embed(text);
    },
  };
}

// Prune callbacks
function createPruneCallbacks(): PruneCallbacks {
  return {
    async removeEntry(entryId: string): Promise<void> {
      entriesMap.delete(entryId);
    },

    async removeVectors(entryId: string, vectorIndices: number[]): Promise<void> {
      const entry = entriesMap.get(entryId);
      if (!entry) return;

      // Remove specified indices from queries and expansions
      entry.vectors.queries = entry.vectors.queries.filter((_, i) => !vectorIndices.includes(i + 1)); // +1 because 0 is caption
      entry.vectors.expansions = entry.vectors.expansions.filter((_, i) => {
        const expansionStartIdx = 1 + entry.vectors.queries.length;
        return !vectorIndices.includes(expansionStartIdx + i);
      });
    },

    async rebuildIndex(): Promise<void> {
      console.log("Rebuilding index...");

      // We need to rebuild the index from scratch
      // This requires re-embedding all entries
      const newIndex = new IndexFlatIP(EMBEDDING_DIM);
      const newEntries: BankEntry[] = [];

      let vectorIdx = 0;
      for (const entry of entriesMap.values()) {
        // Re-embed caption
        const captionVec = await embed(entry.metadata.caption);
        newIndex.add(Array.from(captionVec));
        const captionIdx = vectorIdx++;

        // We don't have original query texts, so skip re-embedding
        // In production, you'd store query texts or vectors

        entry.vectors = {
          caption: captionIdx,
          queries: [],
          expansions: [],
        };

        newEntries.push(entry);
      }

      bankIndex = newIndex;
      bankData = { version: 2, entries: newEntries };

      // Upload to S3
      await uploadJson(BANK_DATA_KEY, bankData);
      await uploadBuffer(BANK_INDEX_KEY, newIndex.toBuffer());

      console.log(`Rebuilt index with ${newIndex.ntotal()} vectors`);
    },

    async getStats(): Promise<{ entryCount: number, vectorCount: number }> {
      return {
        entryCount: entriesMap.size,
        vectorCount: bankIndex?.ntotal() || 0,
      };
    },
  };
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remainingSecs = (secs % 60).toFixed(0);
  return `${mins}m ${remainingSecs}s`;
}

async function preEmbedCaptions(): Promise<number> {
  console.log("Pre-embedding captions for clustering analysis...");
  const start = Date.now();
  const total = entriesMap.size;
  let current = 0;

  for (const entry of entriesMap.values()) {
    current++;
    if (current % 50 === 0 || current === total) {
      const elapsed = formatDuration(Date.now() - start);
      process.stdout.write(`\rEmbedding: ${current}/${total} (${elapsed})`.padEnd(60));
    }

    if (!embeddingCache.has(entry.id) && entry.metadata?.caption) {
      const vec = await embed(entry.metadata.caption);
      embeddingCache.set(entry.id, vec);
    }
  }

  const duration = Date.now() - start;
  console.log(`\nEmbedding complete in ${formatDuration(duration)}`);
  return duration;
}

interface AuditOptions {
  outputPath?: string
  format?: "json" | "md"
  searchability?: boolean
}

async function audit(options: AuditOptions = {}): Promise<void> {
  const { outputPath, format = "md", searchability = false } = options;
  const totalStart = Date.now();
  console.log("Starting image bank audit...\n");

  const loaders = createBankLoaders();

  // Load entries first
  const loadStart = Date.now();
  await loaders.loadEntries();
  await loaders.loadIndex();
  const loadDuration = Date.now() - loadStart;
  console.log(`Load complete in ${formatDuration(loadDuration)}\n`);

  // Pre-embed captions for clustering
  const embedDuration = await preEmbedCaptions();

  // Setup entry tests
  const entryTests = [distinctivenessTest, qualityTest];
  if (searchability) {
    console.log("Searchability test enabled (uses vision API)\n");
    entryTests.push(searchabilityTest);
  }

  // Create search query generator if searchability enabled
  const generateSearchQueries = searchability
    ? createSearchQueryGenerator(process.env.OPENAI_API_KEY || "")
    : undefined;

  // Extend loaders with searchability context if enabled
  const extendedLoaders = searchability
    ? {
      ...loaders,
      getImageUrl,
      generateSearchQueries,
      search: searchKB,
    }
    : loaders;

  const auditor = createKBAuditor<BankEntry>({
    kbName: "image-bank",
    loaders: extendedLoaders,
    entryTests,
    vectorTests: [marginalValueTest, similarityTest],
    onProgress: (current, total, entryId) => {
      process.stdout.write(`\rAuditing: ${current}/${total} - ${entryId}`.padEnd(80));
    },
  });

  const auditStart = Date.now();
  const report = await auditor.audit();
  const auditDuration = Date.now() - auditStart;
  const totalDuration = Date.now() - totalStart;

  console.log("\n\nAudit Summary:");
  console.log(`  Total entries: ${report.stats.totalEntries}`);
  console.log(`  Keep: ${report.stats.passedEntries}`);
  console.log(`  Review: ${report.stats.reviewEntries}`);
  console.log(`  Prune: ${report.stats.pruneEntries}`);
  console.log(`  Redundant vectors: ${report.stats.redundantVectors}`);
  console.log(`  Clusters found: ${report.clusters.length}`);
  console.log(`  Total recommendations: ${report.recommendations.length}`);

  console.log("\nTiming:");
  console.log(`  Load:      ${formatDuration(loadDuration)}`);
  console.log(`  Embed:     ${formatDuration(embedDuration)}`);
  console.log(`  Audit:     ${formatDuration(auditDuration)}`);
  console.log(`  Total:     ${formatDuration(totalDuration)}`);

  if (outputPath) {
    await generateReport(report, outputPath, format);
    console.log(`\nReport saved to: ${outputPath}`);

    // Also save recommendations JSON for approval workflow
    const recsPath = outputPath.replace(/\.(md|json)$/, ".recommendations.json");
    writeFileSync(recsPath, formatRecommendationsJson(report.recommendations));
    console.log(`Recommendations saved to: ${recsPath}`);
  }
}

async function prune(options: { dryRun?: boolean, approved?: string, autoApproveThreshold?: number }): Promise<void> {
  const { dryRun = false, approved, autoApproveThreshold } = options;

  let recommendations;

  if (approved && existsSync(approved)) {
    console.log(`Loading approved recommendations from: ${approved}`);
    const json = readFileSync(approved, "utf-8");
    recommendations = parseApprovedRecommendations(json);
  }
  else {
    console.log("Running audit to generate recommendations...");
    const loaders = createBankLoaders();

    const auditor = createKBAuditor<BankEntry>({
      kbName: "image-bank",
      loaders,
      entryTests: [distinctivenessTest, qualityTest],
      vectorTests: [marginalValueTest, similarityTest],
    });

    const report = await auditor.audit();
    recommendations = report.recommendations;

    if (autoApproveThreshold) {
      console.log(`Auto-approving recommendations with confidence >= ${autoApproveThreshold * 100}%`);
      recommendations = autoApprove(recommendations, {
        minConfidence: autoApproveThreshold,
        vectorsOnly: true,
      });
    }
  }

  const approvedCount = recommendations.filter(r => r.approved === true).length;
  console.log(`\nRecommendations: ${recommendations.length} total, ${approvedCount} approved`);

  if (approvedCount === 0) {
    console.log("No approved recommendations to execute.");
    return;
  }

  if (dryRun) {
    console.log("\nDry run - would execute:");
    for (const rec of recommendations.filter(r => r.approved)) {
      console.log(`  ${rec.type}: ${rec.targetId} (${rec.reason})`);
    }
    return;
  }

  const callbacks = createPruneCallbacks();
  const result = await executePrune(recommendations, callbacks);

  console.log("\nPrune complete:");
  console.log(`  Entries removed: ${result.entriesRemoved.length}`);
  console.log(`  Vectors removed: ${result.vectorsRemoved.length}`);
  console.log(`  New entry count: ${result.newEntryCount}`);
  console.log(`  New vector count: ${result.newVectorCount}`);
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "audit": {
      const outputIdx = args.indexOf("-o");
      const output = outputIdx >= 0 ? args[outputIdx + 1] : undefined;
      const format = output?.endsWith(".json") ? "json" : "md";
      const searchability = args.includes("--searchability");
      await audit({ outputPath: output, format, searchability });
      break;
    }

    case "prune": {
      const dryRun = args.includes("--dry-run");
      const approvedIdx = args.findIndex(a => a.startsWith("--approved="));
      const approved = approvedIdx >= 0 ? args[approvedIdx].split("=")[1] : undefined;
      const autoIdx = args.findIndex(a => a.startsWith("--auto="));
      const autoApproveThreshold = autoIdx >= 0 ? parseFloat(args[autoIdx].split("=")[1]) : undefined;

      await prune({ dryRun, approved, autoApproveThreshold });
      break;
    }

    default:
      console.log("KB Audit CLI - Knowledge Base Quality Management\n");
      console.log("Commands:");
      console.log("  audit [options]          Run audit on image bank");
      console.log("  prune [options]          Execute pruning");
      console.log("");
      console.log("Audit options:");
      console.log("  -o output.md             Write report to file");
      console.log("  --searchability          Enable searchability test (uses vision API)");
      console.log("");
      console.log("Prune options:");
      console.log("  --dry-run                Show what would be pruned");
      console.log("  --approved=file.json     Use approved recommendations file");
      console.log("  --auto=0.95              Auto-approve high confidence (vectors only)");
      console.log("");
      console.log("Examples:");
      console.log("  pnpm kb:audit -o report.md");
      console.log("  pnpm kb:audit --searchability -o report.md");
      console.log("  pnpm kb:prune --dry-run");
      console.log("  pnpm kb:prune --approved=report.recommendations.json");
      console.log("  pnpm kb:prune --auto=0.95 --dry-run");
      break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
