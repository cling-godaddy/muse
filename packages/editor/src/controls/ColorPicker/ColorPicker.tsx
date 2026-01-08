import { useState, useEffect, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { hexToHsv, hsvToHex, type HSV } from "@muse/core";
import { ColorSwatch } from "./ColorSwatch";
import { ColorArea } from "./ColorArea";
import { HueSlider } from "./HueSlider";
import { ColorInput } from "./ColorInput";
import styles from "./ColorPicker.module.css";

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
  ariaLabel?: string
  /** Which side the popover opens on. Default: "bottom" */
  side?: "top" | "right" | "bottom" | "left"
  /** Show only the color swatch, no hex value or chevron. Default: false */
  compact?: boolean
  /** Control open state externally. If undefined, uses internal state. */
  open?: boolean
  /** Called when popover open state changes */
  onOpenChange?: (open: boolean) => void
}

export function ColorPicker({
  value,
  onChange,
  disabled,
  ariaLabel,
  side = "bottom",
  compact = false,
  open: controlledOpen,
  onOpenChange,
}: ColorPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));

  // sync HSV when external value changes
  useEffect(() => {
    setHsv(hexToHsv(value));
  }, [value]);

  const updateColor = useCallback(
    (newHsv: HSV) => {
      setHsv(newHsv);
      onChange(hsvToHex(newHsv));
    },
    [onChange],
  );

  const handleSaturationBrightness = useCallback(
    (s: number, v: number) => {
      updateColor({ ...hsv, s, v });
    },
    [hsv, updateColor],
  );

  const handleHue = useCallback(
    (h: number) => {
      updateColor({ ...hsv, h });
    },
    [hsv, updateColor],
  );

  const handleHexChange = useCallback(
    (hex: string) => {
      setHsv(hexToHsv(hex));
      onChange(hex);
    },
    [onChange],
  );

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={compact ? styles.triggerCompact : styles.trigger}
          disabled={disabled}
          aria-label={ariaLabel ?? `Color picker, current color: ${value}`}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <ColorSwatch color={value} size={compact ? "xs" : "sm"} />
          {!compact && (
            <>
              <span className={styles.triggerValue}>{value}</span>
              <ChevronIcon />
            </>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          side={side}
          sideOffset={4}
          align="start"
          role="dialog"
          aria-label="Color picker"
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onFocusOutside={e => e.preventDefault()}
        >
          <ColorArea
            hue={hsv.h}
            saturation={hsv.s}
            brightness={hsv.v}
            onChange={handleSaturationBrightness}
          />

          <HueSlider hue={hsv.h} onChange={handleHue} />

          <div className={styles.inputRow}>
            <ColorInput value={value} onChange={handleHexChange} />
            <div className={styles.preview}>
              <ColorSwatch color={value} size="md" title="Current color" />
            </div>
          </div>

          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.chevron}>
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
