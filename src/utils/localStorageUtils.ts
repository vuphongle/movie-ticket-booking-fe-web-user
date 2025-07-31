export const setDataToLocalStorage = (key: string, data: unknown): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getDataFromLocalStorage = <T = unknown>(key: string): T | null => {
  const localStorageValue = localStorage.getItem(key);
  if (localStorageValue !== null) {
    return JSON.parse(localStorageValue) as T;
  }
  return null;
};
