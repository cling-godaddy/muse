import faiss from "faiss-node";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { KBConfig, KBEntry } from "./types";

const { IndexFlatIP } = faiss;
type IndexFlatIPType = InstanceType<typeof IndexFlatIP>;

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LoadedKB<T extends KBEntry = KBEntry> {
  config: KBConfig
  entries: Map<string, T>
  ids: string[]
  index: IndexFlatIPType
}

const cache = new Map<string, LoadedKB>();

function getKBPath(name: string): string {
  return join(__dirname, "..", "kb", name);
}

function getIndexPath(name: string): string {
  return join(__dirname, "..", "..", "dist", "kb", name);
}

export function loadKB<T extends KBEntry = KBEntry>(name: string): LoadedKB<T> {
  const cached = cache.get(name);
  if (cached) return cached as LoadedKB<T>;

  const kbPath = getKBPath(name);
  const indexPath = getIndexPath(name);

  const configFile = join(kbPath, "config.json");
  const entriesFile = join(kbPath, "entries.json");
  const faissFile = join(indexPath, "index.faiss");
  const idsFile = join(indexPath, "ids.json");

  if (!existsSync(configFile)) {
    throw new Error(`KB "${name}" not found. Expected config at ${configFile}`);
  }

  if (!existsSync(faissFile)) {
    throw new Error(
      `Index for KB "${name}" not found. Run: pnpm kb build ${name}`,
    );
  }

  const config: KBConfig = JSON.parse(readFileSync(configFile, "utf-8"));
  const entriesArray: T[] = JSON.parse(readFileSync(entriesFile, "utf-8"));
  const ids: string[] = JSON.parse(readFileSync(idsFile, "utf-8"));
  const index = IndexFlatIP.read(faissFile);

  const entries = new Map(entriesArray.map(e => [e.id, e]));

  const loaded: LoadedKB<T> = { config, entries, ids, index };
  cache.set(name, loaded as LoadedKB);

  return loaded;
}

export interface SearchResult {
  id: string
  score: number
}

export function search(name: string, vec: Float32Array, k: number): SearchResult[] {
  const { index, ids } = loadKB(name);
  const result = index.search(Array.from(vec), k);

  return result.labels
    .map((label: number, i: number) => ({
      id: ids[label],
      score: result.distances[i],
    }))
    .filter((r): r is SearchResult => r.id !== undefined);
}

export function getEntry<T extends KBEntry = KBEntry>(
  name: string,
  id: string,
): T | undefined {
  const { entries } = loadKB<T>(name);
  return entries.get(id);
}

export function getConfig(name: string): KBConfig {
  const { config } = loadKB(name);
  return config;
}

export function clearCache(): void {
  cache.clear();
}
