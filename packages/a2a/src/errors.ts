import type { JsonRpcError } from "./types.js";

// A2A-specific error codes (-32001 to -32099)
export const A2AErrorCode = {
  TaskNotFound: -32001,
  TaskNotCancelable: -32002,
  PushNotificationNotSupported: -32003,
  UnsupportedOperation: -32004,
  ContentTypeNotSupported: -32005,
  InvalidAgentResponse: -32006,
  ExtendedAgentCardNotConfigured: -32007,
  ExtensionSupportRequired: -32008,
  VersionNotSupported: -32009,
} as const;

// Standard JSON-RPC error codes
export const JsonRpcErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
} as const;

export type A2AErrorCodeType = (typeof A2AErrorCode)[keyof typeof A2AErrorCode];
export type JsonRpcErrorCodeType
  = (typeof JsonRpcErrorCode)[keyof typeof JsonRpcErrorCode];

export class A2AError extends Error {
  code: number;
  data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = "A2AError";
    this.code = code;
    this.data = data;
  }

  toJsonRpcError(): JsonRpcError {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

// Error factory functions
export function taskNotFound(taskId: string): A2AError {
  return new A2AError(
    A2AErrorCode.TaskNotFound,
    `Task not found: ${taskId}`,
    { taskId },
  );
}

export function taskNotCancelable(taskId: string, state: string): A2AError {
  return new A2AError(
    A2AErrorCode.TaskNotCancelable,
    `Task cannot be canceled in state: ${state}`,
    { taskId, state },
  );
}

export function unsupportedOperation(operation: string): A2AError {
  return new A2AError(
    A2AErrorCode.UnsupportedOperation,
    `Operation not supported: ${operation}`,
    { operation },
  );
}

export function contentTypeNotSupported(contentType: string): A2AError {
  return new A2AError(
    A2AErrorCode.ContentTypeNotSupported,
    `Content type not supported: ${contentType}`,
    { contentType },
  );
}

export function invalidParams(message: string): A2AError {
  return new A2AError(JsonRpcErrorCode.InvalidParams, message);
}

export function methodNotFound(method: string): A2AError {
  return new A2AError(
    JsonRpcErrorCode.MethodNotFound,
    `Method not found: ${method}`,
    { method },
  );
}

export function internalError(message: string): A2AError {
  return new A2AError(JsonRpcErrorCode.InternalError, message);
}
