import { groupBy } from "lodash-es";
import { getAllThemes } from "./registry";
import { getAllPalettes, paletteCategoryDescriptions, type PaletteCategory } from "./palettes";
import { getAllTypography, typographyCategoryDescriptions, type TypographyCategory } from "./typography";

// legacy prompt for old theme system
export function generateThemePrompt(): string {
  const themes = getAllThemes();

  const lines = themes.map((theme) => {
    const industries = theme.industries.slice(0, 3).join(", ");
    return `- ${theme.id}: ${theme.description}. Good for: ${industries}`;
  });

  return `Available themes:
${lines.join("\n")}

Select the most appropriate theme based on the user's prompt and include it in your response as "theme": "<theme-id>".`;
}

// new prompt for palette + typography selection
export function generatePaletteTypographyPrompt(): string {
  const palettes = getAllPalettes();
  const typography = getAllTypography();

  const palettesByCategory = groupBy(palettes, p => p.category);
  const typographyByCategory = groupBy(typography, t => t.category);

  const paletteLines = Object.entries(palettesByCategory).map(([cat, items]) => {
    const desc = paletteCategoryDescriptions[cat as PaletteCategory];
    const itemList = items.map(p => `  - ${p.id}: ${p.description}`).join("\n");
    return `${cat.toUpperCase()} (${desc}):\n${itemList}`;
  });

  const typographyLines = Object.entries(typographyByCategory).map(([cat, items]) => {
    const desc = typographyCategoryDescriptions[cat as TypographyCategory];
    const itemList = items.map(t => `  - ${t.id}: ${t.description}`).join("\n");
    return `${cat.toUpperCase()} (${desc}):\n${itemList}`;
  });

  return `PALETTES (pick one):
${paletteLines.join("\n\n")}

TYPOGRAPHY (pick one):
${typographyLines.join("\n\n")}

Output JSON: {"palette": "<id>", "typography": "<id>"}`;
}
