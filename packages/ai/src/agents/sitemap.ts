import { createLogger } from "@muse/logger";
import type { Provider } from "../types";
import type { AgentInput, SitemapPlan, SyncAgent, SyncAgentResult } from "./types";
import { sitemapSchema } from "../schemas";

const log = createLogger().child({ agent: "sitemap" });

const systemPrompt = `You are a website information architect. Given a brand brief and user request, plan the site structure (what pages exist, their hierarchy, and their purposes).

Guidelines:
- Home page ("/") is ALWAYS included as the first page
- Plan 3-7 pages for a typical small business site
- Use 1-level nesting for most sites (e.g., /services/web-design, /products/widget)
- Deeper nesting only when explicitly requested or for large content sites
- Primary pages (homepage, main service/product pages) get 5-8 sections
- Secondary pages (about, contact, individual services) get 3-5 sections

Page hierarchy heuristics:
- "agency" or "services" business → nest under /services/*
- "store" or "ecommerce" → nest under /products/* or /shop/*
- "blog" mentioned → add /blog as top-level
- 4+ similar items (services, products) → nest under parent
- 2-3 similar items → keep flat at root level

Common page patterns:
- / (home) - always primary, main landing page
- /about - secondary, company story and team
- /services or /products - primary if multiple offerings
- /services/[name] - secondary, individual service details
- /pricing - primary if standalone, or part of service pages
- /contact - secondary, contact form and info
- /blog - primary if content-focused business

Suggested sections by page type:
- Home: hero, features, testimonials, stats, cta, footer
- About: hero, about, stats, testimonials, footer
- Services: hero, features, pricing, faq, cta, footer
- Contact: hero, contact, footer
- Product: hero, features, gallery, pricing, testimonials, cta, footer`;

export const sitemapAgent: SyncAgent = {
  config: {
    name: "sitemap",
    description: "Plans site structure and page hierarchy",
    model: "gpt-4o-mini",
  },

  async run(input: AgentInput, provider: Provider): Promise<SyncAgentResult> {
    const briefContext = input.brief
      ? `Brand Brief:
- Target Audience: ${input.brief.targetAudience}
- Brand Voice: ${input.brief.brandVoice.join(", ")}
- Constraints: ${input.brief.constraints.join(", ") || "none"}
`
      : "";

    const existingPagesContext = input.existingPages && input.existingPages.length > 0
      ? `\nExisting Pages (do not duplicate these):
${input.existingPages.map(p => `- ${p.slug}: ${p.title}`).join("\n")}
`
      : "";

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `${briefContext}${existingPagesContext}\nUser Request: ${input.prompt}`,
      },
    ];

    if (input.retryFeedback) {
      messages.push({ role: "user" as const, content: input.retryFeedback });
    }

    log.debug("generating_sitemap", { prompt: input.prompt, hasExistingPages: !!input.existingPages?.length });

    const response = await provider.chat({
      messages,
      responseSchema: sitemapSchema,
    });

    log.debug("sitemap_response", { content: response.content });

    return { content: response.content, usage: response.usage };
  },
};

export function parseSitemap(json: string): SitemapPlan {
  try {
    const parsed = JSON.parse(json);
    return {
      pages: (parsed.pages ?? []).map((p: Record<string, unknown>) => ({
        slug: String(p.slug ?? "/"),
        title: String(p.title ?? "Untitled"),
        purpose: String(p.purpose ?? ""),
        priority: p.priority === "secondary" ? "secondary" : "primary",
        suggestedSections: Array.isArray(p.suggestedSections) ? p.suggestedSections : undefined,
      })),
    };
  }
  catch (err) {
    log.warn("parse_failed", { error: String(err), input: json.slice(0, 200) });
    // Fallback: minimal single-page site
    return {
      pages: [
        { slug: "/", title: "Home", purpose: "Main landing page", priority: "primary" },
      ],
    };
  }
}
