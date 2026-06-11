import { describe, expect, it } from "vite-plus/test";
import { AppealSchema } from "#/entities/appeal/model/appeal.schema";
import { generateSyntheticAppeals } from "./synthetic-generator";

describe("generateSyntheticAppeals", () => {
  it("returns deterministic data for the same seed", () => {
    expect(generateSyntheticAppeals(42, 5)).toEqual(generateSyntheticAppeals(42, 5));
  });

  it("generates valid synthetic records with demo contact formats", () => {
    const appeals = generateSyntheticAppeals(260611, 300);
    expect(appeals).toHaveLength(300);
    for (const appeal of appeals) {
      expect(() => AppealSchema.parse(appeal)).not.toThrow();
      expect(appeal.synthetic).toBe(true);
      expect(appeal.applicant.email).toMatch(/@example\.test$/);
      expect(appeal.applicant.syntheticIdentifier).not.toMatch(/^\d{12}$/);
      expect(appeal.description).not.toMatch(/https?:\/\//);
    }
  });
});
