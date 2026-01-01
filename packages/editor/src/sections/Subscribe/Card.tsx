import type { SubscribeSection as SubscribeSectionType } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Card.module.css";

interface Props {
  block: SubscribeSectionType
  onUpdate: (data: Partial<SubscribeSectionType>) => void
  isPending?: boolean
}

export function Card({ block, onUpdate }: Props) {
  const isEditable = useIsEditable();

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <EditableText
          value={block.headline ?? ""}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Stay in the loop"
        />
        <EditableText
          value={block.subheadline ?? ""}
          onChange={v => onUpdate({ subheadline: v || undefined })}
          as="p"
          className={styles.subheadline}
          placeholder="Join 10,000+ subscribers"
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

        <EditableText
          value={block.disclaimer ?? ""}
          onChange={v => onUpdate({ disclaimer: v || undefined })}
          as="p"
          className={styles.disclaimer}
          placeholder="No spam. Unsubscribe anytime."
        />
      </div>
    </section>
  );
}
