import type { FooterBlock as FooterBlockType, FooterLink, SocialLink, SocialPlatform } from "@muse/core";
import styles from "./Footer.module.css";

interface Props {
  block: FooterBlockType
  onUpdate: (data: Partial<FooterBlockType>) => void
}

const PLATFORMS: SocialPlatform[] = ["twitter", "facebook", "instagram", "linkedin", "youtube", "github", "tiktok"];

export function Footer({ block, onUpdate }: Props) {
  const updateLink = (index: number, data: Partial<FooterLink>) => {
    const links = (block.links ?? []).map((link, i) =>
      i === index ? { ...link, ...data } : link,
    );
    onUpdate({ links });
  };

  const addLink = () => {
    onUpdate({ links: [...(block.links ?? []), { label: "", href: "#" }] });
  };

  const removeLink = (index: number) => {
    onUpdate({ links: (block.links ?? []).filter((_, i) => i !== index) });
  };

  const updateSocialLink = (index: number, data: Partial<SocialLink>) => {
    const socialLinks = (block.socialLinks ?? []).map((link, i) =>
      i === index ? { ...link, ...data } : link,
    );
    onUpdate({ socialLinks });
  };

  const addSocialLink = () => {
    onUpdate({
      socialLinks: [...(block.socialLinks ?? []), { platform: "twitter", href: "" }],
    });
  };

  const removeSocialLink = (index: number) => {
    onUpdate({
      socialLinks: (block.socialLinks ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className={styles.section}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Company Name</label>
          <input
            type="text"
            value={block.companyName ?? ""}
            onChange={e => onUpdate({ companyName: e.target.value || undefined })}
            placeholder="Company Name"
          />
        </div>
        <div className={styles.field}>
          <label>Copyright</label>
          <input
            type="text"
            value={block.copyright ?? ""}
            onChange={e => onUpdate({ copyright: e.target.value || undefined })}
            placeholder="2024 Company. All rights reserved."
          />
        </div>
      </div>

      <div className={styles.linksSection}>
        <label>Links</label>
        <div className={styles.linksList}>
          {(block.links ?? []).map((link, i) => (
            <div key={i} className={styles.linkRow}>
              <input
                type="text"
                value={link.label}
                onChange={e => updateLink(i, { label: e.target.value })}
                placeholder="Label"
              />
              <input
                type="text"
                value={link.href}
                onChange={e => updateLink(i, { href: e.target.value })}
                placeholder="/page"
              />
              <button type="button" onClick={() => removeLink(i)} className={styles.removeButton}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLink} className={styles.addButton}>
          Add Link
        </button>
      </div>

      <div className={styles.socialSection}>
        <label>Social Links</label>
        <div className={styles.linksList}>
          {(block.socialLinks ?? []).map((social, i) => (
            <div key={i} className={styles.linkRow}>
              <select
                value={social.platform}
                onChange={e => updateSocialLink(i, { platform: e.target.value as SocialPlatform })}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="url"
                value={social.href}
                onChange={e => updateSocialLink(i, { href: e.target.value })}
                placeholder="https://..."
              />
              <button type="button" onClick={() => removeSocialLink(i)} className={styles.removeButton}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSocialLink} className={styles.addButton}>
          Add Social
        </button>
      </div>
    </div>
  );
}
