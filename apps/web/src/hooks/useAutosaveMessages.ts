import { useEffect, useRef } from "react";
import type { Message } from "./useChat";
import { useSaveMessages } from "../queries/siteQueries";

export function useAutosaveMessages(siteId: string | undefined, messages: Message[], isLoading: boolean) {
  const saveMessages = useSaveMessages();
  const prevIsLoadingRef = useRef(isLoading);
  const lastSavedCountRef = useRef(0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // On first render, capture baseline (handles mounting mid-stream or with existing messages)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (messages.length > 0 || isLoading) {
        lastSavedCountRef.current = messages.length;
      }
    }

    // Detect when streaming completes (isLoading: true → false)
    const wasLoading = prevIsLoadingRef.current;
    const justFinished = wasLoading && !isLoading;

    // Continuously update baseline when not loading (tracks current state)
    // This captures the count BEFORE user starts next interaction
    if (!isLoading && !justFinished) {
      lastSavedCountRef.current = messages.length;
    }

    if (justFinished && siteId && messages.length > lastSavedCountRef.current) {
      // Save new messages since last save
      const newMessages = messages.slice(lastSavedCountRef.current);

      saveMessages.mutateAsync({ siteId, messages: newMessages })
        .then(() => {
          lastSavedCountRef.current = messages.length;
        })
        .catch((err) => {
          console.error("Failed to save messages:", err);
          // TODO: Show error to user, add retry logic
        });
    }

    prevIsLoadingRef.current = isLoading;
  }, [isLoading, messages, siteId, saveMessages]);

  return {
    isSaving: saveMessages.isPending,
    saveError: saveMessages.error,
  };
}
