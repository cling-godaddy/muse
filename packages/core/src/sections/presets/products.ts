import type { SectionPreset } from "../types";

export const productsGrid: SectionPreset = {
  id: "products-grid",
  name: "Grid",
  sectionType: "products",
  layoutPattern: "grid",
  category: "showcase",
  mood: "clean",
  tags: ["ecommerce", "catalog", "shop", "organized"],
  industries: ["ecommerce", "retail", "fashion", "marketplace"],
  description: "Standard product grid. Clean, scannable.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-products--grid",
  imageRequirements: { category: "subject", count: 8, orientation: "square" },
  imageInjection: { type: "nested", array: "items", field: "image" },
};

export const productsFeatured: SectionPreset = {
  id: "products-featured",
  name: "Featured",
  sectionType: "products",
  layoutPattern: "grid",
  category: "showcase",
  mood: "premium",
  tags: ["hero", "spotlight", "showcase", "highlight"],
  industries: ["ecommerce", "luxury", "fashion", "tech"],
  description: "Hero product with supporting grid. Spotlight style.",
  requiredFields: ["items"],
  optionalFields: ["headline", "subheadline"],
  className: "muse-products--featured",
  imageRequirements: { category: "subject", count: 5, orientation: "mixed" },
  imageInjection: { type: "nested", array: "items", field: "image" },
};

export const productsMinimal: SectionPreset = {
  id: "products-minimal",
  name: "Minimal",
  sectionType: "products",
  layoutPattern: "grid",
  category: "showcase",
  mood: "elegant",
  tags: ["minimal", "clean", "luxury", "highend"],
  industries: ["luxury", "fashion", "art", "design"],
  description: "Minimal cards. Image and price only. High-end feel.",
  requiredFields: ["items"],
  optionalFields: ["headline"],
  className: "muse-products--minimal",
  imageRequirements: { category: "subject", count: 6, orientation: "vertical" },
  imageInjection: { type: "nested", array: "items", field: "image" },
};

export const productsPresets = {
  "products-grid": productsGrid,
  "products-featured": productsFeatured,
  "products-minimal": productsMinimal,
} as const;

export type ProductsPresetId = keyof typeof productsPresets;
