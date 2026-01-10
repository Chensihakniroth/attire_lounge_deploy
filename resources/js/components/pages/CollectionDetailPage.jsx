import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import ItemCard from './collections/ItemCard';
import minioBaseUrl from '../../config.js';

// --- Mock Data ---
const createCollectionItems = (prefix, name, count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `${prefix}${i + 1}`,
        name: `${name} Style ${i + 1}`,
        image: `${minioBaseUrl}/uploads/collections/default/${prefix}${i + 1}.jpg`,
    }));
};

const allItems = {
    'havana-collection': {
        title: 'Havana Collection',
        items: createCollectionItems('hvn', 'Havana', 10)
    },
    'mocha-mousse-25': {
        title: "Mocha Mousse '25",
        items: createCollectionItems('mm', 'Mocha Mousse', 10)
    },
    'groom-collection': {
        title: 'Groom Collection',
        items: createCollectionItems('g', 'Groom', 10)
    },
};
// --- End Mock Data ---

const PageHeader = ({ title }) => (
    <div className="text-center py-16 sm:py-24 bg-gray-50">
        <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {title}
        </motion.h1>
        <Link to="/collections" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
            <ChevronLeft size={16} />
            Back to Collections
        </Link>
    </div>
);

const CollectionDetailPage = () => {
    const { collectionSlug } = useParams();

    const collection = useMemo(() => {
        return allItems[collectionSlug] || null;
    }, [collectionSlug]);

    if (!collection) {
        return (
            <div className="min-h-screen bg-white text-center py-40">
                <h1 className="text-2xl font-bold text-red-500">Collection Not Found</h1>
                <p className="text-gray-600 mt-4">The collection you are looking for does not exist.</p>
                <Link to="/collections" className="mt-8 inline-block bg-black text-white px-6 py-3 rounded-lg">
                    Back to Collections
                </Link>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <PageHeader title={collection.title} />

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {collection.items.map(item => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default CollectionDetailPage;
