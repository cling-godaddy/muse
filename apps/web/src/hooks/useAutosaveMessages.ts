import { useEffect, useRef } from "react";
import type { Message } from "./useChat";
import { useSaveMessages } from "../queries/siteQueries";

export function useAutosaveMessages(siteId: string | undefined, messages: Message[], isLoading: boolean) {
  const saveMessages = useSaveMessages();
  const prevIsLoadingRef = useRef(isLoading);
  const lastSavedCountRef = useRef(0);

  useEffect(() => {
    // Detect when streaming completes (isLoading: true → false)
    const wasLoading = prevIsLoadingRef.current;
    const justFinished = wasLoading && !isLoading;

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
