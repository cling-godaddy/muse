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
    | "logos"
    | "menu"
    | "products";

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
  min?: number
  max?: number
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

// Section data types

export interface SectionBase {
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

export interface HeroSection extends SectionBase {
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

export interface FeaturesSection extends SectionBase {
  type: "features"
  headline?: string
  items: FeatureItem[]
  columns?: 2 | 3 | 4
}

export interface CtaSection extends SectionBase {
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

export interface TestimonialsSection extends SectionBase {
  type: "testimonials"
  headline?: string
  quotes: Quote[]
}

export interface GallerySection extends SectionBase {
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

export interface PricingSection extends SectionBase {
  type: "pricing"
  headline?: string
  subheadline?: string
  plans: PricingPlan[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqSection extends SectionBase {
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

export interface ContactSection extends SectionBase {
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

export interface FooterSection extends SectionBase {
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

export interface AboutSection extends SectionBase {
  type: "about"
  headline?: string
  body?: string
  image?: ImageSource
  teamMembers?: TeamMember[]
}

export interface SubscribeSection extends SectionBase {
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

export interface StatsSection extends SectionBase {
  type: "stats"
  headline?: string
  stats: StatItem[]
}

export interface LogoItem {
  image: ImageSource
  href?: string
}

export interface LogosSection extends SectionBase {
  type: "logos"
  headline?: string
  logos: LogoItem[]
}

export interface MenuItem {
  name: string
  description?: string
  price: string
  tags?: string[]
  image?: ImageSource
}

export interface MenuCategory {
  name: string
  items: MenuItem[]
}

export interface MenuSection extends SectionBase {
  type: "menu"
  headline?: string
  subheadline?: string
  items?: MenuItem[]
  categories?: MenuCategory[]
}

export interface ProductItem {
  image: ImageSource
  name: string
  price: string
  originalPrice?: string
  rating?: number
  href?: string
  badge?: string
}

export interface ProductsSection extends SectionBase {
  type: "products"
  headline?: string
  subheadline?: string
  items: ProductItem[]
}

export type Section
  = | HeroSection
    | FeaturesSection
    | CtaSection
    | TestimonialsSection
    | GallerySection
    | PricingSection
    | FaqSection
    | ContactSection
    | FooterSection
    | AboutSection
    | SubscribeSection
    | StatsSection
    | LogosSection
    | MenuSection
    | ProductsSection;

export function isSectionType<T extends Section>(
  type: T["type"],
): (section: Section) => section is T {
  return (section): section is T => section.type === type;
}

export const isHeroSection = isSectionType<HeroSection>("hero");
export const isFeaturesSection = isSectionType<FeaturesSection>("features");
export const isCtaSection = isSectionType<CtaSection>("cta");
export const isTestimonialsSection = isSectionType<TestimonialsSection>("testimonials");
export const isGallerySection = isSectionType<GallerySection>("gallery");
export const isPricingSection = isSectionType<PricingSection>("pricing");
export const isFaqSection = isSectionType<FaqSection>("faq");
export const isContactSection = isSectionType<ContactSection>("contact");
export const isFooterSection = isSectionType<FooterSection>("footer");
export const isAboutSection = isSectionType<AboutSection>("about");
export const isSubscribeSection = isSectionType<SubscribeSection>("subscribe");
export const isStatsSection = isSectionType<StatsSection>("stats");
export const isLogosSection = isSectionType<LogosSection>("logos");
export const isMenuSection = isSectionType<MenuSection>("menu");
export const isProductsSection = isSectionType<ProductsSection>("products");
