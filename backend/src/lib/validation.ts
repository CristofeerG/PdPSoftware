export function parseIntParam(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

export function isPositiveInteger(value: unknown): value is number {
  return isPositiveNumber(value) && Number.isInteger(value);
}
