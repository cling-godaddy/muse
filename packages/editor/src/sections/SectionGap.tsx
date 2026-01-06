import { useState } from "react";
import { Plus } from "lucide-react";
import type { Site, Page } from "@muse/core";
import { SectionPicker } from "./SectionPicker";
import styles from "./SectionGap.module.css";

interface SectionGapProps {
  index: number
  site: Site
  currentPage: Page
  onAdd: (index: number, presetId: string) => void
}

export function SectionGap({ index, site, currentPage, onAdd }: SectionGapProps) {
  const [open, setOpen] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    onAdd(index, presetId);
  };

  return (
    <div className={styles.gap}>
      <div className={styles.divider} />
      <SectionPicker
        trigger={(
          <button
            type="button"
            className={styles.button}
            aria-label="Add section"
          >
            <Plus size={16} />
          </button>
        )}
        site={site}
        currentPage={currentPage}
        onPresetSelect={handlePresetSelect}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
