import React, { createContext, useState, useContext, useEffect } from 'react';
import { products } from '../data/products.js';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const localData = localStorage.getItem('attire-lounge-favorites');
            if (localData) {
                const parsedData = JSON.parse(localData);
                // Filter out any IDs that don't exist in the current product list
                const validIds = parsedData.filter(id => products.some(p => p.id === id));
                return validIds;
            }
            return [];
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

    const toggleFavorite = (productId) => {
        if (favorites.includes(productId)) {
            removeFavorite(productId);
        } else {
            addFavorite(productId);
        }
    };

    const value = {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorited,
        toggleFavorite
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};