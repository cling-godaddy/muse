export interface Preset {
  id: string
  label: string
  prompt: string
}

export interface PresetCategory {
  id: string
  label: string
  presets: Preset[]
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "tone",
    label: "Tone",
    presets: [
      { id: "clearer", label: "Clearer", prompt: "Rewrite this to be clearer" },
      { id: "shorter", label: "Shorter", prompt: "Make this shorter" },
      { id: "expanded", label: "Expanded", prompt: "Expand this section" },
      { id: "bullets", label: "Bullet points", prompt: "Turn this into bullet points" },
    ],
  },
  {
    id: "voice",
    label: "Voice",
    presets: [
      { id: "professional", label: "Professional", prompt: "Make this sound more professional" },
      { id: "friendly", label: "Friendly", prompt: "Make this more friendly" },
      { id: "confident", label: "Confident", prompt: "Make this more confident" },
    ],
  },
  {
    id: "business",
    label: "Business Copy",
    presets: [
      { id: "explain-business", label: "Explain business", prompt: "Explain what my business does more clearly" },
      { id: "differentiate", label: "Differentiate", prompt: "Highlight what makes my business different" },
      { id: "stronger-cta", label: "Stronger CTA", prompt: "Write a stronger call to action" },
      { id: "button-text", label: "Button text", prompt: "Rewrite this button text" },
      { id: "seo-optimize", label: "SEO optimize", prompt: "Optimize this for search engines" },
    ],
  },
];
