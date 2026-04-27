const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  return true;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function toIso(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return date.toISOString();
}

export function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidIso(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;

  const dateMatch = value.match(ISO_DATE_RE);
  if (dateMatch) {
    const [, yearRaw, monthRaw, dayRaw] = dateMatch;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    return isValidDateParts(year, month, day);
  }

  const datetimeMatch = value.match(ISO_DATETIME_RE);
  if (!datetimeMatch) return false;

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw, , tzRaw] = datetimeMatch;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const second = secondRaw ? Number(secondRaw) : 0;

  if (!isValidDateParts(year, month, day)) return false;
  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  if (second < 0 || second > 59) return false;

  if (tzRaw !== "Z") {
    const [offsetHourRaw, offsetMinuteRaw] = tzRaw.slice(1).split(":");
    const offsetHour = Number(offsetHourRaw);
    const offsetMinute = Number(offsetMinuteRaw);

    if (offsetHour < 0 || offsetHour > 23) return false;
    if (offsetMinute < 0 || offsetMinute > 59) return false;
  }

  return true;
}
