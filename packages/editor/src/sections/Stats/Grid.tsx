import type { StatsSection as StatsSectionType, StatItem, RichContent } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Grid.module.css";

interface Props {
  section: StatsSectionType
  onUpdate: (data: Partial<StatsSectionType>) => void
}

export function Grid({ section, onUpdate }: Props) {
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
    <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      <EditableText
        rich
        hideLists
        value={section.headline ?? ""}
        onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
        as="h2"
        className={styles.headline}
        placeholder="By the numbers"
      />

      <div className={styles.grid}>
        {section.stats.map((stat, i) => (
          <div key={i} className={styles.card}>
            {isEditable
              ? (
                <>
                  <input
                    type="text"
                    className={styles.value}
                    value={stat.value ?? ""}
                    onChange={e => updateStat(i, { value: e.target.value })}
                    placeholder="100+"
                  />
                  <textarea
                    className={styles.label}
                    value={stat.label ?? ""}
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
                  <span className={styles.value}>{stat.value}</span>
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
