import React, { useEffect } from "react";
import type { Preview, Decorator } from "@storybook/react-vite";
import { action } from "storybook/actions";
import {
  resolveThemeFromBundle,
  resolveThemeFromSelection,
  themeToCssVars,
  loadFonts,
  getTypography,
  getBundleIds,
  getPaletteIds,
} from "@muse/themes";
import { EditorModeProvider } from "@muse/editor";

function ThemeWrapper({
  bundleId,
  paletteId,
  children,
}: {
  bundleId?: string
  paletteId?: string
  children: React.ReactNode
}) {
  // If palette is selected, use it with default typography/style
  // Otherwise use the bundle
  const resolved = paletteId
    ? { theme: resolveThemeFromSelection(paletteId, "inter", "rounded"), effects: null }
    : resolveThemeFromBundle(bundleId || "terminal");

  const cssVars = resolved?.theme ? themeToCssVars(resolved.theme) : {};

  useEffect(() => {
    if (resolved) {
      const typo = getTypography(resolved.typography);
      if (typo) loadFonts(typo);
    }
  }, [resolved]);

  return (
    <EditorModeProvider mode="preview">
      <div style={cssVars as React.CSSProperties}>{children}</div>
    </EditorModeProvider>
  );
}

const withTheme: Decorator = (Story, context) => {
  const paletteId = context.globals.palette !== "none" ? context.globals.palette : undefined;
  const bundleId = context.globals.theme || "terminal";

  return (
    <ThemeWrapper bundleId={bundleId} paletteId={paletteId}>
      <Story />
    </ThemeWrapper>
  );
};

const logLinkClick = action("link-click");

function LinkInterceptor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link) {
        e.preventDefault();
        logLinkClick({
          text: link.textContent?.trim(),
          href: link.getAttribute("href"),
        });
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return <>{children}</>;
}

const withLinkHandler: Decorator = Story => (
  <LinkInterceptor>
    <Story />
  </LinkInterceptor>
);

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
      config: {
        rules: [
          { id: "frame-tested", enabled: false }, // can't test cross-origin iframes
        ],
      },
    },
  },
  decorators: [withTheme, withLinkHandler],
  globalTypes: {
    palette: {
      name: "Palette",
      description: "Color palette (overrides bundle)",
      defaultValue: "none",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "none", title: "Palette" },
          ...getPaletteIds().map(id => ({ value: id, title: id })),
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      name: "Bundle",
      description: "Theme bundle (ignored if palette selected)",
      defaultValue: "terminal",
      toolbar: {
        icon: "box",
        items: getBundleIds().map(id => ({ value: id, title: id })),
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
