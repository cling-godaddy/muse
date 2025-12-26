import type { GalleryBlock as GalleryBlockType } from "@muse/core";

interface Props {
  block: GalleryBlockType
  onUpdate: (data: Partial<GalleryBlockType>) => void
}

export function Gallery({ block, onUpdate }: Props) {
  const columns = block.columns ?? 3;

  return (
    <div className="muse-block-gallery">
      {block.headline !== undefined && (
        <input
          type="text"
          className="muse-block-gallery-headline"
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      <div
        className="muse-block-gallery-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {block.images.map((image, i) => (
          <div key={i} className="muse-block-gallery-item">
            <img src={image.url} alt={image.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}
