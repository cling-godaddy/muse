import type { TypographyPreset } from "./typography/types";

const GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2";

export function buildGoogleFontsUrl(typography: TypographyPreset): string | null {
  if (!typography.googleFonts?.length) return null;

  const families = typography.googleFonts
    .map(f => `family=${f}`)
    .join("&");

  return `${GOOGLE_FONTS_BASE}?${families}&display=swap`;
}

let currentLinkId: string | null = null;

export function loadFonts(typography: TypographyPreset): void {
  const url = buildGoogleFontsUrl(typography);

  // remove previous font link if exists
  if (currentLinkId) {
    const existing = document.getElementById(currentLinkId);
    existing?.remove();
  }

  if (!url) return;

  const linkId = `muse-fonts-${typography.id}`;

  // check if already loaded
  if (document.getElementById(linkId)) {
    currentLinkId = linkId;
    return;
  }

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);

  currentLinkId = linkId;
}
