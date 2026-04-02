import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2, Package, Tag, Info } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { usePOS } from './POSContext';
import ProductRow from './ProductRow';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { addItem } = usePOS();

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/v1/admin/pos/products/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products with search, category, and pagination
    const fetchProducts = useCallback(async (isNewSearch = false) => {
        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const response = await axios.get('/api/v1/admin/pos/products', {
                params: {
                    search,
                    category: selectedCategory,
                    page: currentPage,
                    per_page: 30
                }
            });

            const newProducts = response.data.data;
            if (isNewSearch) {
                setProducts(newProducts);
                setPage(2);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
                setPage(prev => prev + 1);
            }
            setHasMore(response.data.next_page_url !== null);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [search, selectedCategory, page]);

    // Handle initial load and search/category changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(true);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedCategory]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
            fetchProducts();
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Search & Category Filter Section */}
            <div className="p-4 space-y-4 bg-white/50 dark:bg-black/20 border-b border-black/5 dark:border-white/5 backdrop-blur-md sticky top-0 z-20">
                {/* Product Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search product code or name..."
                        className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-attire-accent/50 focus:bg-white dark:focus:bg-black transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Quick Filters */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all ${
                            selectedCategory === null 
                                ? 'bg-attire-accent text-black shadow-lg shadow-attire-accent/10 scale-105' 
                                : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all ${
                                selectedCategory === cat 
                                    ? 'bg-attire-accent text-black shadow-lg shadow-attire-accent/10 scale-105' 
                                    : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10 dark:hover:bg-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List - Scrollable Ledger */}
            <div 
                className="flex-1 overflow-y-auto p-4 attire-scrollbar bg-black/[0.02] dark:bg-black/40" 
                onScroll={handleScroll}
            >
                {/* Ledger Header */}
                <div className="flex items-center gap-4 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 mb-2 border-b border-black/5 dark:border-white/5 sticky top-0 bg-[#f8f8f8] dark:bg-[#050505] z-10 transition-colors">
                    <div className="w-32 flex-shrink-0">SKU / Code</div>
                    <div className="flex-1">Product Description</div>
                    <div className="w-28 hidden md:block">Classification</div>
                    <div className="w-24 text-right">Unit Price</div>
                    <div className="w-8"></div>
                </div>

                {products.length === 0 && !loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-12 opacity-50">
                        <Package size={48} className="mb-4 text-gray-400" />
                        <p className="text-[11px] font-bold uppercase tracking-widest">No products found</p>
                        <p className="text-[9px] mt-1">Try broadening your search or choosing a different category</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <AnimatePresence mode="popLayout">
                            {products.map((product) => (
                                <ProductRow 
                                    key={product.id} 
                                    product={product} 
                                    onClick={() => addItem(product)} 
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Loading state indicator */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-attire-accent" size={24} />
                    </div>
                )}
                
                {/* No more results message */}
                {!hasMore && products.length > 0 && (
                    <div className="text-center py-8 opacity-30 text-[9px] font-bold uppercase tracking-widest">
                        End of Catalog reached
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCatalog;
