export function formatGraphicLabel(value: string): string {
  if (!value) return '';

  const formatted = value.replace(/_/g, ' ').trim();

  return formatted;
}

export const formatDate = (dateStr?: string | number): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDate_corner = (dateInput: number[] | string): string => {
  let date: Date;

  if (Array.isArray(dateInput)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
    date = new Date(year, month - 1, day, hour, minute, second);
  } else {
    date = new Date(dateInput);
  }

  const dd = `0${date.getDate()}`.slice(-2);
  const mm = `0${date.getMonth() + 1}`.slice(-2);
  const yyyy = date.getFullYear();
  const hh = `0${date.getHours()}`.slice(-2);
  const min = `0${date.getMinutes()}`.slice(-2);

  return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
};

export function getMovieTitle<T extends { name: string; nameEn?: string | null }>(
  movie: T,
  language: string
): string {
  const isEnglish = language?.toLowerCase().startsWith('en');
  if (isEnglish) {
    return movie.nameEn?.trim() || movie.name;
  }
  return movie.name;
}


