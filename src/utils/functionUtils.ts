export function formatGraphicLabel(value: string): string {
  if (!value) return '';

  const formatted = value.replace(/_/g, ' ').trim();

  return formatted;
}