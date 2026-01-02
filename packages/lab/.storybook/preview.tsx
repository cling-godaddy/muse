import React, { useEffect } from "react";
import type { Preview, Decorator } from "@storybook/react-vite";
import { action } from "storybook/actions";
import {
  resolveThemeFromBundle,
  themeToCssVars,
  loadFonts,
  getTypography,
  getBundle,
  getBundleIds,
} from "@muse/themes";
import { EditorModeProvider } from "@muse/editor";

function ThemeWrapper({ bundleId, children }: { bundleId: string, children: React.ReactNode }) {
  const bundle = getBundle(bundleId);
  const resolved = resolveThemeFromBundle(bundleId);
  const cssVars = resolved ? themeToCssVars(resolved.theme) : {};

  useEffect(() => {
    if (bundle) {
      const typo = getTypography(bundle.typography);
      if (typo) loadFonts(typo);
    }
  }, [bundle]);

  return (
    <EditorModeProvider mode="preview">
      <div style={cssVars as React.CSSProperties}>{children}</div>
    </EditorModeProvider>
  );
}

const withTheme: Decorator = (Story, context) => {
  const bundleId = context.globals.theme || "terminal";
  return (
    <ThemeWrapper bundleId={bundleId}>
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
  decorators: [withTheme, withLinkHandler],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Theme bundle for components",
      defaultValue: "terminal",
      toolbar: {
        icon: "paintbrush",
        items: getBundleIds().map(id => ({ value: id, title: id })),
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
