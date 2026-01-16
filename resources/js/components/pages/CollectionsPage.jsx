import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CollectionCard from './collections/CollectionCard';
import ItemCard from './collections/ItemCard';
import API from '../../api';
import minioBaseUrl from '../../config.js';
import { Search, X } from 'lucide-react';

const collections = [
    { id: 1, title: 'Havana Collection', slug: 'havana-collection', description: 'Lightweight fabrics and breezy silhouettes.', itemsCount: 42, image: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg` },
    { id: 5, title: "Mocha Mousse '25'", slug: 'mocha-mousse-25', description: 'Breathable natural fabrics for sophisticated comfort.', itemsCount: 35, image: `${minioBaseUrl}/uploads/collections/default/mm1.jpg` },
    { id: 3, title: 'Groom Collection', slug: 'groom-collection', description: 'Elegant tuxedos and formal wear for special occasions.', itemsCount: 19, image: `${minioBaseUrl}/uploads/collections/default/g10.jpg` },
];

const PageHeader = () => (
    <div className="text-center py-16 sm:py-24" style={{ backgroundColor: '#0d3542' }}>
        <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            Our Collections
        </motion.h1>
        <motion.p
            className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
            Discover our curated collections, where timeless elegance meets modern craftsmanship. Each piece is designed to elevate your personal style.
        </motion.p>
    </div>
);

const AllProductsView = ({ products, categories, onFilterChange, searchTerm, selectedCategory, onClearFilters }) => {
    return (
        <div>
            {/* Filter Section */}
            <div className="mb-12 p-6 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="relative md:col-span-1">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-attire-accent focus:border-attire-accent"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <div className="md:col-span-1">
                        <select
                            value={selectedCategory}
                            onChange={(e) => onFilterChange({ selectedCategory: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-attire-accent focus:border-attire-accent bg-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1 flex justify-start">
                         <button
                            onClick={onClearFilters}
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            <X size={16} className="mr-2" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map(product => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ItemCard product={product} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};


const CollectionsPage = () => {
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        selectedCategory: ''
    });

    useEffect(() => {
        if (showAllProducts) {
            setLoading(true);
            API.getCategories()
                .then(categoriesData => {
                    setCategories(categoriesData.data);
                })
                .catch(error => console.error("Failed to fetch categories:", error))
                .finally(() => setLoading(false));
        }
    }, [showAllProducts]);

    useEffect(() => {
        if (showAllProducts) {
            setLoading(true);
            const apiFilters = {
                search: filters.searchTerm,
                category: filters.selectedCategory,
                per_page: 1000 // Get all
            };
            API.getProducts(apiFilters)
                .then(productsData => {
                    console.log('Fetched products (CollectionsPage):', productsData); // Debugging line
                    setProducts(productsData.data);
                })
                .catch(error => console.error("Failed to fetch products:", error))
                .finally(() => setLoading(false));
        }
    }, [showAllProducts, filters]);
    
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleClearFilters = () => {
        setFilters({ searchTerm: '', selectedCategory: '' });
    };

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <PageHeader />

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {!showAllProducts ? (
                    <>
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
                        >
                            {collections.map((collection) => (
                                <Link to={`/collections/${collection.slug}`} key={collection.id}>
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    >
                                        <CollectionCard collection={collection} />
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                        <div className="text-center mt-16">
                            <button
                                onClick={() => setShowAllProducts(true)}
                                className="bg-attire-accent text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-accent/90 transition-colors"
                            >
                                Browse All Products
                            </button>
                        </div>
                    </>
                ) : (
                    loading && products.length === 0 ? (
                        <div className="text-center">Loading products...</div>
                    ) : (
                       <AllProductsView 
                            products={products}
                            categories={categories}
                            onFilterChange={handleFilterChange}
                            searchTerm={filters.searchTerm}
                            selectedCategory={filters.selectedCategory}
                            onClearFilters={handleClearFilters}
                       />
                    )
                )}
            </main>
        </div>
    );
};

export default CollectionsPage;
