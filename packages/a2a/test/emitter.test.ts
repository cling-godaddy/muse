import { describe, expect, it } from "vitest";
import { createA2AEmitter } from "../src/emitter";
import type { StreamResponse } from "../src/types";

describe("createA2AEmitter", () => {
  const createTestEmitter = () => {
    const events: StreamResponse[] = [];
    const emitter = createA2AEmitter({
      taskId: "task-123",
      contextId: "ctx-456",
      onEvent: event => events.push(event),
    });
    return { emitter, events };
  };

  describe("statusUpdate", () => {
    it("emits spec-compliant statusUpdate event", () => {
      const { emitter, events } = createTestEmitter();

      emitter.statusUpdate("brief", { description: "Extracting brand context" });

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty("statusUpdate");

      const update = (events[0] as { statusUpdate: unknown }).statusUpdate as Record<string, unknown>;
      expect(update.taskId).toBe("task-123");
      expect(update.contextId).toBe("ctx-456");
      expect(update.final).toBe(false);
      expect(update.metadata).toEqual({ step: "brief", description: "Extracting brand context" });

      const status = update.status as Record<string, unknown>;
      expect(status.state).toBe("working");
      // Per spec, TaskStatus.message is a Message object, not a string.
      // Human-readable description goes in metadata.
      expect(status.message).toBeUndefined();
      expect(status.timestamp).toBeDefined();
    });

    it("handles statusUpdate without description", () => {
      const { emitter, events } = createTestEmitter();

      emitter.statusUpdate("brief");

      const update = (events[0] as { statusUpdate: unknown }).statusUpdate as Record<string, unknown>;
      const status = update.status as Record<string, unknown>;
      expect(status.message).toBeUndefined();
      expect(update.metadata).toEqual({ step: "brief" });
    });
  });

  describe("artifactUpdate", () => {
    it("emits spec-compliant artifactUpdate event", () => {
      const { emitter, events } = createTestEmitter();

      emitter.artifactUpdate(
        { name: "theme", parts: [{ data: { primaryColor: "#007bff" } }] },
        { append: false, lastChunk: true },
      );

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty("artifactUpdate");

      const update = (events[0] as { artifactUpdate: unknown }).artifactUpdate as Record<string, unknown>;
      expect(update.taskId).toBe("task-123");
      expect(update.contextId).toBe("ctx-456");
      expect(update.append).toBe(false);
      expect(update.lastChunk).toBe(true);

      const artifact = update.artifact as Record<string, unknown>;
      expect(artifact.name).toBe("theme");
      expect(artifact.artifactId).toBeDefined();
      expect(artifact.parts).toEqual([{ data: { primaryColor: "#007bff" } }]);
    });

    it("auto-generates artifactId if not provided", () => {
      const { emitter, events } = createTestEmitter();

      emitter.artifactUpdate({ name: "sections", parts: [] });

      const update = (events[0] as { artifactUpdate: unknown }).artifactUpdate as Record<string, unknown>;
      const artifact = update.artifact as Record<string, unknown>;
      expect(artifact.artifactId).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it("uses stable artifactId for same name", () => {
      const { emitter, events } = createTestEmitter();

      emitter.artifactUpdate({ name: "theme", parts: [{ data: { v: 1 } }] });
      emitter.artifactUpdate({ name: "theme", parts: [{ data: { v: 2 } }] }, { append: true });

      const update1 = (events[0] as { artifactUpdate: unknown }).artifactUpdate as Record<string, unknown>;
      const update2 = (events[1] as { artifactUpdate: unknown }).artifactUpdate as Record<string, unknown>;
      const artifact1 = update1.artifact as Record<string, unknown>;
      const artifact2 = update2.artifact as Record<string, unknown>;

      expect(artifact1.artifactId).toBe(artifact2.artifactId);
    });
  });

  describe("inputRequired", () => {
    it("emits input-required status", () => {
      const { emitter, events } = createTestEmitter();

      emitter.inputRequired("Which section type would you like?", {
        metadata: { options: ["hero", "features", "cta"] },
      });

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: unknown }).statusUpdate as Record<string, unknown>;
      const status = update.status as Record<string, unknown>;

      expect(status.state).toBe("input-required");
      // Prompt goes in metadata, not status.message (which is a Message object per spec)
      expect(status.message).toBeUndefined();
      expect(update.metadata).toMatchObject({
        prompt: "Which section type would you like?",
        options: ["hero", "features", "cta"],
      });
      expect(update.final).toBe(false);
    });
  });

  describe("message", () => {
    it("emits agent message with taskId and contextId", () => {
      const { emitter, events } = createTestEmitter();

      emitter.message([{ text: "I've generated your landing page." }]);

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty("message");

      const message = (events[0] as { message: unknown }).message as Record<string, unknown>;
      expect(message.role).toBe("agent");
      expect(message.messageId).toBeDefined();
      expect(message.taskId).toBe("task-123");
      expect(message.contextId).toBe("ctx-456");
      expect(message.parts).toEqual([{ text: "I've generated your landing page." }]);
    });
  });

  describe("complete", () => {
    it("emits final completed status", () => {
      const { emitter, events } = createTestEmitter();

      emitter.complete("Site generation finished");

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: unknown }).statusUpdate as Record<string, unknown>;
      const status = update.status as Record<string, unknown>;

      expect(status.state).toBe("completed");
      // Completion message goes in metadata.description, not status.message
      expect(status.message).toBeUndefined();
      expect(update.metadata).toEqual({ description: "Site generation finished" });
      expect(update.final).toBe(true);
    });
  });

  describe("fail", () => {
    it("emits final failed status with error details", () => {
      const { emitter, events } = createTestEmitter();

      emitter.fail(new Error("API rate limit exceeded"));

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: unknown }).statusUpdate as Record<string, unknown>;
      const status = update.status as Record<string, unknown>;

      expect(status.state).toBe("failed");
      // Error message is in status.error.message, not status.message
      expect(status.message).toBeUndefined();
      expect(update.final).toBe(true);

      const error = status.error as Record<string, unknown>;
      expect(error.message).toBe("API rate limit exceeded");
      expect(error.stack).toBeDefined();
    });

    it("handles string errors", () => {
      const { emitter, events } = createTestEmitter();

      emitter.fail("Something went wrong");

      const update = (events[0] as { statusUpdate: unknown }).statusUpdate as Record<string, unknown>;
      const status = update.status as Record<string, unknown>;

      expect(status.state).toBe("failed");
      // Error message is in status.error.message, not status.message
      expect(status.message).toBeUndefined();
      const error = status.error as Record<string, unknown>;
      expect(error.message).toBe("Something went wrong");
    });
  });

  describe("emitTask", () => {
    it("emits task object", () => {
      const { emitter, events } = createTestEmitter();

      const task = {
        id: "task-123",
        contextId: "ctx-456",
        version: 1,
        status: { state: "completed" as const, timestamp: new Date().toISOString() },
        artifacts: [],
        history: [],
      };

      emitter.emitTask(task);

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty("task");
      expect((events[0] as { task: unknown }).task).toEqual(task);
    });
  });
});
