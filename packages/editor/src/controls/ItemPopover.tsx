import { useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import styles from "./ItemPopover.module.css";

interface Props {
  /** The clickable element that opens the popover */
  trigger: ReactNode
  /** The popover content */
  children: ReactNode
  /** Additional className for the trigger wrapper */
  triggerClassName?: string
  /** Whether this item is visually selected */
  selected?: boolean
  /** Called when popover opens */
  onOpen?: () => void
  /** Popover placement side */
  side?: "top" | "bottom" | "left" | "right"
  /** Popover alignment */
  align?: "start" | "center" | "end"
}

export function ItemPopover({
  trigger,
  children,
  triggerClassName,
  selected,
  onOpen,
  side = "bottom",
  align = "center",
}: Props) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && onOpen) {
      onOpen();
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <div
          className={`${styles.trigger} ${triggerClassName ?? ""}`}
          data-state={open ? "open" : "closed"}
          data-selected={selected || undefined}
        >
          {trigger}
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          side={side}
          align={align}
          sideOffset={8}
        >
          {children}
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Styled field group for use inside ItemPopover */
export function PopoverField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

/** Styled input for use inside ItemPopover */
export function PopoverInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: "text" | "url" | "email"
}) {
  return (
    <input
      type={type}
      className={styles.input}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

/** Styled select for use inside ItemPopover */
export function PopoverSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: readonly T[] | T[]
}) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={e => onChange(e.target.value as T)}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

/** Action buttons row for use inside ItemPopover */
export function PopoverActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

/** Styled button for use inside ItemPopover */
export function PopoverButton({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode
  onClick: () => void
  variant?: "default" | "danger"
}) {
  return (
    <button
      type="button"
      className={`${styles.button} ${variant === "danger" ? styles.danger : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
