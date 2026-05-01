import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePOS } from './POSContext';
import { Zap, Loader2, ChevronDown, ShoppingBag, Package, Scissors, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../admin/AdminContext';

const QuickAccessDeck = ({ onClose }) => {
    const { activeOutlet } = useAdmin();
    const [activeTab, setActiveTab] = useState(activeOutlet === 'attire_lounge' ? 'services' : 'drinks');
    const [services, setServices] = useState(window.__posServiceCache || []);
    const [drinks, setDrinks] = useState([]);
    const [drinkCategories, setDrinkCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const { addItem } = usePOS();

    // Map user-friendly names to DB categories (garments excluded — use full catalog)
    const accessoryGroups = [
        { id: 'necktie',    label: 'Neck Tie',             cats: ['NECK TIE'] },
        { id: 'bowtie',     label: 'Bow Tie',              cats: ['BOW TIE'] },
        { id: 'ascot',      label: 'Ascot',                cats: ['CRAVAT'] },
        { id: 'scarf',      label: 'Scarf',                cats: ['SCARF'] },
        { id: 'pocket',     label: 'Pocket Square',        cats: ['POCKET SQUARE'] },
        { id: 'lapelpin',   label: 'Lapel & Collar Pin',   cats: ['LAPEL PIN', 'COLLAR PIN'] },
        { id: 'cufflinks',  label: 'Cufflinks',            cats: ['CUFFLINKS'] },
        { id: 'tieclip',    label: 'Tie Clip',             cats: ['TIE CLIP'] },
        { id: 'button',     label: 'Button',               cats: ['BUTTON'] },
        { id: 'waist',      label: 'Waist & Support',      cats: ['CUMMERBUND', 'SUSPENDERS', 'BELT'] },
        { id: 'timepieces', label: 'Timepieces & Jewelry', cats: ['POCKET WATCH', 'JEWELRY'] },
        { id: 'bags',       label: 'Bags & Boxes',         cats: ['BAG', 'BOX'] },
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch services
                const servicesRes = await axios.get('/api/v1/admin/pos/products/services');
                window.__posServiceCache = servicesRes.data;
                setServices(servicesRes.data);

                // Fetch drink categories (any categories present in products from caffeine/kravat)
                const categoriesRes = await axios.get('/api/v1/admin/pos/products', {
                    params: { type: 'all', per_page: 1 } // Just to trigger the scope and potentially get facets if we had them
                });
                
                // For now, let's fetch ALL categories and filter for those that have products in the current scope
                const allCatsRes = await axios.get('/api/v1/admin/pos/products', {
                    params: { per_page: 500 }
                });
                const products = allCatsRes.data.data || [];
                const cats = [...new Set(products.map(p => p.category))].filter(Boolean);
                
                const drinkGroups = cats.map(cat => ({
                    id: cat.toLowerCase().replace(/\s+/g, '-'),
                    label: cat,
                    cats: [cat]
                }));
                
                setDrinkCategories(drinkGroups);
                setDrinks(products);

            } catch (err) {
                console.error('Failed to fetch POS data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchCategoryProducts = async (cats) => {
        setLoadingProducts(true);
        try {
            const response = await axios.get('/api/v1/admin/pos/products', {
                params: { category: cats.join(','), per_page: 200 }
            });
            setCategoryProducts(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleCategoryClick = (group) => {
        setSelectedCategory(group);
        fetchCategoryProducts(group.cats);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.01] rounded-2xl animate-pulse">
            <Loader2 className="animate-spin text-attire-accent opacity-30" size={32} />
        </div>
    );

    return (
        <div className="h-full flex flex-col font-sans select-none overflow-hidden">
            {/* Functional Header */}
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-attire-accent/10 dark:bg-white/5 border border-attire-accent/20 text-attire-accent">
                        {activeTab === 'services' ? <Scissors size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    <div>
                        <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white leading-none mb-1">
                            {selectedCategory ? selectedCategory.label : (activeTab === 'drinks' ? 'Cold Drinks & Brews' : (activeTab === 'services' ? 'Tactical Services' : 'Quick Accessories'))}
                        </h3>
                        <p className="text-[9px] text-gray-500 dark:text-[#8b949e] uppercase tracking-widest font-bold">
                            {selectedCategory ? `${categoryProducts.length} items found` : 'Deep Access Terminal'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Tab Switcher */}
                    {!selectedCategory && (
                        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 mr-4">
                            {['caffeine', 'kravat'].includes(activeOutlet) && drinkCategories.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('drinks')}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'drinks' ? 'bg-white dark:bg-[#161b22] text-attire-accent shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Drinks
                                </button>
                            )}
                            {services.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'services' ? 'bg-white dark:bg-[#161b22] text-attire-accent shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Services
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('accessories')}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'accessories' ? 'bg-white dark:bg-[#161b22] text-attire-accent shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Accessories
                            </button>
                        </div>
                    )}

                    {selectedCategory && (
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-attire-accent transition-all"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    )}

                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/10 dark:bg-white/5 border border-black/15 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:bg-red-500/10 hover:text-red-500 transition-all group"
                    >
                        Close <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Content Deck */}
            <div className="flex-1 overflow-y-auto attire-scrollbar pb-4 pr-1">
                <AnimatePresence mode="wait">
                    {/* Category View (Drinks) */}
                    {activeTab === 'drinks' && !selectedCategory && (
                        <motion.div 
                            key="drink-groups"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-4 gap-4"
                        >
                            {drinkCategories.length === 0 ? (
                                <div className="col-span-4 h-40 flex flex-col items-center justify-center text-center opacity-30">
                                    <Package size={40} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Drink Categories Found</p>
                                </div>
                            ) : (
                                drinkCategories.map((group) => (
                                    <button
                                        key={group.id}
                                        onClick={() => handleCategoryClick(group)}
                                        className="flex flex-col items-start justify-center p-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-attire-accent/40 hover:bg-white dark:hover:bg-white/[0.06] transition-all group"
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors leading-snug">{group.label}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">Quick Select</span>
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Category View (Accessories) */}
                    {activeTab === 'accessories' && !selectedCategory && (
                        <motion.div 
                            key="accessory-groups"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-4 gap-4"
                        >
                            {accessoryGroups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => handleCategoryClick(group)}
                                    className="flex flex-col items-start justify-center p-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-attire-accent/40 hover:bg-white dark:hover:bg-white/[0.06] transition-all group"
                                >
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors leading-snug">{group.label}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">{group.cats.length} categories</span>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Product View (When category selected) */}
                    {selectedCategory && (
                        <motion.div 
                            key="category-products"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-wrap gap-4"
                        >
                            {loadingProducts ? (
                                <div className="w-full h-40 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-attire-accent/30" size={24} />
                                </div>
                            ) : categoryProducts.length === 0 ? (
                                <div className="w-full h-40 flex flex-col items-center justify-center text-center opacity-30">
                                    <Package size={40} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Inventory in Sector</p>
                                </div>
                            ) : (
                                categoryProducts.map((p) => (
                                    <motion.button
                                        key={p.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => addItem(p)}
                                        className="flex flex-col items-start p-4 w-[180px] rounded-2xl bg-black/[0.04] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-attire-accent/60 hover:bg-white dark:hover:bg-white/[0.06] transition-all group"
                                    >
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{p.sku}</span>
                                        <p className="text-[12px] font-black uppercase tracking-wider text-gray-900 dark:text-white mb-2 line-clamp-2 w-full text-left group-hover:text-attire-accent transition-colors">
                                            {p.display_name || p.name}
                                        </p>
                                        <span className="mt-auto text-[13px] font-mono font-black text-attire-accent">
                                            ${parseFloat(p.price).toLocaleString()}
                                        </span>
                                    </motion.button>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Services View */}
                    {activeTab === 'services' && (
                        <motion.div 
                            key="services-deck"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-wrap gap-3 justify-start content-start"
                        >
                            {services.map((service) => (
                                <motion.button
                                    key={service.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        addItem({ ...service, is_service: true });
                                    }}
                                    className="flex flex-col items-start justify-center text-left p-4 w-[160px] min-h-[90px] rounded-2xl bg-black/[0.04] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-attire-accent/60 hover:bg-white dark:hover:bg-white/[0.06] transition-all group shadow-none"
                                >
                                    <p className="text-[12px] font-black uppercase tracking-[0.05em] text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-attire-accent transition-colors line-clamp-2 w-full">
                                        {service.name}
                                    </p>
                                    <span className="text-[13px] font-mono font-black text-attire-accent">
                                        ${parseFloat(service.price).toLocaleString()}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QuickAccessDeck;
