import { describe, expect, it } from "vitest";
import { createTaskStore } from "../src/task-store";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("createTaskStore", () => {
  describe("create", () => {
    it("creates a task with valid UUIDs", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      expect(task.id).toMatch(uuidRegex);
      expect(task.contextId).toMatch(uuidRegex);
    });

    it("creates a task with submitted status", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      expect(task.status.state).toBe("submitted");
      expect(task.status.timestamp).toBeDefined();
    });

    it("creates a task with version 1", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      expect(task.version).toBe(1);
    });

    it("uses provided contextId", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create({ contextId: "my-context" });

      expect(task.contextId).toBe("my-context");
    });

    it("initializes empty artifacts and history", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      expect(task.artifacts).toEqual([]);
      expect(task.history).toEqual([]);
    });

    it("includes initialMessage in history", () => {
      const store = createTaskStore({ freezeInDev: false });
      const message = {
        messageId: "msg-1",
        role: "user" as const,
        parts: [{ text: "Hello" }],
      };
      const task = store.create({ initialMessage: message });

      expect(task.history).toHaveLength(1);
      expect(task.history?.[0]).toEqual(message);
    });
  });

  describe("get", () => {
    it("retrieves existing task", () => {
      const store = createTaskStore({ freezeInDev: false });
      const created = store.create();
      const retrieved = store.get(created.id);

      expect(retrieved).toEqual(created);
    });

    it("returns undefined for non-existent task", () => {
      const store = createTaskStore({ freezeInDev: false });
      const retrieved = store.get("non-existent-id");

      expect(retrieved).toBeUndefined();
    });

    it("returns a copy, not the original", () => {
      const store = createTaskStore({ freezeInDev: false });
      const created = store.create();
      const retrieved1 = store.get(created.id);
      const retrieved2 = store.get(created.id);

      expect(retrieved1).not.toBe(retrieved2);
      expect(retrieved1).toEqual(retrieved2);
    });
  });

  describe("update", () => {
    it("updates task status", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();
      const updated = store.update(task.id, { state: "working" });

      expect(updated?.status.state).toBe("working");
    });

    it("updates status message and preserves state change", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const updated = store.update(task.id, {
        state: "working",
        message: "Processing...",
      });

      expect(updated?.status.state).toBe("working");
      expect(updated?.status.message).toBe("Processing...");
      expect(updated?.status.timestamp).toBeDefined();
    });

    it("increments version on update", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();
      expect(task.version).toBe(1);

      const updated = store.update(task.id, { state: "working" });
      expect(updated?.version).toBe(2);
    });

    it("returns undefined for non-existent task", () => {
      const store = createTaskStore({ freezeInDev: false });
      const updated = store.update("non-existent", { state: "working" });

      expect(updated).toBeUndefined();
    });
  });

  describe("updateMetadata", () => {
    it("sets task metadata", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const updated = store.updateMetadata(task.id, { foo: "bar" });

      expect(updated?.metadata).toEqual({ foo: "bar" });
    });

    it("merges with existing metadata", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      store.updateMetadata(task.id, { foo: "bar" });
      const updated = store.updateMetadata(task.id, { baz: 123 });

      expect(updated?.metadata).toEqual({ foo: "bar", baz: 123 });
    });

    it("overwrites existing keys", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      store.updateMetadata(task.id, { foo: "bar" });
      const updated = store.updateMetadata(task.id, { foo: "updated" });

      expect(updated?.metadata).toEqual({ foo: "updated" });
    });

    it("increments version on metadata update", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();
      expect(task.version).toBe(1);

      const updated = store.updateMetadata(task.id, { test: true });
      expect(updated?.version).toBe(2);
    });

    it("returns undefined for non-existent task", () => {
      const store = createTaskStore({ freezeInDev: false });
      const result = store.updateMetadata("non-existent", { foo: "bar" });

      expect(result).toBeUndefined();
    });

    it("clones metadata to prevent mutations", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const metadata = { nested: { value: 1 } };
      store.updateMetadata(task.id, metadata);

      // Mutate the original object
      metadata.nested.value = 999;

      // Stored metadata should be unchanged
      const retrieved = store.get(task.id);
      expect((retrieved?.metadata as { nested: { value: number } }).nested.value).toBe(1);
    });
  });

  describe("addArtifact", () => {
    it("adds artifact to task", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const artifact = {
        artifactId: "artifact-1",
        name: "theme",
        parts: [{ data: { color: "blue" } }],
      };

      const updated = store.addArtifact(task.id, artifact);

      expect(updated?.artifacts).toHaveLength(1);
      expect(updated?.artifacts?.[0]).toEqual(artifact);
    });

    it("appends multiple artifacts", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      store.addArtifact(task.id, { artifactId: "a1", parts: [] });
      const updated = store.addArtifact(task.id, { artifactId: "a2", parts: [] });

      expect(updated?.artifacts).toHaveLength(2);
    });

    it("increments version on addArtifact", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const updated = store.addArtifact(task.id, { artifactId: "a1", parts: [] });
      expect(updated?.version).toBe(2);
    });
  });

  describe("addMessage", () => {
    it("adds message to task history", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const message = {
        messageId: "msg-1",
        role: "user" as const,
        parts: [{ text: "Hello" }],
      };

      const updated = store.addMessage(task.id, message);

      expect(updated?.history).toHaveLength(1);
      expect(updated?.history?.[0]).toEqual(message);
    });

    it("increments version on addMessage", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      const message = {
        messageId: "msg-1",
        role: "user" as const,
        parts: [{ text: "Hello" }],
      };

      const updated = store.addMessage(task.id, message);
      expect(updated?.version).toBe(2);
    });
  });

  describe("list", () => {
    it("lists all tasks", () => {
      const store = createTaskStore({ freezeInDev: false });
      store.create();
      store.create();
      store.create();

      const tasks = store.list();

      expect(tasks).toHaveLength(3);
    });

    it("filters by contextId", () => {
      const store = createTaskStore({ freezeInDev: false });
      store.create({ contextId: "context-a" });
      store.create({ contextId: "context-a" });
      store.create({ contextId: "context-b" });

      const tasks = store.list({ contextId: "context-a" });

      expect(tasks).toHaveLength(2);
      expect(tasks.every(t => t.contextId === "context-a")).toBe(true);
    });

    it("filters by status", () => {
      const store = createTaskStore({ freezeInDev: false });
      const t1 = store.create();
      const t2 = store.create();
      store.create();

      store.update(t1.id, { state: "completed" });
      store.update(t2.id, { state: "failed" });

      const tasks = store.list({ status: ["completed", "failed"] });

      expect(tasks).toHaveLength(2);
    });

    it("applies limit", () => {
      const store = createTaskStore({ freezeInDev: false });
      store.create();
      store.create();
      store.create();

      const tasks = store.list({ limit: 2 });

      expect(tasks).toHaveLength(2);
    });

    it("sorts by most recent first", () => {
      const store = createTaskStore({ freezeInDev: false });
      const t1 = store.create();
      store.create();
      store.create();

      // Update t1 to make it most recent
      store.update(t1.id, { state: "working" });

      const tasks = store.list();

      expect(tasks[0]?.id).toBe(t1.id);
    });
  });

  describe("delete", () => {
    it("removes task from store", () => {
      const store = createTaskStore({ freezeInDev: false });
      const task = store.create();

      expect(store.delete(task.id)).toBe(true);
      expect(store.get(task.id)).toBeUndefined();
    });

    it("returns false for non-existent task", () => {
      const store = createTaskStore({ freezeInDev: false });

      expect(store.delete("non-existent")).toBe(false);
    });
  });

  describe("TTL expiration", () => {
    it("expires tasks after TTL", () => {
      const store = createTaskStore({ ttl: 10, freezeInDev: false });
      const task = store.create();

      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const retrieved = store.get(task.id);
          expect(retrieved).toBeUndefined();
          resolve();
        }, 20);
      });
    });
  });

  describe("immutability (freeze in dev)", () => {
    it("freezes returned tasks when freezeInDev is true", () => {
      const store = createTaskStore({ freezeInDev: true });
      const task = store.create();

      expect(Object.isFrozen(task)).toBe(true);
      expect(Object.isFrozen(task.status)).toBe(true);
      expect(Object.isFrozen(task.artifacts)).toBe(true);
      expect(Object.isFrozen(task.history)).toBe(true);
    });

    it("throws when mutating frozen task", () => {
      const store = createTaskStore({ freezeInDev: true });
      const task = store.create();

      expect(() => {
        // @ts-expect-error - intentionally testing runtime behavior
        task.status.state = "working";
      }).toThrow();
    });

    it("throws when pushing to frozen arrays", () => {
      const store = createTaskStore({ freezeInDev: true });
      const task = store.create();

      expect(() => {
        task.artifacts?.push({ artifactId: "bad", parts: [] });
      }).toThrow();
    });
  });
});
