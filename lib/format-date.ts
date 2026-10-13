export type DatePrecision = "day" | "month";

const FORMATS: Record<DatePrecision, Intl.DateTimeFormatOptions> = {
  day: { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  month: { month: "short", year: "numeric", timeZone: "UTC" },
};

/** "2026-09-28" as "Sep 28, 2026", or "Sep 2026" for month precision; UTC so the server and phone agree. */
export function formatDate(iso: string, precision: DatePrecision = "day"): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", FORMATS[precision]);
}

/** Two-digit counter for tour labels, like "02". */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
