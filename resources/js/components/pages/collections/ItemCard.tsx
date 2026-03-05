import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { Product } from '../../../types';

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
        }
    };

    return (
        <div
            className={`text-left group ${hasSlug ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={handleProductClick}
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
        </div>
    );
});

export default ItemCard;
