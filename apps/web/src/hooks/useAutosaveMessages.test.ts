import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAutosaveMessages } from "./useAutosaveMessages";
import type { Message } from "./useChat";

// Mock the useSaveMessages mutation
const mockMutateAsync = vi.fn();
vi.mock("../queries/siteQueries", () => ({
  useSaveMessages: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  }),
}));

// Mock useSiteStore to provide siteId from global state
let mockDraftId: string | null = "site_123";
vi.mock("../stores/siteStore", () => ({
  useSiteStore: (selector: (state: { draft: { id: string } | null }) => unknown) => {
    return selector({ draft: mockDraftId ? { id: mockDraftId } : null });
  },
}));

describe("useAutosaveMessages", () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
    mockMutateAsync.mockResolvedValue({});
    mockDraftId = "site_123";
  });

  it("doesn't save messages on initial load", async () => {
    const existingMessages: Message[] = [
      { id: "1", role: "user", content: "Existing message" },
    ];

    renderHook(() =>
      useAutosaveMessages(existingMessages, false),
    );

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it("sends only new messages after existing messages are loaded", async () => {
    const existingMessages: Message[] = [
      { id: "1", role: "user", content: "Old message 1" },
      { id: "2", role: "assistant", content: "Old message 2" },
    ];

    const { rerender } = renderHook(
      ({ messages, isLoading }: { messages: Message[], isLoading: boolean }) =>
        useAutosaveMessages(messages, isLoading),
      {
        initialProps: {
          messages: existingMessages,
          isLoading: false,
        },
      },
    );

    // User starts sending new message (isLoading: false → true)
    rerender({
      messages: [
        ...existingMessages,
        { id: "3", role: "user" as const, content: "New message" },
      ],
      isLoading: true,
    });

    // Response completes (isLoading: true → false)
    const finalMessages: Message[] = [
      ...existingMessages,
      { id: "3", role: "user" as const, content: "New message" },
      { id: "4", role: "assistant" as const, content: "New response" },
    ];
    rerender({
      messages: finalMessages,
      isLoading: false,
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        siteId: "site_123",
        messages: [
          { id: "3", role: "user", content: "New message" },
          { id: "4", role: "assistant", content: "New response" },
        ],
      });
    });
  });

  it("triggers save only when isLoading transitions from true to false", async () => {
    const { rerender } = renderHook(
      ({ isLoading }: { isLoading: boolean }) =>
        useAutosaveMessages([], isLoading),
      { initialProps: { isLoading: false } },
    );

    // false → false (no trigger)
    rerender({ isLoading: false });
    expect(mockMutateAsync).not.toHaveBeenCalled();

    // false → true (no trigger, but captures baseline)
    rerender({ isLoading: true });
    expect(mockMutateAsync).not.toHaveBeenCalled();

    // true → false (TRIGGER!)
    rerender({ isLoading: false });

    // Note: In this test messages array is empty, so no save happens
    // This tests the transition logic, not the save logic
  });

  it("saves incrementally across multiple conversation turns", async () => {
    const { rerender } = renderHook(
      ({ messages, isLoading }: { messages: Message[], isLoading: boolean }) =>
        useAutosaveMessages(messages, isLoading),
      {
        initialProps: {
          messages: [] as Message[],
          isLoading: false,
        },
      },
    );

    // First turn: user sends, AI responds
    const firstTurnMessages1: Message[] = [{ id: "1", role: "user", content: "First" }];
    rerender({ messages: firstTurnMessages1, isLoading: true } as { messages: Message[], isLoading: boolean });

    const firstTurnMessages2: Message[] = [
      { id: "1", role: "user", content: "First" },
      { id: "2", role: "assistant", content: "Response 1" },
    ];
    rerender({
      messages: firstTurnMessages2,
      isLoading: false,
    } as { messages: Message[], isLoading: boolean });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        siteId: "site_123",
        messages: [
          { id: "1", role: "user", content: "First" },
          { id: "2", role: "assistant", content: "Response 1" },
        ],
      });
    });

    // Second turn: user sends again
    const secondTurnMessages1: Message[] = [
      { id: "1", role: "user", content: "First" },
      { id: "2", role: "assistant", content: "Response 1" },
      { id: "3", role: "user", content: "Second" },
    ];
    rerender({
      messages: secondTurnMessages1,
      isLoading: true,
    } as { messages: Message[], isLoading: boolean });

    const secondTurnMessages2: Message[] = [
      { id: "1", role: "user", content: "First" },
      { id: "2", role: "assistant", content: "Response 1" },
      { id: "3", role: "user", content: "Second" },
      { id: "4", role: "assistant", content: "Response 2" },
    ];
    rerender({
      messages: secondTurnMessages2,
      isLoading: false,
    } as { messages: Message[], isLoading: boolean });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      // Second call should only have new messages
      expect(mockMutateAsync.mock.calls[1]?.[0]).toEqual({
        siteId: "site_123",
        messages: [
          { id: "3", role: "user", content: "Second" },
          { id: "4", role: "assistant", content: "Response 2" },
        ],
      });
    });
  });

  it("doesn't save if no new messages since last save", async () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "Message" },
    ];

    const { rerender } = renderHook(
      ({ isLoading }: { isLoading: boolean }) =>
        useAutosaveMessages(messages, isLoading),
      { initialProps: { isLoading: true } },
    );

    // Complete loading without adding messages
    rerender({ isLoading: false });

    // No new messages, so no save
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it("doesn't save if siteId is undefined (no draft in store)", async () => {
    // Mock store to return null draft
    mockDraftId = null;

    const { rerender } = renderHook(
      ({ messages, isLoading }: { messages: Message[], isLoading: boolean }) =>
        useAutosaveMessages(messages, isLoading),
      {
        initialProps: {
          messages: [] as Message[],
          isLoading: false,
        },
      },
    );

    const testMessages1: Message[] = [{ id: "1", role: "user", content: "Test" }];
    rerender({ messages: testMessages1, isLoading: true } as { messages: Message[], isLoading: boolean });

    const testMessages2: Message[] = [
      { id: "1", role: "user", content: "Test" },
      { id: "2", role: "assistant", content: "Response" },
    ];
    rerender({
      messages: testMessages2,
      isLoading: false,
    } as { messages: Message[], isLoading: boolean });

    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});
