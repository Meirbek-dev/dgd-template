import { describe, expect, it } from "vite-plus/test";
import { isAppealOverdue } from "./appeal-overdue";
import { generateSyntheticAppeals } from "#/data/mock/synthetic-generator";

describe("isAppealOverdue", () => {
  const base = generateSyntheticAppeals(260611, 1)[0];
  const referenceDate = new Date("2026-06-11T09:00:00.000Z");

  it("marks active appeal due yesterday as overdue", () => {
    expect(
      isAppealOverdue(
        { ...base, status: "in_progress", dueAt: "2026-06-10T09:00:00.000Z" },
        referenceDate,
      ),
    ).toBe(true);
  });

  it("does not mark active appeal due tomorrow as overdue", () => {
    expect(
      isAppealOverdue(
        { ...base, status: "in_progress", dueAt: "2026-06-12T09:00:00.000Z" },
        referenceDate,
      ),
    ).toBe(false);
  });

  it("does not mark closed appeal as current overdue", () => {
    expect(
      isAppealOverdue(
        {
          ...base,
          status: "closed",
          closedAt: "2026-06-11T09:00:00.000Z",
          dueAt: "2026-06-10T09:00:00.000Z",
        },
        referenceDate,
      ),
    ).toBe(false);
  });
});
