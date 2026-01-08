export type Role = "user" | "assistant" | "system";

export interface Message {
  role: Role
  content: string
}

export type UsageAction = "generate_site" | "generate_section" | "generate_item" | "refine" | "normalize_query" | "rewrite_text";

export interface Usage {
  input: number
  output: number
  cost: number
  model: string
  action?: UsageAction
  detail?: string
  timestamp: string
}

export interface ResponseSchema {
  name: string
  description?: string
  schema: Record<string, unknown>
  strict?: boolean
}

export interface ChatRequest {
  messages: Message[]
  model?: string
  stream?: boolean
  jsonMode?: boolean
  /** OpenAI: json_schema response format. Anthropic: tool use. Takes precedence over jsonMode. */
  responseSchema?: ResponseSchema
  /** Available tools for the model to call */
  tools?: ToolDefinition[]
  /** Results from previous tool calls (for multi-turn) */
  toolResults?: ToolResult[]
}

export interface ChatResponse {
  content: string
  model: string
  usage?: {
    input: number
    output: number
  }
  toolCalls?: ToolCall[]
}

// Tool definitions for agentic tool use
export interface ToolDefinition {
  name: string
  description: string
  schema: Record<string, unknown>
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResult {
  id: string
  result: unknown
}

export type ProviderName = "openai" | "anthropic";

export interface Provider {
  name: ProviderName
  chat(request: ChatRequest): Promise<ChatResponse>
  chatStream(request: ChatRequest): AsyncGenerator<string>
}
