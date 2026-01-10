import type { Site, Page, SectionPreset } from "@muse/core";
import { allPresets } from "@muse/core";

export function getAvailablePresets(site: Site, page: Page): SectionPreset[] {
  const presets = Object.values(allPresets);

  return presets.filter((preset) => {
    // navbar: only one per site (in sharedSections)
    if (preset.sectionType === "navbar") {
      return !site.sharedSections?.some(s => s.type === "navbar");
    }

    // hero: only one per page (hard constraint)
    if (preset.sectionType === "hero") {
      return !page.sections.some(s => s.type === "hero");
    }

    // footer: only one per page (hard constraint)
    if (preset.sectionType === "footer") {
      return !page.sections.some(s => s.type === "footer");
    }

    return true;
  });
}
