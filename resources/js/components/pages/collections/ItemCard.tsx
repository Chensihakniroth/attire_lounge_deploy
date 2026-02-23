import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { Product } from '../../../types';

interface ItemCardProps {
    product: Product;
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
};

const ItemCard = memo(({ product }: ItemCardProps) => {
    const navigate = useNavigate();
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';
    
    // In industry-standard apps, we prefer slugs for SEO-friendly URLs
    const identifier = product.slug || String(product.id);

    return (
        <motion.div
            className="text-left cursor-pointer group"
            onClick={() => navigate(`/product/${identifier}`)}
            variants={itemVariants}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="relative overflow-hidden aspect-[3/4] rounded-sm bg-white/5">
                <OptimizedImage 
                    src={imageUrl} 
                    alt={product.name} 
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {Boolean(product.discount_percent && product.discount_percent > 0) && (
                    <div className="absolute top-4 left-4 bg-white text-black text-[8px] font-bold uppercase tracking-widest px-2 py-1">
                        -{product.discount_percent}%
                    </div>
                )}
            </div>
            
            <div className="mt-6 space-y-1">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold truncate pr-4">
                        {product.name}
                    </h3>
                    <span className="text-[10px] text-white/40 font-medium">
                        ${product.price}
                    </span>
                </div>
                <p className="text-[8px] uppercase tracking-[0.1em] text-white/20">
                    {product.collection}
                </p>
            </div>
        </motion.div>
    );
});

export default ItemCard;
