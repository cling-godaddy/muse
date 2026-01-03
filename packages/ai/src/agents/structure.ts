import { generateSectionPrompt } from "@muse/core";
import { createLogger } from "@muse/logger";
import type { Provider } from "../types";
import type { AgentInput, PageStructure, SyncAgent, SyncAgentResult } from "./types";
import { retrieve, formatStructureContext, type StructureKBEntry } from "../rag";
import { structureSchema } from "../schemas";

const log = createLogger().child({ agent: "structure-rag" });

export function buildStructurePrompt(context: string, isTemplate: boolean): string {
  if (isTemplate) {
    // Template mode: minimal prompt, just copy the template
    return `You are a page structure planner.

${context}

Your task: Copy the template structure above EXACTLY. Add a "purpose" field to each section describing what it should accomplish for the user's request.

Do not change, add, or remove any sections. Do not change any type or preset values.`;
  }

  // Non-template mode: full prompt with all options
  return `You are a page structure planner. Given a brand brief and user request, define the section structure for a landing page.

SECTION TYPES AND PRESETS:
${generateSectionPrompt()}
${context ? `\n${context}\n` : ""}
Guidelines:
- When similar examples are provided, use them as guidance for section selection.
- Generate 4-8 sections for a typical landing page
- Start with a hero section
- Use footer section (not text) for site navigation, social links, and copyright - place at the end
- Use about section for company story, mission, or team showcase
- Use subscribe section for newsletter/email capture
- Use stats section for key metrics and social proof numbers
- Use logos section for client/partner logo displays ("Trusted by...")
- End with cta or footer section
- Select presets that match the brand mood and industry
- Use simple IDs like "section-1", "section-2"
- Purpose should guide the copy specialist on what content to generate`;
}

interface RAGContext {
  text: string
  isTemplate: boolean
}

async function getRAGContext(prompt: string): Promise<RAGContext> {
  try {
    const examples = await retrieve<StructureKBEntry>("structure", prompt, {
      topK: 3,
      minScore: 0.5,
    });

    if (examples.length > 0) {
      const { text, isTemplate } = formatStructureContext(examples);
      log.info("rag_retrieved", {
        kb: "structure",
        count: examples.length,
        isTemplate,
        matches: examples.map(e => ({ id: e.entry.id, score: e.score.toFixed(3) })),
      });
      return { text, isTemplate };
    }
    else {
      log.debug("rag_no_matches", { kb: "structure", prompt: prompt.slice(0, 100) });
      return { text: "", isTemplate: false };
    }
  }
  catch (err) {
    log.debug("rag_unavailable", { error: String(err) });
    return { text: "", isTemplate: false };
  }
}

export const structureAgent: SyncAgent = {
  config: {
    name: "structure",
    description: "Plans page structure and section layout",
    model: "gpt-4o-mini",
  },

  async run(input: AgentInput, provider: Provider): Promise<SyncAgentResult> {
    const { text: context, isTemplate } = await getRAGContext(input.prompt);
    const systemPrompt = buildStructurePrompt(context, isTemplate);

    log.debug("prompt_built", {
      isTemplate,
      promptLength: systemPrompt.length,
      systemPrompt: systemPrompt.slice(0, 500),
    });

    const briefContext = input.brief
      ? `Brand Brief:
- Target Audience: ${input.brief.targetAudience}
- Brand Voice: ${input.brief.brandVoice.join(", ")}
- Color Direction: ${input.brief.colorDirection}
- Constraints: ${input.brief.constraints.join(", ") || "none"}
`
      : "";

    // Page context for multi-page site generation
    const pageContext = input.context?.pageSlug
      ? `\nPage Context:
- Page: ${input.context.pageSlug} (${input.context.pageTitle ?? "Untitled"})
- Purpose: ${input.context.pagePurpose ?? ""}
- Priority: ${input.context.pagePriority === "secondary" ? "secondary (3-5 sections)" : "primary (5-8 sections)"}
${input.context.suggestedSections ? `- Suggested sections: ${(input.context.suggestedSections as string[]).join(", ")}` : ""}`
      : "";

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `${briefContext}${pageContext}\nUser Request: ${input.prompt}` },
    ];
    if (input.retryFeedback) {
      messages.push({ role: "user" as const, content: input.retryFeedback });
    }

    const response = await provider.chat({
      messages,
      responseSchema: structureSchema,
    });

    log.debug("llm_response", { content: response.content });

    return { content: response.content, usage: response.usage };
  },
};

interface RawSection {
  id?: string
  type?: string
  preset?: string
  purpose?: string
}

export function parseStructure(json: string): PageStructure {
  try {
    const parsed = JSON.parse(json);
    return {
      sections: parsed.sections.map((s: RawSection, i: number) => ({
        id: s.id ?? `section-${i + 1}`,
        type: s.type ?? "text",
        preset: s.preset,
        purpose: s.purpose ?? "",
      })),
    };
  }
  catch (err) {
    log.warn("parse_failed", { error: String(err), input: json.slice(0, 200) });
    return {
      sections: [
        { id: "section-1", type: "hero", preset: "hero-centered", purpose: "introduce the product" },
        { id: "section-2", type: "features", preset: "features-grid-icons", purpose: "highlight key features" },
        { id: "section-3", type: "cta", preset: "cta-centered", purpose: "drive conversion" },
      ],
    };
  }
}
