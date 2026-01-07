import styles from "./ColorPicker.module.css";

interface HueSliderProps {
  hue: number
  onChange: (hue: number) => void
}

export function HueSlider({ hue, onChange }: HueSliderProps) {
  return (
    <div className={styles.hueSlider}>
      <input
        type="range"
        min={0}
        max={360}
        value={hue}
        onChange={e => onChange(Number(e.target.value))}
        aria-label="Hue"
        className={styles.hueSliderInput}
      />
    </div>
  );
}
