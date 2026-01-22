import React from 'react';
import { motion } from 'framer-motion';

const ItemCard = ({ product, openLightbox }) => {
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';

    return (
        <motion.div
            className="text-center"
            onClick={openLightbox}
        >
            <div className="relative overflow-hidden mb-4 aspect-w-3 aspect-h-4 group">
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-base text-attire-cream">{product.name}</h3>
        </motion.div>
    );
};

export default ItemCard;
