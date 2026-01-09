import { createContext, useContext, type ReactNode } from "react";

interface SiteContextValue {
  siteId?: string
  pageSlugs: string[]
  onGeneratePage?: (slug: string) => void
}

const SiteContext = createContext<SiteContextValue>({ pageSlugs: [] });

interface SiteProviderProps {
  siteId?: string
  pageSlugs: string[]
  onGeneratePage?: (slug: string) => void
  children: ReactNode
}

export function SiteProvider({ siteId, pageSlugs, onGeneratePage, children }: SiteProviderProps) {
  return (
    <SiteContext.Provider value={{ siteId, pageSlugs, onGeneratePage }}>
      {children}
    </SiteContext.Provider>
  );
}

export function usePageExists(slug: string): boolean {
  const { pageSlugs } = useContext(SiteContext);
  return pageSlugs.includes(slug);
}

export function useGeneratePage(): ((slug: string) => void) | undefined {
  const { onGeneratePage } = useContext(SiteContext);
  return onGeneratePage;
}

export function useSiteContext(): SiteContextValue {
  return useContext(SiteContext);
}
