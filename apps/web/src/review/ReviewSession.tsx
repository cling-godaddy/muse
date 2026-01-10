import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Spinner } from "@muse/ui";
import { AccuracyReview } from "./AccuracyReview";

interface EntryData {
  id: string
  previewUrl: string
  displayUrl: string
  caption: string
  subjects: string[]
  style: string[]
  colors?: { dominant: string[] }
  mood?: string[]
  context?: string[]
  blacklisted?: boolean
}

interface Stats {
  total: number
  reviewed: number
}

interface Props {
  entryId?: string
  onBack: () => void
  onNavigate?: (id: string) => void
}

const API_BASE = "/api/review";

export function ReviewSession({ entryId, onBack, onNavigate }: Props) {
  const { getToken } = useAuth();
  const [entry, setEntry] = useState<EntryData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }, [getToken]);

  const loadStats = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/stats`);
      const data = await res.json();
      setStats({ total: data.total, reviewed: data.reviewed });
    }
    catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, [authFetch]);

  const loadEntry = useCallback(async (id?: string) => {
    setLoading(true);
    try {
      if (id) {
        const res = await authFetch(`${API_BASE}/entries/${encodeURIComponent(id)}`);
        const data = await res.json();
        setEntry(data);
      }
      else {
        const afterParam = entry?.id ? `?after=${encodeURIComponent(entry.id)}` : "";
        const res = await authFetch(`${API_BASE}/next${afterParam}`);
        const data = await res.json();
        if (data.entry) {
          setEntry(data.entry);
          onNavigate?.(data.entry.id);
        }
        else {
          setEntry(null);
        }
      }
    }
    catch (err) {
      console.error("Failed to load entry:", err);
    }
    finally {
      setLoading(false);
    }
  }, [authFetch, entry?.id, onNavigate]);

  useEffect(() => {
    loadStats();
    loadEntry(entryId);
  }, [entryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = () => {
    setSessionCount(c => c + 1);
    loadStats();
    loadEntry();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center gap-4">
        <div className="text-xl">All entries reviewed!</div>
        <div className="text-neutral-500">
          {sessionCount > 0 && `You reviewed ${sessionCount} entries this session.`}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="fixed top-0 left-0 right-0 bg-neutral-900/80 backdrop-blur border-b border-neutral-800 px-6 py-3 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-neutral-400 hover:text-white">
          ← Dashboard
        </button>
        {stats && (
          <div className="flex items-center gap-3">
            <div className="w-32 bg-neutral-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round((stats.reviewed / stats.total) * 100)}%` }}
              />
            </div>
            <span className="text-sm text-neutral-500">
              {stats.reviewed}
              /
              {stats.total}
            </span>
          </div>
        )}
        <div className="text-sm text-neutral-500">
          Press 1/2/3 to rate
        </div>
      </header>

      <div className="pt-16">
        <AccuracyReview entry={entry} onComplete={handleComplete} />
      </div>
    </div>
  );
}
