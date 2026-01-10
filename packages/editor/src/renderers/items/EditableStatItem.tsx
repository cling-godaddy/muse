import type { StatItem } from "@muse/core";
import { EditablePlainText } from "../fields/EditablePlainText";

interface Props {
  item: StatItem
  onChange: (item: StatItem) => void
  onRemove?: () => void
}

export function EditableStatItem({
  item,
  onChange,
  onRemove,
}: Props) {
  // Structure uses data attributes for CSS targeting (cross-package)
  // Stats.module.css styles these via [data-stat-*] selectors
  return (
    <>
      <div data-stat-value="">
        <EditablePlainText
          value={item.value}
          onChange={v => onChange({ ...item, value: v })}
          placeholder="100+"
        />
      </div>
      <div data-stat-label="">
        <EditablePlainText
          value={item.label}
          onChange={v => onChange({ ...item, label: v })}
          placeholder="Customers"
        />
      </div>
      {onRemove && (
        <button type="button" data-stat-remove="" onClick={onRemove}>
          ×
        </button>
      )}
    </>
  );
}
