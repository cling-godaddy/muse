import { createContext, useContext, type ReactNode } from "react";

type EditorMode = "edit" | "preview";

const EditorModeContext = createContext<EditorMode>("edit");

interface EditorModeProviderProps {
  mode: EditorMode
  children: ReactNode
}

export function EditorModeProvider({ mode, children }: EditorModeProviderProps) {
  return (
    <EditorModeContext.Provider value={mode}>
      {children}
    </EditorModeContext.Provider>
  );
}

export function useEditorMode(): EditorMode {
  return useContext(EditorModeContext);
}

export function useIsEditable(): boolean {
  return useContext(EditorModeContext) === "edit";
}
