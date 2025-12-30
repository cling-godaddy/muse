import type { FooterBlock as FooterBlockType, FooterLink, SocialLink, SocialPlatform } from "@muse/core";
import { useAutoResize } from "../hooks";
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
  block: FooterBlockType
  onUpdate: (data: Partial<FooterBlockType>) => void
}

const PLATFORMS: SocialPlatform[] = ["twitter", "facebook", "instagram", "linkedin", "youtube", "github", "tiktok"];

export function Footer({ block, onUpdate }: Props) {
  const copyrightRef = useAutoResize(block.copyright ?? "");

  const updateLink = (index: number, data: Partial<FooterLink>) => {
    const links = (block.links ?? []).map((link, i) =>
      i === index ? { ...link, ...data } : link,
    );
    onUpdate({ links });
  };

  const addLink = () => {
    onUpdate({ links: [...(block.links ?? []), { label: "Link", href: "#" }] });
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
      socialLinks: [...(block.socialLinks ?? []), { platform: "twitter", href: "https://" }],
    });
  };

  const removeSocialLink = (index: number) => {
    onUpdate({
      socialLinks: (block.socialLinks ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <footer className={styles.footer}>
      {/* Company name - inline editable */}
      {block.companyName !== undefined && (
        <input
          type="text"
          className={styles.companyName}
          value={block.companyName}
          onChange={e => onUpdate({ companyName: e.target.value || undefined })}
          placeholder="Company Name"
        />
      )}

      {/* Navigation links row */}
      <nav className={styles.nav}>
        {(block.links ?? []).map((link, i) => (
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
        ))}
        <button type="button" className={styles.addIcon} onClick={addLink} title="Add link">
          +
        </button>
      </nav>

      {/* Social icons row */}
      <div className={styles.socials}>
        {(block.socialLinks ?? []).map((social, i) => (
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
        ))}
        <button type="button" className={styles.addIcon} onClick={addSocialLink} title="Add social">
          +
        </button>
      </div>

      {/* Copyright - inline editable */}
      {block.copyright !== undefined && (
        <textarea
          ref={copyrightRef}
          className={styles.copyright}
          rows={1}
          value={block.copyright}
          onChange={e => onUpdate({ copyright: e.target.value || undefined })}
          placeholder="© 2024 Company. All rights reserved."
        />
      )}
    </footer>
  );
}
