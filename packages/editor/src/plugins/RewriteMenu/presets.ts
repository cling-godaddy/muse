export interface Preset {
  label: string
  color: "blue" | "green" | "purple" | "orange"
}

// All presets shown as chips, colored by category
export const PRESETS: Preset[] = [
  // Tone - blue
  { label: "shorter", color: "blue" },
  { label: "clearer", color: "blue" },
  { label: "more detailed", color: "blue" },
  { label: "simpler", color: "blue" },
  // Voice - green
  { label: "more professional", color: "green" },
  { label: "more friendly", color: "green" },
  { label: "more confident", color: "green" },
  { label: "more casual", color: "green" },
  // Format - purple
  { label: "into bullet points", color: "purple" },
  { label: "into a numbered list", color: "purple" },
  { label: "into a headline", color: "purple" },
  { label: "into paragraphs", color: "purple" },
  // Style - orange
  { label: "sound like Apple marketing", color: "orange" },
  { label: "more urgent", color: "orange" },
  { label: "more persuasive", color: "orange" },
  { label: "SEO optimized", color: "orange" },
];
