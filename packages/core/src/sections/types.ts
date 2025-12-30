export type SectionType
  = | "hero"
    | "features"
    | "testimonials"
    | "gallery"
    | "pricing"
    | "faq"
    | "contact"
    | "cta"
    | "footer"
    | "about"
    | "subscribe"
    | "stats"
    | "logos";

export type LayoutPattern
  = | "centered"
    | "split"
    | "grid"
    | "cards"
    | "carousel"
    | "masonry"
    | "alternating"
    | "accordion"
    | "banner"
    | "overlay"
    | "list"
    | "table";

export type SectionCategory
  = | "structural"
    | "value"
    | "social-proof"
    | "showcase"
    | "conversion"
    | "content";

export type ImageCategory = "ambient" | "subject" | "people";
export type ImageOrientation = "horizontal" | "vertical" | "square" | "mixed";

export interface ImageRequirements {
  category: ImageCategory
  count: number
  orientation: ImageOrientation
}

export interface SectionPreset {
  id: string
  name: string
  sectionType: SectionType
  layoutPattern: LayoutPattern
  category: SectionCategory

  mood: string
  tags: string[]
  industries: string[]
  description: string

  requiredFields: string[]
  optionalFields: string[]

  className: string

  imageRequirements?: ImageRequirements
}

export type PresetId = string;
