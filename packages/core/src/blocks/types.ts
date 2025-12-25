export interface BlockBase {
  id: string
  type: string
  version?: number
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
}

export interface FeatureItem {
  icon?: string
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

export type Block = TextBlock | HeroBlock | FeaturesBlock | CtaBlock;

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
