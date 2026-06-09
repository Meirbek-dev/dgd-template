## A. Краткое резюме

Нужно построить демонстрационную панель контроля обращений граждан и налогоплательщиков, работающую строго на синтетических данных. Основной сценарий — руководитель видит управленческую картину: количество обращений, просрочки, нагрузку отделов, динамику и категории. Исполнитель работает с назначенными обращениями в mock-режиме. Администратор/аналитик проверяет справочники, качество генерации и техническую статистику.

Главные архитектурные решения:

1. Разделить приложение на `routes`, `features`, `entities`, `data/mock`, `shared`, `lib`, `components`.
2. Domain-логику держать отдельно от React-компонентов.
3. Все сущности валидировать через Zod, типы выводить через `z.infer`.
4. Синтетические данные генерировать детерминированно через seeded faker и фиксированную reference date.
5. Не хранить и не использовать реальные ИИН/БИН, ФИО, адреса, телефоны, налоговые суммы, задолженности, декларации, выгрузки, ключи или внутренние API.
6. Mock RBAC использовать только как переключатель demo-роли, не как авторизацию.
7. Подготовить код так, чтобы позже заменить `mockRepository` на backend API, не переписывая UI и domain-слой.

TanStack Start использует TanStack Router; для такого проекта уместно оставить маршруты в `src/routes`, а корневой shell — в `src/routes/__root.tsx`, потому что это соответствует официальной модели file-based routing TanStack Start/Router. ([TanStack][1])

---

## B. Предлагаемая архитектура приложения

Архитектура должна быть feature-oriented, но с отдельным domain-слоем. Не стоит смешивать генератор данных, вычисление просрочек, таблицу, графики и route-компоненты в одном файле.

Рекомендуемая схема:

```txt
src/
  routes/                 # TanStack Router route files
  features/               # бизнес-фичи: dashboard, appeals, analytics, demo-rbac
  entities/               # domain-сущности, схемы, pure functions
  data/                   # mock repository, faker generator, dictionaries
  shared/                 # shared UI, hooks, config, constants, utils
  components/             # shadcn/ui и app-level layout components
  lib/                    # интеграция QueryClient, router, cn, formatters
  tests/                  # test utilities, fixtures
```

Разделение ответственности:

`routes`
Содержит только route-компоненты, loader/search validation, связывание страницы с feature-компонентами. Route-файлы не должны содержать генерацию данных, сложную фильтрацию, расчет KPI или бизнес-правила.

`features`
Содержит законченные пользовательские сценарии: dashboard widgets, appeals table, appeal detail actions, analytics charts, role switcher. Feature-модули используют `entities` и `data/mock`, но не должны знать о внутреннем устройстве faker-генератора.

`entities`
Содержит типы, Zod-схемы, enum-like constants, business rules и pure functions. Например: `isAppealOverdue`, `calculateAverageProcessingDays`, `canTransitionStatus`, `filterAppeals`.

`data/mock`
Содержит seed, faker generator, in-memory mock database, mock repository. Здесь же должны быть справочники отделов, категорий и статусов. Это единственный слой, где допустима генерация искусственных данных.

`shared`
Содержит переиспользуемые примитивы: форматирование дат, number formatters, empty states, skeletons, error boundaries, typed helpers, accessibility helpers.

`components`
Содержит shadcn/ui компоненты и app layout. Если в текущем шаблоне уже есть `components/ui`, его нужно сохранить.

`lib`
Содержит техническую интеграцию: `query-client.ts`, `router.tsx`, `cn.ts`, `theme.ts`, `query-keys.ts`.

Типы лучше держать рядом со схемами в `entities/*/model`. Например, `appeal.schema.ts` экспортирует `AppealSchema`, а `appeal.types.ts` может экспортировать `type Appeal = z.infer<typeof AppealSchema>`. Для небольшого домена допустимо держать type export прямо в schema-файле.

Zod-схемы — в `entities/*/model/*.schema.ts`. Схемы input-форм — в feature-модулях, если они относятся только к конкретной форме, например `features/appeal-detail/model/add-comment.schema.ts`.

Mock data — в `src/data/mock`. Нельзя размещать mock-данные в route-файлах или UI-компонентах.

Вычисляемая аналитика — в `entities/appeal/lib/appeal-analytics.ts` или `features/analytics/lib/build-analytics-view-model.ts`. Базовые чистые функции — в `entities`, view-model адаптеры для Recharts — в `features`.

UI-компоненты — shadcn primitives в `components/ui`, доменные UI-компоненты в `features/*/ui`, общие app-компоненты в `components/layout` или `shared/ui`.

---

## C. Предлагаемая структура папок

Так как фактическая структура репозитория недоступна, структура ниже предполагает стандартный TanStack Start layout. Если в проекте уже есть `src/routes`, `src/router.tsx`, `src/routeTree.gen.ts`, `components/ui`, `lib/utils.ts`, их нужно сохранить и расширять.

```txt
src/
  routes/
    __root.tsx
    index.tsx
    dashboard.tsx
    appeals/
      index.tsx
      $appealId.tsx
    analytics.tsx
    demo-settings.tsx

  routeTree.gen.ts          # generated, руками не редактировать
  router.tsx                # getRouter/createRouter integration

  app/
    providers.tsx
    app-shell.tsx
    navigation.tsx

  components/
    ui/
      button.tsx
      card.tsx
      badge.tsx
      table.tsx
      input.tsx
      select.tsx
      dialog.tsx
      dropdown-menu.tsx
      textarea.tsx
      skeleton.tsx
      sonner.tsx
    layout/
      page-header.tsx
      app-sidebar.tsx
      app-topbar.tsx

  entities/
    appeal/
      model/
        appeal.schema.ts
        appeal.types.ts
        appeal.constants.ts
      lib/
        appeal-overdue.ts
        appeal-status.ts
        appeal-filtering.ts
        appeal-sorting.ts
        appeal-analytics.ts
      test/
        appeal-overdue.test.ts
        appeal-filtering.test.ts
        appeal-analytics.test.ts

    citizen/
      model/
        citizen.schema.ts
        citizen.types.ts

    department/
      model/
        department.schema.ts
        department.types.ts

    employee/
      model/
        employee.schema.ts
        employee.types.ts

    rbac/
      model/
        role.schema.ts
        permissions.ts
      lib/
        can-perform-action.ts

  features/
    dashboard/
      ui/
        dashboard-page.tsx
        kpi-card.tsx
        department-load-chart.tsx
        appeals-by-date-chart.tsx
        appeals-by-category-chart.tsx
      model/
        dashboard.selectors.ts
        dashboard.types.ts

    appeals-list/
      ui/
        appeals-list-page.tsx
        appeals-table.tsx
        appeals-table-columns.tsx
        appeals-filters.tsx
        appeal-status-badge.tsx
      model/
        appeals-search.schema.ts
        appeals-table-state.ts

    appeal-detail/
      ui/
        appeal-detail-page.tsx
        appeal-summary-card.tsx
        appeal-history.tsx
        appeal-comments.tsx
        appeal-actions.tsx
      model/
        add-comment.schema.ts
        update-status.schema.ts
        assign-employee.schema.ts

    analytics/
      ui/
        analytics-page.tsx
        status-distribution-chart.tsx
        category-processing-time-chart.tsx
        department-overdue-ranking.tsx
      model/
        analytics.selectors.ts

    demo-rbac/
      ui/
        role-switcher.tsx
        permission-guard.tsx
      model/
        demo-role.store.ts

    demo-settings/
      ui/
        demo-settings-page.tsx
        synthetic-data-quality-panel.tsx
        mock-dictionaries-panel.tsx

  data/
    mock/
      seed.ts
      reference-date.ts
      mock-db.ts
      mock-repository.ts
      synthetic-generator.ts
      synthetic-quality.ts
      dictionaries/
        departments.ts
        categories.ts
        statuses.ts
        employees.ts

  shared/
    ui/
      empty-state.tsx
      error-state.tsx
      loading-state.tsx
      section.tsx
      data-quality-badge.tsx
    lib/
      cn.ts
      date-format.ts
      number-format.ts
      assert-never.ts
      invariant.ts
      stable-sort.ts
    config/
      app-config.ts
      demo-config.ts

  lib/
    query-client.ts
    query-keys.ts
    query-options.ts
    theme.ts

  tests/
    setup.ts
    factories/
      appeal.factory.ts
    fixtures/
      synthetic-dataset.fixture.ts
```

Для TanStack Router route tree должен генерироваться автоматически, а `routeTree.gen.ts` не следует редактировать вручную; официальная документация описывает `src/routes`, `__root.tsx` и `routeTree.gen.ts` как стандартные элементы такой структуры. ([TanStack][1])

---

## D. Domain model

Ниже — базовая модель. Поля с идентификаторами намеренно не похожи на ИИН/БИН и не должны быть 12-значными числовыми строками.

### Appeal

```ts
type Appeal = {
  id: string; // "appeal_000001", внутренний synthetic id
  appealNumber: string; // "SYN-2026-000001", demo-номер обращения
  receivedAt: string; // ISO datetime
  dueAt: string; // ISO datetime, срок ответа
  resolvedAt?: string | null; // ISO datetime, если выполнено
  closedAt?: string | null; // ISO datetime, если закрыто

  applicant: Citizen;
  category: AppealCategory;
  subject: string;
  description: string;

  departmentId: string;
  assigneeId?: string | null;

  status: AppealStatus;

  priority: "low" | "normal" | "high";
  channel: "web" | "office" | "phone" | "email" | "other";

  comments: AppealComment[];
  history: AppealHistoryEvent[];

  synthetic: true;
  createdAt: string;
  updatedAt: string;
};
```

Назначение: центральная сущность. Хранит карточку обращения, связи с заявителем, отделом, исполнителем, сроки, статус, историю и комментарии.

### Citizen

```ts
type Citizen = {
  id: string; // "citizen_000001"
  displayName: string; // synthetic display name
  syntheticIdentifier: string; // "SYN-CIT-000001", не ИИН/БИН
  type: "individual" | "sole_proprietor" | "legal_entity_representative";
  email: string; // domain example.invalid / example.test
  phone: string; // заведомо demo-формат
  addressLine: string; // "Синтетический адрес #001"
  synthetic: true;
};
```

Назначение: заявитель. Не содержит реальных ИИН/БИН, паспортных данных, реальных адресов или телефонов.

### Department

```ts
type Department = {
  id: string; // "dep_intake"
  name: string; // "отдел приема обращений"
  shortName: string; // "Прием обращений"
  code: string; // "DEP-INTAKE"
  isActive: boolean;
};
```

Назначение: справочник отделов для фильтров, аналитики и назначения ответственности.

### Employee

```ts
type Employee = {
  id: string; // "emp_000001"
  displayName: string; // synthetic employee name
  departmentId: string;
  position: string; // "главный специалист", synthetic
  email: string; // employee-001@example.invalid
  isActive: boolean;
  synthetic: true;
};
```

Назначение: mock-исполнители. Не является реальной кадровой информацией.

### AppealStatus

```ts
type AppealStatus =
  | "new"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "overdue"
  | "closed";
```

Назначение: состояние обработки. При этом просрочку лучше считать через pure function `isAppealOverdue(appeal, referenceDate)`, а статус `overdue` использовать как отображаемое/сгенерированное состояние, чтобы не зависеть только от ручного поля.

### AppealCategory

```ts
type AppealCategory =
  | "consultation"
  | "registration"
  | "tax_reporting"
  | "debt"
  | "complaint"
  | "technical_issue"
  | "other";
```

Отображаемые русские названия хранятся отдельно в dictionary:

```ts
const APPEAL_CATEGORY_LABELS = {
  consultation: "консультация",
  registration: "регистрация",
  tax_reporting: "налоговая отчетность",
  debt: "задолженность",
  complaint: "жалоба",
  technical_issue: "техническая проблема",
  other: "иное",
} as const;
```

### AppealComment

```ts
type AppealComment = {
  id: string;
  appealId: string;
  authorEmployeeId: string;
  authorRole: Role;
  text: string;
  createdAt: string;
  visibility: "internal";
  synthetic: true;
};
```

Назначение: внутренний комментарий. В MVP все комментарии внутренние, без отправки заявителю.

### AppealHistoryEvent

```ts
type AppealHistoryEvent = {
  id: string;
  appealId: string;
  type:
    | "created"
    | "status_changed"
    | "assigned"
    | "comment_added"
    | "resolved"
    | "closed";
  createdAt: string;
  actorEmployeeId?: string | null;
  fromStatus?: AppealStatus | null;
  toStatus?: AppealStatus | null;
  message: string;
  synthetic: true;
};
```

Назначение: audit-like история для демонстрации. Это не production-аудит.

### DashboardMetric

```ts
type DashboardMetric = {
  id: string;
  label: string;
  value: number;
  unit?: "count" | "days" | "percent";
  description?: string;
  severity?: "neutral" | "warning" | "critical" | "positive";
};
```

Назначение: нормализованное представление KPI-карточек.

### Role

```ts
type Role = "manager" | "executor" | "admin";
```

Назначение: mock-роли для управления видимостью действий в интерфейсе.

---

## E. Zod validation plan

Zod следует использовать как runtime-границу между mock data generator, repository и UI. Zod официально позиционируется как TypeScript-first библиотека валидации со статическим выводом типов; также в документации указано, что для Zod должен быть включен `strict` в `tsconfig.json`. ([Zod][2])

Нужные схемы:

```txt
entities/appeal/model/
  appeal-status.schema.ts
  appeal-category.schema.ts
  appeal-comment.schema.ts
  appeal-history.schema.ts
  appeal.schema.ts

entities/citizen/model/
  citizen.schema.ts

entities/department/model/
  department.schema.ts

entities/employee/model/
  employee.schema.ts

entities/rbac/model/
  role.schema.ts

features/appeals-list/model/
  appeals-search.schema.ts

features/appeal-detail/model/
  add-comment.schema.ts
  update-status.schema.ts
  assign-employee.schema.ts
```

Принцип:

```ts
export const AppealSchema = z.object({ ... }).strict();
export type Appeal = z.infer<typeof AppealSchema>;
```

Особенно строго валидировать:

1. `id`, `appealNumber`, `syntheticIdentifier`: запретить форматы, похожие на ИИН/БИН. Например, не принимать `^\d{12}$`.
2. `email`: разрешать только `example.invalid`, `example.test` или другой явно demo-домен.
3. `phone`: не генерировать и не принимать реальные номера. Лучше использовать demo-формат `+7 000 000 00 01`.
4. `receivedAt`, `dueAt`, `resolvedAt`, `closedAt`: ISO datetime, `dueAt > receivedAt`.
5. `status`: только enum.
6. `comments.text`: длина, отсутствие HTML, отсутствие потенциальных секретных паттернов.
7. `history`: корректный переход статусов.
8. `synthetic`: literal `true`, чтобы любой объект домена явно маркировался как синтетический.
9. Search params `/appeals`: фильтры должны валидироваться через Zod, чтобы не ломать таблицу некорректным URL.

Для consistency checks использовать `.superRefine()`:

```ts
if (data.status === 'closed' && !data.closedAt) {
  ctx.addIssue(...)
}

if (data.dueAt <= data.receivedAt) {
  ctx.addIssue(...)
}
```

---

## F. Synthetic data plan

`@faker-js/faker` использовать только внутри `src/data/mock/synthetic-generator.ts`. Faker умеет генерировать большие объемы fake data и поддерживает seed для воспроизводимости; при этом в документации faker есть важное предупреждение: реалистичные данные могут случайно совпасть с валидной реальной информацией, поэтому нельзя отправлять сгенерированные контакты или сообщения наружу. ([GitHub][3])

Базовые правила генерации:

1. Один фиксированный seed:

```ts
export const SYNTHETIC_DATA_SEED = 20260609;
```

1. Одна фиксированная reference date:

```ts
export const DEMO_REFERENCE_DATE = "2026-06-09T00:00:00.000Z";
```

Это важно для стабильного SSR/client результата и для тестов.

1. Генератор должен быть чистым по API:

```ts
generateSyntheticDataset({
  seed: SYNTHETIC_DATA_SEED,
  referenceDate: DEMO_REFERENCE_DATE,
  appealsCount: 240,
});
```

1. Номера обращений:

```txt
SYN-2026-000001
SYN-2026-000002
```

1. Идентификаторы заявителей:

```txt
SYN-CIT-000001
SYN-CIT-000002
```

Не использовать поля `iin`, `bin`, `taxpayerId`. Даже если нужен “идентификатор заявителя”, назвать его `syntheticIdentifier`.

1. Email:

```txt
citizen-000001@example.invalid
employee-000001@example.invalid
```

1. Адреса:

```txt
Синтетический адрес #000001
Демо-город, учебная улица, дом 1
```

Не использовать реальные города, улицы, номера квартир и почтовые индексы.

1. Телефоны:

```txt
+7 000 000 00 01
+7 000 000 00 02
```

1. Темы и описания обращения генерировать из заранее заданных шаблонов, не через свободные реальные налоговые данные:

```ts
const SUBJECT_TEMPLATES = {
  consultation: [
    "Консультация по порядку подачи обращения",
    "Вопрос по срокам рассмотрения заявления",
  ],
  debt: [
    "Вопрос по демонстрационной задолженности",
    "Уточнение порядка сверки в demo-режиме",
  ],
};
```

1. Просрочки генерировать управляемо. Например:

   - 15–25% обращений просрочены;
   - просрочка возможна только для `new`, `in_progress`, `waiting`, `overdue`;
   - `closed` и `resolved` могут иметь `resolvedAt > dueAt`, но тогда это “закрыто с нарушением срока”, а не текущая просрочка.

2. История изменений генерируется последовательно:

   - `created`;
   - опционально `assigned`;
   - опционально `status_changed`;
   - опционально `comment_added`;
   - `resolved`/`closed`, если статус финальный.

3. После генерации весь массив прогнать через `DatasetSchema.parse(dataset)`. Если схема падает, generator test должен падать.

Ключевые функции:

```ts
generateDepartments();
generateEmployees(departments);
generateCitizen(index);
generateAppeal(index, context);
generateAppealHistory(appeal);
generateAppealComments(appeal);
validateSyntheticDataset(dataset);
assertNoRealSensitivePatterns(dataset);
```

Для защиты от случайных реалистичных совпадений добавить тесты на forbidden patterns:

```txt
- 12 consecutive digits
- поля с именами iin/bin
- email не на example.invalid/example.test
- phone не demo-формата
- упоминания реальных API hostnames
- строки "password", "secret", "token", "apiKey"
```

---

## G. Routing plan

Предлагаемые маршруты:

```txt
/
  redirect или landing summary

/dashboard
  основная панель руководителя

/appeals
  реестр обращений

/appeals/$appealId
  карточка обращения

/analytics
  аналитика

/demo-settings
  demo-настройки, mock-справочники, проверка качества синтетики
```

Route files:

```txt
src/routes/index.tsx
src/routes/dashboard.tsx
src/routes/appeals/index.tsx
src/routes/appeals/$appealId.tsx
src/routes/analytics.tsx
src/routes/demo-settings.tsx
```

`/`
Лучше сделать redirect на `/dashboard`, чтобы руководитель сразу попадал в рабочий экран. Альтернатива — компактная demo-landing страница с предупреждением “только синтетические данные”.

`/dashboard`
Получает `appeals`, `departments`, `employees` через query options/mock repository. Строит KPI и 2–3 основных графика.

`/appeals`
Получает список обращений. Search params валидируются через Zod: `status`, `departmentId`, `category`, `overdue`, `q`, `page`, `pageSize`, `sort`.

`/appeals/$appealId`
Получает одно обращение по id. Если не найдено — route-level not found state. Действия зависят от demo-роли.

`/analytics`
Получает весь synthetic dataset и строит агрегаты: по дням/неделям, категориям, статусам, отделам, среднему времени обработки.

`/demo-settings`
Показывает seed, reference date, количество записей, долю просрочек, проверку synthetic quality, справочники категорий/отделов/исполнителей. Не должно содержать реальных настроек интеграций.

---

## H. State management plan

TanStack Query использовать как слой доступа к данным, даже в mock-режиме. Это подготовит переход к backend API: UI будет зависеть от `useQuery/useMutation`, а не от faker. Для mock MVP query functions должны читать in-memory repository и возвращать `Promise.resolve(data)`, без HTTP и внешних API.

Пример query keys:

```ts
appeals: ["appeals"];
appealById: (id: string) => ["appeals", id];
dashboard: ["dashboard"];
analytics: ["analytics"];
departments: ["departments"];
employees: ["employees"];
```

TanStack Query поддерживает invalidation через `queryClient.invalidateQueries`, что подходит для mock mutation-действий: обновили in-memory данные, затем инвалидировали `['appeals']`, `['appeals', id]`, `['dashboard']`, `['analytics']`. ([GitHub][4])

Где использовать TanStack Query:

```txt
useAppealsQuery()
useAppealQuery(appealId)
useDashboardMetricsQuery()
useAnalyticsQuery()
useDepartmentsQuery()
useEmployeesQuery()
useUpdateAppealStatusMutation()
useAssignEmployeeMutation()
useAddAppealCommentMutation()
```

Где достаточно локального состояния:

```txt
- открытие/закрытие dialog
- временное значение input поиска до debounce
- selected rows, если это только UI
- раскрытие фильтров на мобильном экране
```

Где использовать TanStack Store:

```txt
- выбранная demo-роль
- настройки demo-режима: seed display, compact table mode, theme preference при необходимости
- возможно, глобальные UI preferences
```

Выбранную роль хранить в `features/demo-rbac/model/demo-role.store.ts`. Допустимо сохранять только роль в `localStorage`, потому что это не чувствительные данные. Но обращения, комментарии и synthetic dataset лучше не сохранять в localStorage на MVP, чтобы не создавать иллюзию persistence.

Фильтры таблицы лучше хранить в URL search params. Это дает воспроизводимые demo-ссылки и упрощает тестирование. Внутреннее состояние TanStack Table — sorting/pagination/globalFilter — можно синхронизировать с search params постепенно.

Mock mutations:

```txt
updateAppealStatus(input)
  validate input через Zod
  проверить permission
  проверить transition rule
  обновить mockDb.appeals
  добавить history event
  invalidate appeals/dashboard/analytics
  показать toast через sonner
```

Важно: mutation не должна делать `fetch`, `axios`, `XMLHttpRequest`, `sendBeacon` или обращаться к внешним URL.

---

## I. План таблицы

Таблица обращений через TanStack Table. Для 100–300 строк достаточно client-side sorting/filtering/pagination. TanStack Table поддерживает controlled sorting state и client-side sorted row model; это хорошо ложится на фильтры и сортировку в MVP. ([TanStack][5])

Колонки:

```txt
1. Номер
   appealNumber
   link to /appeals/$appealId

2. Дата поступления
   receivedAt
   формат: DD.MM.YYYY

3. Заявитель
   applicant.displayName
   вторичная строка: syntheticIdentifier

4. Категория
   category label

5. Тема
   subject, truncate

6. Отдел
   department name

7. Исполнитель
   employee displayName или "не назначен"

8. Срок ответа
   dueAt
   дополнительно: "осталось 2 дн." / "просрочено на 3 дн."

9. Статус
   status badge

10. Просрочка
   computed isOverdue
```

Сортировка:

```txt
- receivedAt desc по умолчанию
- dueAt asc
- status
- department
- category
```

Фильтры:

```txt
- status: multi-select
- departmentId: select/multi-select
- category: select/multi-select
- overdue: all | overdue | not_overdue
- q: global search по номеру, теме, заявителю, syntheticIdentifier
```

Пагинация:

```txt
- pageSize: 10 / 20 / 50
- default: 20
- состояние в URL search params
```

Computed fields:

```ts
isOverdue = isAppealOverdue(appeal, referenceDate);
daysUntilDue = calculateDaysUntilDue(appeal, referenceDate);
processingDays = calculateProcessingDays(appeal);
departmentName = departmentsById[appeal.departmentId]?.name;
assigneeName = employeesById[appeal.assigneeId]?.displayName;
```

Отображение статусов:

```txt
new          Новое
in_progress  В работе
waiting      Ожидает
resolved     Выполнено
overdue      Просрочено
closed       Закрыто
```

Выделение просроченных строк:

```txt
- не использовать агрессивную заливку
- тонкий левый border или subtle background через semantic token
- текст "Просрочено на N дн."
- строка должна оставаться читаемой в dark mode
```

Для производительности:

```txt
- columns через useMemo
- filtered data через pure selector/useMemo
- dictionary maps через useMemo
- не создавать formatter внутри каждой cell без memoization
- для 300 строк virtualization не нужна
- @tanstack/react-virtual рассмотреть только при росте до тысяч строк
```

---

## J. Панель управления и панель аналитики

Dashboard должен быть ориентирован на руководителя, без технического шума.

KPI-карточки:

```txt
- Всего обращений
- Новые
- В работе
- Закрытые
- Просроченные
- Средний срок обработки
- Доля просрочки
- Отдел с максимальной нагрузкой
```

Графики Dashboard через Recharts:

```txt
- LineChart / AreaChart: обращения по датам
- BarChart: нагрузка по отделам
- PieChart или BarChart: распределение по категориям
- BarChart: просрочки по отделам
```

Analytics page:

```txt
- обращения по дням / неделям
- распределение по категориям
- распределение по статусам
- рейтинг отделов по количеству обращений
- рейтинг отделов по просрочкам
- среднее время обработки по категориям
```

Pure functions:

```ts
getAppealsCount(appeals);
getAppealsByStatus(appeals);
getAppealsByCategory(appeals);
getAppealsByDepartment(appeals);
getOverdueAppeals(appeals, referenceDate);
getAverageProcessingDays(appeals);
getAverageProcessingDaysByCategory(appeals);
buildAppealsTimeSeries(appeals, granularity);
rankDepartmentsByLoad(appeals);
rankDepartmentsByOverdue(appeals, referenceDate);
```

Recharts view models:

```ts
toRechartsSeries(timeSeries);
toCategoryChartData(categoryDistribution);
toDepartmentRankingChartData(departmentRanking);
```

Тестирование расчетов:

```txt
- фиксированная reference date
- маленькие fixtures на 5–10 обращений
- отдельные кейсы: новое не просрочено, новое просрочено, закрыто после срока, closed не считается текущей просрочкой
- проверка среднего срока обработки с округлением
- проверка группировки по неделям
```

---

## K. UI/UX plan

Основной стиль: современный минимализм, shadcn-ui, нейтральная палитра через design tokens, без декоративных градиентов, “spark/fire” метафор, чрезмерных анимаций и визуального шума. Не строить дизайн вокруг lucide-иконок; для MVP лучше текстовая навигация и четкая типографика. Если существующий шаблон уже использует иконки, оставить только нейтральные служебные иконки там, где они улучшают сканирование, но не делать их смысловой основой интерфейса.

Layout:

```txt
- AppShell с sidebar слева и topbar сверху
- sidebar: Дашборд, Реестр, Аналитика, Demo-настройки
- topbar: название приложения, demo badge, переключатель роли, theme toggle
- main content: max-width по необходимости, но dashboard может занимать всю ширину
```

Карточки метрик:

```txt
- shadcn Card
- крупное значение
- короткий label
- вторичная подсказка
- severity через semantic tokens, не через яркие цвета
```

Таблицы:

```txt
- shadcn Table как visual layer
- TanStack Table как state/model layer
- sticky header можно добавить позже
- фильтры сверху, не в отдельной перегруженной панели
- пустое состояние при отсутствии результатов
```

Бейджи статусов:

```txt
- Badge variant на основе статуса
- русские labels
- спокойные цвета через CSS variables
- overdue — заметный, но не агрессивный
```

Empty states:

```txt
- "Обращения не найдены"
- "Измените фильтры или сбросьте поиск"
- кнопка "Сбросить фильтры"
```

Loading states:

```txt
- skeleton для KPI cards
- skeleton rows для таблицы
- без бесконечных “прыгающих” элементов
```

Error states:

```txt
- route-level error boundary
- текст: "Не удалось подготовить demo-данные"
- технические details только в collapsible block на demo-settings/admin экране
```

Toast notifications через sonner:

```txt
- "Статус обращения изменен"
- "Комментарий добавлен"
- "Исполнитель назначен"
- "Действие недоступно для выбранной demo-роли"
```

Accessibility:

```txt
- все кнопки с понятными labels
- aria-sort для sortable headers
- keyboard focus visible
- dialog focus trap
- не использовать только цвет для статусов
- charts должны иметь текстовые summary рядом или под графиком
- достаточный contrast в dark/light mode
```

Интерфейс полностью на русском языке. Исключение — технические enum-значения внутри кода.

Responsive behavior:

```txt
- desktop: sidebar + full table
- tablet: sidebar collapsible, таблица с горизонтальным scroll
- mobile: KPI cards в одну колонку, фильтры в раскрываемой панели, таблица превращается в compact list только если это уже есть в дизайн-системе
```

---

## L. Безопасность и защита данных

Главное правило: приложение работает только на synthetic/mock data. Нельзя использовать реальные ИИН/БИН, ФИО, адреса, телефоны, email, налоговые сведения, задолженности, декларации, внутренние API, ключи, пароли, выгрузки или служебную информацию.

Требования для MVP:

```txt
- не добавлять реальные API endpoints
- не использовать fetch к внешним адресам
- не добавлять telemetry/analytics/tracking
- не использовать реальные env secrets
- не читать локальные выгрузки
- не использовать production-like auth tokens
- не отправлять synthetic contacts наружу
- все данные маркировать synthetic: true
- на UI показывать demo badge: "Синтетические данные"
```

Mock RBAC не является авторизацией. Это только демонстрационный переключатель роли, который управляет видимостью кнопок и mock-действий. Его нельзя описывать как security boundary.

Прототип не является production-системой. Перед production потребуются:

```txt
- реальная идентификация и аутентификация
- серверная авторизация
- модель ролей и прав доступа
- audit log
- журналирование действий
- backend validation
- защита персональных данных
- шифрование при передаче и хранении
- secure deployment pipeline
- secrets management
- CSP/security headers
- privacy review
- threat modeling
- data retention policy
- интеграционное тестирование с backend
- контроль доступа к отчетам и выгрузкам
```

Дополнительная защита MVP:

```txt
- test на отсутствие forbidden field names: iin, bin, password, token, apiKey, secret
- test на отсутствие 12-значных numeric identifiers
- test на email domains только example.invalid/example.test
- test на отсутствие внешних URL в mock data
- grep/check script перед build, если это вписывается в существующий check pipeline
```

---

## M. План тестирования

Unit tests для domain functions:

```txt
entities/appeal/lib/appeal-overdue.test.ts
  - active appeal due yesterday => overdue
  - active appeal due tomorrow => not overdue
  - closed appeal due yesterday => not current overdue
  - resolved after due date => processing violation, but not current overdue

entities/appeal/lib/appeal-status.test.ts
  - new -> in_progress allowed
  - in_progress -> resolved allowed
  - closed -> in_progress denied
  - executor cannot close if permission rules forbid it

entities/appeal/lib/appeal-analytics.test.ts
  - counts by status
  - counts by category
  - average processing days
  - department overdue ranking
```

Tests для synthetic data generator:

```txt
data/mock/synthetic-generator.test.ts
  - same seed returns same dataset
  - dataset size between 100 and 300
  - all objects pass Zod schemas
  - all records have synthetic: true
  - no forbidden identifier patterns
  - no real-looking IIN/BIN
  - emails use demo domains only
  - generated history is chronological
```

Tests для filtering/sorting:

```txt
features/appeals-list/model/appeal-filtering.test.ts
  - filter by status
  - filter by department
  - filter by category
  - filter by overdue
  - global search by appealNumber/subject/applicant
  - combined filters
```

Component tests через Testing Library + jsdom:

```txt
features/dashboard/ui/kpi-card.test.tsx
  - renders label/value/unit
  - renders warning state textually

features/appeals-list/ui/appeals-table.test.tsx
  - renders rows
  - changes sorting
  - applies search
  - highlights overdue row
  - shows empty state

features/appeal-detail/ui/appeal-actions.test.tsx
  - manager sees assign action
  - executor sees status/comment action
  - unavailable action shows disabled or hidden state
```

Route-level smoke tests, если конфигурация позволяет:

```txt
- /dashboard renders dashboard title
- /appeals renders registry title
- /appeals/$appealId renders synthetic appeal
- /analytics renders charts headings
- /demo-settings renders seed/reference date
```

Для тестов использовать фиксированный `DEMO_REFERENCE_DATE`, иначе просрочки будут зависеть от текущей даты и тесты начнут флакать.

---

## N. Фазы имплементации

| Фаза                                          | Цель                                                                         | Файлы/модули                                                                     | Ожидаемый результат                                                        | Проверка                                         | Риски                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| Phase 0 — repository inspection and setup     | Проверить фактическую структуру, scripts, aliases, UI primitives, test setup | `package.json`, `tsconfig*`, `vite/config`, `src/routes`, `components/ui`, `lib` | Карта текущего проекта и точка встраивания                                 | `bun install`, `bun run check`                   | Сейчас репозиторий недоступен; возможны отличия структуры       |
| Phase 1 — domain types and Zod schemas        | Описать строгую domain model                                                 | `entities/*/model/*.schema.ts`, `*.types.ts`, constants                          | Типы и схемы для Appeal/Citizen/Department/Employee/RBAC                   | `bun run check`, unit tests schemas              | Дублирование типов вручную вместо `z.infer`                     |
| Phase 2 — synthetic data generator            | Сгенерировать 100–300 стабильных обращений                                   | `data/mock/seed.ts`, `reference-date.ts`, `synthetic-generator.ts`, `mock-db.ts` | Детерминированный dataset, прошедший Zod validation                        | `bun run test`                                   | Faker может случайно создать real-looking data; нужны guards    |
| Phase 3 — layout and routing                  | Создать app shell и страницы                                                 | `routes/*`, `app/app-shell.tsx`, `components/layout/*`                           | Рабочая навигация `/dashboard`, `/appeals`, `/analytics`, `/demo-settings` | `bun run generate-routes`, `bun run dev`         | Несовпадение с текущей схемой TanStack Start                    |
| Phase 4 — dashboard                           | Реализовать KPI и базовые графики                                            | `features/dashboard/*`, `entities/appeal/lib/appeal-analytics.ts`                | Руководитель видит основные показатели                                     | `bun run test`, visual smoke                     | Перегрузка экрана деталями                                      |
| Phase 5 — appeals table                       | Реестр с фильтрами, сортировкой, пагинацией                                  | `features/appeals-list/*`                                                        | Таблица 100–300 строк, поиск, фильтры, overdue highlight                   | `bun run test`, `bun run check`                  | Состояние фильтров может стать сложным; лучше URL search schema |
| Phase 6 — appeal detail page                  | Карточка обращения и mock actions                                            | `features/appeal-detail/*`, mutations                                            | Карточка, история, комментарии, смена статуса, назначение                  | `bun run test`                                   | Несогласованность history/status, если нет transition rules     |
| Phase 7 — analytics                           | Отдельная аналитическая страница                                             | `features/analytics/*`, analytics selectors                                      | Динамика, категории, статусы, рейтинги отделов                             | `bun run test`                                   | Неверные группировки дат/недель                                 |
| Phase 8 — mock role switcher and demo actions | Mock RBAC и permission guard                                                 | `features/demo-rbac/*`, `entities/rbac/*`                                        | Роль переключается, действия видимы по роли                                | `bun run test`                                   | Пользователи могут принять mock RBAC за реальную безопасность   |
| Phase 9 — tests                               | Покрыть критическую логику и UI                                              | `*.test.ts`, `*.test.tsx`, `tests/setup.ts`                                      | Tests для generator, overdue, filtering, KPI/table                         | `bun run test`                                   | jsdom может требовать setup для Recharts/ResizeObserver         |
| Phase 10 — polish, check, build               | Финальная стабилизация                                                       | все модули                                                                       | Чистый build, понятный UI, no external APIs                                | `bun run check`, `bun run test`, `bun run build` | Непроверенные visual regressions, лишние dependencies           |

---

## O. Критерий принятия MVP

MVP считается принятым, если:

```txt
- проект устанавливается через bun install
- приложение запускается через bun run dev
- bun run build проходит без ошибок
- bun run check проходит без ошибок
- bun run test проходит без ошибок
- есть /dashboard с KPI и графиками
- есть /appeals с таблицей обращений
- есть /appeals/$appealId с карточкой обращения
- есть /analytics с базовой аналитикой
- есть /demo-settings или /settings для demo-настроек
- 100–300 обращений генерируются детерминированно
- все данные полностью synthetic/mock
- нет реальных ИИН/БИН, ФИО, адресов, телефонов, налоговых сведений
- нет внешних API и отправки данных наружу
- mock-роли manager/executor/admin переключаются в UI
- действия ограничены mock permission rules
- есть тесты для overdue calculation
- есть тесты для generator quality
- есть тесты для filtering/sorting
- есть component tests для KPI/table
- UI на русском языке
- UI понятен руководителю и не перегружен техническими деталями
- светлая и темная тема работают, если они предусмотрены шаблоном
```

---

## P. Риски и открытые вопросы

Технические риски:

```txt
- репозиторий не был доступен для фактической инспекции, поэтому структура может отличаться
- TanStack Start route conventions могут уже быть настроены иначе
- существующий check pipeline может использовать ESLint, Biome или кастомный tsc script
- Recharts в jsdom может потребовать mocks для ResizeObserver
- SSR/client hydration mismatch, если генератор будет использовать текущую дату вместо fixed reference date
- слишком толстые route-файлы, если не вынести selectors и domain functions
- сложность синхронизации TanStack Table state с URL search params
```

Продуктовые риски:

```txt
- руководитель может ожидать production-дашборд, хотя это demo-прототип
- статус overdue может быть неоднозначен: статус или вычисляемый признак
- “задолженность” как категория может ошибочно восприниматься как реальные налоговые данные
- слишком много графиков снизит управленческую читаемость
- исполнительские действия без backend persistence могут вызвать неверные ожидания
```

Риски безопасности:

```txt
- случайная загрузка реальной выгрузки в mock layer
- случайное добавление реального API endpoint
- случайные real-looking faker values
- появление полей `iin`, `bin`, `taxpayerId`, `debtAmount`, которые будут выглядеть как реальные налоговые данные
- demo RBAC могут принять за настоящую авторизацию
- сохранение synthetic dataset в localStorage может быть ошибочно расширено до реальных данных в будущем
```

Вопросы перед implementation:

```txt
1. Нужно ли сохранять mock mutations после reload страницы или достаточно in-memory state? Сохранять
2. Какой объем dataset принять по умолчанию: 100, 200 или 300 обращений? 300
3. Считать overdue отдельным статусом или вычисляемым признаком поверх статуса? Отдельным
4. Нужен ли export mock-отчетов? Да, делать
5. Должна ли demo-role сохраняться между сессиями? Да
```

---

## Команды проверки проекта

```bash
bun install
bun run check
bun run test
bun run build
bun run dev
```

После добавления или изменения route-файлов также запускать:

```bash
bun run generate-routes
```
