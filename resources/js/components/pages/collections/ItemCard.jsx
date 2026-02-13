import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
};

const ItemCard = ({ product, openLightbox }) => {
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';

    return (
        <motion.div
            layout
            className="text-center"
            onClick={openLightbox}
            variants={itemVariants}
        >
            <div className="relative overflow-hidden aspect-[3/4] group rounded-sm">
                <OptimizedImage src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
        </motion.div>
    );
};

export default ItemCard;
