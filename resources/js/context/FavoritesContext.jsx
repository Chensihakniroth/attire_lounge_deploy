import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const localData = localStorage.getItem('attire-lounge-favorites');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Could not parse favorites from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('attire-lounge-favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error("Could not save favorites to localStorage", error);
        }
    }, [favorites]);

    const addFavorite = (productId) => {
        setFavorites(prev => {
            if (prev.includes(productId)) return prev;
            return [...prev, productId];
        });
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