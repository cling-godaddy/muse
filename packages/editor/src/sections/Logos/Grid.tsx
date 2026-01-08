import type { LogoItem, RichContent } from "@muse/core";
import type { LogosProps } from "./index";
import { EditableText, ImageLoader } from "../../ux";
import { useIsEditable } from "../../context/EditorMode";
import styles from "./Grid.module.css";

export function Grid({ section, onUpdate, isPending }: LogosProps) {
  const isEditable = useIsEditable();

  const updateLogo = (index: number, data: Partial<LogoItem>) => {
    const logos = section.logos.map((logo, i) =>
      i === index ? { ...logo, ...data } : logo,
    );
    onUpdate({ logos });
  };

  const removeLogo = (index: number) => {
    onUpdate({ logos: section.logos.filter((_, i) => i !== index) });
  };

  return (
    <section className={styles.section} style={{ backgroundColor: section.backgroundColor }}>
      <EditableText
        rich
        hideLists
        value={section.headline ?? ""}
        onChange={(v: RichContent) => onUpdate({ headline: v.text ? v : undefined })}
        as="h2"
        className={styles.headline}
        placeholder="Trusted by"
      />

      <div className={styles.grid}>
        {section.logos.map((logo, i) => (
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
