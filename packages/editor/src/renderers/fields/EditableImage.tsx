import type { ImageSource, Usage } from "@muse/core";
import { Image } from "../../controls/Image";

interface Props {
  value: ImageSource | undefined
  onChange: (value: ImageSource) => void
  onRemove?: () => void
  onUsage?: (usage: Usage) => void
  className?: string
  trigger?: React.ReactNode
}

export function EditableImage({
  value,
  onChange,
  onRemove,
  onUsage,
  className,
  trigger,
}: Props) {
  return (
    <Image
      image={value}
      onUpdate={onChange}
      onRemove={onRemove}
      onUsage={onUsage}
      className={className}
      trigger={trigger}
    />
  );
}
