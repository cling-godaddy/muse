import { useRef, useLayoutEffect, useCallback, type ElementType } from "react";
import { useIsEditable } from "../context/EditorMode";
import { SmartLink } from "./SmartLink";

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

  const resize = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      void ref.current.offsetHeight; // force reflow
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);

  useLayoutEffect(() => {
    if (isEditable) {
      resize();
    }
  }, [value, isEditable, resize]);

  if (!isEditable) {
    if (!value) return null;
    return <Component className={className}>{value}</Component>;
  }

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ resize: "none", overflow: "hidden" }}
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
