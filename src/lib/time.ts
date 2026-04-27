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
  return parseIso(value) !== null;
}
