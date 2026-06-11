import { faker } from "@faker-js/faker";
import {
  AppealSchema,
  type Appeal,
  type AppealCategory,
  type AppealStatus,
} from "#/entities/appeal/model/appeal.schema";
import { departments } from "./dictionaries/departments";
import { employees } from "./dictionaries/employees";
import { DEMO_DATASET_SIZE, DEMO_SEED } from "./seed";

const categories: AppealCategory[] = [
  "consultation",
  "registration",
  "tax_reporting",
  "debt",
  "complaint",
  "technical_issue",
  "other",
];
const statuses: AppealStatus[] = ["new", "in_progress", "waiting", "resolved", "overdue", "closed"];
const channels: Appeal["channel"][] = ["web", "office", "phone", "email", "other"];
const priorities: Appeal["priority"][] = ["low", "normal", "high"];
const citizenTypes: Appeal["applicant"]["type"][] = [
  "individual",
  "sole_proprietor",
  "legal_entity_representative",
];
const subjects: Record<AppealCategory, string[]> = {
  consultation: [
    "Разъяснение порядка подачи заявления",
    "Консультация по личному кабинету",
    "Уточнение статуса обращения",
  ],
  registration: [
    "Изменение регистрационных сведений",
    "Проверка карточки заявителя",
    "Корректировка demo-профиля",
  ],
  tax_reporting: [
    "Вопрос по форме отчетности",
    "Проверка статуса отправки",
    "Техническое уточнение по отчету",
  ],
  debt: [
    "Сверка синтетического уведомления",
    "Разъяснение demo-начисления",
    "Проверка статуса платежного запроса",
  ],
  complaint: [
    "Жалоба на длительное ожидание",
    "Повторное обращение по срокам",
    "Проверка качества ответа",
  ],
  technical_issue: [
    "Ошибка входа в demo-сервис",
    "Не открывается форма обращения",
    "Сбой уведомления в кабинете",
  ],
  other: [
    "Общее информационное обращение",
    "Запрос на уточнение маршрута",
    "Прочий вопрос заявителя",
  ],
};

function id(prefix: string, value: number) {
  return `${prefix}_${String(value).padStart(6, "0")}`;
}

function isoDaysBefore(days: number) {
  const date = new Date("2026-06-11T09:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export function generateSyntheticAppeals(seed = DEMO_SEED, size = DEMO_DATASET_SIZE): Appeal[] {
  faker.seed(seed);

  return Array.from({ length: size }, (_, index) => {
    const ordinal = index + 1;
    const category = categories[faker.number.int({ min: 0, max: categories.length - 1 })];
    const department = departments[faker.number.int({ min: 0, max: departments.length - 1 })];
    const departmentEmployees = employees.filter(
      (employee) => employee.departmentId === department.id,
    );
    const assignee =
      departmentEmployees[faker.number.int({ min: 0, max: departmentEmployees.length - 1 })];
    const receivedOffset = faker.number.int({ min: 1, max: 70 });
    const dueOffset = Math.max(0, receivedOffset - faker.number.int({ min: 4, max: 20 }));
    const status = statuses[faker.number.int({ min: 0, max: statuses.length - 1 })];
    const receivedAt = isoDaysBefore(receivedOffset);
    const dueAt = isoDaysBefore(Math.max(0, dueOffset));
    const resolvedAt =
      status === "resolved" || status === "closed"
        ? isoDaysBefore(Math.max(0, dueOffset - 2))
        : null;
    const closedAt = status === "closed" ? isoDaysBefore(Math.max(0, dueOffset - 1)) : null;
    const appealId = id("appeal", ordinal);
    const commentCount = faker.number.int({ min: 0, max: 3 });
    const subject = faker.helpers.arrayElement(subjects[category]);

    const appeal: Appeal = {
      id: appealId,
      appealNumber: `SYN-2026-${String(ordinal).padStart(6, "0")}`,
      receivedAt,
      dueAt,
      resolvedAt,
      closedAt,
      applicant: {
        id: id("citizen", ordinal),
        displayName: `Синтетический заявитель ${String(ordinal).padStart(3, "0")}`,
        syntheticIdentifier: `SYN-CIT-${String(ordinal).padStart(6, "0")}`,
        type: faker.helpers.arrayElement(citizenTypes),
        email: `citizen-${String(ordinal).padStart(3, "0")}@example.test`,
        phone: `+7 000 000 ${String(Math.floor(ordinal / 100)).padStart(2, "0")} ${String(ordinal % 100).padStart(2, "0")}`,
        addressLine: `Синтетический адрес #${String(ordinal).padStart(3, "0")}`,
        synthetic: true,
      },
      category,
      subject,
      description: `${subject}. Запись создана генератором demo-данных и не содержит реальных сведений, документов или контактов.`,
      departmentId: department.id,
      assigneeId: assignee?.id ?? null,
      status,
      priority: faker.helpers.arrayElement(priorities),
      channel: faker.helpers.arrayElement(channels),
      comments: Array.from({ length: commentCount }, (_, commentIndex) => ({
        id: `comment_${String(ordinal).padStart(6, "0")}_${String(commentIndex + 1).padStart(2, "0")}`,
        appealId,
        authorEmployeeId: assignee?.id ?? employees[0].id,
        authorRole: commentIndex % 2 === 0 ? "executor" : "manager",
        text: "Внутренняя demo-заметка по ходу обработки синтетического обращения.",
        createdAt: isoDaysBefore(Math.max(0, receivedOffset - commentIndex - 1)),
        visibility: "internal",
        synthetic: true,
      })),
      history: [
        {
          id: `history_${String(ordinal).padStart(6, "0")}_01`,
          appealId,
          type: "created",
          createdAt: receivedAt,
          actorEmployeeId: null,
          fromStatus: null,
          toStatus: "new",
          message: "Синтетическое обращение зарегистрировано.",
          synthetic: true,
        },
        {
          id: `history_${String(ordinal).padStart(6, "0")}_02`,
          appealId,
          type: "assigned",
          createdAt: isoDaysBefore(Math.max(0, receivedOffset - 1)),
          actorEmployeeId: assignee?.id ?? employees[0].id,
          fromStatus: "new",
          toStatus: status,
          message: "Назначен ответственный исполнитель в demo-режиме.",
          synthetic: true,
        },
      ],
      synthetic: true,
      createdAt: receivedAt,
      updatedAt: isoDaysBefore(Math.max(0, dueOffset - 1)),
    };

    return AppealSchema.parse(appeal);
  });
}
