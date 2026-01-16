import React from 'react';
import { motion } from 'framer-motion';

const ItemCard = ({ product }) => { // Changed prop name from item to product
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Use the first image from the images array, provide a fallback if it's empty
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';

    return (
        <motion.div
            className="text-center"
            variants={cardVariants}
        >
            <div className="relative overflow-hidden mb-4">
                <img src={imageUrl} alt={product.name} className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-base text-gray-800">{product.name}</h3>
        </motion.div>
    );
};

export default ItemCard;
