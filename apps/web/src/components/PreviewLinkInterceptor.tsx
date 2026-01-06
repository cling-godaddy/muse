interface Props {
  pageMap: Map<string, string>
  onNavigate: (pageId: string) => void
  children: React.ReactNode
}

export function PreviewLinkInterceptor({ pageMap, onNavigate, children }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    // skip external links
    if (href.startsWith("http") || href.startsWith("//")) return;

    // normalize: support both "/about" and "about" formats
    const normalizedHref = href.startsWith("/") ? href : `/${href}`;

    const pageId = pageMap.get(normalizedHref) ?? pageMap.get(href);
    if (pageId) {
      e.preventDefault();
      onNavigate(pageId);
    }
  };

  return <div onClickCapture={handleClick}>{children}</div>;
}
