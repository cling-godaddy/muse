import { useState, useCallback, type ReactNode, type MouseEvent } from "react";
import { useSiteContext } from "../context/Site";
import { MissingPage } from "./MissingPage";

interface SmartLinkProps {
  href: string
  className?: string
  children: ReactNode
}

function isInternalLink(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function normalizeSlug(href: string): string {
  // Remove query string and hash
  const withoutQuery = href.split("?")[0] ?? href;
  const path = withoutQuery.split("#")[0] ?? withoutQuery;
  // Normalize trailing slash
  return path === "/" ? "/" : path.replace(/\/$/, "");
}

export function SmartLink({ href, className, children }: SmartLinkProps) {
  const { pageSlugs, onGeneratePage } = useSiteContext();
  const [showModal, setShowModal] = useState(false);
  const [missingSlug, setMissingSlug] = useState("");

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (!isInternalLink(href)) return;

    const slug = normalizeSlug(href);
    const exists = pageSlugs.includes(slug);

    if (!exists) {
      e.preventDefault();
      setMissingSlug(slug);
      setShowModal(true);
    }
  }, [href, pageSlugs]);

  const handleGenerate = useCallback(() => {
    setShowModal(false);
    onGeneratePage?.(missingSlug);
  }, [missingSlug, onGeneratePage]);

  return (
    <>
      <a href={href} className={className} onClick={handleClick}>
        {children}
      </a>
      <MissingPage
        open={showModal}
        slug={missingSlug}
        onClose={() => setShowModal(false)}
        onGenerate={handleGenerate}
      />
    </>
  );
}
