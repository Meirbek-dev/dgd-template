import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/app/app-shell";
import { DashboardPage } from "#/features/dashboard/ui/dashboard-page";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});
