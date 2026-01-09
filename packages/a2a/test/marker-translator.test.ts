import { describe, expect, it, vi } from "vitest";
import { createA2AEmitter } from "../src/emitter";
import { createMarkerTranslator } from "../src/marker-translator";
import type { StreamResponse } from "../src/types";

describe("createMarkerTranslator", () => {
  const createTestSetup = (onParseError?: (marker: string, error: Error) => void) => {
    const events: StreamResponse[] = [];
    const emitter = createA2AEmitter({
      taskId: "task-123",
      contextId: "ctx-456",
      onEvent: event => events.push(event),
    });
    const translator = createMarkerTranslator(emitter, { onParseError });
    return { translator, events };
  };

  describe("agent markers", () => {
    it("translates AGENT:start markers to statusUpdate", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[AGENT:brief:start]");

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty("statusUpdate");
      const update = (events[0] as { statusUpdate: Record<string, unknown> }).statusUpdate;
      expect(update.metadata).toMatchObject({ step: "brief", description: "Extracting brand context" });
    });

    it("translates AGENT:complete markers with safe fields only", () => {
      const { translator, events } = createTestSetup();

      // Include both safe fields (duration) and unsafe fields (largePayload)
      translator.processChunk("[AGENT:theme:complete]{\"duration\":150,\"largePayload\":{\"huge\":\"data\"}}");

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: Record<string, unknown> }).statusUpdate;
      expect(update.metadata).toMatchObject({
        step: "theme",
        completed: true,
        duration: 150,
      });
      // Unsafe field should NOT be included
      expect((update.metadata as Record<string, unknown>).largePayload).toBeUndefined();
    });

    it("handles multiple agent markers in one chunk", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[AGENT:brief:start]\nSome text\n[AGENT:brief:complete]");

      expect(events).toHaveLength(2);
    });
  });

  describe("data artifacts", () => {
    it("translates THEME marker to artifactUpdate (first wins)", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[THEME:{\"palette\":\"ocean\",\"typography\":\"modern\"}]");

      expect(events).toHaveLength(1);
      expect(events[0]).toHaveProperty("artifactUpdate");
      const update = (events[0] as { artifactUpdate: Record<string, unknown> }).artifactUpdate;
      const artifact = update.artifact as { name: string, parts: Array<{ data: unknown }> };
      expect(artifact.name).toBe("theme");
      expect(artifact.parts[0]?.data).toEqual({ palette: "ocean", typography: "modern" });
    });

    it("ignores subsequent THEME markers (first wins)", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[THEME:{\"palette\":\"ocean\"}]");
      translator.processChunk("[THEME:{\"palette\":\"forest\"}]");

      const themeEvents = events.filter((e) => {
        if (!("artifactUpdate" in e)) return false;
        const artifact = (e.artifactUpdate as { artifact: { name: string } }).artifact;
        return artifact.name === "theme";
      });
      expect(themeEvents).toHaveLength(1);
      const artifact = (themeEvents[0] as { artifactUpdate: { artifact: { parts: Array<{ data: { palette: string } }> } } }).artifactUpdate.artifact;
      expect(artifact.parts[0]?.data.palette).toBe("ocean");
    });

    it("translates SECTIONS marker with revision (last wins)", () => {
      const { translator, events } = createTestSetup();

      const sections1 = [{ type: "hero", headline: "Draft" }];
      const sections2 = [{ type: "hero", headline: "Final" }];
      translator.processChunk(`[SECTIONS:${JSON.stringify(sections1)}]`);
      translator.processChunk(`[SECTIONS:${JSON.stringify(sections2)}]`);

      const sectionEvents = events.filter((e) => {
        if (!("artifactUpdate" in e)) return false;
        const artifact = (e.artifactUpdate as { artifact: { name: string } }).artifact;
        return artifact.name === "sections";
      });
      // Both should be emitted (last wins = consumer uses last)
      expect(sectionEvents).toHaveLength(2);

      // Check revisions
      const rev1 = (sectionEvents[0] as { artifactUpdate: { metadata?: { rev: number } } }).artifactUpdate.metadata?.rev;
      const rev2 = (sectionEvents[1] as { artifactUpdate: { metadata?: { rev: number } } }).artifactUpdate.metadata?.rev;
      expect(rev1).toBe(1);
      expect(rev2).toBe(2);
    });

    it("translates IMAGES marker with revision (last wins)", () => {
      const { translator, events } = createTestSetup();

      const images1 = [{ sectionId: "sec-1", planned: true }];
      const images2 = [{ sectionId: "sec-1", image: { url: "https://example.com/img.jpg" } }];
      translator.processChunk(`[IMAGES:${JSON.stringify(images1)}]`);
      translator.processChunk(`[IMAGES:${JSON.stringify(images2)}]`);

      const imageEvents = events.filter((e) => {
        if (!("artifactUpdate" in e)) return false;
        const artifact = (e.artifactUpdate as { artifact: { name: string } }).artifact;
        return artifact.name === "images";
      });
      expect(imageEvents).toHaveLength(2);
    });

    it("translates SITEMAP marker with revision (last wins)", () => {
      const { translator, events } = createTestSetup();

      const sitemap = { pages: [{ slug: "/", title: "Home" }] };
      translator.processChunk(`[SITEMAP:${JSON.stringify(sitemap)}]\n`);

      expect(events).toHaveLength(1);
      const update = (events[0] as { artifactUpdate: Record<string, unknown> }).artifactUpdate;
      const artifact = update.artifact as { name: string };
      expect(artifact.name).toBe("sitemap");
      expect(update.metadata).toMatchObject({ rev: 1 });
    });
  });

  describe("page markers", () => {
    it("translates PAGE marker to statusUpdate with minimal metadata", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[PAGE:{\"slug\":\"/about\",\"title\":\"About Us\",\"sectionCount\":5,\"largeData\":{}}]");

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: Record<string, unknown> }).statusUpdate;
      // Should only have slug and title, not sectionCount or largeData
      expect(update.metadata).toMatchObject({
        step: "page",
        slug: "/about",
        title: "About Us",
      });
      expect((update.metadata as Record<string, unknown>).sectionCount).toBeUndefined();
      expect((update.metadata as Record<string, unknown>).largeData).toBeUndefined();
    });

    it("deduplicates PAGE markers by slug", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[PAGE:{\"slug\":\"/about\",\"title\":\"About Us\"}]");
      translator.processChunk("[PAGE:{\"slug\":\"/about\",\"title\":\"About Us v2\"}]");

      const pageEvents = events.filter((e) => {
        if (!("statusUpdate" in e)) return false;
        return (e.statusUpdate as { metadata?: { step?: string } }).metadata?.step === "page";
      });
      expect(pageEvents).toHaveLength(1);
    });
  });

  describe("usage marker", () => {
    it("translates USAGE marker to statusUpdate with usage data", () => {
      const { translator, events } = createTestSetup();

      const usage = { input: 100, output: 50, cost: 0.001 };
      translator.processChunk(`[USAGE:${JSON.stringify(usage)}]`);

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: Record<string, unknown> }).statusUpdate;
      expect(update.metadata).toMatchObject({ usage });
    });
  });

  describe("full transcript", () => {
    it("handles realistic multi-marker stream with revisions and parse error", () => {
      const onParseError = vi.fn();
      const { translator, events } = createTestSetup(onParseError);

      // Simulate realistic orchestrator output sequence
      translator.processChunk("[AGENT:brief:start]");
      translator.processChunk("[AGENT:brief:complete]{\"duration\":150,\"summary\":\"Coffee shop branding\"}");
      translator.processChunk("[THEME:{\"palette\":\"warm\",\"typography\":\"modern\"}]");
      translator.processChunk("[AGENT:structure:start]");
      translator.processChunk("[SECTIONS:[{\"type\":\"hero\",\"headline\":\"Draft\"}]]");
      translator.processChunk("[AGENT:structure:complete]{\"duration\":200,\"sectionCount\":3}");
      translator.processChunk("[AGENT:image:start]");
      translator.processChunk("[IMAGES:[{\"sectionId\":\"sec-1\",\"planned\":true}]]");
      translator.processChunk("[SECTIONS:[{\"type\":\"hero\",\"headline\":\"Final\"}]]"); // rev 2
      translator.processChunk("[THEME:{\"palette\":\"cool\"}]"); // should be ignored (first wins)
      translator.processChunk("[IMAGES:[{\"sectionId\":\"sec-1\",\"image\":{\"url\":\"https://example.com\"}}]]"); // rev 2
      translator.processChunk("[USAGE:{invalid json}]"); // parse error
      translator.processChunk("[USAGE:{\"input\":500,\"output\":200,\"cost\":0.01}]");
      translator.processChunk("[AGENT:image:complete]{\"duration\":300,\"resolved\":1}");

      // Verify event counts
      const statusUpdates = events.filter(e => "statusUpdate" in e);
      const artifactUpdates = events.filter(e => "artifactUpdate" in e);

      // Should have: brief start, brief complete, structure start, structure complete,
      //              image start, image complete, parse_error, usage = 8 status updates
      expect(statusUpdates.length).toBe(8);

      // Should have: theme (1), sections (2), images (2) = 5 artifact updates
      expect(artifactUpdates.length).toBe(5);

      // Verify theme is first value (first wins)
      const themeEvent = artifactUpdates.find((e) => {
        const artifact = (e as { artifactUpdate: { artifact: { name: string } } }).artifactUpdate.artifact;
        return artifact.name === "theme";
      });
      const themeParts = (themeEvent as { artifactUpdate: { artifact: { parts: Array<{ data: { palette: string } }> } } }).artifactUpdate.artifact.parts;
      expect(themeParts[0]?.data.palette).toBe("warm"); // First, not "cool"

      // Verify sections has rev 2 for last emission
      const sectionEvents = artifactUpdates.filter((e) => {
        const artifact = (e as { artifactUpdate: { artifact: { name: string } } }).artifactUpdate.artifact;
        return artifact.name === "sections";
      });
      expect(sectionEvents).toHaveLength(2);
      const lastSectionRev = (sectionEvents[1] as { artifactUpdate: { metadata?: { rev: number } } }).artifactUpdate.metadata?.rev;
      expect(lastSectionRev).toBe(2);

      // Verify parse error was emitted and callback called
      const parseErrorEvent = statusUpdates.find((e) => {
        const metadata = (e as { statusUpdate: { metadata?: { step?: string } } }).statusUpdate.metadata;
        return metadata?.step === "parse_error";
      });
      expect(parseErrorEvent).toBeDefined();
      expect(onParseError).toHaveBeenCalled();

      // Verify usage was still processed after parse error
      const usageEvent = statusUpdates.find((e) => {
        const metadata = (e as { statusUpdate: { metadata?: { step?: string } } }).statusUpdate.metadata;
        return metadata?.step === "usage";
      });
      expect(usageEvent).toBeDefined();
    });

    it("maintains stable artifactId across revisions", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[SECTIONS:[{\"v\":1}]]");
      translator.processChunk("[SECTIONS:[{\"v\":2}]]");

      const sectionEvents = events.filter((e) => {
        if (!("artifactUpdate" in e)) return false;
        return (e.artifactUpdate as { artifact: { name: string } }).artifact.name === "sections";
      });

      const id1 = (sectionEvents[0] as { artifactUpdate: { artifact: { artifactId: string } } }).artifactUpdate.artifact.artifactId;
      const id2 = (sectionEvents[1] as { artifactUpdate: { artifact: { artifactId: string } } }).artifactUpdate.artifact.artifactId;

      // Same name should produce same artifactId
      expect(id1).toBe(id2);
      expect(id1).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  describe("error handling", () => {
    it("emits parse_error status on invalid JSON", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("[THEME:not valid json]");

      expect(events).toHaveLength(1);
      const update = (events[0] as { statusUpdate: Record<string, unknown> }).statusUpdate;
      expect(update.metadata).toMatchObject({
        step: "parse_error",
        description: "Failed to parse marker",
      });
      expect((update.metadata as { error?: string }).error).toBeDefined();
    });

    it("calls onParseError callback on invalid JSON", () => {
      const onParseError = vi.fn();
      const { translator } = createTestSetup(onParseError);

      // SECTIONS regex requires [SECTIONS:[...]] format, so use invalid JSON inside brackets
      translator.processChunk("[SECTIONS:[not valid json]]");

      expect(onParseError).toHaveBeenCalledWith(
        expect.stringContaining("[SECTIONS:"),
        expect.any(Error),
      );
    });

    it("handles chunks with no markers", () => {
      const { translator, events } = createTestSetup();

      translator.processChunk("Just some plain text without markers");

      expect(events).toHaveLength(0);
    });

    it("truncates long markers in parse_error to avoid bloat", () => {
      const { translator, events } = createTestSetup();

      const longInvalidJson = "x".repeat(200);
      translator.processChunk(`[THEME:${longInvalidJson}]`);

      const update = (events[0] as { statusUpdate: Record<string, unknown> }).statusUpdate;
      const marker = (update.metadata as { marker?: string }).marker;
      expect(marker?.length).toBeLessThanOrEqual(100);
    });
  });
});
