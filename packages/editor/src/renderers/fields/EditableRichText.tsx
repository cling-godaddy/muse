import type { RichContent, TextOrRich } from "@muse/core";
import { RichEditable } from "../../ux/RichEditable";

interface Props {
  value: TextOrRich
  onChange: (value: RichContent) => void
  className?: string
  placeholder?: string
  elementType?: string
}

export function EditableRichText({
  value,
  onChange,
  className,
  placeholder,
  elementType,
}: Props) {
  return (
    <RichEditable
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      elementType={elementType}
    />
  );
}
