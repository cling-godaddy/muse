import React, { type ReactNode } from "react";

/**
 * Wraps each child element in a styled container.
 * Handles fragments by flattening their children.
 */
export function wrapChildren(
  children: ReactNode,
  className: string | undefined,
): ReactNode {
  // Flatten fragments to get actual children
  const items = React.Children.toArray(children);

  return items.map((child, i) => (
    <div key={i} className={className}>
      {child}
    </div>
  ));
}
