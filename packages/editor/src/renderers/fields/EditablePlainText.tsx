import { useRef, useEffect } from "react";

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function EditablePlainText({
  value,
  onChange,
  className,
  placeholder,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

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
