import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { KpiCard } from "./kpi-card";

describe("KpiCard", () => {
  it("renders label and formatted value", () => {
    render(<KpiCard label="Просрочено" value={12} unit="count" severity="critical" />);
    expect(screen.getByText("Просрочено")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });
});
