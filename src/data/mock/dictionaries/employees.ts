import type { Employee } from "#/entities/employee/model/employee.schema";
import { departments } from "./departments";

const positions = ["главный специалист", "ведущий специалист", "эксперт", "координатор"];

export const employees: Employee[] = departments.flatMap((department, departmentIndex) =>
  Array.from({ length: 4 }, (_, employeeIndex) => {
    const ordinal = departmentIndex * 4 + employeeIndex + 1;
    return {
      id: `emp_${String(ordinal).padStart(6, "0")}`,
      displayName: `Синтетический сотрудник ${String(ordinal).padStart(3, "0")}`,
      departmentId: department.id,
      position: positions[employeeIndex % positions.length],
      email: `employee-${String(ordinal).padStart(3, "0")}@example.invalid`,
      isActive: true,
      synthetic: true,
    };
  }),
);
