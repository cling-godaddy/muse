import { useState, useCallback, useMemo, useRef, useLayoutEffect } from "react";

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_MS = 300;

export interface UseHistory<T> {
  /** Save current present to past (call BEFORE mutation) */
  push: () => void
  undo: () => T | null
  redo: () => T | null
  canUndo: boolean
  canRedo: boolean
  clear: () => void
  /** Set current state as baseline without creating history entry */
  setBaseline: (state: T) => void
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
  // Use ref to access present in callbacks without causing them to re-create
  const presentRef = useRef<T>(initial);
  useLayoutEffect(() => {
    presentRef.current = present;
  }, [present]);

  const push = useCallback(() => {
    const now = Date.now();
    const shouldDebounce = now - lastPushRef.current < DEBOUNCE_MS;
    lastPushRef.current = now;

    // During transaction, only first push creates history entry
    if (transactionRef.current.active && transactionRef.current.hasPushed) {
      return;
    }

    // Debounce rapid pushes - don't create new entry
    if (shouldDebounce && !transactionRef.current.active) {
      return;
    }

    if (transactionRef.current.active) {
      transactionRef.current.hasPushed = true;
    }

    setHistory((prev) => {
      const newPast = [...prev.past, presentRef.current];
      // Enforce circular buffer limit
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      return { past: newPast, future: [] };
    });
  }, []);

  const undo = useCallback((): T | null => {
    let restored: T | null = null;
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const last = prev.past[prev.past.length - 1];
      if (last === undefined) return prev;
      restored = last;
      return { past: prev.past.slice(0, -1), future: [presentRef.current, ...prev.future] };
    });
    if (restored !== null) {
      setPresent(restored);
    }
    return restored;
  }, []);

  const redo = useCallback((): T | null => {
    let restored: T | null = null;
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const first = prev.future[0];
      if (first === undefined) return prev;
      restored = first;
      return { past: [...prev.past, presentRef.current], future: prev.future.slice(1) };
    });
    if (restored !== null) {
      setPresent(restored);
    }
    return restored;
  }, []);

  const clear = useCallback(() => {
    setHistory({ past: [], future: [] });
  }, []);

  const setBaseline = useCallback((state: T) => {
    setPresent(state);
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
      setBaseline,
      beginTransaction,
      commitTransaction,
      rollbackTransaction,
    }),
    [push, undo, redo, canUndo, canRedo, clear, setBaseline, beginTransaction, commitTransaction, rollbackTransaction],
  );
}
