import { useState, useEffect, useRef } from "react";

interface SiteTitleInputProps {
  value: string
  onChange: (value: string) => void
}

export function SiteTitleInput({ value, onChange }: SiteTitleInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim() || "Untitled Site";
    if (trimmed !== value) {
      onChange(trimmed);
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-sm text-text-muted hover:text-text truncate max-w-[200px] transition-colors"
      >
        {value}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      }}
      className="text-sm bg-transparent border-b border-border focus:border-primary outline-none w-[200px] text-text"
    />
  );
}
