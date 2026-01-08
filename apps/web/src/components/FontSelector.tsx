import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { getAllTypography, getTypography } from "@muse/themes";
import styles from "./FontSelector.module.css";

interface FontSelectorProps {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function FontSelector({ value, onChange, disabled }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const allTypography = getAllTypography();
  const current = getTypography(value);

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
          <div className={styles.list}>
            {allTypography.map(typography => (
              <button
                key={typography.id}
                type="button"
                className={styles.item}
                data-active={typography.id === value}
                onClick={() => handleSelect(typography.id)}
              >
                {typography.name}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
