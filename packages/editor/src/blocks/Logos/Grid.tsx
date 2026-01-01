import type { LogoItem } from "@muse/core";
import type { LogosProps } from "./index";
import { EditableText, ImageLoader } from "../../ux";
import { useIsEditable } from "../../context/EditorModeContext";
import styles from "./Grid.module.css";

export function Grid({ block, onUpdate, isPending }: LogosProps) {
  const isEditable = useIsEditable();

  const updateLogo = (index: number, data: Partial<LogoItem>) => {
    const logos = block.logos.map((logo, i) =>
      i === index ? { ...logo, ...data } : logo,
    );
    onUpdate({ logos });
  };

  const removeLogo = (index: number) => {
    onUpdate({ logos: block.logos.filter((_, i) => i !== index) });
  };

  return (
    <section className={styles.section}>
      <EditableText
        value={block.headline ?? ""}
        onChange={v => onUpdate({ headline: v || undefined })}
        as="h2"
        className={styles.headline}
        placeholder="Trusted by"
      />

      <div className={styles.grid}>
        {block.logos.map((logo, i) => (
          <div key={i} className={styles.logo}>
            {logo.href && !isEditable
              ? (
                <a href={logo.href} className={styles.logoLink}>
                  <ImageLoader
                    image={logo.image}
                    isPending={!!isPending}
                    className={styles.logoImage}
                  />
                </a>
              )
              : (
                <ImageLoader
                  image={logo.image}
                  isPending={!!isPending}
                  className={styles.logoImage}
                />
              )}
            {isEditable && (
              <>
                <input
                  type="text"
                  value={logo.href ?? ""}
                  onChange={e => updateLogo(i, { href: e.target.value || undefined })}
                  placeholder="Link (optional)"
                  className={styles.linkInput}
                />
                <button
                  type="button"
                  onClick={() => removeLogo(i)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
