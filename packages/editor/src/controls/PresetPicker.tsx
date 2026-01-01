import { getPresetsForType, getDefaultPreset, type SectionType } from "@muse/core";
import { Select } from "./Select";

interface Props {
  sectionType: string
  currentPreset: string | undefined
  onChange: (presetId: string) => void
}

export function PresetPicker({ sectionType, currentPreset, onChange }: Props) {
  const presets = getPresetsForType(sectionType as SectionType);
  const defaultPreset = getDefaultPreset(sectionType as SectionType);
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
