import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Trash2 } from "lucide-react";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { Dialog, Spinner } from "@muse/editor";

interface SiteSummary {
  id: string
  name: string
  updatedAt: string
  pageCount: number
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function SiteCard({ site, to, onDelete }: { site: SiteSummary, to: string, onDelete: () => void }) {
  return (
    <div className="group relative">
      <Link
        to={to}
        className="block bg-bg-muted rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
      >
        <div className="aspect-video bg-bg-subtle flex items-center justify-center">
          <span className="text-4xl text-text-subtle font-medium">
            {site.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-medium truncate text-text">{site.name}</h3>
          <p className="text-sm text-text-muted">
            {site.pageCount}
            {" "}
            page
            {site.pageCount !== 1 ? "s" : ""}
            {" "}
            ·
            {formatRelativeTime(site.updatedAt)}
          </p>
        </div>
      </Link>
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1.5 rounded bg-bg/80 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white text-text-muted transition-all"
        aria-label="Delete site"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function EmptyState({ onCreate, isCreating }: { onCreate: () => void, isCreating: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 text-text-subtle">+</div>
      <p className="text-text-muted mb-6">No sites yet. Create your first one.</p>
      <button
        onClick={onCreate}
        disabled={isCreating}
        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isCreating ? <Spinner /> : "Create Site"}
      </button>
    </div>
  );
}

export function SitesDashboard() {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingSite, setDeletingSite] = useState<SiteSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    authFetch("/api/sites")
      .then(r => r.json())
      .then(data => setSites(data.sites))
      .finally(() => setLoading(false));
  }, [authFetch]);

  const handleNewSite = async () => {
    setCreating(true);
    try {
      const res = await authFetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Site" }),
      });
      const site = await res.json();
      navigate(`/sites/${site.id}`);
    }
    finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSite) return;
    setIsDeleting(true);
    try {
      await authFetch(`/api/sites/${deletingSite.id}`, { method: "DELETE" });
      setSites(prev => prev.filter(s => s.id !== deletingSite.id));
      setDeletingSite(null);
    }
    finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="px-6 py-3 border-b border-border bg-bg flex items-center gap-4">
        <Link to="/" className="text-xl font-semibold hover:text-primary transition-colors">
          Muse
        </Link>
        <div className="ml-auto">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">My Sites</h1>
          {sites.length > 0 && (
            <button
              onClick={handleNewSite}
              disabled={creating}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <Spinner /> : "New Site"}
            </button>
          )}
        </div>

        {loading
          ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          )
          : sites.length === 0
            ? (
              <EmptyState onCreate={handleNewSite} isCreating={creating} />
            )
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map(site => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    to={`/sites/${site.id}`}
                    onDelete={() => setDeletingSite(site)}
                  />
                ))}
              </div>
            )}
      </div>

      <Dialog
        open={!!deletingSite}
        onOpenChange={open => !open && setDeletingSite(null)}
        title="Delete Site"
      >
        <div className="p-5 pt-0">
          <p className="text-text-muted mb-6">
            Are you sure you want to delete
            {" "}
            <span className="font-medium text-text">{deletingSite?.name}</span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeletingSite(null)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? <Spinner /> : "Delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
