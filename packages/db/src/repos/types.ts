import type { Site, Section } from "@muse/core";

export interface SiteSummary {
  id: string
  name: string
  updatedAt: string
  pageCount: number
}

export interface SiteUpdatableFields {
  name?: string
  description?: string | null
  location?: string | null
  thumbnailUrl?: string | null
}

export interface SitesTable {
  save(site: Site, userId: string): Promise<void>
  getById(id: string): Promise<Site | null>
  getByIdForUser(id: string, userId: string): Promise<Site | null>
  listByUser(userId: string): Promise<SiteSummary[]>
  delete(id: string, userId: string): Promise<void>
  updateSection(sectionId: string, section: Section): Promise<void>
  updateFields(siteId: string, fields: SiteUpdatableFields): Promise<void>
  appendCost(siteId: string, cost: StoredUsage): Promise<void>
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

export type UsageAction = "generate_site" | "generate_section" | "generate_item" | "refine" | "rewrite_text";

export interface StoredUsage {
  input: number
  output: number
  cost: number
  model: string
  action?: UsageAction
  detail?: string
  timestamp: string
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
