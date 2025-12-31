import { useRef, useEffect, type ElementType } from "react";
import { useIsEditable } from "../context/EditorModeContext";

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  as?: ElementType
  className?: string
  placeholder?: string
}

export function EditableText({
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
    />
  );
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
      <a href={href} className={className}>
        {text}
      </a>
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
