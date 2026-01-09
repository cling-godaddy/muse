// A2A Protocol types
export type {
  // Task
  Task,
  TaskState,
  TaskStatus,
  // Messages
  Message,
  Role,
  Part,
  TextPart,
  FilePart,
  FileContent,
  DataPart,
  // Artifacts
  Artifact,
  // Streaming
  StreamResponse,
  StatusUpdate,
  ArtifactUpdate,
  // JSON-RPC
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  // Request/Response params
  SendMessageParams,
  SendMessageConfiguration,
  GetTaskParams,
  ListTasksParams,
  ListTasksResponse,
  CancelTaskParams,
} from "./types.js";

// Agent Card
export type {
  AgentCard,
  AgentProvider,
  AgentInterface,
  AgentCapabilities,
  SecurityScheme,
  AgentSkill,
  JsonSchema,
} from "./agent-card.js";

export { createMuseAgentCard } from "./agent-card.js";

// Errors
export {
  A2AErrorCode,
  JsonRpcErrorCode,
  A2AError,
  taskNotFound,
  taskNotCancelable,
  unsupportedOperation,
  contentTypeNotSupported,
  invalidParams,
  methodNotFound,
  internalError,
} from "./errors.js";

export type { A2AErrorCodeType, JsonRpcErrorCodeType } from "./errors.js";
