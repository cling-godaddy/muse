import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { Site, Section } from "@muse/core";
import type { Message } from "../hooks/useChat";

const API_URL = "http://localhost:3001";

export function useSite(siteId: string | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      if (!siteId) throw new Error("No siteId");
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/sites/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load site");
      return res.json() as Promise<Site>;
    },
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveSite() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ site, messages }: { site: Site, messages: Message[] }) => {
      const token = await getToken();

      // Save site
      const siteRes = await fetch(`${API_URL}/api/sites/${site.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(site),
      });

      if (!siteRes.ok) {
        const data = await siteRes.json();
        throw new Error(data.error ?? "Failed to save site");
      }

      // Save messages
      if (messages.length > 0) {
        const storedMessages = messages.map((m, i) => ({
          id: m.id,
          siteId: site.id,
          role: m.role,
          content: m.content,
          createdAt: new Date(Date.now() + i).toISOString(),
          agents: m.agents,
          usage: m.usage,
        }));

        const msgRes = await fetch(`${API_URL}/api/messages/${site.id}`, {
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

      return siteRes.json() as Promise<Site>;
    },
    onSuccess: (savedSite) => {
      // Update cache directly (no refetch needed)
      queryClient.setQueryData(["site", savedSite.id], savedSite);
    },
  });
}

export function useSaveMessages() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ siteId, messages }: { siteId: string, messages: Message[] }) => {
      const token = await getToken();

      const storedMessages = messages.map((m, i) => ({
        id: m.id,
        siteId,
        role: m.role,
        content: m.content,
        createdAt: new Date(Date.now() + i).toISOString(),
        agents: m.agents,
        usage: m.usage,
      }));

      const res = await fetch(`${API_URL}/api/messages/${siteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: storedMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save messages");
      }

      return res.json();
    },
  });
}

export function usePatchSection() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ siteId, sectionId, updates }: { siteId: string, sectionId: string, updates: Partial<Section> }) => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/sites/${siteId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update section");
      }

      const result = await res.json() as { section: Section, pageId: string };
      return { ...result, siteId };
    },
    onSuccess: ({ section, pageId, siteId }) => {
      // Update the query cache so serverSite stays fresh
      queryClient.setQueryData<Site>(["site", siteId], (oldSite) => {
        if (!oldSite) return oldSite;

        const page = oldSite.pages[pageId];
        if (!page) return oldSite;

        return {
          ...oldSite,
          pages: {
            ...oldSite.pages,
            [pageId]: {
              ...page,
              sections: page.sections.map(s =>
                s.id === section.id ? section : s,
              ),
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });
    },
  });
}
