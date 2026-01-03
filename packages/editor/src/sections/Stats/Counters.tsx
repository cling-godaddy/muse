import { useEffect, useRef, useState } from "react";
import type { StatsSection as StatsSectionType, StatItem } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Counters.module.css";

interface Props {
  section: StatsSectionType
  onUpdate: (data: Partial<StatsSectionType>) => void
}

function parseAnimatable(value: string): { num: number, suffix: string, isFloat: boolean } | null {
  // Ratio patterns like "24/7" or "4.8/5" - don't animate
  if (/^\d+(\.\d+)?\/\d+$/.test(value)) return null;

  // Extract leading number and suffix
  const match = value.match(/^(\d+\.?\d*)(.*)$/);
  if (!match?.[1]) return null;

  const numStr = match[1];
  const suffix = match[2] ?? "";
  const isFloat = numStr.includes(".");
  const num = isFloat ? parseFloat(numStr) : parseInt(numStr, 10);
  if (isNaN(num)) return null;

  return { num, suffix, isFloat };
}

function AnimatedValue({ value }: { value: string }) {
  const parsed = parseAnimatable(value);
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const hasAnimated = useRef(false);

  const targetValue = parsed?.num ?? 0;
  const suffix = parsed?.suffix ?? "";
  const isFloat = parsed?.isFloat ?? false;
  const canAnimate = parsed !== null;

  useEffect(() => {
    if (!canAnimate || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? Math.round(targetValue * eased * 10) / 10
        : Math.round(targetValue * eased);
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [canAnimate, targetValue, isFloat]);

  if (!canAnimate) {
    return <span className={styles.value}>{value}</span>;
  }

  const formatted = isFloat
    ? displayValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : displayValue.toLocaleString();

  return (
    <span className={styles.value}>
      {formatted}
      {suffix}
    </span>
  );
}

export function Counters({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();

  const updateStat = (index: number, data: Partial<StatItem>) => {
    const stats = section.stats.map((stat, i) =>
      i === index ? { ...stat, ...data } : stat,
    );
    onUpdate({ stats });
  };

  const addStat = () => {
    onUpdate({
      stats: [...section.stats, { value: "0", label: "Label" }],
    });
  };

  const removeStat = (index: number) => {
    onUpdate({ stats: section.stats.filter((_, i) => i !== index) });
  };

  return (
    <section className={styles.section}>
      <EditableText
        value={section.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="By the numbers"
      />

      <div className={styles.counters}>
        {section.stats.map((stat, i) => (
          <div key={i} className={styles.counter}>
            {isEditable
              ? (
                <>
                  <input
                    type="text"
                    className={styles.valueInput}
                    value={stat.value}
                    onChange={e => updateStat(i, { value: e.target.value })}
                    placeholder="1500"
                  />
                  <textarea
                    className={styles.label}
                    value={stat.label}
                    onChange={e => updateStat(i, { label: e.target.value })}
                    placeholder="Customers"
                    rows={1}
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </>
              )
              : (
                <>
                  <AnimatedValue value={stat.value} />
                  <span className={styles.label}>{stat.label}</span>
                </>
              )}
          </div>
        ))}
      </div>

      {isEditable && (
        <button type="button" onClick={addStat} className={styles.addButton}>
          Add Stat
        </button>
      )}
    </section>
  );
}
