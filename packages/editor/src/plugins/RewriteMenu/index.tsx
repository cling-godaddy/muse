import * as Popover from "@radix-ui/react-popover";
import { Sparkles } from "lucide-react";
import { PRESET_CATEGORIES, type Preset } from "./presets";
import styles from "./RewriteMenu.module.css";

interface RewriteMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (preset: Preset) => void
  isLoading?: boolean
}

export function RewriteMenu({
  open,
  onOpenChange,
  onSelect,
  isLoading,
}: RewriteMenuProps) {
  const handleSelect = (preset: Preset) => {
    onSelect(preset);
    onOpenChange(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          disabled={isLoading}
          title="AI rewrite"
          data-rewrite-menu-trigger
        >
          {isLoading
            ? <span className={styles.spinner} />
            : <Sparkles size={14} />}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          side="bottom"
          align="end"
          sideOffset={8}
          data-rewrite-menu
        >
          <div className={styles.header}>
            <Sparkles size={14} />
            <span>AI Rewrite</span>
          </div>

          {PRESET_CATEGORIES.map(category => (
            <div key={category.id} className={styles.category}>
              <div className={styles.categoryLabel}>{category.label}</div>
              <div className={styles.presetGrid}>
                {category.presets.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.presetButton}
                    onClick={() => handleSelect(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export type { Preset } from "./presets";
