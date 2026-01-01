import type { StatsBlock as StatsBlockType, StatItem } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Grid.module.css";

interface Props {
  block: StatsBlockType
  onUpdate: (data: Partial<StatsBlockType>) => void
}

export function Grid({ block, onUpdate }: Props) {
  const isEditable = useIsEditable();

  const updateStat = (index: number, data: Partial<StatItem>) => {
    const stats = block.stats.map((stat, i) =>
      i === index ? { ...stat, ...data } : stat,
    );
    onUpdate({ stats });
  };

  const addStat = () => {
    onUpdate({
      stats: [...block.stats, { value: "0", label: "Label" }],
    });
  };

  const removeStat = (index: number) => {
    onUpdate({ stats: block.stats.filter((_, i) => i !== index) });
  };

  return (
    <section className={styles.section}>
      <EditableText
        value={block.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="By the numbers"
      />

      <div className={styles.grid}>
        {block.stats.map((stat, i) => (
          <div key={i} className={styles.card}>
            {isEditable
              ? (
                <>
                  <div className={styles.valueRow}>
                    <input
                      type="text"
                      className={styles.prefix}
                      value={stat.prefix ?? ""}
                      onChange={e => updateStat(i, { prefix: e.target.value || undefined })}
                      placeholder="$"
                    />
                    <input
                      type="text"
                      className={styles.value}
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
                  <span className={styles.value}>
                    {stat.prefix}
                    {stat.value}
                    {stat.suffix}
                  </span>
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
