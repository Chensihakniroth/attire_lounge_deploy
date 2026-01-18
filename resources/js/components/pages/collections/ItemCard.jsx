import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../../context/FavoritesContext.jsx';

const ItemCard = ({ product }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };
    const { addFavorite, removeFavorite, isFavorited } = useFavorites();
    const isFavorite = isFavorited(product.id);

    const toggleFavorite = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isFavorite) {
            removeFavorite(product.id);
        } else {
            addFavorite(product.id);
        }
    };

    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';

    return (
        <motion.div
            className="text-center"
            variants={cardVariants}
        >
            <div className="relative overflow-hidden mb-4 aspect-w-3 aspect-h-4 group">
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                <button 
                    onClick={toggleFavorite}
                    className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 rounded-full text-gray-800 hover:bg-white transition-opacity z-10"
                    aria-label="Toggle Favorite"
                >
                    <Heart size={14} className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
            </div>
            <h3 className="text-base text-attire-navy">{product.name}</h3>
        </motion.div>
    );
};

export default ItemCard;
