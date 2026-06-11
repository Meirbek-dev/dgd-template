import { DepartmentSchema } from "#/entities/department/model/department.schema";
import { EmployeeSchema } from "#/entities/employee/model/employee.schema";
import { departments } from "./dictionaries/departments";
import { employees } from "./dictionaries/employees";
import { generateSyntheticAppeals } from "./synthetic-generator";

export const mockDb = {
  departments: departments.map((department) => DepartmentSchema.parse(department)),
  employees: employees.map((employee) => EmployeeSchema.parse(employee)),
  appeals: generateSyntheticAppeals(),
};
