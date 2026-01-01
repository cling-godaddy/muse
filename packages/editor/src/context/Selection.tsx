import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Selection {
  blockId: string
  itemIndex?: number
}

interface SelectionContextValue {
  selection: Selection | null
  select: (blockId: string, itemIndex?: number) => void
  clearSelection: () => void
  isSelected: (blockId: string, itemIndex?: number) => boolean
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection | null>(null);

  const select = useCallback((blockId: string, itemIndex?: number) => {
    setSelection({ blockId, itemIndex });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const isSelected = useCallback((blockId: string, itemIndex?: number) => {
    if (!selection) return false;
    if (selection.blockId !== blockId) return false;
    if (itemIndex === undefined) return selection.itemIndex === undefined;
    return selection.itemIndex === itemIndex;
  }, [selection]);

  return (
    <SelectionContext.Provider value={{ selection, select, clearSelection, isSelected }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection must be used within SelectionProvider");
  }
  return ctx;
}
