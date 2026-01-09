// A2A Protocol Types (v1.0)
// https://a2a-protocol.org/latest/specification/

// Task states (kebab-case per spec)
export type TaskState
  = | "submitted"
    | "working"
    | "completed"
    | "failed"
    | "cancelled"
    | "input-required"
    | "rejected"
    | "auth-required";

export interface TaskError {
  code?: string
  message: string
  stack?: string
  cause?: unknown
}

export interface TaskStatus {
  state: TaskState
  message?: Message
  timestamp: string
  error?: TaskError
}

export interface Task {
  id: string
  contextId: string
  version: number
  status: TaskStatus
  artifacts?: Artifact[]
  history?: Message[]
  metadata?: Record<string, unknown>
}

// Messages
export type Role = "user" | "agent";

export interface Message {
  messageId: string
  contextId?: string
  taskId?: string
  role: Role
  parts: Part[]
  metadata?: Record<string, unknown>
  extensions?: string[]
  referenceTaskIds?: string[]
}

// Parts (v1.0: member name acts as discriminator, no "type"/"kind" field)
export type Part = TextPart | FilePart | DataPart;

export interface TextPart {
  text: string
  metadata?: Record<string, unknown>
}

export interface FilePart {
  file: FileContent
  metadata?: Record<string, unknown>
}

export interface FileContent {
  fileWithUri?: string
  fileWithBytes?: string // base64 encoded
  mediaType?: string
  name?: string
}

export interface DataPart {
  data: unknown // arbitrary JSON payload
  metadata?: Record<string, unknown>
}

// Artifacts
export interface Artifact {
  artifactId: string
  name?: string
  description?: string
  parts: Part[]
  metadata?: Record<string, unknown>
  extensions?: string[]
}

// Streaming responses
export type StreamResponse
  = | { task: Task }
    | { message: Message }
    | { statusUpdate: StatusUpdate }
    | { artifactUpdate: ArtifactUpdate };

export interface StatusUpdate {
  taskId: string
  contextId: string
  status: TaskStatus
  final: boolean
  metadata?: Record<string, unknown>
}

export interface ArtifactUpdate {
  taskId: string
  contextId: string
  artifact: Artifact
  append?: boolean
  lastChunk?: boolean
  metadata?: Record<string, unknown>
}

// JSON-RPC 2.0
export interface JsonRpcRequest {
  jsonrpc: "2.0"
  id: string | number
  method: string
  params?: unknown
}

export interface JsonRpcResponse {
  jsonrpc: "2.0"
  id: string | number
  result?: unknown
  error?: JsonRpcError
}

export interface JsonRpcError {
  code: number
  message: string
  data?: unknown
}

// Send message params
export interface SendMessageParams {
  message: Message
  configuration?: SendMessageConfiguration
  metadata?: Record<string, unknown>
}

export interface SendMessageConfiguration {
  acceptedOutputModes?: string[]
  historyLength?: number
  blocking?: boolean
}

// Get/List task params
export interface GetTaskParams {
  id: string
  historyLength?: number
}

export interface ListTasksParams {
  contextId?: string
  status?: TaskState[]
  pageSize?: number
  pageToken?: string
  historyLength?: number
  lastUpdatedAfter?: string
  includeArtifacts?: boolean
}

export interface ListTasksResponse {
  tasks: Task[]
  nextPageToken?: string
}

// Cancel task params
export interface CancelTaskParams {
  id: string
}
