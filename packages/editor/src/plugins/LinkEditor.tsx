import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import styles from "./LinkEditor.module.css";

interface Position {
  top: number
  left: number
}

export function LinkEditorPlugin() {
  const [editor] = useLexicalComposerContext();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [url, setUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState("");

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setVisible(false);
      return;
    }

    // Only show when collapsed (cursor inside link, not selecting)
    if (!selection.isCollapsed()) {
      setVisible(false);
      return;
    }

    const node = selection.anchor.getNode();
    const parent = node.getParent();
    let linkNode: LinkNode | null = null;

    if ($isLinkNode(parent)) {
      linkNode = parent;
    }
    else if ($isLinkNode(node)) {
      linkNode = node as LinkNode;
    }

    if (!linkNode) {
      setVisible(false);
      return;
    }

    const linkUrl = linkNode.getURL();
    setUrl(linkUrl);
    setEditUrl(linkUrl);

    // Position below the link
    const domNode = editor.getElementByKey(linkNode.getKey());
    if (domNode) {
      const rect = domNode.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
      setVisible(true);
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateLinkEditor();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateLinkEditor();
      });
    });
  }, [editor, updateLinkEditor]);

  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setVisible(false);
  };

  const saveEdit = () => {
    if (editUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, editUrl);
    }
    setIsEditing(false);
  };

  if (!visible) return null;

  return createPortal(
    <div
      data-link-editor=""
      className={styles.popover}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={e => e.preventDefault()}
    >
      {isEditing
        ? (
          <div className={styles.row}>
            <input
              type="url"
              className={styles.input}
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveEdit();
                }
                else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditUrl(url);
                }
              }}
              autoFocus
            />
            <button type="button" className={styles.button} onClick={saveEdit}>
              Save
            </button>
          </div>
        )
        : (
          <div className={styles.row}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.url} ${styles.urlLink}`}
              title={url}
            >
              <ExternalLink size={12} style={{ marginRight: 4 }} />
              {url}
            </a>
            <button
              type="button"
              className={styles.button}
              onClick={() => setIsEditing(true)}
              title="Edit link"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.danger}`}
              onClick={removeLink}
              title="Remove link"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
    </div>,
    document.body,
  );
}
