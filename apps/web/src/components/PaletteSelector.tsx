import { useState, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { getAllPalettes, getPalette, paletteCategories, type ColorPalette, type PaletteCategory } from "@muse/themes";
import styles from "./PaletteSelector.module.css";

interface PaletteSelectorProps {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

const CATEGORY_LABELS: Record<PaletteCategory, string> = {
  warm: "Warm",
  cool: "Cool",
  nature: "Nature",
  neutral: "Neutral",
  vibrant: "Vibrant",
  luxury: "Luxury",
};

function groupByCategory(palettes: ColorPalette[]): Record<string, ColorPalette[]> {
  const groups: Record<string, ColorPalette[]> = {};
  for (const palette of palettes) {
    const category = palette.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(palette);
  }
  // Sort each group alphabetically
  for (const group of Object.values(groups)) {
    group.sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

function PaletteSwatch({ palette }: { palette: ColorPalette }) {
  return (
    <div className={styles.swatch}>
      <div className={styles.swatchColor} style={{ backgroundColor: palette.colors.primary }} />
      <div className={styles.swatchColor} style={{ backgroundColor: palette.colors.accent }} />
      <div className={styles.swatchColor} style={{ backgroundColor: palette.colors.background }} />
    </div>
  );
}

export function PaletteSelector({ value, onChange, disabled }: PaletteSelectorProps) {
  const [open, setOpen] = useState(false);
  const allPalettes = useMemo(() => getAllPalettes(), []);
  const grouped = useMemo(() => groupByCategory(allPalettes), [allPalettes]);
  const current = getPalette(value);

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
          {current && <PaletteSwatch palette={current} />}
          <span className={styles.triggerLabel}>
            {current?.name ?? "Select palette"}
          </span>
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
            {paletteCategories.map(category => (
              <div key={category} className={styles.category}>
                <div className={styles.categoryHeader}>{CATEGORY_LABELS[category]}</div>
                <div className={styles.grid}>
                  {grouped[category]?.map(palette => (
                    <button
                      key={palette.id}
                      type="button"
                      className={styles.item}
                      data-active={palette.id === value}
                      onClick={() => handleSelect(palette.id)}
                    >
                      <PaletteSwatch palette={palette} />
                      <span>{palette.name}</span>
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
