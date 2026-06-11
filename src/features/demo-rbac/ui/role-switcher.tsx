import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { ROLE_LABELS, type Role } from "#/entities/rbac/model/role.schema";
import { useDemoRole } from "../model/demo-role.store";

const roles: Role[] = ["manager", "executor", "admin"];

export function RoleSwitcher() {
  const { role, setRole } = useDemoRole();
  return (
    <Select value={role} onValueChange={(value) => setRole(value as Role)}>
      <SelectTrigger className="w-42" aria-label="Demo-роль">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {roles.map((item) => (
            <SelectItem key={item} value={item}>
              {ROLE_LABELS[item]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
