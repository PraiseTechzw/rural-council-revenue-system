export function toIsoDate(value: Date | string): string {
  return new Date(value).toISOString();
}

export function isValidDate(value: unknown): boolean {
  return value instanceof Date && !Number.isNaN(value.getTime());
}
