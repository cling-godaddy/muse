import type { ReactNode } from "react";
import type {
  FeatureItem,
  StatItem,
  Quote,
  ImageSource,
  NavItem,
  ProductItem,
  FooterLink,
  SocialLink,
  SocialPlatform,
  PricingPlan,
  FaqItem,
  FormField,
  TeamMember,
  MenuItem,
} from "@muse/core";
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Field } from "../Field";

const socialIcons: Record<SocialPlatform, LucideIcon> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  tiktok: Twitter, // fallback - lucide doesn't have tiktok
};

interface ItemProps {
  sectionId: string
  basePath: string
  index: number
}

/**
 * Renderer for FeatureItem
 */
export function FeatureItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: FeatureItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      {item.icon && (
        <Field
          schema={{ type: "text" }}
          value={item.icon}
          path={`${path}.icon`}
          sectionId={sectionId}
        />
      )}
      <Field
        schema={{ type: "image" }}
        value={item.image}
        path={`${path}.image`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.title}
        path={`${path}.title`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "rich-text" }}
        value={item.description}
        path={`${path}.description`}
        sectionId={sectionId}
      />
    </>
  );
}

/**
 * Renderer for StatItem
 */
export function StatItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: StatItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "text" }}
        value={item.value}
        path={`${path}.value`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.label}
        path={`${path}.label`}
        sectionId={sectionId}
      />
    </>
  );
}

/**
 * Renderer for Quote (Testimonial)
 */
export function QuoteItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: Quote }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "rich-text" }}
        value={item.text}
        path={`${path}.text`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "image" }}
        value={item.avatar}
        path={`${path}.avatar`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.author}
        path={`${path}.author`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.role}
        path={`${path}.role`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.company}
        path={`${path}.company`}
        sectionId={sectionId}
      />
    </>
  );
}

/**
 * Renderer for ProductItem
 */
export function ProductItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: ProductItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "image" }}
        value={item.image}
        path={`${path}.image`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.name}
        path={`${path}.name`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.price}
        path={`${path}.price`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.originalPrice}
        path={`${path}.originalPrice`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.badge}
        path={`${path}.badge`}
        sectionId={sectionId}
      />
    </>
  );
}

/**
 * Renderer for NavItem
 */
export function NavItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: NavItem }) {
  const path = `${basePath}[${index}]`;
  // NavItem is a CTA-like field with label + href
  return (
    <Field
      schema={{ type: "cta" }}
      value={{ text: item.label, href: item.href }}
      path={path}
      sectionId={sectionId}
    />
  );
}

/**
 * Renderer for gallery images
 */
export function GalleryImageRenderer({
  image,
  sectionId,
  basePath,
  index,
}: ItemProps & { image: ImageSource }) {
  const path = `${basePath}[${index}]`;
  return (
    <Field
      schema={{ type: "image" }}
      value={image}
      path={path}
      sectionId={sectionId}
    />
  );
}

/**
 * Renderer for logo items
 */
export function LogoItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: { image: ImageSource, href?: string } }) {
  const path = `${basePath}[${index}]`;
  return (
    <Field
      schema={{ type: "image" }}
      value={item.image}
      path={`${path}.image`}
      sectionId={sectionId}
    />
  );
}

/**
 * Renderer for FooterLink
 */
export function FooterLinkRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: FooterLink }) {
  const path = `${basePath}[${index}]`;
  return (
    <Field
      schema={{ type: "cta" }}
      value={{ text: item.label, href: item.href }}
      path={path}
      sectionId={sectionId}
    />
  );
}

/**
 * Renderer for SocialLink
 * Renders as a link with the appropriate social platform icon
 */
export function SocialLinkRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: SocialLink }) {
  const path = `${basePath}[${index}]`;
  const Icon = socialIcons[item.platform];
  return (
    <a
      href={item.href}
      data-editable-path={path}
      data-section-id={sectionId}
      data-field-type="cta"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.platform}
    >
      <Icon size={20} />
    </a>
  );
}

/**
 * Renderer for PricingPlan
 */
export function PricingPlanRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: PricingPlan }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "text" }}
        value={item.name}
        path={`${path}.name`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.price}
        path={`${path}.price`}
        sectionId={sectionId}
      />
      {item.period && (
        <Field
          schema={{ type: "text" }}
          value={item.period}
          path={`${path}.period`}
          sectionId={sectionId}
        />
      )}
      {item.description && (
        <Field
          schema={{ type: "rich-text" }}
          value={item.description}
          path={`${path}.description`}
          sectionId={sectionId}
        />
      )}
      {item.cta && (
        <Field
          schema={{ type: "cta" }}
          value={item.cta}
          path={`${path}.cta`}
          sectionId={sectionId}
        />
      )}
    </>
  );
}

/**
 * Renderer for FaqItem
 */
export function FaqItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: FaqItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "text" }}
        value={item.question}
        path={`${path}.question`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "rich-text" }}
        value={item.answer}
        path={`${path}.answer`}
        sectionId={sectionId}
      />
    </>
  );
}

/**
 * Renderer for TeamMember
 */
export function TeamMemberRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: TeamMember }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "text" }}
        value={item.name}
        path={`${path}.name`}
        sectionId={sectionId}
      />
      <Field
        schema={{ type: "text" }}
        value={item.role}
        path={`${path}.role`}
        sectionId={sectionId}
      />
      {item.image && (
        <Field
          schema={{ type: "image" }}
          value={item.image}
          path={`${path}.image`}
          sectionId={sectionId}
        />
      )}
      {item.bio && (
        <Field
          schema={{ type: "rich-text" }}
          value={item.bio}
          path={`${path}.bio`}
          sectionId={sectionId}
        />
      )}
    </>
  );
}

/**
 * Renderer for MenuItem
 */
export function MenuItemRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: MenuItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <Field
        schema={{ type: "text" }}
        value={item.name}
        path={`${path}.name`}
        sectionId={sectionId}
      />
      {item.description && (
        <Field
          schema={{ type: "rich-text" }}
          value={item.description}
          path={`${path}.description`}
          sectionId={sectionId}
        />
      )}
      <Field
        schema={{ type: "text" }}
        value={item.price}
        path={`${path}.price`}
        sectionId={sectionId}
      />
      {item.image && (
        <Field
          schema={{ type: "image" }}
          value={item.image}
          path={`${path}.image`}
          sectionId={sectionId}
        />
      )}
    </>
  );
}

/**
 * Renderer for FormField (contact forms)
 */
export function FormFieldRenderer({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: FormField }) {
  const path = `${basePath}[${index}]`;
  return (
    <Field
      schema={{ type: "text" }}
      value={item.label}
      path={`${path}.label`}
      sectionId={sectionId}
    />
  );
}

/**
 * Registry of list item renderers by "sectionType:fieldName" key.
 */
type ListRenderer = (
  items: unknown[],
  sectionId: string,
  fieldName: string,
) => ReactNode;

export const listRenderers: Record<string, ListRenderer> = {
  "features:items": (items, sectionId, fieldName) =>
    (items as FeatureItem[]).map((item, i) => (
      <FeatureItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "stats:stats": (items, sectionId, fieldName) =>
    (items as StatItem[]).map((item, i) => (
      <StatItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "testimonials:quotes": (items, sectionId, fieldName) =>
    (items as Quote[]).map((item, i) => (
      <QuoteItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "gallery:images": (items, sectionId, fieldName) =>
    (items as ImageSource[]).map((image, i) => (
      <GalleryImageRenderer
        key={i}
        image={image}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "logos:logos": (items, sectionId, fieldName) =>
    (items as { image: ImageSource, href?: string }[]).map((item, i) => (
      <LogoItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "navbar:items": (items, sectionId, fieldName) =>
    (items as NavItem[]).map((item, i) => (
      <NavItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "products:items": (items, sectionId, fieldName) =>
    (items as ProductItem[]).map((item, i) => (
      <ProductItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "footer:links": (items, sectionId, fieldName) =>
    (items as FooterLink[]).map((item, i) => (
      <FooterLinkRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "footer:socialLinks": (items, sectionId, fieldName) =>
    (items as SocialLink[]).map((item, i) => (
      <SocialLinkRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "pricing:plans": (items, sectionId, fieldName) =>
    (items as PricingPlan[]).map((item, i) => (
      <PricingPlanRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "faq:items": (items, sectionId, fieldName) =>
    (items as FaqItem[]).map((item, i) => (
      <FaqItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "about:teamMembers": (items, sectionId, fieldName) =>
    (items as TeamMember[]).map((item, i) => (
      <TeamMemberRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "menu:items": (items, sectionId, fieldName) =>
    (items as MenuItem[]).map((item, i) => (
      <MenuItemRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "contact:formFields": (items, sectionId, fieldName) =>
    (items as FormField[]).map((item, i) => (
      <FormFieldRenderer
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),
};
