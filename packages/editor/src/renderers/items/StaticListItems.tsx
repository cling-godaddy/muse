import type { ReactNode } from "react";
import type {
  FeatureItem,
  StatItem,
  Quote,
  ImageSource,
  NavItem,
  ProductItem,
} from "@muse/core";
import { getPlainText } from "@muse/core";

interface ItemProps {
  sectionId: string
  basePath: string
  index: number
}

function editAttrs(sectionId: string, path: string, fieldType: string) {
  return {
    "data-editable-path": path,
    "data-section-id": sectionId,
    "data-field-type": fieldType,
  };
}

/**
 * Static renderer for FeatureItem
 */
export function StaticFeatureItem({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: FeatureItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      {item.icon && (
        <span {...editAttrs(sectionId, `${path}.icon`, "text")}>{item.icon}</span>
      )}
      {item.image?.url && (
        <img
          src={item.image.url}
          alt={item.image.alt}
          {...editAttrs(sectionId, `${path}.image`, "image")}
        />
      )}
      <span {...editAttrs(sectionId, `${path}.title`, "text")}>{item.title}</span>
      <span {...editAttrs(sectionId, `${path}.description`, "rich-text")}>
        {getPlainText(item.description)}
      </span>
    </>
  );
}

/**
 * Static renderer for StatItem
 */
export function StaticStatItem({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: StatItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <span {...editAttrs(sectionId, `${path}.value`, "text")}>{item.value}</span>
      <span {...editAttrs(sectionId, `${path}.label`, "text")}>{item.label}</span>
    </>
  );
}

/**
 * Static renderer for Quote (Testimonial)
 */
export function StaticQuoteItem({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: Quote }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      <span {...editAttrs(sectionId, `${path}.text`, "rich-text")}>
        {getPlainText(item.text)}
      </span>
      {item.avatar?.url && (
        <img
          src={item.avatar.url}
          alt={item.author}
          {...editAttrs(sectionId, `${path}.avatar`, "image")}
        />
      )}
      <span {...editAttrs(sectionId, `${path}.author`, "text")}>{item.author}</span>
      {item.role && (
        <span {...editAttrs(sectionId, `${path}.role`, "text")}>{item.role}</span>
      )}
      {item.company && (
        <span {...editAttrs(sectionId, `${path}.company`, "text")}>{item.company}</span>
      )}
    </>
  );
}

/**
 * Static renderer for ProductItem
 */
export function StaticProductItem({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: ProductItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <>
      {item.image?.url && (
        <img
          src={item.image.url}
          alt={item.name}
          {...editAttrs(sectionId, `${path}.image`, "image")}
        />
      )}
      <span {...editAttrs(sectionId, `${path}.name`, "text")}>{item.name}</span>
      <span {...editAttrs(sectionId, `${path}.price`, "text")}>{item.price}</span>
      {item.originalPrice && (
        <span {...editAttrs(sectionId, `${path}.originalPrice`, "text")}>
          {item.originalPrice}
        </span>
      )}
      {item.badge && (
        <span {...editAttrs(sectionId, `${path}.badge`, "text")}>
          {item.badge}
        </span>
      )}
    </>
  );
}

/**
 * Static renderer for NavItem
 */
export function StaticNavItem({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: NavItem }) {
  const path = `${basePath}[${index}]`;
  return (
    <a
      href={item.href}
      {...editAttrs(sectionId, `${path}.label`, "text")}
    >
      {item.label}
    </a>
  );
}

/**
 * Static renderer for gallery images
 */
export function StaticGalleryImage({
  image,
  sectionId,
  basePath,
  index,
}: ItemProps & { image: ImageSource }) {
  const path = `${basePath}[${index}]`;
  return (
    <img
      src={image.url}
      alt={image.alt}
      {...editAttrs(sectionId, path, "image")}
    />
  );
}

/**
 * Static renderer for logo items
 */
export function StaticLogoItem({
  item,
  sectionId,
  basePath,
  index,
}: ItemProps & { item: { image: ImageSource, href?: string } }) {
  const path = `${basePath}[${index}]`;
  return (
    <img
      src={item.image.url}
      alt={item.image.alt}
      {...editAttrs(sectionId, `${path}.image`, "image")}
    />
  );
}

/**
 * Registry of static list item renderers by "sectionType:fieldName" key.
 */
type StaticListRenderer = (
  items: unknown[],
  sectionId: string,
  fieldName: string,
) => ReactNode;

export const staticListRenderers: Record<string, StaticListRenderer> = {
  "features:items": (items, sectionId, fieldName) =>
    (items as FeatureItem[]).map((item, i) => (
      <StaticFeatureItem
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "stats:stats": (items, sectionId, fieldName) =>
    (items as StatItem[]).map((item, i) => (
      <StaticStatItem
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "testimonials:quotes": (items, sectionId, fieldName) =>
    (items as Quote[]).map((item, i) => (
      <StaticQuoteItem
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "gallery:images": (items, sectionId, fieldName) =>
    (items as ImageSource[]).map((image, i) => (
      <StaticGalleryImage
        key={i}
        image={image}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "logos:logos": (items, sectionId, fieldName) =>
    (items as { image: ImageSource, href?: string }[]).map((item, i) => (
      <StaticLogoItem
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "navbar:items": (items, sectionId, fieldName) =>
    (items as NavItem[]).map((item, i) => (
      <StaticNavItem
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),

  "products:items": (items, sectionId, fieldName) =>
    (items as ProductItem[]).map((item, i) => (
      <StaticProductItem
        key={i}
        item={item}
        sectionId={sectionId}
        basePath={fieldName}
        index={i}
      />
    )),
};
