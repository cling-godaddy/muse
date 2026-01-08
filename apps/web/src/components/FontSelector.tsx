import { useState, useEffect, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { getAllTypography, getTypography, type TypographyPreset } from "@muse/themes";
import styles from "./FontSelector.module.css";

interface FontSelectorProps {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

const FONT_PREVIEW_LINK_ID = "font-selector-preview-fonts";

const CATEGORY_LABELS: Record<string, string> = {
  modern: "Modern",
  classic: "Classic",
  friendly: "Friendly",
  expressive: "Expressive",
};

const CATEGORY_ORDER = ["modern", "classic", "friendly", "expressive"];

function buildAllFontsUrl(presets: TypographyPreset[]): string {
  const allFamilies = new Set<string>();
  for (const preset of presets) {
    if (preset.googleFonts) {
      for (const font of preset.googleFonts) {
        allFamilies.add(font);
      }
    }
  }
  const families = Array.from(allFamilies).map(f => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function groupByCategory(presets: TypographyPreset[]): Record<string, TypographyPreset[]> {
  const groups: Record<string, TypographyPreset[]> = {};
  for (const preset of presets) {
    const category = preset.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(preset);
  }
  // Sort each group alphabetically
  for (const group of Object.values(groups)) {
    group.sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

export function FontSelector({ value, onChange, disabled }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const allTypography = useMemo(() => getAllTypography(), []);
  const grouped = useMemo(() => groupByCategory(allTypography), [allTypography]);
  const current = getTypography(value);

  // Load all fonts when popover opens
  useEffect(() => {
    if (!open) return;

    // Check if already loaded
    if (document.getElementById(FONT_PREVIEW_LINK_ID)) return;

    const url = buildAllFontsUrl(allTypography);
    const link = document.createElement("link");
    link.id = FONT_PREVIEW_LINK_ID;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }, [open, allTypography]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          disabled={disabled}
        >
          <span className={styles.triggerLabel}>{current?.name ?? "Select font"}</span>
          <ChevronDown size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          align="start"
          sideOffset={4}
        >
          <div className={styles.container}>
            {CATEGORY_ORDER.map(category => (
              <div key={category} className={styles.category}>
                <div className={styles.categoryHeader}>{CATEGORY_LABELS[category]}</div>
                <div className={styles.grid}>
                  {grouped[category]?.map(typography => (
                    <button
                      key={typography.id}
                      type="button"
                      className={styles.item}
                      data-active={typography.id === value}
                      onClick={() => handleSelect(typography.id)}
                      style={{ fontFamily: typography.fonts.heading }}
                    >
                      {typography.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
