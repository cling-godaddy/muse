import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import faiss from "faiss-node";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../../.env") });

const { IndexFlatIP } = faiss;

const KB_DIR = join(__dirname, "..", "src", "kb");
const DIST_DIR = join(__dirname, "..", "dist", "kb");

interface KBConfig {
  name: string
  version: number
  embedFields: string[]
}

interface KBEntry {
  id: string
  [key: string]: unknown
}

function normalize(vec: Float32Array): void {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
}

function getEmbedText(entry: KBEntry, fields: string[]): string {
  const parts: string[] = [];
  for (const field of fields) {
    const value = entry[field];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      parts.push(value.join(" "));
    }
    else if (typeof value === "string") {
      parts.push(value);
    }
  }
  return parts.join(" ");
}

async function scaffold(name: string): Promise<void> {
  const kbPath = join(KB_DIR, name);

  if (existsSync(kbPath)) {
    console.error(`KB "${name}" already exists at ${kbPath}`);
    process.exit(1);
  }

  mkdirSync(kbPath, { recursive: true });

  const config: KBConfig = {
    name,
    version: 1,
    embedFields: ["request", "keywords"],
  };

  const entries: KBEntry[] = [
    {
      id: "example-1",
      request: "Example request description",
      keywords: ["example", "template"],
    },
  ];

  writeFileSync(join(kbPath, "config.json"), JSON.stringify(config, null, 2));
  writeFileSync(join(kbPath, "entries.json"), JSON.stringify(entries, null, 2));

  console.log(`Created KB "${name}" at ${kbPath}`);
  console.log("  - config.json (edit embedFields as needed)");
  console.log("  - entries.json (add your entries)");
  console.log(`\nNext: pnpm kb build ${name}`);
}

async function build(name: string): Promise<void> {
  const kbPath = join(KB_DIR, name);
  const distPath = join(DIST_DIR, name);

  if (!existsSync(kbPath)) {
    console.error(`KB "${name}" not found at ${kbPath}`);
    console.error(`Run: pnpm kb scaffold ${name}`);
    process.exit(1);
  }

  const config: KBConfig = JSON.parse(
    readFileSync(join(kbPath, "config.json"), "utf-8"),
  );
  const entries: KBEntry[] = JSON.parse(
    readFileSync(join(kbPath, "entries.json"), "utf-8"),
  );

  if (entries.length === 0) {
    console.error(`KB "${name}" has no entries`);
    process.exit(1);
  }

  console.log(`Building index for "${name}" (${entries.length} entries)...`);

  const texts = entries.map(e => getEmbedText(e, config.embedFields));

  const openai = new OpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  const dimension = response.data[0].embedding.length;
  const index = new IndexFlatIP(dimension);

  for (const item of response.data) {
    const vec = new Float32Array(item.embedding);
    normalize(vec);
    index.add(Array.from(vec));
  }

  mkdirSync(distPath, { recursive: true });
  index.write(join(distPath, "index.faiss"));
  writeFileSync(
    join(distPath, "ids.json"),
    JSON.stringify(entries.map(e => e.id)),
  );

  console.log(`Index written to ${distPath}`);
  console.log(`  - index.faiss (${index.ntotal()} vectors, ${dimension}d)`);
  console.log("  - ids.json");
}

async function buildAll(): Promise<void> {
  if (!existsSync(KB_DIR)) {
    console.log("No KBs found");
    return;
  }

  const kbs = readdirSync(KB_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  if (kbs.length === 0) {
    console.log("No KBs found");
    return;
  }

  for (const name of kbs) {
    await build(name);
  }
}

function list(): void {
  if (!existsSync(KB_DIR)) {
    console.log("No KBs found");
    return;
  }

  const kbs = readdirSync(KB_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  if (kbs.length === 0) {
    console.log("No KBs found");
    return;
  }

  console.log("Knowledge Bases:\n");

  for (const name of kbs) {
    const kbPath = join(KB_DIR, name);
    const distPath = join(DIST_DIR, name);

    const entries: KBEntry[] = JSON.parse(
      readFileSync(join(kbPath, "entries.json"), "utf-8"),
    );

    const hasIndex = existsSync(join(distPath, "index.faiss"));
    const status = hasIndex ? "✓ indexed" : "⚠ needs build";

    console.log(`  ${name}: ${entries.length} entries (${status})`);
  }
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "scaffold":
      if (!args[0]) {
        console.error("Usage: pnpm kb scaffold <name>");
        process.exit(1);
      }
      await scaffold(args[0]);
      break;

    case "build":
      if (args[0] === "--all") {
        await buildAll();
      }
      else if (args[0]) {
        await build(args[0]);
      }
      else {
        console.error("Usage: pnpm kb build <name> | --all");
        process.exit(1);
      }
      break;

    case "list":
      list();
      break;

    default:
      console.log("KB CLI - Knowledge Base Management\n");
      console.log("Commands:");
      console.log("  scaffold <name>  Create a new KB with templates");
      console.log("  build <name>     Build FAISS index for a KB");
      console.log("  build --all      Build all KB indexes");
      console.log("  list             List all KBs with status");
      break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
