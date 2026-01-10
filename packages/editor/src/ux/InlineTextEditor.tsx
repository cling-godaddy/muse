import { useEffect, useRef, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { $getRoot } from "lexical";
import { type RichContent, type TextOrRich, getPlainText } from "@muse/core";
import { theme } from "../theme";
import { FloatingToolbarPlugin } from "../plugins/FloatingToolbar";
import { LinkEditorPlugin } from "../plugins/LinkEditor";
import { initializeFromValue } from "../utils/richContent";

interface InlineTextEditorProps {
  value: TextOrRich
  onChange: (value: RichContent) => void
  className?: string
  /** Whether the editor is currently active/editable */
  isEditing: boolean
  /** Called when editor should activate (e.g., on click) */
  onActivate?: () => void
  /** Hide list formatting options */
  hideLists?: boolean
  /** Element type for AI rewrite suggestions */
  elementType?: string
  /** Data path for EditActivation (e.g., "headline", "items[0].title") */
  path?: string
  /** Section ID for EditActivation */
  sectionId?: string
  /** Field type for EditActivation */
  fieldType?: string
}

// Plugin to control editable state
function EditableStatePlugin({ isEditing }: { isEditing: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(isEditing);
  }, [editor, isEditing]);

  return null;
}

// Plugin to sync external value changes
function SyncPlugin({ value }: { value: TextOrRich }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const lastValueRef = useRef<TextOrRich>(value);

  useEffect(() => {
    if (!initializedRef.current) {
      initializeFromValue(editor, value);
      initializedRef.current = true;
      lastValueRef.current = value;
      return;
    }

    const prevText = getPlainText(lastValueRef.current);
    const newText = getPlainText(value);

    let editorText = "";
    editor.getEditorState().read(() => {
      editorText = $getRoot().getTextContent();
    });

    if (prevText !== newText && editorText !== newText) {
      initializeFromValue(editor, value);
    }

    lastValueRef.current = value;
  }, [editor, value]);

  return null;
}

// Plugin to auto-focus when editing starts
function AutoFocusOnEditPlugin({ isEditing }: { isEditing: boolean }) {
  const [editor] = useLexicalComposerContext();
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (isEditing && !wasEditingRef.current) {
      // Just became editable - focus with delay for command listeners
      const timeout = setTimeout(() => {
        editor.focus();
      }, 0);
      wasEditingRef.current = true;
      return () => clearTimeout(timeout);
    }
    if (!isEditing) {
      wasEditingRef.current = false;
    }
  }, [editor, isEditing]);

  return null;
}

export function InlineTextEditor({
  value,
  onChange,
  className,
  isEditing,
  onActivate,
  hideLists,
  elementType,
  path,
  sectionId,
  fieldType,
}: InlineTextEditorProps) {
  const initialConfig = {
    namespace: "muse-inline-editor",
    theme,
    nodes: [LinkNode, AutoLinkNode, ListNode, ListItemNode, HeadingNode],
    editable: isEditing,
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const json = editorState.toJSON();
      const text = $getRoot().getTextContent();
      onChange({ _rich: true, json, text });
    });
  }, [onChange]);

  const handleClick = useCallback(() => {
    if (!isEditing && onActivate) {
      onActivate();
    }
  }, [isEditing, onActivate]);

  // Data attributes for EditActivation to recognize this as an editable field
  const editAttrs = path && sectionId
    ? {
      "data-editable-path": path,
      "data-section-id": sectionId,
      "data-field-type": fieldType,
    }
    : {};

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        data-element-type={elementType}
        {...editAttrs}
        onClick={handleClick}
        style={{ cursor: isEditing ? "text" : "pointer" }}
      >
        <RichTextPlugin
          contentEditable={(
            <ContentEditable className={className} />
          )}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <LinkPlugin />
      <ListPlugin />
      <EditableStatePlugin isEditing={isEditing} />
      <SyncPlugin value={value} />
      <AutoFocusOnEditPlugin isEditing={isEditing} />
      {isEditing && (
        <>
          <FloatingToolbarPlugin hideLists={hideLists} />
          <LinkEditorPlugin />
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        </>
      )}
    </LexicalComposer>
  );
}
