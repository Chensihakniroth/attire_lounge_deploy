import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
};

const ItemCard = memo(({ product }) => {
    const navigate = useNavigate();
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';

    return (
        <motion.div
            className="text-left cursor-pointer group"
            onClick={() => navigate(`/product/${product.id}`)}
            variants={itemVariants}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="relative overflow-hidden aspect-[3/4] rounded-sm bg-white/5">
                <OptimizedImage 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                />
            </div>
        </motion.div>
    );
});

export default ItemCard;
