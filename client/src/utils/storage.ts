export const storage = {
  getFavoriteStatus: (id: number): boolean => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(id);
  },
  toggleFavorite: (id: number): boolean => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(id)) {
      favorites = favorites.filter((favId: number) => favId !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return favorites.includes(id);
  },
  getTooltipShown: (): boolean => {
    return localStorage.getItem('tooltipShown') === 'true';
  },
  setTooltipShown: () => {
    localStorage.setItem('tooltipShown', 'true');
  }
};
