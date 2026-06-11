import { describe, expect, it } from "vite-plus/test";
import { generateSyntheticAppeals } from "#/data/mock/synthetic-generator";
import { filterAppeals } from "./appeal-filtering";

describe("filterAppeals", () => {
  const appeals = generateSyntheticAppeals(260611, 40);
  const referenceDate = new Date("2026-06-11T09:00:00.000Z");

  it("filters by status", () => {
    const result = filterAppeals(appeals, { status: "new" }, referenceDate);
    expect(result.every((appeal) => appeal.status === "new")).toBe(true);
  });

  it("filters by combined query and department", () => {
    const sample = appeals[0];
    const result = filterAppeals(
      appeals,
      { query: sample.appealNumber, departmentId: sample.departmentId },
      referenceDate,
    );
    expect(result.map((appeal) => appeal.id)).toContain(sample.id);
    expect(result.every((appeal) => appeal.departmentId === sample.departmentId)).toBe(true);
  });
});
