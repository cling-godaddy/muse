import { useMemo, useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Sparkles } from "lucide-react";
import type { Site, Page, SectionCategory, SectionPreset } from "@muse/core";
import { getAvailablePresets } from "../filtering";
import { CategoryGroup } from "./CategoryGroup";
import styles from "./SectionPicker.module.css";

interface SectionPickerProps {
  trigger: ReactNode
  site: Site
  currentPage: Page
  onPresetSelect: (presetId: string, generateWithAI: boolean) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_ORDER: SectionCategory[] = [
  "structural",
  "value",
  "showcase",
  "social-proof",
  "conversion",
  "content",
];

export function SectionPicker({
  trigger,
  site,
  currentPage,
  onPresetSelect,
  open,
  onOpenChange,
}: SectionPickerProps) {
  const [generateWithAI, setGenerateWithAI] = useState(false);

  const availablePresets = useMemo(
    () => getAvailablePresets(site, currentPage),
    [site, currentPage],
  );

  const presetsByCategory = useMemo(() => {
    const grouped: Record<SectionCategory, SectionPreset[]> = {
      "structural": [],
      "value": [],
      "showcase": [],
      "social-proof": [],
      "conversion": [],
      "content": [],
    };

    availablePresets.forEach((preset) => {
      grouped[preset.category].push(preset);
    });

    return grouped;
  }, [availablePresets]);

  const handlePresetSelect = (presetId: string) => {
    onPresetSelect(presetId, generateWithAI);
    onOpenChange(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        {trigger}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          side="bottom"
          align="center"
          sideOffset={8}
        >
          <div className={styles.header}>
            <label className={styles.aiToggle}>
              <span className={styles.aiToggleLabel}>Generate with AI</span>
              <input
                type="checkbox"
                checked={generateWithAI}
                onChange={e => setGenerateWithAI(e.target.checked)}
                aria-label="Toggle AI content generation"
              />
              <div className={styles.toggleTrack}>
                <div className={styles.toggleCircle}>
                  <Sparkles size={10} className={styles.toggleIcon} />
                </div>
              </div>
            </label>
          </div>
          {CATEGORY_ORDER.map(category => (
            <CategoryGroup
              key={category}
              category={category}
              presets={presetsByCategory[category]}
              onPresetSelect={handlePresetSelect}
            />
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
