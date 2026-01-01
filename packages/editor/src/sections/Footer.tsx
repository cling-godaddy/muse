import type { FooterSection as FooterSectionType, FooterLink, SocialLink, SocialPlatform } from "@muse/core";
import { EditableText } from "../ux";
import { useIsEditable } from "../context/EditorMode";
import {
  ItemPopover,
  PopoverField,
  PopoverInput,
  PopoverSelect,
  PopoverActions,
  PopoverButton,
} from "../controls/ItemPopover";
import { Social } from "../icons/Social";
import styles from "./Footer.module.css";

interface Props {
  section: FooterSectionType
  onUpdate: (data: Partial<FooterSectionType>) => void
}

const PLATFORMS: SocialPlatform[] = ["twitter", "facebook", "instagram", "linkedin", "youtube", "github", "tiktok"];

export function Footer({ section, onUpdate }: Props) {
  const isEditable = useIsEditable();

  const updateLink = (index: number, data: Partial<FooterLink>) => {
    const links = (section.links ?? []).map((link, i) =>
      i === index ? { ...link, ...data } : link,
    );
    onUpdate({ links });
  };

  const addLink = () => {
    onUpdate({ links: [...(section.links ?? []), { label: "Link", href: "#" }] });
  };

  const removeLink = (index: number) => {
    onUpdate({ links: (section.links ?? []).filter((_, i) => i !== index) });
  };

  const updateSocialLink = (index: number, data: Partial<SocialLink>) => {
    const socialLinks = (section.socialLinks ?? []).map((link, i) =>
      i === index ? { ...link, ...data } : link,
    );
    onUpdate({ socialLinks });
  };

  const addSocialLink = () => {
    onUpdate({
      socialLinks: [...(section.socialLinks ?? []), { platform: "twitter", href: "https://" }],
    });
  };

  const removeSocialLink = (index: number) => {
    onUpdate({
      socialLinks: (section.socialLinks ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <footer className={styles.footer}>
      {section.companyName !== undefined && (
        <EditableText
          value={section.companyName}
          onChange={v => onUpdate({ companyName: v || undefined })}
          as="span"
          className={styles.companyName}
          placeholder="Company Name"
        />
      )}

      <nav className={styles.nav}>
        {(section.links ?? []).map((link, i) => (
          isEditable
            ? (
              <ItemPopover
                key={i}
                trigger={<span className={styles.navLink}>{link.label || "Link"}</span>}
              >
                <PopoverField label="Label">
                  <PopoverInput
                    value={link.label}
                    onChange={value => updateLink(i, { label: value })}
                    placeholder="Link text"
                  />
                </PopoverField>
                <PopoverField label="URL">
                  <PopoverInput
                    value={link.href}
                    onChange={value => updateLink(i, { href: value })}
                    placeholder="/page or https://..."
                    type="url"
                  />
                </PopoverField>
                <PopoverActions>
                  <PopoverButton variant="danger" onClick={() => removeLink(i)}>
                    Remove
                  </PopoverButton>
                </PopoverActions>
              </ItemPopover>
            )
            : (
              <a key={i} href={link.href} className={styles.navLink}>{link.label}</a>
            )
        ))}
        {isEditable && (
          <button type="button" className={styles.addIcon} onClick={addLink} title="Add link">
            +
          </button>
        )}
      </nav>

      <div className={styles.socials}>
        {(section.socialLinks ?? []).map((social, i) => (
          isEditable
            ? (
              <ItemPopover
                key={i}
                trigger={(
                  <span className={styles.socialIcon} title={social.platform}>
                    <Social platform={social.platform} size={16} />
                  </span>
                )}
              >
                <PopoverField label="Platform">
                  <PopoverSelect
                    value={social.platform}
                    onChange={value => updateSocialLink(i, { platform: value })}
                    options={PLATFORMS}
                  />
                </PopoverField>
                <PopoverField label="URL">
                  <PopoverInput
                    value={social.href}
                    onChange={value => updateSocialLink(i, { href: value })}
                    placeholder="https://twitter.com/..."
                    type="url"
                  />
                </PopoverField>
                <PopoverActions>
                  <PopoverButton variant="danger" onClick={() => removeSocialLink(i)}>
                    Remove
                  </PopoverButton>
                </PopoverActions>
              </ItemPopover>
            )
            : (
              <a key={i} href={social.href} className={styles.socialIcon} title={social.platform}>
                <Social platform={social.platform} size={16} />
              </a>
            )
        ))}
        {isEditable && (
          <button type="button" className={styles.addIcon} onClick={addSocialLink} title="Add social">
            +
          </button>
        )}
      </div>

      {section.copyright !== undefined && (
        <EditableText
          value={section.copyright}
          onChange={v => onUpdate({ copyright: v || undefined })}
          as="p"
          className={styles.copyright}
          placeholder="© 2024 Company. All rights reserved."
        />
      )}
    </footer>
  );
}
