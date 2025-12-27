import * as SelectPrimitive from "@radix-ui/react-select";
import styles from "./Select.module.css";

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

export function Select({ value, options, onChange, placeholder, ariaLabel }: Props) {
  const selectedOption = options.find(o => o.value === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className={styles.trigger} aria-label={ariaLabel}>
        <SelectPrimitive.Value placeholder={placeholder}>
          {selectedOption?.label}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className={styles.icon}>
          <ChevronIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className={styles.content} position="popper" sideOffset={4} side="bottom">
          <SelectPrimitive.Viewport className={styles.viewport}>
            {options.map(option => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={styles.item}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className={styles.indicator}>
                  <CheckIcon />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
