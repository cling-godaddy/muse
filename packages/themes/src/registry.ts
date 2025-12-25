import type { Theme } from "./types";

const themes = new Map<string, Theme>();

export function registerTheme(theme: Theme): void {
  themes.set(theme.id, theme);
}

export function getTheme(id: string): Theme | undefined {
  return themes.get(id);
}

export function getAllThemes(): Theme[] {
  return Array.from(themes.values());
}

export function getThemeIds(): string[] {
  return Array.from(themes.keys());
}
