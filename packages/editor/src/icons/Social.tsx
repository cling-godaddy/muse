import {
  siX,
  siFacebook,
  siInstagram,
  siYoutube,
  siGithub,
  siTiktok,
} from "simple-icons";
import type { SocialPlatform } from "@muse/core";

// LinkedIn was removed from simple-icons due to trademark issues
// Using a simple "in" text fallback
const ICONS: Partial<Record<SocialPlatform, { path: string, hex: string }>> = {
  twitter: { path: siX.path, hex: siX.hex },
  facebook: { path: siFacebook.path, hex: siFacebook.hex },
  instagram: { path: siInstagram.path, hex: siInstagram.hex },
  youtube: { path: siYoutube.path, hex: siYoutube.hex },
  github: { path: siGithub.path, hex: siGithub.hex },
  tiktok: { path: siTiktok.path, hex: siTiktok.hex },
};

const FALLBACK_LABELS: Partial<Record<SocialPlatform, string>> = {
  linkedin: "in",
};

interface Props {
  platform: SocialPlatform
  size?: number
  className?: string
}

export function Social({ platform, size = 20, className }: Props) {
  const icon = ICONS[platform];

  // Fallback to text label if no icon available
  if (!icon) {
    const label = FALLBACK_LABELS[platform] ?? platform.slice(0, 2);
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          fontSize: size * 0.5,
          fontWeight: 600,
          textTransform: "lowercase",
        }}
        className={className}
      >
        {label}
      </span>
    );
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      <path d={icon.path} />
    </svg>
  );
}

/** Get the brand hex color for a platform */
export function getSocialColor(platform: SocialPlatform): string {
  return `#${ICONS[platform]?.hex ?? "000000"}`;
}
