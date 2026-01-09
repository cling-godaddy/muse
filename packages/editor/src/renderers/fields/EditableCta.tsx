interface CtaValue {
  text: string
  href: string
}

interface Props {
  value: CtaValue
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
  return (
    <input
      type="text"
      className={className}
      value={value.text}
      onChange={e => onChange({ ...value, text: e.target.value })}
      placeholder={placeholder}
    />
  );
}
