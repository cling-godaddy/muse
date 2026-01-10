import type { ReactNode } from "react";
import type { Section } from "@muse/core";
import type { LayoutComponent } from "./sectionRegistry";
import { Field } from "./Field";
import { staticListRenderers } from "./items/StaticListItems";

interface Props {
  /** The section component to render */
  Component: LayoutComponent
  /** Section data */
  section: Section
  /** Additional class name */
  className?: string
}

/**
 * Renders a section in static (non-editable) mode.
 * Used for preview and published pages.
 *
 * For each field defined in the section's schema:
 * 1. Creates a Field with the current value
 * 2. Passes it to the section component via the slot prop
 */
export function StaticSection({
  Component,
  section,
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
      // Handle list fields with static item renderers
      const items = (value as unknown[]) ?? [];
      const key = `${section.type}:${fieldName}`;
      const renderer = staticListRenderers[key];

      if (renderer) {
        slots[fieldSchema.slot] = renderer(items, section.id, fieldName);
      }
      else {
        // Fallback: render placeholder
        slots[fieldSchema.slot] = (
          <div style={{ padding: "1rem", background: "#f0f0f0", borderRadius: "4px" }}>
            Static list rendering not implemented for
            {" "}
            {section.type}
            .
            {fieldName}
          </div>
        );
      }
    }
    else {
      slots[fieldSchema.slot] = (
        <Field
          key={fieldName}
          schema={fieldSchema}
          value={value}
          path={fieldName}
          sectionId={section.id}
        />
      );
    }
  }

  // Pass non-schema props (variant, className, etc.) directly
  const directProps: Record<string, unknown> = {
    className,
  };

  // Common props that sections might need but aren't in schema
  if ("variant" in section) directProps.variant = section.variant;
  if ("preset" in section) directProps.variant = (section.preset as string)?.replace(/^[^-]+-/, "");
  if ("backgroundColor" in section) directProps.backgroundColor = section.backgroundColor;
  if ("backgroundOverlay" in section) directProps.overlayOpacity = section.backgroundOverlay;
  if ("backgroundImage" in section && "backgroundImage" in (schema as Record<string, unknown>) === false) {
    const bg = (section as { backgroundImage?: { url: string } }).backgroundImage;
    if (bg?.url) directProps.backgroundImageUrl = bg.url;
  }

  return <Component {...slots} {...directProps} />;
}
