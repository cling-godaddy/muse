import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { FieldType } from "@muse/sections";

/**
 * Information about the currently active edit target
 */
export interface ActiveEdit {
  sectionId: string
  path: string
  fieldType: FieldType
  element: HTMLElement
}

interface EditActivationContextValue {
  /** Currently active edit target, if any */
  activeEdit: ActiveEdit | null
  /** Activate editing for a specific field */
  activate: (edit: ActiveEdit) => void
  /** Deactivate editing */
  deactivate: () => void
  /** Save a field value change */
  saveField: (sectionId: string, path: string, value: unknown) => void
  /** Get the current value of a field */
  getFieldValue: (sectionId: string, path: string) => unknown
}

const EditActivationContext = createContext<EditActivationContextValue | null>(null);

interface ProviderProps {
  children: ReactNode
  /** Container element for click detection (defaults to document) */
  containerRef?: React.RefObject<HTMLElement>
  /** Callback to save field changes */
  onSaveField?: (sectionId: string, path: string, value: unknown) => void
  /** Callback to get current field value */
  onGetFieldValue?: (sectionId: string, path: string) => unknown
}

/**
 * Provider that handles click-to-edit detection.
 * Listens for clicks on elements with data-editable-path attribute.
 */
export function EditActivationProvider({ children, containerRef, onSaveField, onGetFieldValue }: ProviderProps) {
  const [activeEdit, setActiveEdit] = useState<ActiveEdit | null>(null);
  const isClickInsideRef = useRef(false);

  const activate = useCallback((edit: ActiveEdit) => {
    setActiveEdit(edit);
  }, []);

  const deactivate = useCallback(() => {
    setActiveEdit(null);
  }, []);

  const saveField = useCallback((sectionId: string, path: string, value: unknown) => {
    onSaveField?.(sectionId, path, value);
  }, [onSaveField]);

  const getFieldValue = useCallback((sectionId: string, path: string) => {
    return onGetFieldValue?.(sectionId, path);
  }, [onGetFieldValue]);

  // Click handler to detect editable field clicks
  useEffect(() => {
    const container = containerRef?.current ?? document;

    const handleClick = (e: Event) => {
      const event = e as MouseEvent;
      const target = event.target as HTMLElement;

      // Find closest editable element
      const editable = target.closest("[data-editable-path]") as HTMLElement | null;

      if (!editable) {
        // Clicked outside any editable - deactivate
        // But only if we're not clicking inside the active edit overlay
        if (!isClickInsideRef.current) {
          deactivate();
        }
        return;
      }

      const path = editable.dataset.editablePath;
      const sectionId = editable.dataset.sectionId;
      const fieldType = editable.dataset.fieldType as FieldType;

      if (!path || !sectionId || !fieldType) {
        console.warn("EditActivation: incomplete data attributes on", editable);
        return;
      }

      // Activate this field
      // TODO: remove debug log once overlays are implemented
      console.log("[EditActivation] click detected:", { sectionId, path, fieldType });
      activate({
        sectionId,
        path,
        fieldType,
        element: editable,
      });
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [containerRef, activate, deactivate]);

  return (
    <EditActivationContext.Provider value={{ activeEdit, activate, deactivate, saveField, getFieldValue }}>
      {children}
    </EditActivationContext.Provider>
  );
}

/**
 * Hook to access the edit activation context
 */
export function useEditActivation() {
  const ctx = useContext(EditActivationContext);
  if (!ctx) {
    throw new Error("useEditActivation must be used within EditActivationProvider");
  }
  return ctx;
}

/**
 * Hook for overlays to mark their container as "inside" the edit flow.
 * Clicks inside won't trigger deactivation.
 */
export function useEditInsideMarker(ref: React.RefObject<HTMLElement>) {
  const { activeEdit } = useEditActivation();
  const isClickInsideRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !activeEdit) return;

    const handleMouseDown = () => {
      isClickInsideRef.current = true;
    };
    const handleMouseUp = () => {
      // Reset after the click event has had a chance to fire
      setTimeout(() => {
        isClickInsideRef.current = false;
      }, 0);
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseup", handleMouseUp);
    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref, activeEdit]);
}
