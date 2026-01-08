import type { SectionPreset } from "../types";

export const subscribeInline: SectionPreset = {
  id: "subscribe-inline",
  name: "Inline",
  sectionType: "subscribe",
  layoutPattern: "banner",
  category: "conversion",
  mood: "professional",
  tags: ["compact", "horizontal", "inline", "subtle"],
  industries: ["blog", "saas", "media", "newsletter"],
  description: "Horizontal input + button. Compact.",
  requiredFields: ["buttonText"],
  optionalFields: ["headline", "placeholderText", "disclaimer"],
  className: "muse-subscribe--inline",
  defaultBackground: "backgroundAlt",
};

export const subscribeCard: SectionPreset = {
  id: "subscribe-card",
  name: "Card",
  sectionType: "subscribe",
  layoutPattern: "centered",
  category: "conversion",
  mood: "friendly",
  tags: ["prominent", "centered", "focused", "elevated"],
  industries: ["startup", "newsletter", "education", "lifestyle"],
  description: "Centered card with headline. Prominent.",
  requiredFields: ["headline", "buttonText"],
  optionalFields: ["subheadline", "placeholderText", "disclaimer"],
  className: "muse-subscribe--card",
  defaultBackground: "backgroundAlt",
};

export const subscribeBanner: SectionPreset = {
  id: "subscribe-banner",
  name: "Banner",
  sectionType: "subscribe",
  layoutPattern: "banner",
  category: "conversion",
  mood: "bold",
  tags: ["full-width", "prominent", "bold", "attention"],
  industries: ["ecommerce", "media", "startup", "marketing"],
  description: "Full-width colored banner. High visibility.",
  requiredFields: ["headline", "buttonText"],
  optionalFields: ["subheadline", "placeholderText", "disclaimer"],
  className: "muse-subscribe--banner",
  defaultBackground: "backgroundAlt",
};

export const subscribePresets = {
  "subscribe-inline": subscribeInline,
  "subscribe-card": subscribeCard,
  "subscribe-banner": subscribeBanner,
} as const;

export type SubscribePresetId = keyof typeof subscribePresets;
