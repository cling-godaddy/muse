import { useEffect, useRef, useState } from "react";
import type { StatsSection as StatsSectionType, StatItem } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Counters.module.css";

interface Props {
  section: StatsSectionType
  onUpdate: (data: Partial<StatsSectionType>) => void
}

function parseNumericValue(value: string): number {
  const parsed = parseInt(value.replace(/[^0-9.-]/g, ""), 10);
  return isNaN(parsed) ? 0 : parsed;
}

function AnimatedValue({ value, prefix, suffix }: { value: string, prefix?: string, suffix?: string }) {
  const targetValue = parseNumericValue(value);
  const [displayValue, setDisplayValue] = useState(targetValue);
  const frameRef = useRef<number | undefined>(undefined);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate on first mount
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetValue * eased);
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
  }, [targetValue]);

  return (
    <span className={styles.value}>
      {prefix}
      {displayValue.toLocaleString()}
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
                  <div className={styles.valueRow}>
                    <input
                      type="text"
                      className={styles.prefix}
                      value={stat.prefix ?? ""}
                      onChange={e => updateStat(i, { prefix: e.target.value || undefined })}
                      placeholder=""
                    />
                    <input
                      type="text"
                      className={styles.valueInput}
                      value={stat.value}
                      onChange={e => updateStat(i, { value: e.target.value })}
                      placeholder="100"
                    />
                    <input
                      type="text"
                      className={styles.suffix}
                      value={stat.suffix ?? ""}
                      onChange={e => updateStat(i, { suffix: e.target.value || undefined })}
                      placeholder="+"
                    />
                  </div>
                  <input
                    type="text"
                    className={styles.label}
                    value={stat.label}
                    onChange={e => updateStat(i, { label: e.target.value })}
                    placeholder="Customers"
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
                  <AnimatedValue
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
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
