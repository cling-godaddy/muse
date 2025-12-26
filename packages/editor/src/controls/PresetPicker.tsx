import { getPresetsForType, getDefaultPreset, type SectionType } from "@muse/core";

interface Props {
  blockType: string
  currentPreset: string | undefined
  onChange: (presetId: string) => void
}

const PRESET_BLOCK_TYPES: SectionType[] = [
  "hero",
  "features",
  "testimonials",
  "gallery",
  "pricing",
  "faq",
  "contact",
  "cta",
];

export function supportsPresets(blockType: string): boolean {
  return PRESET_BLOCK_TYPES.includes(blockType as SectionType);
}

export function PresetPicker({ blockType, currentPreset, onChange }: Props) {
  const presets = getPresetsForType(blockType as SectionType);
  const defaultPreset = getDefaultPreset(blockType as SectionType);
  const selected = currentPreset ?? defaultPreset;

  if (presets.length === 0) return null;

  return (
    <select
      className="muse-preset-picker"
      value={selected}
      onChange={e => onChange(e.target.value)}
      aria-label="Select layout"
    >
      {presets.map(preset => (
        <option key={preset.id} value={preset.id}>
          {preset.name}
        </option>
      ))}
    </select>
  );
}
