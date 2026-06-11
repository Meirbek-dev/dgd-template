import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3Icon, ClipboardListIcon, DatabaseIcon, LayoutDashboardIcon } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { DemoRoleProvider } from "#/features/demo-rbac/model/demo-role.store";
import { RoleSwitcher } from "#/features/demo-rbac/ui/role-switcher";
import { cn } from "#/lib/utils";

const navigation = [
  { to: "/dashboard", label: "Дашборд", icon: LayoutDashboardIcon },
  { to: "/appeals", label: "Реестр", icon: ClipboardListIcon },
  { to: "/analytics", label: "Аналитика", icon: BarChart3Icon },
  { to: "/demo-settings", label: "Demo-настройки", icon: DatabaseIcon },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <DemoRoleProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <div className="grid min-h-dvh lg:grid-cols-[248px_1fr]">
          <aside className="border-border/80 border-b bg-card lg:border-r lg:border-b-0">
            <div className="flex h-full flex-col gap-6 p-4">
              <div className="flex items-start justify-between gap-3 lg:block">
                <div>
                  <p className="font-semibold text-lg leading-tight">Контроль обращений</p>
                  <p className="text-muted-foreground text-sm">demo-панель ведомства</p>
                </div>
                <Badge variant="secondary">Синтетические данные</Badge>
              </div>
              <nav className="grid gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.to ||
                    (item.to === "/appeals" && pathname.startsWith("/appeals"));
                  return (
                    <Button
                      key={item.to}
                      asChild
                      variant={active ? "secondary" : "ghost"}
                      className="justify-start"
                    >
                      <Link to={item.to} className={cn(active && "font-medium")}>
                        <Icon data-icon="inline-start" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
              <div className="mt-auto hidden rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground lg:block">
                Mock RBAC управляет только demo-действиями в интерфейсе.
              </div>
            </div>
          </aside>
          <div className="min-w-0">
            <header className="sticky top-0 z-10 flex min-h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur">
              <div>
                <p className="font-medium">Управленческая картина по обращениям</p>
                <p className="text-muted-foreground text-xs">Фиксированная дата: 11.06.2026</p>
              </div>
              <RoleSwitcher />
            </header>
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </DemoRoleProvider>
  );
}
