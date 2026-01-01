import type { SubscribeBlock as SubscribeBlockType } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Inline.module.css";

interface Props {
  block: SubscribeBlockType
  onUpdate: (data: Partial<SubscribeBlockType>) => void
}

export function Inline({ block, onUpdate }: Props) {
  const isEditable = useIsEditable();

  return (
    <section className={styles.section}>
      <EditableText
        value={block.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="span"
        className={styles.headline}
        placeholder="Subscribe to our newsletter"
      />

      <div className={styles.form}>
        {isEditable
          ? (
            <>
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
            </>
          )
          : (
            <>
              <input
                type="email"
                className={styles.emailInput}
                placeholder={block.placeholderText ?? "Enter your email"}
                disabled
              />
              <button type="button" className={styles.button}>
                {block.buttonText || "Subscribe"}
              </button>
            </>
          )}
      </div>

      {(isEditable || block.disclaimer) && (
        <EditableText
          value={block.disclaimer ?? ""}
          onChange={v => onUpdate({ disclaimer: v || undefined })}
          as="span"
          className={styles.disclaimer}
          placeholder="No spam"
        />
      )}
    </section>
  );
}
