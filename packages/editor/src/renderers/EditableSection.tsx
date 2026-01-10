import type { ReactNode } from "react";
import type { Section, Usage, FeatureItem, StatItem, Quote, ImageSource, NavItem, ProductItem } from "@muse/core";
import type { LayoutComponent } from "./sectionRegistry";
import { EditableField } from "./EditableField";
import { EditableFeatureItem } from "./items/EditableFeatureItem";
import { EditableStatItem } from "./items/EditableStatItem";
import { EditableQuoteItem } from "./items/EditableQuoteItem";
import { EditableNavItem } from "./items/EditableNavItem";
import { EditableProductItem } from "./items/EditableProductItem";

interface Props {
  /** The section component to render */
  Component: LayoutComponent
  /** Section data */
  section: Section
  /** Callback when field values change */
  onUpdate: (changes: Partial<Section>) => void
  /** Optional callback for usage tracking (AI, images) */
  onUsage?: (usage: Usage) => void
  /** Additional class name */
  className?: string
}

/**
 * List item renderer function signature.
 * Maps items array to editable React components.
 */
type ListItemRenderer = (
  items: unknown[],
  updateItem: (index: number, item: unknown) => void,
  removeItem: (index: number) => void,
  onUsage?: (usage: Usage) => void,
) => ReactNode;

/**
 * Registry of list item renderers by "sectionType:fieldName" key.
 * Add new entries here to support additional list types.
 */
const listRenderers: Record<string, ListItemRenderer> = {
  "features:items": (items, updateItem, removeItem, onUsage) =>
    (items as FeatureItem[]).map((item, i) => (
      <EditableFeatureItem
        key={i}
        item={item}
        onChange={newItem => updateItem(i, newItem)}
        onRemove={() => removeItem(i)}
        onUsage={onUsage}
      />
    )),

  "stats:stats": (items, updateItem, removeItem) =>
    (items as StatItem[]).map((item, i) => (
      <EditableStatItem
        key={i}
        item={item}
        onChange={newItem => updateItem(i, newItem)}
        onRemove={() => removeItem(i)}
      />
    )),

  "testimonials:quotes": (items, updateItem, removeItem, onUsage) =>
    (items as Quote[]).map((item, i) => (
      <EditableQuoteItem
        key={i}
        item={item}
        onChange={newItem => updateItem(i, newItem)}
        onRemove={() => removeItem(i)}
        onUsage={onUsage}
      />
    )),

  "gallery:images": items =>
    (items as ImageSource[]).map((image, i) => (
      <img key={i} src={image.url} alt={image.alt} />
    )),

  "logos:logos": items =>
    (items as { image: ImageSource, href?: string }[]).map((logo, i) => (
      <img key={i} src={logo.image.url} alt={logo.image.alt} />
    )),

  "navbar:items": (items, updateItem, removeItem) =>
    (items as NavItem[]).map((item, i) => (
      <EditableNavItem
        key={i}
        item={item}
        onChange={newItem => updateItem(i, newItem)}
        onRemove={() => removeItem(i)}
      />
    )),

  "products:items": (items, updateItem, removeItem, onUsage) =>
    (items as ProductItem[]).map((item, i) => (
      <EditableProductItem
        key={i}
        item={item}
        onChange={newItem => updateItem(i, newItem)}
        onRemove={() => removeItem(i)}
        onUsage={onUsage}
      />
    )),
};

/**
 * Renders list items based on section type and field name.
 * Uses the listRenderers registry to find the appropriate renderer.
 */
function renderListItems(
  sectionType: string,
  fieldName: string,
  items: unknown[],
  onUpdate: (items: unknown[]) => void,
  onUsage?: (usage: Usage) => void,
): ReactNode {
  const updateItem = (index: number, item: unknown) => {
    const newItems = [...items];
    newItems[index] = item;
    onUpdate(newItems);
  };

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const key = `${sectionType}:${fieldName}`;
  const renderer = listRenderers[key];

  if (renderer) {
    return renderer(items, updateItem, removeItem, onUsage);
  }

  // Fallback: render placeholder for unknown list types
  return (
    <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "4px" }}>
      List editing not yet implemented for
      {" "}
      {sectionType}
      .
      {fieldName}
    </div>
  );
}

/**
 * Renders a section in edit mode by binding editable fields to slots.
 *
 * For each field defined in the section's schema:
 * 1. Creates an EditableField with the current value
 * 2. Passes it to the section component via the slot prop
 */
export function EditableSection({
  Component,
  section,
  onUpdate,
  onUsage,
  className,
}: Props) {
  const schema = Component.schema;
  const slots: Record<string, ReactNode> = {};

  // Build slot props from schema
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const value = (section as unknown as Record<string, unknown>)[fieldName];

    // Skip optional fields with no value
    if (fieldSchema.optional && (value === undefined || value === null)) {
      continue;
    }

    if (fieldSchema.type === "list") {
      // Handle list fields with specialized item renderers
      const items = (value as unknown[]) ?? [];
      slots[fieldSchema.slot] = renderListItems(
        section.type,
        fieldName,
        items,
        newItems => onUpdate({ [fieldName]: newItems } as Partial<Section>),
        onUsage,
      );
    }
    else {
      // Handle regular fields
      slots[fieldSchema.slot] = (
        <EditableField
          key={fieldName}
          schema={fieldSchema}
          value={value}
          onChange={v => onUpdate({ [fieldName]: v } as Partial<Section>)}
          onUsage={onUsage}
        />
      );
    }
  }

  // Pass non-schema props (variant, className, etc.) directly
  const directProps: Record<string, unknown> = {
    className,
  };

  // Map preset to variant (e.g., "hero-centered" -> "centered")
  if ("preset" in section && section.preset) {
    const preset = section.preset as string;
    // Extract variant from preset (everything after the first hyphen)
    const variant = preset.includes("-") ? preset.substring(preset.indexOf("-") + 1) : preset;
    directProps.variant = variant;
  }
  else if ("variant" in section) {
    directProps.variant = section.variant;
  }

  // Pass through other common props
  if ("backgroundColor" in section) directProps.backgroundColor = section.backgroundColor;
  if ("backgroundOverlay" in section) directProps.overlayOpacity = section.backgroundOverlay;
  if ("columns" in section) directProps.columns = section.columns;
  if ("sticky" in section) directProps.sticky = section.sticky;

  // Handle background image for overlay variants
  if ("backgroundImage" in section) {
    const bg = (section as { backgroundImage?: ImageSource }).backgroundImage;
    if (bg?.url) directProps.backgroundImageUrl = bg.url;
  }

  return <Component {...slots} {...directProps} />;
}
