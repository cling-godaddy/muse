import { Hono } from "hono";
import { createMessagesTable, type MessagesTable, type StoredMessage } from "@muse/db";
import { requireAuth } from "../middleware/auth";

export const messagesRoute = new Hono();

messagesRoute.use("/*", requireAuth);

let messagesTable: MessagesTable | null = null;

async function getMessages(): Promise<MessagesTable> {
  if (!messagesTable) {
    messagesTable = await createMessagesTable();
  }
  return messagesTable;
}

messagesRoute.get("/:siteId", async (c) => {
  const messages = await getMessages();
  const siteId = c.req.param("siteId");
  const result = await messages.getBySiteId(siteId);
  return c.json({ messages: result });
});

messagesRoute.post("/:siteId", async (c) => {
  const table = await getMessages();
  const siteId = c.req.param("siteId");
  const body = await c.req.json() as { messages: StoredMessage[] };

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "Missing messages array" }, 400);
  }

  // Ensure all messages have the correct siteId
  const messagesToSave = body.messages.map(m => ({
    ...m,
    siteId,
  }));

  await table.saveBatch(messagesToSave);
  return c.json({ success: true });
});

// For testing: reset the cached messages table
export function resetMessagesRoute(): void {
  messagesTable = null;
}
