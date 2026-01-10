interface CtaValue {
  text: string
  href: string
}

interface Props {
  value: CtaValue | undefined
  onChange: (value: CtaValue) => void
  className?: string
  placeholder?: string
}

export function EditableCta({
  value,
  onChange,
  className,
  placeholder,
}: Props) {
  const text = value?.text ?? "";
  const href = value?.href ?? "";

  return (
    <input
      type="text"
      className={className}
      value={text}
      onChange={e => onChange({ text: e.target.value, href })}
      placeholder={placeholder}
    />
  );
}
