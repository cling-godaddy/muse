import type { SectionPreset } from "../types";

export const aboutStory: SectionPreset = {
  id: "about-story",
  name: "Story",
  sectionType: "about",
  layoutPattern: "centered",
  category: "content",
  mood: "warm",
  tags: ["narrative", "storytelling", "personal", "mission"],
  industries: ["startup", "agency", "nonprofit", "creative"],
  description: "Narrative company story. Mission-driven.",
  requiredFields: ["body"],
  optionalFields: ["headline", "image"],
  className: "muse-about--story",
  defaultBackground: "background",
  imageRequirements: { category: "ambient", count: 1, orientation: "horizontal" },
  imageInjection: { type: "single", field: "image" },
};

export const aboutTeam: SectionPreset = {
  id: "about-team",
  name: "Team Grid",
  sectionType: "about",
  layoutPattern: "grid",
  category: "content",
  mood: "professional",
  tags: ["team", "people", "faces", "bios"],
  industries: ["agency", "consulting", "corporate", "startup"],
  description: "Team member grid with photos and bios.",
  requiredFields: ["teamMembers"],
  optionalFields: ["headline"],
  className: "muse-about--team",
  defaultBackground: "backgroundAlt",
  imageRequirements: { category: "people", count: 6, orientation: "square" },
  imageInjection: { type: "nested", array: "teamMembers", field: "image" },
};

export const aboutPresets = {
  "about-story": aboutStory,
  "about-team": aboutTeam,
} as const;

export type AboutPresetId = keyof typeof aboutPresets;
