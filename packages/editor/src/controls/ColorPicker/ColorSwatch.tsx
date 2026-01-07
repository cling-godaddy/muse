import styles from "./ColorPicker.module.css";

interface ColorSwatchProps {
  color: string
  selected?: boolean
  onClick?: () => void
  size?: "sm" | "md" | "lg"
  ariaLabel?: string
  title?: string
}

export function ColorSwatch({
  color,
  selected,
  onClick,
  size = "md",
  ariaLabel,
  title,
}: ColorSwatchProps) {
  const sizeClass = styles[`swatch_${size}`];

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.swatch} ${sizeClass} ${selected ? styles.swatchSelected : ""}`}
        style={{ backgroundColor: color }}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={selected}
        title={title}
      />
    );
  }

  return (
    <span
      className={`${styles.swatch} ${sizeClass}`}
      style={{ backgroundColor: color }}
      title={title}
    />
  );
}
