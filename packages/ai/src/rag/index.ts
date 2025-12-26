export { embed, embedBatch } from "./embeddings";
export { loadKB, search, getEntry, getConfig, clearCache } from "./store";
export { retrieve, formatStructureContext, formatStructureExamples, getEmbedText } from "./retriever";
export type {
  KBConfig,
  KBEntry,
  RetrievedExample,
  RetrieveOptions,
  StructureKBEntry,
  StructureBlock,
} from "./types";
