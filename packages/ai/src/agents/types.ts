import type { Message, Provider } from "../types";

export type { ImagePlan, ImageSelection } from "@muse/media";

export interface BrandBrief {
  targetAudience: string
  brandVoice: string[]
  colorDirection: string
  imageryStyle: string
  constraints: string[]
}

export interface BlockStructure {
  id: string
  type: string
  purpose: string
  preset?: string
}

export interface PageStructure {
  blocks: BlockStructure[]
}

export interface AgentInput {
  prompt: string
  messages?: Message[]
  brief?: BrandBrief
  structure?: PageStructure
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

export interface SyncAgent {
  config: AgentConfig
  run(input: AgentInput, provider: Provider): Promise<string>
}
