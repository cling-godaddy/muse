import React, { useEffect } from "react";
import type { Preview, Decorator } from "@storybook/react";
import {
  resolveThemeFromBundle,
  themeToCssVars,
  loadFonts,
  getTypography,
  getBundle,
  getBundleIds,
} from "@muse/themes";

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

  return <div style={cssVars as React.CSSProperties}>{children}</div>;
}

const withTheme: Decorator = (Story, context) => {
  const bundleId = context.globals.theme || "terminal";
  return (
    <ThemeWrapper bundleId={bundleId}>
      <Story />
    </ThemeWrapper>
  );
};

const preview: Preview = {
  decorators: [withTheme],
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
