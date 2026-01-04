export const BREAKPOINTS = {
  mobile: 390,
  mobileLandscape: 844,
  tablet: 768,
  tabletLandscape: 1024,
} as const;

export const PREVIEW_DEVICES = [
  { id: "mobile", label: "Mobile", width: 390, height: 844 },
  { id: "mobile-landscape", label: "Mobile Landscape", width: 844, height: 390 },
  { id: "tablet", label: "Tablet", width: 768, height: 1024 },
  { id: "tablet-landscape", label: "Tablet Landscape", width: 1024, height: 768 },
  { id: "desktop", label: "Desktop", width: null, height: null },
] as const;

export type PreviewDevice = typeof PREVIEW_DEVICES[number]["id"];
