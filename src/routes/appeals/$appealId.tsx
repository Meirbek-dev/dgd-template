import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/app/app-shell";
import { AppealDetailPage } from "#/features/appeal-detail/ui/appeal-detail-page";

export const Route = createFileRoute("/appeals/$appealId")({
  component: AppealRoute,
});

function AppealRoute() {
  const { appealId } = Route.useParams();
  return (
    <AppShell>
      <AppealDetailPage appealId={appealId} />
    </AppShell>
  );
}
