import { useState, useRef, useEffect, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEditorServices } from "../../context/EditorServices";
import { PRESETS } from "./presets";
import styles from "./RewriteMenu.module.css";

interface RewriteMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with an instruction like "shorter" - triggers API rewrite */
  onRewrite: (instruction: string) => void
  /** Called with literal text to apply directly - no API call */
  onApplyDirectText: (text: string) => void
  isLoading?: boolean
  sourceText?: string
  sectionType?: string
  elementType?: string
  siteContext?: { name?: string, description?: string }
}

const colorClass = {
  blue: styles.chipBlue,
  green: styles.chipGreen,
  purple: styles.chipPurple,
  orange: styles.chipOrange,
};

export function RewriteMenu({
  open,
  onOpenChange,
  onRewrite,
  onApplyDirectText,
  isLoading,
  sourceText,
  sectionType,
  elementType,
  siteContext,
}: RewriteMenuProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [llmSuggestions, setLlmSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const hasFetchedRef = useRef(false);
  const { getToken, trackUsage } = useEditorServices();

  // Check if we have context for AI suggestions
  const hasContext = !!(sectionType && elementType);

  // Fetch LLM suggestions when menu opens
  const fetchLlmSuggestions = useCallback(async () => {
    if (!getToken || !elementType) return;

    setIsLoadingSuggestions(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch("/api/chat/suggest-rewrites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          elementType,
          sectionType,
          businessContext: siteContext,
          currentText: sourceText?.slice(0, 200), // Limit text sent
        }),
      });

      if (!response.ok) return;

      const { suggestions, usage } = await response.json();

      if (usage && trackUsage) {
        trackUsage(usage);
      }

      if (suggestions && suggestions.length > 0) {
        setLlmSuggestions(suggestions);
      }
    }
    catch (err) {
      console.error("Failed to fetch LLM suggestions:", err);
    }
    finally {
      setIsLoadingSuggestions(false);
    }
  }, [getToken, elementType, sectionType, siteContext, sourceText, trackUsage]);

  // Fetch suggestions once when menu opens
  // Intentionally only depends on `open` to prevent re-fetches when other props change
  useEffect(() => {
    if (open && elementType && getToken && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchLlmSuggestions();
    }
    if (!open) {
      // Reset when menu closes
      hasFetchedRef.current = false;
      setLlmSuggestions([]);
      setApplyingIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus input when popover opens, clear when it closes
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    else {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setInput(""), 0);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onRewrite(input.trim());
    // Don't close here - stay open to show loading state
    // Parent will close after rewrite completes
  };

  const handleChipClick = (instruction: string) => {
    setInput(instruction);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (text: string, index: number) => {
    setApplyingIndex(index);
    onApplyDirectText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          disabled={isLoading}
          title="AI rewrite"
          data-rewrite-menu-trigger
        >
          {isLoading
            ? <span className={styles.spinner} />
            : <Sparkles size={14} />}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          side="bottom"
          align="end"
          sideOffset={8}
          data-rewrite-menu
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner} />
              <span className={styles.loadingText}>Rewriting...</span>
            </div>
          )}

          {/* Header */}
          <div className={styles.header}>
            <Sparkles size={14} />
            <span>Rewrite with AI</span>
          </div>

          {/* Source text preview */}
          {sourceText && (
            <div className={styles.sourcePreview}>
              <span className={styles.sourceLabel}>Text:</span>
              <span className={styles.sourceText}>{sourceText}</span>
            </div>
          )}

          {/* AI Suggestions - direct replacement text */}
          {hasContext && (isLoadingSuggestions || llmSuggestions.length > 0) && (
            <div className={styles.aiSection}>
              <div className={styles.aiHeader}>
                <span className={styles.aiLabel}>AI suggestions</span>
                <span className={styles.aiHint}>click to use</span>
              </div>
              <div className={styles.aiSuggestions}>
                {isLoadingSuggestions
                  ? (
                    <div className={styles.aiLoading}>
                      <span className={styles.aiLoadingSpinner} />
                      <span>Generating suggestions...</span>
                    </div>
                  )
                  : (
                    llmSuggestions.map((text, index) => (
                      <button
                        key={index}
                        type="button"
                        className={styles.aiSuggestion}
                        onClick={() => handleSuggestionClick(text, index)}
                        disabled={isLoading || applyingIndex !== null}
                      >
                        <span className={styles.aiSuggestionText}>{text}</span>
                        {applyingIndex === index
                          ? <span className={styles.aiSuggestionSpinner} />
                          : <ArrowRight size={14} className={styles.aiSuggestionArrow} />}
                      </button>
                    ))
                  )}
              </div>
            </div>
          )}

          {/* Custom instruction input with inline button */}
          <div className={styles.customSection}>
            <label className={styles.customLabel}>Or describe a change:</label>
            <div className={styles.customInputRow}>
              <input
                ref={inputRef}
                type="text"
                className={styles.customInput}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="shorter, more professional..."
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.customButton}
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                title="Rewrite"
              >
                {isLoading ? <span className={styles.customButtonSpinner} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>

          {/* Instruction chips - fill input */}
          <div className={styles.chips}>
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                className={`${styles.chip} ${colorClass[preset.color]}`}
                onClick={() => handleChipClick(preset.label)}
                disabled={isLoading}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
