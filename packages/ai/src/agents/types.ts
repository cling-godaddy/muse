import type { Message, Provider } from "../types";

export type { ImagePlan, ImageSelection } from "@muse/media";

export interface BrandBrief {
  targetAudience: string
  brandVoice: string[]
  colorDirection: string
  imageryStyle: string
  constraints: string[]
}

export interface SectionStructure {
  id: string
  type: string
  purpose: string
  preset?: string
}

export interface PageStructure {
  sections: SectionStructure[]
}

export interface CopySectionContent {
  id: string
  headline?: string
  subheadline?: string
  itemTitles?: string[]
}

export interface AgentInput {
  prompt: string
  messages?: Message[]
  brief?: BrandBrief
  structure?: PageStructure
  copySections?: CopySectionContent[]
  context?: Record<string, unknown>
  retryFeedback?: string
}

export interface AgentConfig {
  name: string
  description: string
  model?: string
}

export interface Agent {
  config: AgentConfig
  run(input: AgentInput, provider: Provider): AsyncGenerator<string>
}

export interface SyncAgentResult {
  content: string
  usage?: { input: number, output: number }
}

export interface SyncAgent {
  config: AgentConfig
  run(input: AgentInput, provider: Provider): Promise<SyncAgentResult>
}
