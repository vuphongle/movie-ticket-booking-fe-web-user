export function formatGraphicLabel(value: string): string {
  if (!value) return '';

  const formatted = value.replace(/_/g, ' ').trim();

  return formatted;
}

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};