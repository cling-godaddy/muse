import { v4 as uuid } from "uuid";
import type {
  Artifact,
  Message,
  Task,
  TaskState,
  StreamResponse,
  StatusUpdate,
  ArtifactUpdate,
  TaskStatus,
  TaskError,
} from "./types.js";

/**
 * Callback for streaming A2A events.
 * Each event is a spec-compliant StreamResponse.
 */
export type StreamCallback = (event: StreamResponse) => void;

/**
 * Options for creating an A2A emitter.
 */
export interface A2AEmitterOptions {
  taskId: string
  contextId: string
  onEvent: StreamCallback
}

/**
 * Ergonomic API for emitting A2A protocol events.
 * All methods emit spec-compliant StreamResponse objects underneath.
 */
export interface A2AEmitter {
  /** Get the task ID */
  readonly taskId: string
  /** Get the context ID */
  readonly contextId: string

  /**
   * Emit a status update event.
   * Maps to: StreamResponse { statusUpdate: { taskId, contextId, status, final: false, metadata } }
   */
  statusUpdate(step: string, metadata?: Record<string, unknown>): void

  /**
   * Emit an artifact update event.
   * Maps to: StreamResponse { artifactUpdate: { taskId, contextId, artifact, append?, lastChunk?, metadata? } }
   */
  artifactUpdate(
    artifact: Omit<Artifact, "artifactId"> & { artifactId?: string },
    options?: { append?: boolean, lastChunk?: boolean, metadata?: Record<string, unknown> }
  ): void

  /**
   * Emit an input-required status.
   * Sets task state to "input-required" and optionally includes a message describing what input is needed.
   */
  inputRequired(prompt: string, options?: { metadata?: Record<string, unknown> }): void

  /**
   * Emit a message from the agent.
   * Maps to: StreamResponse { message: Message }
   */
  message(parts: Message["parts"], metadata?: Record<string, unknown>): void

  /**
   * Mark the task as completed.
   * Emits final statusUpdate with state: "completed" and final: true
   */
  complete(message?: string): void

  /**
   * Mark the task as failed.
   * Emits final statusUpdate with state: "failed", error details, and final: true
   */
  fail(error: Error | string): void

  /**
   * Emit the final task object.
   * Call this after complete() or fail() to send the final task state.
   */
  emitTask(task: Task): void
}

/**
 * Create an A2A emitter for streaming events.
 *
 * @example
 * ```typescript
 * const emitter = createA2AEmitter({
 *   taskId: "task-123",
 *   contextId: "ctx-456",
 *   onEvent: (event) => stream.write(`data: ${JSON.stringify(event)}\n\n`)
 * });
 *
 * emitter.statusUpdate("brief", { description: "Extracting brand context" });
 * emitter.artifactUpdate({ name: "theme", parts: [{ data: themeData }] });
 * emitter.complete("Site generation finished");
 * ```
 */
export function createA2AEmitter(options: A2AEmitterOptions): A2AEmitter {
  const { taskId, contextId, onEvent } = options;

  function emitStatusUpdate(
    state: TaskState,
    opts: {
      message?: string
      error?: TaskError
      final: boolean
      metadata?: Record<string, unknown>
    },
  ): void {
    const status: TaskStatus = {
      state,
      timestamp: new Date().toISOString(),
      message: opts.message,
      error: opts.error,
    };

    const statusUpdate: StatusUpdate = {
      taskId,
      contextId,
      status,
      final: opts.final,
      metadata: opts.metadata,
    };

    onEvent({ statusUpdate });
  }

  function emitArtifactUpdate(
    artifact: Artifact,
    opts?: { append?: boolean, lastChunk?: boolean, metadata?: Record<string, unknown> },
  ): void {
    const artifactUpdate: ArtifactUpdate = {
      taskId,
      contextId,
      artifact,
      append: opts?.append,
      lastChunk: opts?.lastChunk,
      metadata: opts?.metadata,
    };

    onEvent({ artifactUpdate });
  }

  return {
    taskId,
    contextId,

    statusUpdate(step: string, metadata?: Record<string, unknown>): void {
      emitStatusUpdate("working", {
        message: step,
        final: false,
        metadata: { step, ...metadata },
      });
    },

    artifactUpdate(
      artifact: Omit<Artifact, "artifactId"> & { artifactId?: string },
      opts?: { append?: boolean, lastChunk?: boolean, metadata?: Record<string, unknown> },
    ): void {
      const fullArtifact: Artifact = {
        artifactId: artifact.artifactId ?? uuid(),
        ...artifact,
      };
      emitArtifactUpdate(fullArtifact, opts);
    },

    inputRequired(prompt: string, opts?: { metadata?: Record<string, unknown> }): void {
      emitStatusUpdate("input-required", {
        message: prompt,
        final: false,
        metadata: opts?.metadata,
      });
    },

    message(parts: Message["parts"], metadata?: Record<string, unknown>): void {
      const message: Message = {
        messageId: uuid(),
        role: "agent",
        parts,
        metadata,
      };
      onEvent({ message });
    },

    complete(message?: string): void {
      emitStatusUpdate("completed", {
        message: message ?? "Task completed",
        final: true,
      });
    },

    fail(error: Error | string): void {
      const errorMessage = typeof error === "string" ? error : error.message;
      const taskError: TaskError = {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      };

      emitStatusUpdate("failed", {
        message: errorMessage,
        error: taskError,
        final: true,
      });
    },

    emitTask(task: Task): void {
      onEvent({ task });
    },
  };
}
