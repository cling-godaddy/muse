import { Hono, type Context } from "hono";
import { streamSSE } from "hono/streaming";
import {
  createMuseAgentCard,
  createTaskStore,
  createA2AEmitter,
  createMarkerTranslator,
  type TaskStore,
  type JsonRpcRequest,
  type JsonRpcResponse,
  type Task,
  type Message,
  type StreamResponse,
  type GetTaskParams,
  type CancelTaskParams,
  type ListTasksParams,
  A2AError,
  methodNotFound,
  invalidParams,
  internalError,
  taskNotFound,
  taskNotCancelable,
} from "@muse/a2a";
import { createClient, orchestrate, orchestrateSite, type Provider, type Message as AIMessage } from "@muse/ai";
import { createMediaClient, getIamJwt, type MediaClient } from "@muse/media";
import { createLogger } from "@muse/logger";

const logger = createLogger();

// Singletons
let taskStore: TaskStore | null = null;
let client: Provider | null = null;
let mediaClient: MediaClient | null = null;

function getTaskStore(): TaskStore {
  if (!taskStore) {
    taskStore = createTaskStore({
      ttl: 60 * 60 * 1000, // 1 hour
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
    });
  }
  return taskStore;
}

function getClient(): Provider {
  if (!client) {
    client = createClient({
      provider: (process.env.AI_PROVIDER as "openai" | "anthropic") ?? "openai",
      openaiKey: process.env.OPENAI_API_KEY,
      anthropicKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

function getMediaClient(): MediaClient {
  if (!mediaClient) {
    mediaClient = createMediaClient({
      gettyJwt: getIamJwt,
      logger: logger.child({ agent: "media" }),
    });
  }
  return mediaClient;
}

// Skill inference from message content
function inferSkillFromMessage(message: Message): string {
  // Check for explicit skill in message metadata
  if (message.metadata?.skillId) {
    return message.metadata.skillId as string;
  }

  // Check first text part for keywords
  const textPart = message.parts.find((p): p is { text: string } => "text" in p);
  if (textPart) {
    const text = textPart.text.toLowerCase();
    if (text.includes("refine") || text.includes("edit") || text.includes("change") || text.includes("update")) {
      return "refine";
    }
    if (text.includes("multi-page") || text.includes("full site") || text.includes("website")) {
      return "generate_site";
    }
  }

  // Default to landing page generation
  return "generate_landing";
}

// JSON-RPC response helpers
function jsonRpcSuccess(id: string | number, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id: string | number, error: A2AError): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: { code: error.code, message: error.message, data: error.data },
  };
}

// Format StreamResponse as JSON-RPC SSE event
function formatSSE(id: string | number, event: StreamResponse): string {
  const response = jsonRpcSuccess(id, event);
  return JSON.stringify(response);
}

// Method name aliases (v1.0 uses PascalCase, we also accept slash-style)
const methodAliases: Record<string, string> = {
  SendMessage: "message/send",
  SendStreamingMessage: "message/stream",
  GetTask: "tasks/get",
  CancelTask: "tasks/cancel",
};

function normalizeMethodName(method: string): string {
  return methodAliases[method] ?? method;
}

// Method handlers
type MethodHandler = (params: unknown) => Promise<unknown> | unknown;

const methods: Record<string, MethodHandler> = {
  "tasks/get": (params) => {
    const { id, historyLength } = params as GetTaskParams;
    if (!id) {
      throw invalidParams("Missing required parameter: id");
    }

    const task = getTaskStore().get(id);
    if (!task) {
      throw taskNotFound(id);
    }

    // Apply historyLength filter if specified
    if (historyLength !== undefined && task.history) {
      return {
        ...task,
        history: task.history.slice(-historyLength),
      };
    }

    return task;
  },

  "tasks/cancel": (params) => {
    const { id } = params as CancelTaskParams;
    if (!id) {
      throw invalidParams("Missing required parameter: id");
    }

    const task = getTaskStore().get(id);
    if (!task) {
      throw taskNotFound(id);
    }

    // Can only cancel tasks that are in-progress
    const cancelableStates = ["submitted", "working", "input-required"];
    if (!cancelableStates.includes(task.status.state)) {
      throw taskNotCancelable(id, task.status.state);
    }

    const updated = getTaskStore().update(id, { state: "cancelled" });
    return updated;
  },

  "message/send": async (params) => {
    const { message, metadata } = params as {
      message: Message
      metadata?: { skillId?: string }
    };
    if (!message) {
      throw invalidParams("Missing required parameter: message");
    }

    // Determine skill from metadata or infer from message
    const skillId = metadata?.skillId ?? inferSkillFromMessage(message);

    // Create a new task or resume existing one
    const contextId = message.contextId;
    const task = getTaskStore().create({
      contextId,
      initialMessage: message,
    });

    logger.info("a2a_message_send", { taskId: task.id, contextId, skillId });

    // TODO: Route to orchestrator based on skillId
    // For now, just mark as completed with a stub response
    getTaskStore().update(task.id, {
      state: "completed",
      message: `Task completed (stub) - skill: ${skillId}`,
    });

    return getTaskStore().get(task.id);
  },

  "message/stream": async (params) => {
    // For non-streaming context, behave like message/send
    // Actual streaming is handled in the route handler
    const handler = methods["message/send"];
    if (!handler) throw internalError("message/send handler not found");
    return handler(params);
  },
};

// Main A2A route
export const a2aRoute = new Hono();

// JSON-RPC endpoint
a2aRoute.post("/", async (c) => {
  let rpcId: string | number = 0;

  try {
    const body = await c.req.json<JsonRpcRequest>();
    rpcId = body.id;

    // Validate JSON-RPC structure
    if (body.jsonrpc !== "2.0") {
      return c.json(jsonRpcError(rpcId, invalidParams("Invalid JSON-RPC version")));
    }

    if (!body.method) {
      return c.json(jsonRpcError(rpcId, invalidParams("Missing method")));
    }

    // Normalize method names (v1.0 uses PascalCase, we also accept slash-style)
    const normalizedMethod = normalizeMethodName(body.method);

    // Handle streaming methods
    if (normalizedMethod === "message/stream") {
      return handleMessageStream(c, rpcId, body.params);
    }

    // Find and execute handler for other methods
    const handler = methods[normalizedMethod];
    if (!handler) {
      logger.warn("a2a_method_not_found", { method: body.method, normalized: normalizedMethod });
      return c.json(jsonRpcError(rpcId, methodNotFound(body.method)));
    }

    logger.info("a2a_request", { method: body.method, normalized: normalizedMethod, id: rpcId });
    const result = await handler(body.params);
    return c.json(jsonRpcSuccess(rpcId, result));
  }
  catch (err) {
    if (err instanceof A2AError) {
      logger.warn("a2a_error", { code: err.code, message: err.message });
      return c.json(jsonRpcError(rpcId, err));
    }

    logger.error("a2a_internal_error", { error: err });
    return c.json(jsonRpcError(rpcId, internalError(err instanceof Error ? err.message : "Unknown error")));
  }
});

// SSE streaming handler for message/stream
async function handleMessageStream(c: Context, rpcId: string | number, params: unknown) {
  const { message, metadata } = params as {
    message: Message
    metadata?: { skillId?: string }
  };

  if (!message) {
    return c.json(jsonRpcError(rpcId, invalidParams("Missing required parameter: message")));
  }

  const skillId = metadata?.skillId ?? inferSkillFromMessage(message);
  const contextId = message.contextId;

  // Create task
  const task = getTaskStore().create({
    contextId,
    initialMessage: message,
  });

  logger.info("a2a_message_stream", { taskId: task.id, contextId, skillId });

  return streamSSE(c, async (stream) => {
    const emitter = createA2AEmitter({
      taskId: task.id,
      contextId: task.contextId,
      onEvent: (event: StreamResponse) => {
        stream.writeSSE({ data: formatSSE(rpcId, event) });
      },
    });

    try {
      // Emit initial task so clients can grab taskId/contextId immediately
      emitter.emitTask(task);

      // Update task to working
      getTaskStore().update(task.id, { state: "working" });

      // Emit initial status
      emitter.statusUpdate("starting", { skillId, description: "Starting generation" });

      // Convert A2A message to AI message format
      const aiMessages = convertToAIMessages(message);

      // Select orchestrator based on skill
      const generator = skillId === "generate_site" ? orchestrateSite : orchestrate;

      // Create marker translator to convert orchestrator output to A2A events
      const translator = createMarkerTranslator(emitter, {
        onParseError: (marker, error) => {
          logger.warn("a2a_marker_parse_error", { taskId: task.id, marker: marker.slice(0, 100), error: error.message });
        },
      });

      // Run orchestrator and translate markers to A2A events
      const config = { mediaClient: getMediaClient(), logger };
      const input = { messages: aiMessages };

      for await (const chunk of generator(input, getClient(), { config })) {
        translator.processChunk(chunk);
      }

      // Mark complete
      const completionMessage = `Site generation complete (skill: ${skillId})`;
      getTaskStore().update(task.id, { state: "completed", message: completionMessage });
      emitter.complete(completionMessage);

      // Emit final task
      const finalTask = getTaskStore().get(task.id);
      if (finalTask) {
        emitter.emitTask(finalTask);
      }
    }
    catch (err) {
      logger.error("a2a_stream_error", { taskId: task.id, error: err });
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      getTaskStore().update(task.id, {
        state: "failed",
        error: { message: errorMessage },
      });
      emitter.fail(err);
    }
  });
}

/**
 * Convert A2A Message to AI Message format.
 * Extracts text parts and converts to the format expected by orchestrators.
 */
function convertToAIMessages(message: Message): AIMessage[] {
  // Extract text content from message parts
  const textParts = message.parts
    .filter((p): p is { text: string } => "text" in p)
    .map(p => p.text);

  const content = textParts.join("\n");

  // Map A2A role to AI role
  const role = message.role === "agent" ? "assistant" : "user";

  return [{ role, content }];
}

// REST endpoint for listing tasks (not in JSON-RPC spec)
a2aRoute.get("/tasks", (c) => {
  const contextId = c.req.query("contextId");
  const status = c.req.query("status")?.split(",") as Task["status"]["state"][] | undefined;
  const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;

  const params: ListTasksParams = {
    contextId,
    status,
    pageSize: limit,
  };

  const tasks = getTaskStore().list({
    contextId: params.contextId,
    status: params.status,
    limit: params.pageSize,
  });

  return c.json({ tasks });
});

// Agent Card route (to be mounted at /.well-known)
export const agentCardRoute = new Hono();

agentCardRoute.get("/agent-card.json", (c) => {
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  const card = createMuseAgentCard(baseUrl);
  return c.json(card);
});
