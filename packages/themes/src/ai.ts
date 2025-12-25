import { getAllThemes } from "./registry";

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
