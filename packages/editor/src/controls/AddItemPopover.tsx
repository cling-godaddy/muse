import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Sparkles } from "lucide-react";
import styles from "./AddItemPopover.module.css";

interface AddItemPopoverProps {
  itemType: string
  onAdd: (useAI: boolean) => void
  disabled?: boolean
}

export function AddItemPopover({ itemType, onAdd, disabled }: AddItemPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (useAI: boolean) => {
    onAdd(useAI);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className={styles.addButton} disabled={disabled}>
          + Add
          {" "}
          {itemType}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.popover} align="center" sideOffset={4}>
          <div className={styles.header}>
            Add
            {itemType}
          </div>
          <button
            type="button"
            className={styles.option}
            onClick={() => handleSelect(false)}
          >
            <div className={styles.optionIcon}>○</div>
            <div className={styles.optionContent}>
              <div className={styles.optionLabel}>Blank</div>
              <div className={styles.optionDescription}>Start with empty fields</div>
            </div>
          </button>
          <button
            type="button"
            className={styles.option}
            onClick={() => handleSelect(true)}
          >
            <div className={styles.optionIcon}>
              <Sparkles size={14} />
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionLabel}>Generate with AI</div>
              <div className={styles.optionDescription}>Create example based on context</div>
            </div>
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
