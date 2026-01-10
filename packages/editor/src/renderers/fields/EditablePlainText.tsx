import { useRef, useEffect } from "react";

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  /** Use single-line input instead of auto-sizing textarea */
  multiline?: boolean
}

export function EditablePlainText({
  value,
  onChange,
  className,
  placeholder,
  multiline = true,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current && multiline) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, multiline]);

  if (!multiline) {
    const textLength = (value ?? placeholder ?? "").length;
    return (
      <input
        type="text"
        className={className}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        size={Math.max(textLength, 2)}
      />
    );
  }

  return (
    <textarea
      ref={ref}
      className={className}
      rows={1}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ resize: "none" }}
    />
  );
}
