import React from 'react';
import { motion } from 'framer-motion';

const ItemCard = ({ item }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="text-center"
            variants={cardVariants}
        >
            <div className="relative overflow-hidden mb-4">
                <img src={item.image} alt={item.name} className="w-full h-auto object-cover" />
            </div>
            <h3 className="text-base text-gray-800">{item.name}</h3>
        </motion.div>
    );
};

export default ItemCard;
