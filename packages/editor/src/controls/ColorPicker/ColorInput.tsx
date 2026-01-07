import { useState, useEffect } from "react";
import { isValidHex, normalizeHex } from "./utils";
import styles from "./ColorPicker.module.css";

interface ColorInputProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value);

  // sync when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    // auto-add # if user starts typing hex
    if (newValue && !newValue.startsWith("#")) {
      newValue = "#" + newValue;
    }
    setInputValue(newValue);
  };

  const handleBlur = () => {
    if (isValidHex(inputValue)) {
      const normalized = normalizeHex(inputValue);
      onChange(normalized);
      setInputValue(normalized);
    }
    else {
      // revert to current value
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <input
      type="text"
      className={styles.hexInput}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="#000000"
      aria-label="Hex color value"
      spellCheck={false}
      autoComplete="off"
    />
  );
}
