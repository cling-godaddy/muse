import type { ImageBlock as ImageBlockType } from "@muse/core";

interface Props {
  block: ImageBlockType
  onUpdate: (data: Partial<ImageBlockType>) => void
}

export function ImageBlock({ block, onUpdate }: Props) {
  const size = block.size ?? "medium";

  return (
    <div className={`muse-block-image muse-block-image--${size}`}>
      <div className="muse-block-image-container">
        <img
          src={block.image.url}
          alt={block.image.alt}
          className="muse-block-image-img"
        />
        {block.image.provider && (
          <span className="muse-block-image-attribution">
            via
            {" "}
            {block.image.provider}
          </span>
        )}
      </div>
      <input
        type="text"
        className="muse-block-image-caption"
        value={block.caption ?? ""}
        onChange={e => onUpdate({ caption: e.target.value || undefined })}
        placeholder="Add caption..."
      />
    </div>
  );
}
