import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/app/app-shell";
import { AnalyticsPage } from "#/features/analytics/ui/analytics-page";

export const Route = createFileRoute("/analytics")({
  component: () => (
    <AppShell>
      <AnalyticsPage />
    </AppShell>
  ),
});
