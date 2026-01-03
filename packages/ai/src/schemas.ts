import type { ResponseSchema } from "./types";

export const briefSchema: ResponseSchema = {
  name: "brand_brief",
  schema: {
    type: "object",
    properties: {
      targetAudience: { type: "string", description: "Who the site is for" },
      brandVoice: { type: "array", items: { type: "string" }, description: "3 adjectives describing the brand voice" },
      colorDirection: { type: "string", description: "Color palette guidance" },
      imageryStyle: { type: "string", description: "Visual style guidance" },
      constraints: { type: "array", items: { type: "string" }, description: "Specific requirements mentioned" },
    },
    required: ["targetAudience", "brandVoice", "colorDirection", "imageryStyle", "constraints"],
    additionalProperties: false,
  },
};

export const structureSchema: ResponseSchema = {
  name: "page_structure",
  schema: {
    type: "object",
    properties: {
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique section ID like section-1, section-2" },
            type: { type: "string", description: "Section type: hero, features, cta, testimonials, pricing, faq, gallery, contact, footer, about, subscribe, stats, logos, menu, products" },
            preset: { type: "string", description: "Preset ID for the section style" },
            purpose: { type: "string", description: "What this section should accomplish" },
          },
          required: ["id", "type", "preset", "purpose"],
          additionalProperties: false,
        },
      },
    },
    required: ["sections"],
    additionalProperties: false,
  },
};

export const themeSchema: ResponseSchema = {
  name: "theme_selection",
  schema: {
    type: "object",
    properties: {
      palette: { type: "string", description: "Color palette ID" },
      typography: { type: "string", description: "Typography preset ID" },
    },
    required: ["palette", "typography"],
    additionalProperties: false,
  },
};

export const sitemapSchema: ResponseSchema = {
  name: "sitemap_plan",
  schema: {
    type: "object",
    properties: {
      pages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            slug: { type: "string", description: "URL path like '/' or '/services/web-design'" },
            title: { type: "string", description: "Page title for meta and navigation" },
            purpose: { type: "string", description: "What this page should accomplish" },
            priority: { type: "string", enum: ["primary", "secondary"], description: "Primary pages get 5-8 sections, secondary get 3-5" },
            suggestedSections: {
              type: ["array", "null"],
              items: { type: "string" },
              description: "Suggested section types like hero, features, pricing",
            },
          },
          required: ["slug", "title", "purpose", "priority", "suggestedSections"],
          additionalProperties: false,
        },
      },
    },
    required: ["pages"],
    additionalProperties: false,
  },
};

// Helper for nullable string
const nullableString = { type: ["string", "null"] };

// CTA object - all fields required
const ctaObject = {
  type: ["object", "null"],
  properties: {
    text: { type: "string" },
    href: { type: "string" },
  },
  required: ["text", "href"],
  additionalProperties: false,
};

export const copySectionsSchema: ResponseSchema = {
  name: "copy_sections",
  schema: {
    type: "object",
    properties: {
      sections: {
        type: "array",
        items: {
          anyOf: [
            // Hero
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "hero" },
                headline: { type: "string" },
                subheadline: nullableString,
                cta: ctaObject,
                secondaryCta: ctaObject,
                alignment: { type: ["string", "null"], enum: ["left", "center", "right", null] },
              },
              required: ["id", "preset", "type", "headline", "subheadline", "cta", "secondaryCta", "alignment"],
              additionalProperties: false,
            },
            // Features
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "features" },
                headline: nullableString,
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      icon: nullableString,
                      title: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["icon", "title", "description"],
                    additionalProperties: false,
                  },
                },
                columns: { type: ["number", "null"], enum: [2, 3, 4, null] },
              },
              required: ["id", "preset", "type", "headline", "items", "columns"],
              additionalProperties: false,
            },
            // CTA
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "cta" },
                headline: { type: "string" },
                description: nullableString,
                buttonText: { type: "string" },
                buttonHref: { type: "string" },
                variant: { type: ["string", "null"], enum: ["primary", "secondary", null] },
              },
              required: ["id", "preset", "type", "headline", "description", "buttonText", "buttonHref", "variant"],
              additionalProperties: false,
            },
            // Testimonials
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "testimonials" },
                headline: nullableString,
                quotes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      author: { type: "string" },
                      role: nullableString,
                      company: nullableString,
                    },
                    required: ["text", "author", "role", "company"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "quotes"],
              additionalProperties: false,
            },
            // Gallery
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "gallery" },
                headline: nullableString,
                columns: { type: ["number", "null"], enum: [2, 3, 4, null] },
              },
              required: ["id", "preset", "type", "headline", "columns"],
              additionalProperties: false,
            },
            // Pricing
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "pricing" },
                headline: nullableString,
                subheadline: nullableString,
                plans: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "string" },
                      period: nullableString,
                      description: nullableString,
                      features: { type: "array", items: { type: "string" } },
                      cta: ctaObject,
                      highlighted: { type: ["boolean", "null"] },
                    },
                    required: ["name", "price", "period", "description", "features", "cta", "highlighted"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "subheadline", "plans"],
              additionalProperties: false,
            },
            // FAQ
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "faq" },
                headline: nullableString,
                subheadline: nullableString,
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                    required: ["question", "answer"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "subheadline", "items"],
              additionalProperties: false,
            },
            // Contact
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "contact" },
                headline: nullableString,
                subheadline: nullableString,
                email: nullableString,
                phone: nullableString,
                address: nullableString,
              },
              required: ["id", "preset", "type", "headline", "subheadline", "email", "phone", "address"],
              additionalProperties: false,
            },
            // Footer
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "footer" },
                companyName: nullableString,
                copyright: nullableString,
                links: {
                  type: ["array", "null"],
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      href: { type: "string" },
                    },
                    required: ["label", "href"],
                    additionalProperties: false,
                  },
                },
                socialLinks: {
                  type: ["array", "null"],
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      href: { type: "string" },
                    },
                    required: ["platform", "href"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "companyName", "copyright", "links", "socialLinks"],
              additionalProperties: false,
            },
            // About
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "about" },
                headline: nullableString,
                body: nullableString,
                teamMembers: {
                  type: ["array", "null"],
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      role: { type: "string" },
                      bio: nullableString,
                    },
                    required: ["name", "role", "bio"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "body", "teamMembers"],
              additionalProperties: false,
            },
            // Subscribe
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "subscribe" },
                headline: nullableString,
                subheadline: nullableString,
                buttonText: { type: "string" },
                placeholderText: nullableString,
                disclaimer: nullableString,
              },
              required: ["id", "preset", "type", "headline", "subheadline", "buttonText", "placeholderText", "disclaimer"],
              additionalProperties: false,
            },
            // Stats
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "stats" },
                headline: nullableString,
                stats: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      value: { type: "string", description: "Numeric value only, no symbols (e.g. '95', '10', '1500', '24')" },
                      label: { type: "string", description: "What the stat measures (e.g. 'Customers', 'Years Experience', 'Countries')" },
                      prefix: { type: ["string", "null"], description: "ONLY for monetary values: '$', '€', '£'. Use null for non-monetary stats (most cases)." },
                      suffix: { type: ["string", "null"], description: "Unit: '%' for percentages, '+' for more, 'K'/'M' for thousands/millions. Use null if not needed." },
                    },
                    required: ["value", "label", "prefix", "suffix"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "stats"],
              additionalProperties: false,
            },
            // Logos
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "logos" },
                headline: nullableString,
                logos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      alt: { type: "string" },
                      href: nullableString,
                    },
                    required: ["alt", "href"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "logos"],
              additionalProperties: false,
            },
            // Text
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "text" },
                content: { type: "string" },
              },
              required: ["id", "preset", "type", "content"],
              additionalProperties: false,
            },
            // Menu
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "menu" },
                headline: nullableString,
                subheadline: nullableString,
                // Flat items array - use for menu-cards preset (visual cards with images)
                items: {
                  type: ["array", "null"],
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: nullableString,
                      price: { type: "string" },
                      tags: { type: ["array", "null"], items: { type: "string" } },
                    },
                    required: ["name", "description", "price", "tags"],
                    additionalProperties: false,
                  },
                },
                // Nested categories - use for menu-list preset (text-based categorized menu)
                categories: {
                  type: ["array", "null"],
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: nullableString,
                            price: { type: "string" },
                            tags: { type: ["array", "null"], items: { type: "string" } },
                          },
                          required: ["name", "description", "price", "tags"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["name", "items"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "subheadline", "items", "categories"],
              additionalProperties: false,
            },
            // Products
            {
              type: "object",
              properties: {
                id: { type: "string" },
                preset: { type: "string" },
                type: { type: "string", const: "products" },
                headline: nullableString,
                subheadline: nullableString,
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "string" },
                      originalPrice: nullableString,
                      badge: nullableString,
                    },
                    required: ["name", "price", "originalPrice", "badge"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "preset", "type", "headline", "subheadline", "items"],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    required: ["sections"],
    additionalProperties: false,
  },
};
