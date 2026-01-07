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
}

export function ColorPicker({
  value,
  onChange,
  disabled,
  ariaLabel,
  side = "bottom",
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          disabled={disabled}
          aria-label={ariaLabel ?? `Color picker, current color: ${value}`}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <ColorSwatch color={value} size="sm" />
          <span className={styles.triggerValue}>{value}</span>
          <ChevronIcon />
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
