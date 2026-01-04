import { useState, useCallback, useMemo, useRef } from "react";

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_MS = 300;

export interface UseHistory<T> {
  push: (state: T) => void
  undo: () => T | null
  redo: () => T | null
  canUndo: boolean
  canRedo: boolean
  clear: () => void
  // Transaction API
  beginTransaction: () => void
  commitTransaction: () => void
  rollbackTransaction: () => T | null
}

interface HistoryState<T> {
  past: T[]
  future: T[]
}

interface TransactionState {
  active: boolean
  hasPushed: boolean // Track if we've pushed during this transaction
}

export function useHistory<T>(initial: T): UseHistory<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    future: [],
  });
  const [present, setPresent] = useState<T>(initial);
  const transactionRef = useRef<TransactionState>({ active: false, hasPushed: false });
  const lastPushRef = useRef<number>(0);

  const push = useCallback((state: T) => {
    const now = Date.now();
    const shouldDebounce = now - lastPushRef.current < DEBOUNCE_MS;
    lastPushRef.current = now;

    // During transaction, only first push creates history entry
    if (transactionRef.current.active && transactionRef.current.hasPushed) {
      setPresent(state);
      return;
    }

    // Debounce rapid pushes - just update present, don't create new entry
    if (shouldDebounce && !transactionRef.current.active) {
      setPresent(state);
      return;
    }

    if (transactionRef.current.active) {
      transactionRef.current.hasPushed = true;
    }

    setHistory((prev) => {
      const newPast = [...prev.past, present];
      // Enforce circular buffer limit
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return { past: newPast, future: [] };
    });
    setPresent(state);
  }, [present]);

  const undo = useCallback((): T | null => {
    let restored: T | null = null;
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const last = prev.past[prev.past.length - 1];
      if (last === undefined) return prev;
      restored = last;
      return { past: prev.past.slice(0, -1), future: [present, ...prev.future] };
    });
    if (restored !== null) {
      setPresent(restored);
    }
    return restored;
  }, [present]);

  const redo = useCallback((): T | null => {
    let restored: T | null = null;
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const first = prev.future[0];
      if (first === undefined) return prev;
      restored = first;
      return { past: [...prev.past, present], future: prev.future.slice(1) };
    });
    if (restored !== null) {
      setPresent(restored);
    }
    return restored;
  }, [present]);

  const clear = useCallback(() => {
    setHistory({ past: [], future: [] });
  }, []);

  const beginTransaction = useCallback(() => {
    transactionRef.current = { active: true, hasPushed: false };
  }, []);

  const commitTransaction = useCallback(() => {
    transactionRef.current = { active: false, hasPushed: false };
  }, []);

  const rollbackTransaction = useCallback((): T | null => {
    transactionRef.current = { active: false, hasPushed: false };
    // Undo the transaction by restoring pre-transaction state
    return undo();
  }, [undo]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return useMemo(
    () => ({
      push,
      undo,
      redo,
      canUndo,
      canRedo,
      clear,
      beginTransaction,
      commitTransaction,
      rollbackTransaction,
    }),
    [push, undo, redo, canUndo, canRedo, clear, beginTransaction, commitTransaction, rollbackTransaction],
  );
}
