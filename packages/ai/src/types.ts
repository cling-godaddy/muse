export type Role = "user" | "assistant" | "system";

export interface Message {
  role: Role
  content: string
}

export interface Usage {
  input: number
  output: number
  cost: number
  model: string
}

export interface ChatRequest {
  messages: Message[]
  model?: string
  stream?: boolean
  jsonMode?: boolean
}

export interface ChatResponse {
  content: string
  model: string
  usage?: {
    input: number
    output: number
  }
}

export type ProviderName = "openai" | "anthropic";

export interface Provider {
  name: ProviderName
  chat(request: ChatRequest): Promise<ChatResponse>
  chatStream(request: ChatRequest): AsyncGenerator<string>
}
