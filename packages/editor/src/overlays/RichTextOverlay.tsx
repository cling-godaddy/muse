import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { RichContent, TextOrRich } from "@muse/core";
import { RichEditable } from "../ux/RichEditable";

interface Props {
  /** The element we're editing over */
  targetElement: HTMLElement
  /** Initial rich text value */
  value: TextOrRich
  /** Called when editing completes with new value */
  onSave: (value: RichContent) => void
  /** Called when editing is cancelled */
  onCancel: () => void
}

/**
 * Positions a RichEditable exactly over the target element.
 * Used for rich text fields with formatting support.
 */
export function RichTextOverlay({
  targetElement,
  value,
  onSave,
  onCancel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [currentValue, setCurrentValue] = useState<RichContent | null>(null);

  // Calculate position based on target element
  useEffect(() => {
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [targetElement]);

  // Handle Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Save on click outside - use mousedown to avoid race with opening click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside our container AND outside the floating toolbar
      const isInContainer = containerRef.current?.contains(target);
      const isInToolbar = target.closest("[data-floating-toolbar]");
      const isInLinkEditor = target.closest("[data-link-editor]");

      if (!isInContainer && !isInToolbar && !isInLinkEditor) {
        if (currentValue) {
          onSave(currentValue);
        }
        else {
          onCancel();
        }
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [currentValue, onSave, onCancel]);

  const handleChange = useCallback((newValue: RichContent) => {
    setCurrentValue(newValue);
  }, []);

  // Get background color from target's parent for opaque overlay
  const bgColor = window.getComputedStyle(targetElement.parentElement ?? targetElement).backgroundColor;

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        minWidth: position.width,
        background: bgColor === "rgba(0, 0, 0, 0)" ? "white" : bgColor,
        border: "2px solid var(--muse-theme-primary, #6366f1)",
        borderRadius: "2px",
        boxSizing: "border-box",
        zIndex: 9999,
      }}
    >
      <RichEditable
        value={value}
        onChange={handleChange}
        autoFocus
      />
    </div>,
    document.body,
  );
}
