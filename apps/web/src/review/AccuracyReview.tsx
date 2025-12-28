import { useState, useEffect, useCallback } from "react";
import { getColorStyle } from "./color";

type AccuracyRating = "accurate" | "partial" | "wrong";

interface Entry {
  id: string
  displayUrl: string
  caption: string
  subjects: string[]
  style: string[]
  colors?: { dominant: string[] }
  mood?: string[]
  context?: string[]
  blacklisted?: boolean
}

interface Props {
  entry: Entry
  onComplete: () => void
}

const API_BASE = "/api/review";

export function AccuracyReview({ entry, onComplete }: Props) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [blacklisted, setBlacklisted] = useState(entry.blacklisted ?? false);

  const handleToggleBlacklist = useCallback(async () => {
    const newValue = !blacklisted;
    setBlacklisted(newValue);
    try {
      await fetch(`${API_BASE}/entries/${encodeURIComponent(entry.id)}/blacklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklisted: newValue }),
      });
    }
    catch (err) {
      console.error("Failed to update blacklist:", err);
      setBlacklisted(!newValue); // revert on error
    }
  }, [entry.id, blacklisted]);

  const handleRate = useCallback(async (accuracy: AccuracyRating) => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/entries/${encodeURIComponent(entry.id)}/accuracy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accuracy,
          notes: notes.trim() || undefined,
        }),
      });
      onComplete();
    }
    catch (err) {
      console.error("Failed to save accuracy:", err);
    }
    finally {
      setSaving(false);
    }
  }, [entry.id, notes, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "1") handleRate("accurate");
      else if (e.key === "2") handleRate("partial");
      else if (e.key === "3") handleRate("wrong");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRate]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={entry.displayUrl}
              alt="Image being reviewed"
              className={`max-h-[500px] rounded-lg shadow-2xl object-contain ${blacklisted ? "opacity-50" : ""}`}
            />
            {blacklisted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-500 text-6xl font-bold opacity-50">BLOCKED</span>
              </div>
            )}
          </div>
          <button
            onClick={handleToggleBlacklist}
            className={`text-sm px-3 py-1 rounded ${
              blacklisted
                ? "bg-red-600/20 text-red-400 border border-red-600/50"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            {blacklisted ? "Blocked" : "Block image"}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-sm text-neutral-500 mb-2">Caption</div>
            <div className="text-lg leading-relaxed">{entry.caption}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {entry.subjects.length > 0 && (
              <div>
                <div className="text-neutral-500 mb-1">Subjects</div>
                <div className="flex flex-wrap gap-1">
                  {entry.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.style.length > 0 && (
              <div>
                <div className="text-neutral-500 mb-1">Style</div>
                <div className="flex flex-wrap gap-1">
                  {entry.style.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.mood && entry.mood.length > 0 && (
              <div>
                <div className="text-neutral-500 mb-1">Mood</div>
                <div className="flex flex-wrap gap-1">
                  {entry.mood.map(m => (
                    <span key={m} className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.colors && (
              <div>
                <div className="text-neutral-500 mb-1">Colors</div>
                <div className="flex flex-wrap gap-1">
                  {entry.colors.dominant.map((c) => {
                    const style = getColorStyle(c);
                    return style
                      ? (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {c}
                        </span>
                      )
                      : (
                        <span key={c} className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-300">
                          {c}
                        </span>
                      );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-neutral-500 mb-2">Notes (optional)</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any issues or observations..."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-600 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleRate("accurate")}
          disabled={saving}
          className="flex-1 max-w-[200px] py-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 text-green-400 rounded-lg font-medium disabled:opacity-50"
        >
          <div>Accurate</div>
          <div className="text-xs text-green-600 mt-1">Press 1</div>
        </button>
        <button
          onClick={() => handleRate("partial")}
          disabled={saving}
          className="flex-1 max-w-[200px] py-4 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/50 text-yellow-400 rounded-lg font-medium disabled:opacity-50"
        >
          <div>Partial</div>
          <div className="text-xs text-yellow-600 mt-1">Press 2</div>
        </button>
        <button
          onClick={() => handleRate("wrong")}
          disabled={saving}
          className="flex-1 max-w-[200px] py-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg font-medium disabled:opacity-50"
        >
          <div>Wrong</div>
          <div className="text-xs text-red-600 mt-1">Press 3</div>
        </button>
      </div>
    </div>
  );
}
