import type { SubscribeBlock as SubscribeBlockType } from "@muse/core";
import { useAutoResize } from "../hooks";
import styles from "./Subscribe.module.css";

interface Props {
  block: SubscribeBlockType
  onUpdate: (data: Partial<SubscribeBlockType>) => void
}

export function Subscribe({ block, onUpdate }: Props) {
  const headlineRef = useAutoResize(block.headline ?? "");

  return (
    <div className={styles.section}>
      <textarea
        ref={headlineRef}
        className={styles.headline}
        rows={1}
        value={block.headline ?? ""}
        onChange={e => onUpdate({ headline: e.target.value || undefined })}
        placeholder="Stay in the loop"
      />
      <input
        type="text"
        className={styles.subheadline}
        value={block.subheadline ?? ""}
        onChange={e => onUpdate({ subheadline: e.target.value || undefined })}
        placeholder="Join 10,000+ subscribers"
      />

      <div className={styles.form}>
        <input
          type="text"
          className={styles.emailInput}
          value={block.placeholderText ?? ""}
          onChange={e => onUpdate({ placeholderText: e.target.value || undefined })}
          placeholder="Enter your email"
        />
        <div className={styles.button}>
          <input
            type="text"
            value={block.buttonText}
            onChange={e => onUpdate({ buttonText: e.target.value })}
            placeholder="Subscribe"
          />
        </div>
      </div>

      <input
        type="text"
        className={styles.disclaimer}
        value={block.disclaimer ?? ""}
        onChange={e => onUpdate({ disclaimer: e.target.value || undefined })}
        placeholder="No spam. Unsubscribe anytime."
      />
    </div>
  );
}
