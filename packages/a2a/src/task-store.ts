import { v4 as uuid } from "uuid";
import type { Artifact, Message, Task, TaskState, TaskStatus } from "./types.js";

export interface CreateTaskOptions {
  contextId?: string
  initialMessage?: Message
}

export interface TaskStore {
  create(options?: CreateTaskOptions): Task
  get(taskId: string): Task | undefined
  update(taskId: string, patch: Partial<TaskStatus>): Task | undefined
  updateMetadata(taskId: string, metadata: Record<string, unknown>): Task | undefined
  addArtifact(taskId: string, artifact: Artifact): Task | undefined
  addMessage(taskId: string, message: Message): Task | undefined
  list(options?: ListOptions): Task[]
  delete(taskId: string): boolean
}

export interface ListOptions {
  contextId?: string
  status?: TaskState[]
  limit?: number
}

interface StoredTask {
  task: Task
  createdAt: number
  updatedAt: number
}

export interface TaskStoreOptions {
  /** TTL in milliseconds. Default: 1 hour */
  ttl?: number
  /** Cleanup interval in milliseconds. Default: 5 minutes */
  cleanupInterval?: number
  /** Freeze returned tasks in dev mode to catch accidental mutations */
  freezeInDev?: boolean
}

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const DEFAULT_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Deep copy a task to prevent callers from mutating stored data.
 */
function copyTask(task: Task): Task {
  return structuredClone(task);
}

/**
 * Deep freeze an object recursively. Used in dev to catch mutations.
 */
function deepFreeze<T extends object>(obj: T): T {
  Object.freeze(obj);
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj;
}

export function createTaskStore(options: TaskStoreOptions = {}): TaskStore {
  const ttl = options.ttl ?? DEFAULT_TTL;
  const cleanupInterval = options.cleanupInterval ?? DEFAULT_CLEANUP_INTERVAL;
  const isDev = typeof process !== "undefined"
    && process.env?.NODE_ENV !== "production";
  const shouldFreeze = options.freezeInDev ?? isDev;

  const tasks = new Map<string, StoredTask>();

  /**
   * Return a safe copy of a task. In dev, freeze it to catch mutations early.
   */
  function safeReturn(task: Task): Task {
    const copy = copyTask(task);
    return shouldFreeze ? deepFreeze(copy) : copy;
  }

  // Periodic cleanup of expired tasks
  const cleanup = () => {
    const now = Date.now();
    for (const [id, stored] of tasks) {
      if (now - stored.updatedAt > ttl) {
        tasks.delete(id);
      }
    }
  };

  const cleanupTimer = setInterval(cleanup, cleanupInterval);
  // Don't block process exit (Node.js only)
  (cleanupTimer as { unref?: () => void }).unref?.();

  function create(opts: CreateTaskOptions = {}): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuid(),
      contextId: opts.contextId ?? uuid(),
      version: 1,
      status: {
        state: "submitted",
        timestamp: now,
      },
      artifacts: [],
      // Clone initialMessage to prevent caller mutations from affecting stored history
      history: opts.initialMessage ? [structuredClone(opts.initialMessage)] : [],
    };

    tasks.set(task.id, {
      task,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return safeReturn(task);
  }

  function get(taskId: string): Task | undefined {
    const stored = tasks.get(taskId);
    if (!stored) return undefined;

    // Check if expired
    if (Date.now() - stored.updatedAt > ttl) {
      tasks.delete(taskId);
      return undefined;
    }

    return safeReturn(stored.task);
  }

  function update(
    taskId: string,
    patch: Partial<TaskStatus>,
  ): Task | undefined {
    const stored = tasks.get(taskId);
    if (!stored) return undefined;

    stored.task.status = {
      ...stored.task.status,
      ...patch,
      timestamp: new Date().toISOString(),
    };
    stored.task.version++;
    stored.updatedAt = Date.now();

    return safeReturn(stored.task);
  }

  function updateMetadata(
    taskId: string,
    metadata: Record<string, unknown>,
  ): Task | undefined {
    const stored = tasks.get(taskId);
    if (!stored) return undefined;

    // Merge new metadata with existing, clone to prevent mutations
    stored.task.metadata = {
      ...stored.task.metadata,
      ...structuredClone(metadata),
    };
    stored.task.version++;
    stored.updatedAt = Date.now();

    return safeReturn(stored.task);
  }

  function addArtifact(taskId: string, artifact: Artifact): Task | undefined {
    const stored = tasks.get(taskId);
    if (!stored) return undefined;

    stored.task.artifacts = stored.task.artifacts ?? [];
    // Clone to prevent caller mutations from affecting stored artifacts
    stored.task.artifacts.push(structuredClone(artifact));
    stored.task.version++;
    stored.updatedAt = Date.now();

    return safeReturn(stored.task);
  }

  function addMessage(taskId: string, message: Message): Task | undefined {
    const stored = tasks.get(taskId);
    if (!stored) return undefined;

    stored.task.history = stored.task.history ?? [];
    // Clone to prevent caller mutations from affecting stored history
    stored.task.history.push(structuredClone(message));
    stored.task.version++;
    stored.updatedAt = Date.now();

    return safeReturn(stored.task);
  }

  function list(opts: ListOptions = {}): Task[] {
    cleanup(); // Clean before listing

    let result: Task[] = [];

    for (const stored of tasks.values()) {
      // Filter by contextId
      if (opts.contextId && stored.task.contextId !== opts.contextId) {
        continue;
      }

      // Filter by status
      if (opts.status && !opts.status.includes(stored.task.status.state)) {
        continue;
      }

      result.push(safeReturn(stored.task));
    }

    // Sort by most recent first
    result.sort((a, b) => {
      const aTime = new Date(a.status.timestamp).getTime();
      const bTime = new Date(b.status.timestamp).getTime();
      return bTime - aTime;
    });

    // Apply limit
    if (opts.limit && opts.limit > 0) {
      result = result.slice(0, opts.limit);
    }

    return result;
  }

  function deleteTask(taskId: string): boolean {
    return tasks.delete(taskId);
  }

  return {
    create,
    get,
    update,
    updateMetadata,
    addArtifact,
    addMessage,
    list,
    delete: deleteTask,
  };
}
