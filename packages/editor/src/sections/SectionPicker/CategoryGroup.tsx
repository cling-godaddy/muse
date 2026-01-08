import type { SectionCategory, SectionPreset } from "@muse/core";
import { PresetCard } from "./PresetCard";
import styles from "./SectionPicker.module.css";

interface CategoryGroupProps {
  category: SectionCategory
  presets: SectionPreset[]
  onPresetSelect: (presetId: string) => void
}

const CATEGORY_LABELS: Record<SectionCategory, string> = {
  "structural": "Structural",
  "value": "Value Proposition",
  "showcase": "Showcase",
  "social-proof": "Social Proof",
  "conversion": "Conversion",
  "content": "Content",
};

export function CategoryGroup({ category, presets, onPresetSelect }: CategoryGroupProps) {
  if (presets.length === 0) return null;

  return (
    <div className={styles.category}>
      <div className={styles.categoryLabel}>
        {CATEGORY_LABELS[category]}
      </div>
      <div className={styles.presetsGrid}>
        {presets.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onClick={() => onPresetSelect(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}
