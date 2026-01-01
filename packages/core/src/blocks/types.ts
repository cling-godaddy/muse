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

export interface FormField {
  name: string
  type: "text" | "email" | "textarea"
  label: string
  placeholder?: string
  required?: boolean
}

export interface ContactBlock extends BlockBase {
  type: "contact"
  headline?: string
  subheadline?: string
  email?: string
  phone?: string
  address?: string
  formHeadline?: string
  formFields?: FormField[]
  submitText?: string
}

export interface FooterLink {
  label: string
  href: string
}

export type SocialPlatform = "twitter" | "facebook" | "instagram" | "linkedin" | "youtube" | "github" | "tiktok";

export interface SocialLink {
  platform: SocialPlatform
  href: string
}

export interface FooterBlock extends BlockBase {
  type: "footer"
  companyName?: string
  copyright?: string
  links?: FooterLink[]
  socialLinks?: SocialLink[]
}

export interface TeamMember {
  name: string
  role: string
  image?: ImageSource
  bio?: string
}

export interface AboutBlock extends BlockBase {
  type: "about"
  headline?: string
  body?: string
  image?: ImageSource
  teamMembers?: TeamMember[]
}

export interface SubscribeBlock extends BlockBase {
  type: "subscribe"
  headline?: string
  subheadline?: string
  buttonText: string
  placeholderText?: string
  disclaimer?: string
}

export interface StatItem {
  value: string
  label: string
  prefix?: string
  suffix?: string
}

export interface StatsBlock extends BlockBase {
  type: "stats"
  headline?: string
  stats: StatItem[]
}

export interface LogoItem {
  image: ImageSource
  href?: string
}

export interface LogosBlock extends BlockBase {
  type: "logos"
  headline?: string
  logos: LogoItem[]
}

export type Block
  = | HeroBlock
    | FeaturesBlock
    | CtaBlock
    | TestimonialsBlock
    | GalleryBlock
    | PricingBlock
    | FaqBlock
    | ContactBlock
    | FooterBlock
    | AboutBlock
    | SubscribeBlock
    | StatsBlock
    | LogosBlock;

export type BlockType = Block["type"];

export function isBlockType<T extends Block>(
  type: T["type"],
): (block: Block) => block is T {
  return (block): block is T => block.type === type;
}

export const isHeroBlock = isBlockType<HeroBlock>("hero");
export const isFeaturesBlock = isBlockType<FeaturesBlock>("features");
export const isCtaBlock = isBlockType<CtaBlock>("cta");
export const isTestimonialsBlock = isBlockType<TestimonialsBlock>("testimonials");
export const isGalleryBlock = isBlockType<GalleryBlock>("gallery");
export const isPricingBlock = isBlockType<PricingBlock>("pricing");
export const isFaqBlock = isBlockType<FaqBlock>("faq");
export const isContactBlock = isBlockType<ContactBlock>("contact");
export const isFooterBlock = isBlockType<FooterBlock>("footer");
export const isAboutBlock = isBlockType<AboutBlock>("about");
export const isSubscribeBlock = isBlockType<SubscribeBlock>("subscribe");
export const isStatsBlock = isBlockType<StatsBlock>("stats");
export const isLogosBlock = isBlockType<LogosBlock>("logos");
