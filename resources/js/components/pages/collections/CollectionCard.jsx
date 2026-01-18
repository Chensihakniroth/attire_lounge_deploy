import React from 'react';
import { motion } from 'framer-motion';

const CollectionCard = ({ collection }) => {
    return (
        <motion.div
            className="group cursor-pointer"
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
                            <div className="overflow-hidden border border-gray-200 h-[28rem]">
                                <motion.img
                                    src={collection.image}
                                    alt={collection.title}
                                    className="w-full h-full object-cover"
                                    style={{ imageRendering: 'crisp-edges' }}
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>            <div className="pt-6 text-center">
                <h3 className="text-2xl font-serif bg-attire-navy text-white">{collection.title}</h3>
                <p className="text-base text-gray-600 mt-2 mb-4">{collection.description}</p>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-4 py-2 rounded-full">
                    {collection.itemsCount} items
                </span>
            </div>
        </motion.div>
    );
};

export default CollectionCard;

