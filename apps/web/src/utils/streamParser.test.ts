import { describe, it, expect } from "vitest";
import { parseStream, type ParseState } from "./streamParser";

const initialState: ParseState = {
  sections: [],
  pages: [],
  agents: new Map(),
  images: [],
};

describe("parseStream", () => {
  describe("marker stripping", () => {
    it("strips markers with nested JSON from displayText", () => {
      const input = `[SITEMAP:{"pages":[{"slug":"/","title":"Home"}]}]
[AGENT:sitemap:complete]{"count":1,"items":[{"a":1}]}
[PAGE:{"slug":"/","title":"Home"}]
`;
      const result = parseStream(input, initialState);

      expect(result.displayText).not.toContain("}]");
      expect(result.displayText).not.toContain("[SITEMAP:");
      expect(result.displayText).not.toContain("[AGENT:");
      expect(result.displayText).not.toContain("[PAGE:");
    });

    it("strips all marker types from displayText", () => {
      const input = `[THEME:sunset+nunito]
[AGENT:theme:start]
[AGENT:theme:complete]{"duration":100}
[SECTIONS:[{"id":"1","type":"hero","preset":"hero/centered","title":"Hello"}]]
[USAGE:{"inputTokens":100,"outputTokens":200}]
[IMAGES:[{"blockId":"1","image":"http://example.com/img.jpg"}]]
`;
      const result = parseStream(input, initialState);

      expect(result.displayText).toBe("");
    });
  });
});
