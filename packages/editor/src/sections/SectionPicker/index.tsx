import { useMemo, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { Site, Page, SectionCategory, SectionPreset } from "@muse/core";
import { getAvailablePresets } from "../filtering";
import { CategoryGroup } from "./CategoryGroup";
import styles from "./SectionPicker.module.css";

interface SectionPickerProps {
  trigger: ReactNode
  site: Site
  currentPage: Page
  onPresetSelect: (presetId: string) => void
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
    onPresetSelect(presetId);
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
