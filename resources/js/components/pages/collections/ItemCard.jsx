import React from 'react';
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

const ItemCard = ({ product }) => {
    const navigate = useNavigate();
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/path/to/default/image.jpg';

    return (
        <motion.div
            layout
            className="text-center cursor-pointer group"
            onClick={() => navigate(`/product/${product.id}`)}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="relative overflow-hidden aspect-[3/4] rounded-sm bg-white/5">
                <OptimizedImage 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                
                {/* Minimal Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white border border-white/20 px-4 py-2 bg-black/20 backdrop-blur-md">
                        Explore Piece
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ItemCard;
