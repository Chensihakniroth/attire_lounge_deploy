export interface FavoritesContextType {
    favorites: (number | string)[];
    addFavorite: (productId: number | string) => void;
    removeFavorite: (productId: number | string) => void;
    isFavorited: (productId: number | string) => boolean;
    toggleFavorite: (productId: number | string) => void;
    clearFavorites: () => void;
}
