import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/app/app-shell";
import { AppealsListPage } from "#/features/appeals-list/ui/appeals-list-page";

export const Route = createFileRoute("/appeals/")({
  component: () => (
    <AppShell>
      <AppealsListPage />
    </AppShell>
  ),
});
