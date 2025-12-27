import { getPresetsForType, getDefaultPreset, type SectionType } from "@muse/core";
import { Select } from "./Select";

interface Props {
  blockType: string
  currentPreset: string | undefined
  onChange: (presetId: string) => void
}

export function PresetPicker({ blockType, currentPreset, onChange }: Props) {
  const presets = getPresetsForType(blockType as SectionType);
  const defaultPreset = getDefaultPreset(blockType as SectionType);
  const selected = currentPreset ?? defaultPreset;

  if (presets.length === 0) return null;

  const options = presets.map(preset => ({
    value: preset.id,
    label: preset.name,
  }));

  return (
    <Select
      value={selected}
      options={options}
      onChange={onChange}
      ariaLabel="Select layout"
    />
  );
}
