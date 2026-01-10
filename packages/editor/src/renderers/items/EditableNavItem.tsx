import type { NavItem } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";

interface Props {
  item: NavItem
  onChange: (item: NavItem) => void
  onRemove?: () => void
  className?: string
}

export function EditableNavItem({
  item,
  onChange,
  className,
}: Props) {
  return (
    <EditablePlainText
      value={item.label}
      onChange={label => onChange({ ...item, label })}
      className={className}
      placeholder="Link..."
    />
  );
}
