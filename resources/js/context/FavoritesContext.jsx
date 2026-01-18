import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    const addFavorite = (productId) => {
        setFavorites(prev => [...prev, productId]);
    };

    const removeFavorite = (productId) => {
        setFavorites(prev => prev.filter(id => id !== productId));
    };

    const isFavorited = (productId) => {
        return favorites.includes(productId);
    };

    const value = {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorited,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
