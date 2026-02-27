import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { Product } from '../../../types';

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
};

interface ItemCardProps {
    product: Product;
}

const ItemCard: React.FC<ItemCardProps> = memo(({ product }) => {
    const navigate = useNavigate();
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';
    const fallbackUrl = product.images && product.images.length > 1 ? product.images[1] : null;

    const hasSlug = !!product.slug && product.slug !== 'undefined';

    const handleProductClick = () => {
        if (hasSlug) {
            navigate(`/product/${product.slug}`);
        } else {
            console.error("This product has an invalid slug and cannot be viewed:", product);
        }
    };

    return (
        <motion.div
            className={`text-left group ${hasSlug ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={handleProductClick}
            variants={itemVariants}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className={`relative overflow-hidden aspect-[3/4] rounded-sm bg-white/5 ${!hasSlug ? 'opacity-50' : ''}`}>
                <OptimizedImage 
                    src={imageUrl} 
                    fallback={fallbackUrl}
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    containerClassName="w-full h-full"
                />
            </div>
        </motion.div>
    );
});

export default ItemCard;
