export interface KBConfig {
  name: string
  version: number
  embedFields: string[]
}

export interface KBEntry {
  id: string
  [key: string]: unknown
}

export interface RetrievedExample<T extends KBEntry = KBEntry> {
  entry: T
  score: number
}

export interface RetrieveOptions {
  topK?: number
  minScore?: number
}

export interface StructureBlock {
  type: string
  preset: string
  rationale: string
}

export interface StructureKBEntry extends KBEntry {
  request: string
  industry?: string
  keywords: string[]
  structure: {
    blocks: StructureBlock[]
  }
}
