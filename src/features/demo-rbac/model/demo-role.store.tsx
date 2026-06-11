import * as React from "react";
import type { Role } from "#/entities/rbac/model/role.schema";

const ROLE_KEY = "dgd-template.demo-role";

type DemoRoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
};

const DemoRoleContext = React.createContext<DemoRoleContextValue | null>(null);

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>("manager");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(ROLE_KEY);
    if (stored === "manager" || stored === "executor" || stored === "admin") setRoleState(stored);
  }, []);

  const setRole = React.useCallback((nextRole: Role) => {
    setRoleState(nextRole);
    window.localStorage.setItem(ROLE_KEY, nextRole);
  }, []);

  return <DemoRoleContext.Provider value={{ role, setRole }}>{children}</DemoRoleContext.Provider>;
}

export function useDemoRole() {
  const context = React.useContext(DemoRoleContext);
  if (!context) throw new Error("useDemoRole must be used inside DemoRoleProvider");
  return context;
}
