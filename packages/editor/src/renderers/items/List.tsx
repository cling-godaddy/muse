import type { ReactNode } from "react";
import type {
  FeatureItem,
  StatItem,
  Quote,
  ImageSource,
  NavItem,
  ProductItem,
} from "@muse/core";
import { Field } from "../Field";

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
};
