import { useState, useCallback } from "react";
import type { Block } from "@muse/core";

export interface UseBlocks {
  blocks: Block[]
  addBlock: (block: Block, index?: number) => void
  updateBlock: (id: string, data: Partial<Block>) => void
  deleteBlock: (id: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  setBlocks: (blocks: Block[]) => void
  clearBlocks: () => void
}

export function useBlocks(initial: Block[] = []): UseBlocks {
  const [blocks, setBlocksState] = useState<Block[]>(initial);

  const setBlocks = useCallback((newBlocks: Block[]) => {
    setBlocksState(newBlocks);
  }, []);

  const clearBlocks = useCallback(() => {
    setBlocksState([]);
  }, []);

  const addBlock = useCallback((block: Block, index?: number) => {
    setBlocksState((prev) => {
      if (index === undefined) {
        return [...prev, block];
      }
      const next = [...prev];
      next.splice(index, 0, block);
      return next;
    });
  }, []);

  const updateBlock = useCallback((id: string, data: Partial<Block>) => {
    setBlocksState(prev =>
      prev.map(b => (b.id === id ? { ...b, ...data } : b)),
    );
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocksState(prev => prev.filter(b => b.id !== id));
  }, []);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocksState((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      const next = [...prev];
      const moved = next.splice(fromIndex, 1)[0];
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return {
    blocks,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    setBlocks,
    clearBlocks,
  };
}
