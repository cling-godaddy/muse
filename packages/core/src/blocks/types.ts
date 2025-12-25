export interface BlockBase {
  id: string
  type: string
  version?: number
  preset?: string
}

export interface ImageSource {
  url: string
  alt: string
  provider?: string
  providerId?: string
}

export interface TextBlock extends BlockBase {
  type: "text"
  content: string
}

export interface HeroBlock extends BlockBase {
  type: "hero"
  headline: string
  subheadline?: string
  cta?: { text: string, href: string }
  secondaryCta?: { text: string, href: string }
  alignment?: "left" | "center" | "right"
  backgroundImage?: ImageSource
  backgroundOverlay?: number
}

export interface FeatureItem {
  icon?: string
  image?: ImageSource
  title: string
  description: string
}

export interface FeaturesBlock extends BlockBase {
  type: "features"
  headline?: string
  items: FeatureItem[]
  columns?: 2 | 3 | 4
}

export interface CtaBlock extends BlockBase {
  type: "cta"
  headline: string
  description?: string
  buttonText: string
  buttonHref: string
  variant?: "primary" | "secondary"
}

export interface ImageBlock extends BlockBase {
  type: "image"
  image: ImageSource
  caption?: string
  size?: "small" | "medium" | "large" | "full"
}

export interface Quote {
  text: string
  author: string
  role?: string
  company?: string
  avatar?: ImageSource
}

export interface TestimonialsBlock extends BlockBase {
  type: "testimonials"
  headline?: string
  quotes: Quote[]
}

export interface GalleryBlock extends BlockBase {
  type: "gallery"
  headline?: string
  images: ImageSource[]
  columns?: 2 | 3 | 4
}

export interface PricingPlan {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  cta?: { text: string, href: string }
  highlighted?: boolean
}

export interface PricingBlock extends BlockBase {
  type: "pricing"
  headline?: string
  subheadline?: string
  plans: PricingPlan[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqBlock extends BlockBase {
  type: "faq"
  headline?: string
  subheadline?: string
  items: FaqItem[]
}

export interface ContactBlock extends BlockBase {
  type: "contact"
  headline?: string
  subheadline?: string
  email?: string
  phone?: string
  address?: string
}

export type Block
  = | TextBlock
    | HeroBlock
    | FeaturesBlock
    | CtaBlock
    | ImageBlock
    | TestimonialsBlock
    | GalleryBlock
    | PricingBlock
    | FaqBlock
    | ContactBlock;

export type BlockType = Block["type"];

export function isBlockType<T extends Block>(
  type: T["type"],
): (block: Block) => block is T {
  return (block): block is T => block.type === type;
}

export const isTextBlock = isBlockType<TextBlock>("text");
export const isHeroBlock = isBlockType<HeroBlock>("hero");
export const isFeaturesBlock = isBlockType<FeaturesBlock>("features");
export const isCtaBlock = isBlockType<CtaBlock>("cta");
export const isImageBlock = isBlockType<ImageBlock>("image");
export const isTestimonialsBlock = isBlockType<TestimonialsBlock>("testimonials");
export const isGalleryBlock = isBlockType<GalleryBlock>("gallery");
export const isPricingBlock = isBlockType<PricingBlock>("pricing");
export const isFaqBlock = isBlockType<FaqBlock>("faq");
export const isContactBlock = isBlockType<ContactBlock>("contact");
