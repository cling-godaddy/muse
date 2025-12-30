import type { SectionPreset } from "../types";

export const statsRow: SectionPreset = {
  id: "stats-row",
  name: "Row",
  sectionType: "stats",
  layoutPattern: "list",
  category: "value",
  mood: "professional",
  tags: ["horizontal", "scannable", "compact", "clean"],
  industries: ["corporate", "saas", "finance", "consulting"],
  description: "Horizontal row of stats. Clean.",
  requiredFields: ["stats"],
  optionalFields: ["headline"],
  className: "muse-stats--row",
};

export const statsGrid: SectionPreset = {
  id: "stats-grid",
  name: "Grid",
  sectionType: "stats",
  layoutPattern: "grid",
  category: "value",
  mood: "professional",
  tags: ["balanced", "visual", "prominent", "organized"],
  industries: ["saas", "startup", "corporate", "technology"],
  description: "2x2 or 3x3 grid layout. Balanced.",
  requiredFields: ["stats"],
  optionalFields: ["headline"],
  className: "muse-stats--grid",
};

export const statsCounters: SectionPreset = {
  id: "stats-counters",
  name: "Counters",
  sectionType: "stats",
  layoutPattern: "cards",
  category: "value",
  mood: "bold",
  tags: ["animated", "large", "impactful", "dramatic"],
  industries: ["startup", "nonprofit", "marketing", "technology"],
  description: "Large animated counters. Impactful.",
  requiredFields: ["stats"],
  optionalFields: ["headline"],
  className: "muse-stats--counters",
};

export const statsPresets = {
  "stats-row": statsRow,
  "stats-grid": statsGrid,
  "stats-counters": statsCounters,
} as const;

export type StatsPresetId = keyof typeof statsPresets;
