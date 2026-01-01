import type { SubscribeBlock as SubscribeBlockType } from "@muse/core";
import { EditableText } from "../../ux";
import { useIsEditable } from "../../context/EditorModeContext";
import styles from "./Banner.module.css";

interface Props {
  block: SubscribeBlockType
  onUpdate: (data: Partial<SubscribeBlockType>) => void
}

export function Banner({ block, onUpdate }: Props) {
  const isEditable = useIsEditable();

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <EditableText
          value={block.headline ?? ""}
          onChange={v => onUpdate({ headline: v || undefined })}
          as="h2"
          className={styles.headline}
          placeholder="Join our newsletter"
        />
        <EditableText
          value={block.subheadline ?? ""}
          onChange={v => onUpdate({ subheadline: v || undefined })}
          as="p"
          className={styles.subheadline}
          placeholder="Get updates delivered straight to your inbox"
        />
      </div>

      <div className={styles.formWrapper}>
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
