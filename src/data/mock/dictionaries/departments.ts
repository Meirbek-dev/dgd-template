import type { Department } from "#/entities/department/model/department.schema";

export const departments: Department[] = [
  {
    id: "dep_intake",
    name: "Отдел приема обращений",
    shortName: "Прием",
    code: "DEP-INTAKE",
    isActive: true,
  },
  {
    id: "dep_consulting",
    name: "Отдел консультаций",
    shortName: "Консультации",
    code: "DEP-CONSULTING",
    isActive: true,
  },
  {
    id: "dep_reporting",
    name: "Отдел отчетности",
    shortName: "Отчетность",
    code: "DEP-REPORTING",
    isActive: true,
  },
  {
    id: "dep_registry",
    name: "Отдел регистрационного учета",
    shortName: "Регистрация",
    code: "DEP-REGISTRY",
    isActive: true,
  },
  {
    id: "dep_control",
    name: "Отдел контроля сроков",
    shortName: "Контроль",
    code: "DEP-CONTROL",
    isActive: true,
  },
  {
    id: "dep_support",
    name: "Техническая поддержка",
    shortName: "Поддержка",
    code: "DEP-SUPPORT",
    isActive: true,
  },
];
