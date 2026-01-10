import styles from "./Progress.module.css";

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Progress({ value, max = 100, size = "md", className }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={`${styles.track} ${styles[size]}${className ? ` ${className}` : ""}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className={styles.bar} style={{ width: `${percent}%` }} />
    </div>
  );
}
