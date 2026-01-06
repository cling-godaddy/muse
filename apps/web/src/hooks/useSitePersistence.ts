import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { Site } from "@muse/core";
import type { Message } from "./useChat";

const API_URL = "http://localhost:3001";

interface UseSitePersistenceOptions {
  site: Site
  setSite: (site: Site) => void
  messages?: Message[]
}

export interface UseSitePersistence {
  hasUnsavedChanges: boolean
  isSaving: boolean
  isLoading: boolean
  error: string | null
  save: () => Promise<void>
  load: (id: string) => Promise<boolean>
  clearError: () => void
}

export function useSitePersistence({
  site,
  setSite,
  messages = [],
}: UseSitePersistenceOptions): UseSitePersistence {
  const { getToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const siteRef = useRef(site);
  siteRef.current = site;

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Track changes since last save
  useEffect(() => {
    if (lastSavedAt) {
      // After first save: compare update time to last save
      const siteUpdatedAt = new Date(site.updatedAt);
      setHasUnsavedChanges(siteUpdatedAt > lastSavedAt);
    }
    else {
      // Never saved: saveable if it has any content
      const hasContent = Object.values(site.pages).some(p => p.sections.length > 0);
      setHasUnsavedChanges(hasContent);
    }
  }, [site.updatedAt, site.pages, lastSavedAt]);

  const save = useCallback(async () => {
    const currentSite = siteRef.current;
    const currentMessages = messagesRef.current;
    setIsSaving(true);
    setError(null);

    try {
      const token = await getToken();

      // Save site
      const res = await fetch(`${API_URL}/api/sites/${currentSite.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(currentSite),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save site");
      }

      // Save messages
      if (currentMessages.length > 0) {
        const storedMessages = currentMessages.map((m, i) => ({
          id: m.id,
          siteId: currentSite.id,
          role: m.role,
          content: m.content,
          createdAt: new Date(Date.now() + i).toISOString(),
          agents: m.agents,
          usage: m.usage,
        }));

        const msgRes = await fetch(`${API_URL}/api/messages/${currentSite.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: storedMessages }),
        });

        if (!msgRes.ok) {
          console.error("Failed to save messages:", msgRes.status);
        }
      }

      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
    finally {
      setIsSaving(false);
    }
  }, [getToken]);

  const load = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/sites/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          return false;
        }

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load");
        }

        const loadedSite = await res.json();
        setSite(loadedSite);
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
        return true;
      }
      catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
      finally {
        setIsLoading(false);
      }
    },
    [getToken, setSite],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    hasUnsavedChanges,
    isSaving,
    isLoading,
    error,
    save,
    load,
    clearError,
  };
}
