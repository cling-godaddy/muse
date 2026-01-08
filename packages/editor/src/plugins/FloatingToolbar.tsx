import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createRangeSelection,
  $setSelection,
  $getNodeByKey,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FOCUS_COMMAND,
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $isLinkNode, $toggleLink, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { $isElementNode } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { ListNode } from "@lexical/list";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  X,
} from "lucide-react";
import { ColorPicker } from "../controls/ColorPicker";
import { useDebouncedCallback } from "@muse/react";
import styles from "./FloatingToolbar.module.css";

interface Position {
  top: number
  left: number
}

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [listType, setListType] = useState<"bullet" | "number" | null>(null);
  const [textColor, setTextColor] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const savedSelectionRef = useRef<{
    anchorKey: string
    anchorOffset: number
    focusKey: string
    focusOffset: number
  } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Update position based on editor root element
  const updatePosition = useCallback(() => {
    const rootElement = editor.getRootElement();
    if (rootElement) {
      const rect = rootElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 44,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [editor]);

  // Update format states based on current selection
  const updateFormatStates = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }

    // Update format states
    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));

    // Check for link
    const node = selection.anchor.getNode();
    const parent = node.getParent();
    setIsLink($isLinkNode(parent) || $isLinkNode(node));

    // Check for list
    const anchorNode = selection.anchor.getNode();
    const element = $isElementNode(anchorNode)
      ? anchorNode
      : anchorNode.getParentOrThrow();
    const listNode = $getNearestNodeOfType(element, ListNode);
    if (listNode && $isListNode(listNode)) {
      const lt = listNode.getListType();
      setListType(lt === "bullet" || lt === "number" ? lt : null);
    }
    else {
      setListType(null);
    }

    // Check for text color
    const color = $getSelectionStyleValueForProperty(selection, "color");
    setTextColor(color || null);
  }, []);

  // Handle focus
  useEffect(() => {
    return editor.registerCommand(
      FOCUS_COMMAND,
      () => {
        setIsFocused(true);
        updatePosition();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updatePosition]);

  // Handle blur - delay to allow clicking toolbar buttons
  useEffect(() => {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        // Delay blur check to allow toolbar interaction
        setTimeout(() => {
          // Don't hide if color picker is open (it's in a portal)
          if (isColorPickerOpen) {
            return;
          }
          const activeElement = document.activeElement;
          const toolbar = toolbarRef.current;
          if (toolbar && toolbar.contains(activeElement)) {
            // Focus is in toolbar, don't hide
            return;
          }
          setIsFocused(false);
          setShowLinkInput(false);
        }, 100);
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, isColorPickerOpen]);

  // Update format states on selection change
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFormatStates();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateFormatStates]);

  // Update format states on editor update
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateFormatStates();
      });
    });
  }, [editor, updateFormatStates]);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
    editor.focus();
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
    editor.focus();
  };

  const handleTextColor = useDebouncedCallback((color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
  }, 32);

  const clearTextColor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color: null });
      }
    });
    editor.focus();
  }, [editor]);

  const toggleLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      editor.focus();
    }
    else {
      // Save Lexical selection before showing link input
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          savedSelectionRef.current = {
            anchorKey: selection.anchor.key,
            anchorOffset: selection.anchor.offset,
            focusKey: selection.focus.key,
            focusOffset: selection.focus.offset,
          };
        }
      });
      setShowLinkInput(true);
    }
  };

  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^mailto:/i.test(trimmed)) return trimmed;
    if (/^tel:/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const insertLink = () => {
    const normalizedUrl = normalizeUrl(linkUrl);
    const savedSelection = savedSelectionRef.current;
    if (normalizedUrl && savedSelection) {
      editor.update(() => {
        const anchorNode = $getNodeByKey(savedSelection.anchorKey);
        const focusNode = $getNodeByKey(savedSelection.focusKey);
        if (anchorNode && focusNode) {
          const selection = $createRangeSelection();
          selection.anchor.set(
            savedSelection.anchorKey,
            savedSelection.anchorOffset,
            $isElementNode(anchorNode) ? "element" : "text",
          );
          selection.focus.set(
            savedSelection.focusKey,
            savedSelection.focusOffset,
            $isElementNode(focusNode) ? "element" : "text",
          );
          $setSelection(selection);
          $toggleLink(normalizedUrl);
        }
      });
      setLinkUrl("");
      setShowLinkInput(false);
      savedSelectionRef.current = null;
      editor.focus();
    }
  };

  const toggleBulletList = () => {
    if (listType === "bullet") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
    editor.focus();
  };

  const toggleNumberList = () => {
    if (listType === "number") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
    editor.focus();
  };

  if (!isFocused) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      className={styles.toolbar}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={e => e.preventDefault()}
    >
      <button
        type="button"
        className={styles.button}
        data-active={isBold}
        onClick={formatBold}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      <button
        type="button"
        className={styles.button}
        data-active={isItalic}
        onClick={formatItalic}
        title="Italic"
      >
        <Italic size={14} />
      </button>

      <div className={styles.divider} />

      <div className={styles.colorPickerWrapper}>
        <ColorPicker
          value={textColor || "#000000"}
          onChange={handleTextColor}
          onOpenChange={setIsColorPickerOpen}
          compact
          side="bottom"
          ariaLabel="Text color"
        />
        {textColor && (
          <button
            type="button"
            className={styles.clearColorButton}
            onClick={clearTextColor}
            title="Clear color"
          >
            <X size={10} />
          </button>
        )}
      </div>

      <div className={styles.divider} />

      <button
        type="button"
        className={styles.button}
        data-active={isLink}
        onClick={toggleLink}
        title="Link"
      >
        <Link size={14} />
      </button>

      <div className={styles.divider} />

      <button
        type="button"
        className={styles.button}
        data-active={listType === "bullet"}
        onClick={toggleBulletList}
        title="Bullet list"
      >
        <List size={14} />
      </button>
      <button
        type="button"
        className={styles.button}
        data-active={listType === "number"}
        onClick={toggleNumberList}
        title="Numbered list"
      >
        <ListOrdered size={14} />
      </button>

      {showLinkInput && (
        <div className={styles.linkInput}>
          <input
            ref={linkInputRef}
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insertLink();
              }
              else if (e.key === "Escape") {
                setShowLinkInput(false);
                setLinkUrl("");
                savedSelectionRef.current = null;
                editor.focus();
              }
            }}
          />
          <button type="button" onClick={insertLink}>
            Add
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
