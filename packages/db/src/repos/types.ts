import type { Site } from "@muse/core";

export interface SiteSummary {
  id: string
  name: string
  updatedAt: string
  pageCount: number
}

export interface SitesTable {
  save(site: Site, userId: string): Promise<void>
  getById(id: string): Promise<Site | null>
  getByIdForUser(id: string, userId: string): Promise<Site | null>
  listByUser(userId: string): Promise<SiteSummary[]>
  delete(id: string, userId: string): Promise<void>
}

export type AgentName = "brief" | "structure" | "theme" | "image" | "copy" | "sitemap" | "pages";
export type AgentStatus = "pending" | "running" | "complete";

export interface StoredAgentState {
  name: AgentName
  status: AgentStatus
  summary?: string
  duration?: number
  data?: {
    sectionCount?: number
    sectionTypes?: string[]
    palette?: string
    typography?: string
    planned?: number
    resolved?: number
  }
}

export interface StoredUsage {
  input: number
  output: number
  cost: number
  model: string
}

export interface StoredMessage {
  id: string
  siteId: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  usage?: StoredUsage
  agents?: StoredAgentState[]
}

export interface MessagesTable {
  save(message: StoredMessage): Promise<void>
  saveBatch(messages: StoredMessage[]): Promise<void>
  getBySiteId(siteId: string): Promise<StoredMessage[]>
  deleteBySiteId(siteId: string): Promise<void>
}
