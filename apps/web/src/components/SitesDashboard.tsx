import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Trash2, Upload } from "lucide-react";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { Dialog, Spinner } from "@muse/editor";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 text-text-subtle">+</div>
      <p className="text-text-muted mb-6">No sites yet. Create your first one.</p>
      <button
        onClick={onCreate}
        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
      >
        Create Site
      </button>
    </div>
  );
}

type SiteType = "landing" | "full";

interface CreateSiteData {
  name: string
  description: string
  location: string
  siteType: SiteType
  autoGenerate: boolean
}

function CreateSiteModal({
  open,
  onOpenChange,
  onSubmit,
  isCreating,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSiteData) => void
  isCreating: boolean
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [siteType, setSiteType] = useState<SiteType>("landing");
  const [autoGenerate, setAutoGenerate] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name || "Untitled Site", description, location, siteType, autoGenerate });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
      setDescription("");
      setLocation("");
      setSiteType("landing");
      setAutoGenerate(true);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} title="Create New Site">
      <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Site Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Awesome Site"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg focus:ring-2 ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Business Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your business, products, or services..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg focus:ring-2 ring-primary outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="San Francisco, CA"
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg focus:ring-2 ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">Site Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSiteType("landing")}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                siteType === "landing"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-bg-subtle"
              }`}
            >
              Landing Page
            </button>
            <button
              type="button"
              onClick={() => setSiteType("full")}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                siteType === "full"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-bg-subtle"
              }`}
            >
              Full Site
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoGenerate}
            onChange={e => setAutoGenerate(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-text">Generate site immediately</span>
        </label>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-border hover:bg-bg-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isCreating ? <Spinner /> : "Create Site"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function SitesDashboard() {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingSite, setDeletingSite] = useState<SiteSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authFetch("/api/sites")
      .then(r => r.json())
      .then(data => setSites(data.sites))
      .finally(() => setLoading(false));
  }, [authFetch]);

  const handleCreateSite = async (data: CreateSiteData) => {
    setCreating(true);
    try {
      const res = await authFetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          location: data.location,
          siteType: data.siteType,
        }),
      });
      const site = await res.json();
      navigate(`/sites/${site.id}`, { state: { autoGenerate: data.autoGenerate } });
    }
    finally {
      setCreating(false);
      setShowCreateModal(false);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.includes("json") && !file.name.endsWith(".json")) {
      setImportError("Please select a JSON file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImportError("File too large (max 10MB)");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await authFetch("/api/sites/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }

      const result = await res.json();
      setImportSuccess(result.message);
      setTimeout(() => setImportSuccess(null), 5000);
    }
    catch (err) {
      if (err instanceof SyntaxError) {
        setImportError("Invalid JSON file");
      }
      else {
        setImportError(err instanceof Error ? err.message : "Import failed");
      }
      setTimeout(() => setImportError(null), 5000);
    }
    finally {
      setImporting(false);
      e.target.value = "";
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
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="px-4 py-2 border border-border hover:bg-bg-subtle rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {importing ? <Spinner /> : <Upload size={16} />}
                Import
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                New Site
              </button>
            </div>
          )}
        </div>

        {importError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {importError}
          </div>
        )}
        {importSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            {importSuccess}
          </div>
        )}

        {loading
          ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          )
          : sites.length === 0
            ? (
              <EmptyState onCreate={() => setShowCreateModal(true)} />
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

      <CreateSiteModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateSite}
        isCreating={creating}
      />
    </div>
  );
}
