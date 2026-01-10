import { ColorPicker } from "@muse/ui";

interface Props {
  value: string | undefined
  onChange: (value: string) => void
}

export function EditableColor({
  value,
  onChange,
}: Props) {
  return (
    <ColorPicker
      value={value ?? "#ffffff"}
      onChange={onChange}
      compact
    />
  );
}
