import type { StatItem } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";

interface Props {
  item: StatItem
  onChange: (item: StatItem) => void
  onRemove?: () => void
  className?: string
}

export function EditableStatItem({
  item,
  onChange,
  onRemove,
  className,
}: Props) {
  return (
    <div className={className}>
      <EditablePlainText
        value={item.value}
        onChange={v => onChange({ ...item, value: v })}
        placeholder="100+"
      />
      <EditablePlainText
        value={item.label}
        onChange={v => onChange({ ...item, label: v })}
        placeholder="Customers"
      />
      {onRemove && (
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      )}
    </div>
  );
}
