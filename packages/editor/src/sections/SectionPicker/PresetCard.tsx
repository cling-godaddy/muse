import type { SectionPreset } from "@muse/core";
import { LayoutPreview } from "./LayoutPreview";
import styles from "./SectionPicker.module.css";

interface PresetCardProps {
  preset: SectionPreset
  onClick: () => void
}

export function PresetCard({ preset, onClick }: PresetCardProps) {
  return (
    <button type="button" className={styles.presetCard} onClick={onClick}>
      <LayoutPreview layoutPattern={preset.layoutPattern} />
      <div className={styles.presetContent}>
        <div className={styles.presetName}>
          {preset.name}
        </div>
        <div className={styles.presetDescription}>
          {preset.description}
        </div>
      </div>
    </button>
  );
}
