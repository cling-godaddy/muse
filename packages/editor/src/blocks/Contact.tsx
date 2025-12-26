import type { ContactBlock as ContactBlockType } from "@muse/core";

interface Props {
  block: ContactBlockType
  onUpdate: (data: Partial<ContactBlockType>) => void
}

export function Contact({ block, onUpdate }: Props) {
  return (
    <div className="muse-block-contact">
      {block.headline !== undefined && (
        <input
          type="text"
          className="muse-block-contact-headline"
          value={block.headline}
          onChange={e => onUpdate({ headline: e.target.value || undefined })}
          placeholder="Section headline..."
        />
      )}
      {block.subheadline !== undefined && (
        <input
          type="text"
          className="muse-block-contact-subheadline"
          value={block.subheadline}
          onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
          placeholder="Subheadline..."
        />
      )}
      <div className="muse-block-contact-info">
        <div className="muse-block-contact-field">
          <label>Email</label>
          <input
            type="email"
            value={block.email ?? ""}
            onChange={e => onUpdate({ email: e.target.value || undefined })}
            placeholder="contact@example.com"
          />
        </div>
        <div className="muse-block-contact-field">
          <label>Phone</label>
          <input
            type="tel"
            value={block.phone ?? ""}
            onChange={e => onUpdate({ phone: e.target.value || undefined })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="muse-block-contact-field">
          <label>Address</label>
          <textarea
            value={block.address ?? ""}
            onChange={e => onUpdate({ address: e.target.value || undefined })}
            placeholder="123 Main St, City, State 12345"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
