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
            <div className="relative overflow-hidden aspect-[3/4] rounded-sm bg-white/5 mb-4">
                <OptimizedImage 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                />
            </div>

            {/* Product Info */}
            <div className="space-y-1.5 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-attire-accent text-[8px] uppercase tracking-[0.2em] font-bold">
                        {product.collection}
                    </span>
                    <div className="h-px w-4 bg-attire-accent/20" />
                </div>
                
                <h3 className="text-white font-serif text-base lg:text-lg italic leading-tight group-hover:text-attire-accent transition-colors duration-300">
                    {product.name}
                </h3>
                
                <div className="flex justify-between items-end pt-1">
                    <span className="text-attire-silver/40 text-[9px] uppercase tracking-widest font-medium">
                        {product.category}
                    </span>
                </div>
            </div>
        </motion.div>
    );
});

export default ItemCard;
