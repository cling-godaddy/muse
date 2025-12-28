import { useState, useEffect } from "react";
import { Spinner } from "@muse/editor";

interface Stats {
  total: number
  reviewed: number
  pending: number
  approved: number
  flagged: number
  accuracy: {
    accurate: number
    partial: number
    wrong: number
    unrated: number
  }
  searchability: {
    avgScore: number | null
    totalTests: number
  }
}

interface EntryItem {
  id: string
  previewUrl: string
  caption: string
  status: "pending" | "approved" | "flagged"
  accuracy: "accurate" | "partial" | "wrong" | null
}

interface Props {
  onStartReview: () => void
  onSelectEntry: (id: string) => void
  onBackToMain: () => void
}

const API_BASE = "/api/review";

export function Dashboard({ onStartReview, onSelectEntry, onBackToMain }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "flagged">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    params.set("limit", "100");

    fetch(`${API_BASE}/entries?${params}`)
      .then(r => r.json())
      .then((data) => {
        if (!cancelled) {
          setEntries(data.entries);
          setTotal(data.total);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const pct = stats ? Math.round((stats.reviewed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBackToMain} className="text-neutral-400 hover:text-white">
              ← Back
            </button>
            <h1 className="text-2xl font-semibold">KB Review</h1>
          </div>
          <button
            onClick={onStartReview}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
          >
            Start Review
          </button>
        </header>

        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-neutral-900 rounded-lg p-6">
              <div className="text-sm text-neutral-400 mb-2">Progress</div>
              <div className="text-3xl font-bold mb-2">
                {stats.reviewed}
                /
                {stats.total}
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-sm text-neutral-500 mt-2">
                {pct}
                % reviewed
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <div className="text-sm text-neutral-400 mb-2">Accuracy</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-400">Accurate</span>
                  <span>{stats.accuracy.accurate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Partial</span>
                  <span>{stats.accuracy.partial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Wrong</span>
                  <span>{stats.accuracy.wrong}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6">
              <div className="text-sm text-neutral-400 mb-2">Searchability</div>
              <div className="text-3xl font-bold mb-2">
                {stats.searchability.avgScore !== null
                  ? `${(stats.searchability.avgScore * 100).toFixed(0)}%`
                  : "—"}
              </div>
              <div className="text-sm text-neutral-500">
                {stats.searchability.totalTests}
                {" "}
                search tests run
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-neutral-400">Filter:</span>
          {(["all", "pending", "approved", "flagged"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm ${
                filter === f
                  ? "bg-neutral-700 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && stats && (
                <span className="ml-1 text-neutral-500">
                  (
                  {f === "pending" ? stats.pending : f === "approved" ? stats.approved : stats.flagged}
                  )
                </span>
              )}
            </button>
          ))}
        </div>

        {loading
          ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          )
          : (
            <>
              <div className="text-sm text-neutral-500 mb-4">
                {total}
                {" "}
                entries
              </div>
              <div className="grid grid-cols-6 gap-4">
                {entries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => onSelectEntry(entry.id)}
                    className="group relative aspect-square bg-neutral-900 rounded-lg overflow-hidden hover:ring-2 ring-blue-500"
                  >
                    <img
                      src={entry.previewUrl}
                      alt={entry.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-white truncate">
                        {entry.caption.slice(0, 50)}
                        ...
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      {entry.accuracy === "accurate" && (
                        <span className="w-3 h-3 rounded-full bg-green-500 block" />
                      )}
                      {entry.accuracy === "partial" && (
                        <span className="w-3 h-3 rounded-full bg-yellow-500 block" />
                      )}
                      {entry.accuracy === "wrong" && (
                        <span className="w-3 h-3 rounded-full bg-red-500 block" />
                      )}
                      {entry.status === "flagged" && !entry.accuracy && (
                        <span className="w-3 h-3 rounded-full bg-orange-500 block" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
