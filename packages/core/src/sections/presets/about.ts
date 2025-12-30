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
  imageRequirements: { category: "ambient", count: 1, orientation: "horizontal" },
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
  imageRequirements: { category: "people", count: 6, orientation: "square" },
};

export const aboutSplit: SectionPreset = {
  id: "about-split",
  name: "Split",
  sectionType: "about",
  layoutPattern: "split",
  category: "content",
  mood: "modern",
  tags: ["visual", "balanced", "image", "text"],
  industries: ["product", "technology", "creative", "lifestyle"],
  description: "Image and text side by side.",
  requiredFields: ["body", "image"],
  optionalFields: ["headline"],
  className: "muse-about--split",
  imageRequirements: { category: "ambient", count: 1, orientation: "vertical" },
};

export const aboutPresets = {
  "about-story": aboutStory,
  "about-team": aboutTeam,
  "about-split": aboutSplit,
} as const;

export type AboutPresetId = keyof typeof aboutPresets;
