import type { AwardTest, AwardTestResult, TestContext, KBEntry } from "../types";

// BankEntry shape for type checking
interface BankEntryLike extends KBEntry {
  width: number
  height: number
  attribution?: { name?: string }
  metadata?: {
    caption?: string
    subjects?: string[]
    colors?: { dominant?: string[] }
    style?: string[]
    mood?: string[]
    context?: string[]
  }
  vectors?: unknown
}

interface QualityChecks {
  hasCaption: boolean
  hasSubjects: boolean
  hasColors: boolean
  hasStyle: boolean
  hasMood: boolean
  hasContext: boolean
  hasValidDimensions: boolean
  hasAttribution: boolean
}

function isBankEntry(entry: KBEntry): entry is BankEntryLike {
  return "metadata" in entry && "vectors" in entry;
}

/**
 * Validates metadata completeness and quality.
 * Checks for essential fields that indicate a well-analyzed entry.
 */
export const qualityTest: AwardTest = {
  name: "quality",
  description: "Validates metadata quality and completeness",

  async run<T extends KBEntry>(ctx: TestContext<T>): Promise<AwardTestResult> {
    const { entry, config } = ctx;

    // For BankEntry (image bank)
    if (isBankEntry(entry)) {
      const metadata = entry.metadata;

      const checks: QualityChecks = {
        hasCaption: !!metadata?.caption && metadata.caption.length > 10,
        hasSubjects: Array.isArray(metadata?.subjects) && metadata.subjects.length > 0,
        hasColors: Array.isArray(metadata?.colors?.dominant) && metadata.colors.dominant.length > 0,
        hasStyle: Array.isArray(metadata?.style) && metadata.style.length > 0,
        hasMood: Array.isArray(metadata?.mood) && metadata.mood.length > 0,
        hasContext: Array.isArray(metadata?.context) && metadata.context.length > 0,
        hasValidDimensions: entry.width > 0 && entry.height > 0,
        hasAttribution: !!entry.attribution?.name,
      };

      const totalFields = Object.keys(checks).length;
      const filledFields = Object.values(checks).filter(Boolean).length;
      const score = filledFields / totalFields;
      const threshold = config.qualityMinFields / totalFields;

      return {
        testName: "quality",
        passed: filledFields >= config.qualityMinFields,
        score,
        threshold,
        details: {
          checks,
          filledFields,
          totalFields,
          missingFields: Object.entries(checks)
            .filter(([, v]) => !v)
            .map(([k]) => k),
        },
      };
    }

    // For generic KB entries, check for basic fields
    const hasId = !!entry.id;
    const fieldCount = Object.keys(entry).filter(k => entry[k] !== undefined && entry[k] !== null).length;
    const score = Math.min(fieldCount / 5, 1); // Assume 5 fields is "complete"

    return {
      testName: "quality",
      passed: hasId && fieldCount >= 3,
      score,
      threshold: 0.6,
      details: {
        hasId,
        fieldCount,
        fields: Object.keys(entry),
      },
    };
  },
};
