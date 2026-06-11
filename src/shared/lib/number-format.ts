export function formatMetric(value: number, unit?: "count" | "days" | "percent") {
  if (unit === "days") return `${value.toLocaleString("ru-RU")} дн.`;
  if (unit === "percent") return `${value.toLocaleString("ru-RU")}%`;
  return value.toLocaleString("ru-RU");
}
