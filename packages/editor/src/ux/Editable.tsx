import { useRef, useEffect, type ElementType } from "react";
import { type RichContent, type TextOrRich, getPlainText } from "@muse/core";
import { useIsEditable } from "../context/EditorMode";
import { SmartLink } from "./SmartLink";
import { RichEditable } from "./RichEditable";

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  as?: ElementType
  className?: string
  placeholder?: string
  rich?: false
}

interface RichEditableTextProps {
  value: TextOrRich
  onChange: (value: RichContent) => void
  as?: ElementType
  className?: string
  placeholder?: string
  rich: true
  hideLists?: boolean
}

type Props = EditableTextProps | RichEditableTextProps;

function PlainEditableText({
  value,
  onChange,
  as: Component = "span",
  className,
  placeholder,
}: EditableTextProps) {
  const isEditable = useIsEditable();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && isEditable) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, isEditable]);

  if (!isEditable) {
    if (!value) return null;
    return <Component className={className}>{value}</Component>;
  }

  return (
    <textarea
      ref={ref}
      className={className}
      rows={1}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ resize: "none" }}
    />
  );
}

function RichEditableText({
  value,
  onChange,
  as: Component = "span",
  className,
  placeholder,
  hideLists,
}: RichEditableTextProps) {
  const isEditable = useIsEditable();
  const plainText = getPlainText(value);

  if (!isEditable) {
    // TODO: render rich content properly when not editable
    if (!plainText) return null;
    return <Component className={className}>{plainText}</Component>;
  }

  return (
    <RichEditable
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      hideLists={hideLists}
    />
  );
}

export function EditableText(props: Props) {
  if (props.rich) {
    return <RichEditableText {...props} />;
  }
  return <PlainEditableText {...props} />;
}

interface EditableLinkProps {
  text: string
  href: string
  onTextChange: (text: string) => void
  className?: string
  placeholder?: string
}

export function EditableLink({
  text,
  href,
  onTextChange,
  className,
  placeholder,
}: EditableLinkProps) {
  const isEditable = useIsEditable();

  if (!isEditable) {
    if (!text) return null;
    return (
      <SmartLink href={href} className={className}>
        {text}
      </SmartLink>
    );
  }

  return (
    <input
      type="text"
      className={className}
      value={text}
      onChange={e => onTextChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
