import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface CtaValue {
  text: string
  href: string
}

interface Props {
  /** The element we're editing over */
  targetElement: HTMLElement
  /** Current CTA value */
  value: CtaValue
  /** Called when editing completes */
  onSave: (value: CtaValue) => void
  /** Called when editing is cancelled */
  onCancel: () => void
}

/**
 * CTA editor overlay with text and href inputs.
 */
export function CtaOverlay({
  targetElement,
  value,
  onSave,
  onCancel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [text, setText] = useState(value.text);
  const [href, setHref] = useState(value.href);

  // Calculate position based on target element
  useEffect(() => {
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
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

  // Focus text input on mount
  useEffect(() => {
    textInputRef.current?.focus();
    textInputRef.current?.select();
  }, []);

  const handleSave = useCallback(() => {
    onSave({ text, href });
  }, [text, href, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  }, [handleSave, onCancel]);

  // Close on click outside - use mousedown to avoid the opening click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (containerRef.current && !containerRef.current.contains(target) && !targetElement.contains(target)) {
        handleSave();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [targetElement, handleSave]);

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "white",
        border: "1px solid var(--muse-border, #e5e7eb)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minWidth: "240px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          htmlFor="cta-text"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--muse-text-muted, #64748b)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Button Text
        </label>
        <input
          ref={textInputRef}
          id="cta-text"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "8px 10px",
            border: "1px solid var(--muse-border, #e5e7eb)",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
          placeholder="Button text..."
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label
          htmlFor="cta-href"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--muse-text-muted, #64748b)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Link URL
        </label>
        <input
          id="cta-href"
          type="text"
          value={href}
          onChange={e => setHref(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "8px 10px",
            border: "1px solid var(--muse-border, #e5e7eb)",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
          placeholder="https://..."
        />
      </div>
    </div>,
    document.body,
  );
}
