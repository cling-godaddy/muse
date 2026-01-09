import type { ReactNode } from "react";
import type { FieldSchema } from "@muse/sections";
import type { TextOrRich, ImageSource } from "@muse/core";
import { getPlainText } from "@muse/core";
import { SmartLink } from "../ux/SmartLink";

interface Props {
  schema: FieldSchema
  value: unknown
  className?: string
}

/**
 * Renders static (non-editable) content based on field type.
 * Used for preview/publish modes.
 */
export function StaticField({
  schema,
  value,
  className,
}: Props): ReactNode {
  const { type } = schema;

  if (value === undefined || value === null) {
    return null;
  }

  switch (type) {
    case "text": {
      const text = value as string;
      if (!text) return null;
      return <span className={className}>{text}</span>;
    }

    case "rich-text": {
      const richValue = value as TextOrRich;
      const text = getPlainText(richValue);
      if (!text) return null;
      // TODO: properly render rich content (bold, links, etc.)
      // For now, just render plain text
      return <span className={className}>{text}</span>;
    }

    case "image": {
      const image = value as ImageSource;
      if (!image?.url) return null;
      return (
        <img
          src={image.url}
          alt={image.alt}
          className={className}
        />
      );
    }

    case "cta": {
      const cta = value as { text: string, href: string };
      if (!cta?.text) return null;
      return (
        <SmartLink href={cta.href} className={className}>
          {cta.text}
        </SmartLink>
      );
    }

    case "color":
      // Color fields don't render anything visible - they're config
      return null;

    case "list":
      // List fields need special handling - render children with StaticField
      console.warn("StaticField: list type not yet implemented");
      return null;

    default:
      console.warn(`StaticField: unknown type "${type}"`);
      return null;
  }
}
