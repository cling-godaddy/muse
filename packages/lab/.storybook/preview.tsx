import React, { useEffect } from "react";
import type { Preview, Decorator } from "@storybook/react-vite";
import { action } from "storybook/actions";
import {
  resolveLayeredTheme,
  themeToCssVars,
  loadFonts,
  getTypography,
  getBundle,
  getBundleIds,
  getPaletteIds,
  getTypographyIds,
} from "@muse/themes";
import { EditorModeProvider } from "@muse/editor";

function ThemeWrapper({
  bundleId,
  paletteOverride,
  typographyOverride,
  children,
}: {
  bundleId: string
  paletteOverride?: string
  typographyOverride?: string
  children: React.ReactNode
}) {
  const resolved = resolveLayeredTheme({
    bundle: bundleId,
    paletteOverride,
    typographyOverride,
  });

  const cssVars = themeToCssVars(resolved.theme);

  useEffect(() => {
    const bundle = getBundle(bundleId);
    const typoId = typographyOverride ?? bundle?.typography ?? "inter";
    const typo = getTypography(typoId);
    if (typo) loadFonts(typo);
  }, [bundleId, typographyOverride]);

  const effectsId = resolved.effects?.id;

  return (
    <EditorModeProvider mode="preview">
      <div style={cssVars as React.CSSProperties} data-effects={effectsId}>
        {children}
      </div>
    </EditorModeProvider>
  );
}

const isDefault = (v: unknown) => !v || v === "none" || v === "_reset";

const withTheme: Decorator = (Story, context) => {
  const { theme, palette, typography } = context.globals;
  const bundleId = isDefault(theme) ? "terminal" : theme;
  const paletteOverride = isDefault(palette) ? undefined : palette;
  const typographyOverride = isDefault(typography) ? undefined : typography;

  return (
    <ThemeWrapper
      bundleId={bundleId}
      paletteOverride={paletteOverride}
      typographyOverride={typographyOverride}
    >
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
    theme: {
      name: "Theme",
      description: "Base theme (palette + typography + style + effects)",
      defaultValue: "terminal",
      toolbar: {
        icon: "box",
        title: "Theme",
        items: getBundleIds().map(id => ({ value: id, title: id })),
      },
    },
    palette: {
      name: "Palette",
      description: "Override theme palette",
      toolbar: {
        icon: "paintbrush",
        title: "Palette",
        items: getPaletteIds().map(id => ({ value: id, title: id })),
      },
    },
    typography: {
      name: "Typography",
      description: "Override theme typography",
      toolbar: {
        icon: "document",
        title: "Typography",
        items: getTypographyIds().map(id => ({ value: id, title: id })),
      },
    },
  },
};

export default preview;
