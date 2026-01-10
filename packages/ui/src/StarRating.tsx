import styles from "./StarRating.module.css";

interface StarRatingProps {
  /** Rating value (e.g., 4.8) */
  rating: number
  /** Maximum rating (default: 5) */
  max?: number
  /** Size in pixels (default: 16) */
  size?: number
  /** Optional className */
  className?: string
}

export function StarRating({
  rating,
  max = 5,
  size = 16,
  className,
}: StarRatingProps) {
  const percentage = Math.min(Math.max((rating / max) * 100, 0), 100);
  const stars = "★".repeat(max);

  return (
    <span
      className={`${styles.container} ${className ?? ""}`}
      style={{
        "fontSize": size,
        "--star-fill-percent": `${percentage}%`,
      } as React.CSSProperties}
      aria-label={`${rating} out of ${max} stars`}
    >
      <span className={styles.empty} aria-hidden="true">{stars}</span>
      <span className={styles.filled} aria-hidden="true">{stars}</span>
    </span>
  );
}
