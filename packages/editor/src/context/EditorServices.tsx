import { createContext, useContext, type ReactNode } from "react";
import type { Usage, Site } from "@muse/core";

interface EditorServicesValue {
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
  site?: Site
}

const EditorServicesContext = createContext<EditorServicesValue>({});

interface EditorServicesProviderProps {
  children: ReactNode
  getToken?: () => Promise<string | null>
  trackUsage?: (usage: Usage) => void
  site?: Site
}

export function EditorServicesProvider({
  children,
  getToken,
  trackUsage,
  site,
}: EditorServicesProviderProps) {
  return (
    <EditorServicesContext.Provider value={{ getToken, trackUsage, site }}>
      {children}
    </EditorServicesContext.Provider>
  );
}

export function useEditorServices(): EditorServicesValue {
  return useContext(EditorServicesContext);
}
