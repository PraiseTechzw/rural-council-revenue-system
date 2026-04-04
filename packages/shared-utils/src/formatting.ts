export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function maskText(value: string, visible = 4): string {
  if (value.length <= visible) {
    return value;
  }
  return `${"*".repeat(value.length - visible)}${value.slice(-visible)}`;
}
