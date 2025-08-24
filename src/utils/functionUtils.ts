export function formatGraphicLabel(value: string): string {
  if (!value) return '';

  const formatted = value.replace(/_/g, ' ').trim();

  return formatted;
}

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};