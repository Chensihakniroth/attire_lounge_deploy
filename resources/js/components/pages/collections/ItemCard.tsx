import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { Product } from '../../../types';

interface ItemCardProps {
    product: Product;
}

const ItemCard: React.FC<ItemCardProps> = memo(({ product }) => {
    const navigate = useNavigate();

    // Support both old Product type (images[]) and API response (image_path)
    const imageUrl = product.images?.[0]
        ?? (product as any).image_path
        ?? (product as any).thumbnail
        ?? '/images/placeholder.jpg';
    const fallbackUrl = product.images?.[1] ?? null;

    const slug = product.slug ?? (product as any).slug;
    const hasSlug = !!slug && slug !== 'undefined' && slug.trim() !== '';

    const handleProductClick = () => {
        if (hasSlug) {
            navigate(`/product/${slug}`);
        }
    };

    return (
        <div
            className={`text-left group animate-gallery-reveal ${hasSlug ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={handleProductClick}
            style={{
                willChange: 'transform, opacity'
            }}
        >
            <div className={`relative overflow-hidden aspect-[3/4] rounded-sm bg-white/5 ${!hasSlug ? 'opacity-50' : ''}`}>
                <OptimizedImage 
                    src={imageUrl} 
                    fallback={fallbackUrl}
                    alt={product.name} 
                    className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.03]" 
                    containerClassName="w-full h-full"
                />
                
                {/* Subtle Hover Overlay - Professional touch */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
        </div>
    );
});

export default ItemCard;
