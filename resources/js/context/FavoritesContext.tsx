import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { products } from '../data/products';
import { FavoritesContextType } from '../types/context';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favorites, setFavorites] = useState<(number | string)[]>(() => {
        try {
            const localData = localStorage.getItem('attire-lounge-favorites');
            if (localData) {
                return JSON.parse(localData);
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

    const addFavorite = (productId: number | string) => {
        setFavorites(prev => {
            if (prev.includes(productId)) return prev;
            return [...prev, productId];
        });
    };

    const removeFavorite = (productId: number | string) => {
        setFavorites(prev => prev.filter(id => id !== productId));
    };

    const isFavorited = (productId: number | string): boolean => {
        return favorites.includes(productId);
    };

    const toggleFavorite = (productId: number | string) => {
        if (favorites.includes(productId)) {
            removeFavorite(productId);
        } else {
            addFavorite(productId);
        }
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    const value: FavoritesContextType = {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorited,
        toggleFavorite,
        clearFavorites
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
