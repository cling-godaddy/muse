import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Sparkles } from "lucide-react";
import { useEditorServices } from "../../context/EditorServices";
import { PRESETS, getContextualPresets, type Preset } from "./presets";
import styles from "./RewriteMenu.module.css";

interface RewriteMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRewrite: (completion: string) => void
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

// Assign colors to LLM suggestions in rotation
const SUGGESTION_COLORS: Array<"blue" | "green" | "purple" | "orange"> = ["orange", "green", "purple", "blue"];

export function RewriteMenu({
  open,
  onOpenChange,
  onRewrite,
  isLoading,
  sourceText,
  sectionType,
  elementType,
  siteContext,
}: RewriteMenuProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [llmSuggestions, setLlmSuggestions] = useState<Preset[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { getToken, trackUsage } = useEditorServices();

  // Get context-aware presets (rule-based, instant)
  const contextualPresets = useMemo(
    () => getContextualPresets(sectionType, elementType),
    [sectionType, elementType],
  );

  // Check if we have contextual suggestions (not just defaults)
  const hasContextualSuggestions = !!(sectionType && elementType);

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
        // Convert string suggestions to Preset objects with colors
        const presets: Preset[] = suggestions.map((label: string, i: number) => ({
          label,
          color: SUGGESTION_COLORS[i % SUGGESTION_COLORS.length],
        }));
        setLlmSuggestions(presets);
      }
    }
    catch (err) {
      console.error("Failed to fetch LLM suggestions:", err);
    }
    finally {
      setIsLoadingSuggestions(false);
    }
  }, [getToken, elementType, sectionType, siteContext, sourceText, trackUsage]);

  // Fetch suggestions when menu opens (only if we have context)
  useEffect(() => {
    if (open && elementType && getToken) {
      fetchLlmSuggestions();
    }
    if (!open) {
      // Reset suggestions when menu closes
      setLlmSuggestions([]);
    }
  }, [open, elementType, getToken, fetchLlmSuggestions]);

  // Use LLM suggestions if available, otherwise fall back to rule-based
  const suggestedPresets = llmSuggestions.length > 0 ? llmSuggestions : contextualPresets;

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

  const handleChipClick = (preset: string) => {
    setInput(preset);
    inputRef.current?.focus();
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

          {/* Contextual suggestions (LLM or rule-based fallback) */}
          {hasContextualSuggestions && (
            <div className={styles.suggestedSection}>
              <div className={styles.suggestedLabel}>
                {llmSuggestions.length > 0 ? "AI suggestions" : `Suggested for this ${elementType}`}
              </div>
              <div className={styles.suggestedChips}>
                {isLoadingSuggestions
                  ? (
                    <span className={styles.loadingDots}>Generating suggestions...</span>
                  )
                  : (
                    suggestedPresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        className={`${styles.chip} ${styles.smartChip} ${colorClass[preset.color]}`}
                        onClick={() => handleChipClick(preset.label)}
                        disabled={isLoading}
                      >
                        {preset.label}
                      </button>
                    ))
                  )}
              </div>
            </div>
          )}

          {/* Subtitle + Input */}
          <div className={styles.inputSection}>
            <label className={styles.inputLabel}>Make this text:</label>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="shorter, more professional..."
              disabled={isLoading}
            />
          </div>

          {/* All chips */}
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

          {/* Submit button */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? "Rewriting..." : "Rewrite"}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
