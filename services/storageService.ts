
const STORAGE_KEY = 'glassquiz_favorites';

export const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const isFavorite = (questionId: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(questionId);
};

export const toggleFavorite = (questionId: string): boolean => {
  const favorites = getFavorites();
  const index = favorites.indexOf(questionId);
  let isFav = false;

  if (index > -1) {
    favorites.splice(index, 1);
    isFav = false;
  } else {
    favorites.push(questionId);
    isFav = true;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return isFav;
};
