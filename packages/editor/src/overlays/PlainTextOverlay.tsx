import { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  /** The element we're editing over */
  targetElement: HTMLElement
  /** Initial text value */
  value: string
  /** Called when editing completes with new value */
  onSave: (value: string) => void
  /** Called when editing is cancelled */
  onCancel: () => void
}

/**
 * Positions a contenteditable div exactly over the target element.
 * Inherits styling from the target for seamless editing experience.
 */
export function PlainTextOverlay({
  targetElement,
  value,
  onSave,
  onCancel,
}: Props) {
  const editableRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Calculate position based on target element
  useEffect(() => {
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
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

  // Copy computed styles from target element
  useEffect(() => {
    if (!editableRef.current) return;

    const computed = window.getComputedStyle(targetElement);
    const el = editableRef.current;

    // Copy text-related styles
    el.style.fontFamily = computed.fontFamily;
    el.style.fontSize = computed.fontSize;
    el.style.fontWeight = computed.fontWeight;
    el.style.fontStyle = computed.fontStyle;
    el.style.lineHeight = computed.lineHeight;
    el.style.letterSpacing = computed.letterSpacing;
    el.style.textAlign = computed.textAlign;
    el.style.textTransform = computed.textTransform;
    el.style.color = computed.color;
    el.style.padding = computed.padding;
  }, [targetElement]);

  // Focus and select all on mount
  useEffect(() => {
    if (!editableRef.current) return;

    editableRef.current.focus();

    // Select all text
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editableRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = editableRef.current?.textContent ?? "";
      onSave(text);
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  }, [onSave, onCancel]);

  const handleBlur = useCallback(() => {
    const text = editableRef.current?.textContent ?? "";
    onSave(text);
  }, [onSave]);

  // Get background color from target's parent for opaque overlay
  const bgColor = window.getComputedStyle(targetElement.parentElement ?? targetElement).backgroundColor;

  return createPortal(
    <div
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        minWidth: position.width,
        minHeight: position.height,
        margin: 0,
        background: bgColor === "rgba(0, 0, 0, 0)" ? "white" : bgColor,
        border: "2px solid var(--muse-theme-primary, #6366f1)",
        borderRadius: "2px",
        outline: "none",
        boxSizing: "border-box",
        zIndex: 9999,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {value}
    </div>,
    document.body,
  );
}
