import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { messagesRoute, resetMessagesRoute } from "./messages";
import { resetSitesTable } from "@muse/db";
import type { StoredMessage } from "@muse/db";

let mockUserId = "test_user_123";

// Mock clerk auth to return configurable user
vi.mock("@hono/clerk-auth", () => ({
  getAuth: () => ({ userId: mockUserId }),
}));

function createTestMessage(overrides: Partial<StoredMessage> = {}): StoredMessage {
  return {
    id: crypto.randomUUID(),
    siteId: "test_site_123",
    role: "user",
    content: "Test message",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("messages routes", () => {
  let app: Hono;

  beforeEach(() => {
    mockUserId = "test_user_123";
    resetSitesTable();
    resetMessagesRoute();
    app = new Hono();
    app.route("/api/messages", messagesRoute);
  });

  describe("POST /api/messages/:siteId", () => {
    it("returns 201 Created when saving messages", async () => {
      const messages = [
        createTestMessage({ role: "user", content: "Hello" }),
        createTestMessage({ role: "assistant", content: "Hi there" }),
      ];

      const res = await app.request("/api/messages/test_site_123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("saves messages successfully", async () => {
      const messages = [
        createTestMessage({ role: "user", content: "Hello" }),
        createTestMessage({ role: "assistant", content: "Hi there" }),
      ];

      // Save
      await app.request("/api/messages/test_site_123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      // Verify
      const getRes = await app.request("/api/messages/test_site_123");
      expect(getRes.status).toBe(200);
      const loaded = await getRes.json();
      expect(loaded.messages).toHaveLength(2);
      expect(loaded.messages[0].content).toBe("Hello");
      expect(loaded.messages[1].content).toBe("Hi there");
    });

    it("appends new messages to existing ones", async () => {
      // Save first batch
      const firstBatch = [
        createTestMessage({ role: "user", content: "First message" }),
      ];
      await app.request("/api/messages/test_site_123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: firstBatch }),
      });

      // Save second batch
      const secondBatch = [
        createTestMessage({ role: "user", content: "Second message" }),
        createTestMessage({ role: "assistant", content: "Response" }),
      ];
      await app.request("/api/messages/test_site_123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: secondBatch }),
      });

      // Verify both batches are saved
      const getRes = await app.request("/api/messages/test_site_123");
      const loaded = await getRes.json();
      expect(loaded.messages).toHaveLength(3);
      expect(loaded.messages[0].content).toBe("First message");
      expect(loaded.messages[1].content).toBe("Second message");
      expect(loaded.messages[2].content).toBe("Response");
    });

    it("returns 400 for missing messages array", async () => {
      const res = await app.request("/api/messages/test_site_123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Missing messages array");
    });

    it("ensures all messages have correct siteId", async () => {
      const messages = [
        createTestMessage({ siteId: "wrong_site", content: "Test" }),
      ];

      await app.request("/api/messages/correct_site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      // Verify siteId was corrected
      const getRes = await app.request("/api/messages/correct_site");
      const loaded = await getRes.json();
      expect(loaded.messages).toHaveLength(1);
      expect(loaded.messages[0].siteId).toBe("correct_site");
    });
  });

  describe("GET /api/messages/:siteId", () => {
    it("returns empty array for new site", async () => {
      const res = await app.request("/api/messages/new_site_123");

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.messages).toEqual([]);
    });

    it("returns messages for specific site only", async () => {
      // Save messages for site A
      const messagesA = [createTestMessage({ siteId: "site_a", content: "A" })];
      await app.request("/api/messages/site_a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesA }),
      });

      // Save messages for site B
      const messagesB = [createTestMessage({ siteId: "site_b", content: "B" })];
      await app.request("/api/messages/site_b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesB }),
      });

      // Verify site A only returns its messages
      const resA = await app.request("/api/messages/site_a");
      const loadedA = await resA.json();
      expect(loadedA.messages).toHaveLength(1);
      expect(loadedA.messages[0].content).toBe("A");

      // Verify site B only returns its messages
      const resB = await app.request("/api/messages/site_b");
      const loadedB = await resB.json();
      expect(loadedB.messages).toHaveLength(1);
      expect(loadedB.messages[0].content).toBe("B");
    });
  });
});
