import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/app/app-shell";
import { DemoSettingsPage } from "#/features/demo-settings/ui/demo-settings-page";

export const Route = createFileRoute("/demo-settings")({
  component: () => (
    <AppShell>
      <DemoSettingsPage />
    </AppShell>
  ),
});
