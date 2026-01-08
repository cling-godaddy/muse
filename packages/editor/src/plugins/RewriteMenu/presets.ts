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

// Context-aware preset mapping for smart suggestions
// Key format: "sectionType:elementType" or "*:elementType" for wildcards
const CONTEXT_PRESETS: Record<string, Preset[]> = {
  // Hero section
  "hero:headline": [
    { label: "more compelling", color: "orange" },
    { label: "add urgency", color: "orange" },
    { label: "shorter", color: "blue" },
    { label: "more confident", color: "green" },
  ],
  "hero:subheadline": [
    { label: "clearer", color: "blue" },
    { label: "more specific", color: "green" },
    { label: "add benefit", color: "orange" },
    { label: "shorter", color: "blue" },
  ],
  "hero:description": [
    { label: "clearer", color: "blue" },
    { label: "more specific", color: "green" },
    { label: "add social proof", color: "purple" },
    { label: "more compelling", color: "orange" },
  ],

  // Features section
  "features:headline": [
    { label: "more benefit-focused", color: "green" },
    { label: "shorter", color: "blue" },
    { label: "action-oriented", color: "orange" },
    { label: "clearer", color: "blue" },
  ],
  "features:title": [
    { label: "shorter", color: "blue" },
    { label: "more benefit-focused", color: "green" },
    { label: "action verb", color: "orange" },
  ],
  "features:description": [
    { label: "clearer", color: "blue" },
    { label: "more specific", color: "green" },
    { label: "add example", color: "purple" },
    { label: "shorter", color: "blue" },
  ],

  // Pricing section
  "pricing:headline": [
    { label: "highlight value", color: "orange" },
    { label: "clearer", color: "blue" },
    { label: "more compelling", color: "orange" },
  ],
  "pricing:description": [
    { label: "clearer", color: "blue" },
    { label: "highlight value", color: "orange" },
    { label: "more persuasive", color: "orange" },
  ],

  // About section
  "about:headline": [
    { label: "more personal", color: "green" },
    { label: "add warmth", color: "green" },
    { label: "shorter", color: "blue" },
  ],
  "about:description": [
    { label: "more personal", color: "green" },
    { label: "add story", color: "purple" },
    { label: "build trust", color: "green" },
    { label: "clearer", color: "blue" },
  ],

  // CTA section
  "cta:headline": [
    { label: "more urgent", color: "orange" },
    { label: "add benefit", color: "green" },
    { label: "more compelling", color: "orange" },
  ],
  "cta:description": [
    { label: "add urgency", color: "orange" },
    { label: "clearer", color: "blue" },
    { label: "more persuasive", color: "orange" },
  ],

  // Testimonials
  "testimonials:headline": [
    { label: "add social proof", color: "purple" },
    { label: "more compelling", color: "orange" },
    { label: "shorter", color: "blue" },
  ],

  // Wildcard element types (any section)
  "*:cta": [
    { label: "shorter", color: "blue" },
    { label: "more urgent", color: "orange" },
    { label: "action verb", color: "green" },
    { label: "add benefit", color: "purple" },
  ],
  "*:button": [
    { label: "shorter", color: "blue" },
    { label: "more urgent", color: "orange" },
    { label: "action verb", color: "green" },
  ],
};

/**
 * Get contextual presets based on section and element type.
 * Falls back to default presets if no specific match found.
 */
export function getContextualPresets(
  sectionType?: string,
  elementType?: string,
): Preset[] {
  if (!elementType) return PRESETS.slice(0, 8);

  // Try exact match first (e.g., "hero:headline")
  const exactKey = `${sectionType}:${elementType}`;
  if (CONTEXT_PRESETS[exactKey]) {
    return CONTEXT_PRESETS[exactKey];
  }

  // Try wildcard match (e.g., "*:cta")
  const wildcardKey = `*:${elementType}`;
  if (CONTEXT_PRESETS[wildcardKey]) {
    return CONTEXT_PRESETS[wildcardKey];
  }

  // Fallback to first 8 default presets
  return PRESETS.slice(0, 8);
}
