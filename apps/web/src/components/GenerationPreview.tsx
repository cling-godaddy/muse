import { Check, Loader2 } from "lucide-react";
import { getPalette, getTypography } from "@muse/themes";
import type { AgentState } from "../utils/streamParser";

// TODO: Consider moving to editor package if reuse needed

interface GenerationPreviewProps {
  agents: AgentState[]
}

function AgentCard({
  agent,
  title,
  children,
}: {
  agent: AgentState | undefined
  title: string
  children: React.ReactNode
}) {
  if (!agent || agent.status === "pending") return null;

  const isRunning = agent.status === "running";
  const isComplete = agent.status === "complete";

  return (
    <div
      className={`
        border border-border rounded-lg p-4 bg-white
        muse-fade-in
        ${isRunning ? "opacity-80" : ""}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        {isRunning
          ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )
          : isComplete
            ? (
              <Check className="w-4 h-4 text-green-600" />
            )
            : null}
        <span className="text-sm font-medium text-text">{title}</span>
      </div>
      <div className="text-sm text-text-muted">{children}</div>
    </div>
  );
}

function PaletteSwatches({ paletteId }: { paletteId: string | undefined }) {
  if (!paletteId) return null;

  const palette = getPalette(paletteId);
  if (!palette) return null;

  const colors = [
    palette.colors.primary,
    palette.colors.accent,
    palette.colors.background,
    palette.colors.backgroundAlt,
    palette.colors.text,
  ];

  return (
    <div className="flex items-center gap-1.5">
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border border-black/10"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function SectionWireframes({ types }: { types: string[] | undefined }) {
  if (!types || types.length === 0) return null;

  // Simple wireframe representations for common section types
  const wireframes: Record<string, React.ReactNode> = {
    hero: (
      <div className="w-8 h-6 border border-current rounded-sm flex items-center justify-center">
        <div className="w-4 h-1 bg-current rounded-full" />
      </div>
    ),
    features: (
      <div className="w-8 h-6 border border-current rounded-sm flex items-center justify-center gap-0.5">
        <div className="w-1.5 h-3 bg-current rounded-sm" />
        <div className="w-1.5 h-3 bg-current rounded-sm" />
        <div className="w-1.5 h-3 bg-current rounded-sm" />
      </div>
    ),
    testimonials: (
      <div className="w-8 h-6 border border-current rounded-sm flex items-center justify-center">
        <div className="w-3 h-3 border border-current rounded-full" />
      </div>
    ),
    cta: (
      <div className="w-8 h-6 border border-current rounded-sm flex items-center justify-center">
        <div className="w-4 h-2 bg-current rounded-sm" />
      </div>
    ),
    footer: (
      <div className="w-8 h-6 border border-current rounded-sm flex items-end justify-center pb-0.5">
        <div className="w-6 h-1 bg-current rounded-full" />
      </div>
    ),
  };

  // Default wireframe for unknown types
  const defaultWireframe = (
    <div className="w-8 h-6 border border-current rounded-sm" />
  );

  return (
    <div className="flex items-center gap-1">
      {types.slice(0, 5).map((type, i) => (
        <div key={i} className="text-text-muted" title={type}>
          {wireframes[type] || defaultWireframe}
        </div>
      ))}
      {types.length > 5 && (
        <span className="text-xs text-text-muted">
          +
          {types.length - 5}
        </span>
      )}
    </div>
  );
}

export function GenerationPreview({ agents }: GenerationPreviewProps) {
  const briefAgent = agents.find(a => a.name === "brief");
  const themeAgent = agents.find(a => a.name === "theme");
  const structureAgent = agents.find(a => a.name === "structure");
  const sitemapAgent = agents.find(a => a.name === "sitemap");
  const copyAgent = agents.find(a => a.name === "copy");
  const pagesAgent = agents.find(a => a.name === "pages");
  const imageAgent = agents.find(a => a.name === "image");

  // Use sitemap for multi-page, structure for single-page
  const layoutAgent = sitemapAgent && sitemapAgent.status !== "pending" ? sitemapAgent : structureAgent;
  // Use pages for multi-page, copy for single-page
  const contentAgent = pagesAgent && pagesAgent.status !== "pending" ? pagesAgent : copyAgent;

  const palette = themeAgent?.data?.palette ? getPalette(themeAgent.data.palette) : null;
  const typography = themeAgent?.data?.typography ? getTypography(themeAgent.data.typography) : null;

  // Don't render if no agents have started
  const hasStarted = agents.some(a => a.status !== "pending");
  if (!hasStarted) return null;

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-3">
        <h2 className="text-lg font-medium text-text text-center mb-6">
          Building Your Site
        </h2>

        <AgentCard agent={briefAgent} title="Brand Strategy">
          {briefAgent?.summary || "Analyzing your brand..."}
        </AgentCard>

        <AgentCard agent={themeAgent} title="Color Palette">
          <div className="space-y-2">
            <PaletteSwatches paletteId={themeAgent?.data?.palette} />
            {palette && typography && (
              <span>
                {palette.name}
                {" "}
                ·
                {typography.name}
              </span>
            )}
            {!palette && "Selecting colors..."}
          </div>
        </AgentCard>

        <AgentCard agent={layoutAgent} title={layoutAgent?.name === "sitemap" ? "Site Structure" : "Page Structure"}>
          {structureAgent?.data?.sectionTypes
            ? (
              <div className="space-y-2">
                <SectionWireframes types={structureAgent.data.sectionTypes} />
                <span>
                  {structureAgent.data.sectionCount}
                  {" "}
                  sections planned
                </span>
              </div>
            )
            : sitemapAgent?.data?.sectionCount
              ? (
                <span>
                  {sitemapAgent.data.sectionCount}
                  {" "}
                  pages planned
                </span>
              )
              : (
                "Planning layout..."
              )}
        </AgentCard>

        <AgentCard agent={contentAgent} title={contentAgent?.name === "pages" ? "Page Builder" : "Copywriter"}>
          {contentAgent?.status === "complete"
            ? (
              <span>
                {contentAgent.data?.sectionCount}
                {" "}
                sections generated
              </span>
            )
            : (
              "Crafting headlines, copy, and calls to action..."
            )}
        </AgentCard>

        <AgentCard agent={imageAgent} title="Images">
          {imageAgent?.data?.planned
            ? (
              <span>
                Curating
                {" "}
                {imageAgent.data.resolved ?? 0}
                /
                {imageAgent.data.planned}
                {" "}
                images
              </span>
            )
            : (
              "Selecting images..."
            )}
        </AgentCard>
      </div>
    </div>
  );
}
