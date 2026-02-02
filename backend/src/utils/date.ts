type ParseDateOptions = { endOfDay?: boolean };

export function parseDateParam(
  value?: string | string[],
  options?: ParseDateOptions,
) {
  if (!value) {
    return undefined;
  }
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    const err = new Error("invalid-date");
    (err as any).status = 400;
    throw err;
  }
  if (options?.endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  }
  return parsed;
}

export function parseDateOnly(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const err = new Error("invalid-date");
    (err as any).status = 400;
    throw err;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function startOfDay(date: Date) {
  const parsed = new Date(date);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function endOfDay(date: Date) {
  const parsed = new Date(date);
  parsed.setHours(23, 59, 59, 999);
  return parsed;
}

export function addDays(date: Date, days: number) {
  const parsed = new Date(date);
  parsed.setDate(parsed.getDate() + days);
  return parsed;
}

export function buildDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
