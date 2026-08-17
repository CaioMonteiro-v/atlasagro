export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const iso = value.slice(0, 10);
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function formatNumber(
  value: number | string | null | undefined,
  suffix = "",
) {
  if (value == null || value === "") return "—";
  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return "—";
  return `${parsed.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${suffix}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDaysISO(isoDate: string, days: number) {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function daysFromTodayISO(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function parseISODate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value).trim();
}

export function optionalNumber(value: string) {
  if (!value) return null;
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function optionalInt(value: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toCsv(rows: Array<Record<string, string>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string) => {
    if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };
  const lines = [
    headers.join(";"),
    ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(";")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function castRows<T>(data: unknown): T[] {
  return (Array.isArray(data) ? data : []) as T[];
}

export function relOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
