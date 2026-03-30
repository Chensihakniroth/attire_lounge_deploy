import React, { useState, useMemo, useCallback, useTransition } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ChevronDown, Loader2 } from 'lucide-react';
import ItemCard from './collections/ItemCard';
// @ts-ignore
import GrainOverlay from '../common/GrainOverlay.jsx';
import SEO from '../common/SEO';
import { useInfiniteProducts, useCollections } from '../../hooks/useProducts';
import { Product } from '../../types';
// @ts-ignore
import useDebounce from '../../hooks/useDebounce';
import { ProductListControls } from './collections/ProductListControls';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ProductListPage: React.FC = () => {
    const query = useQuery();
    const collectionQuery = query.get('collection');
    const { data: collectionsData } = useCollections();

    const collections = useMemo(() => collectionsData || [], [collectionsData]);

    const [isPending, startTransition] = useTransition();
    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [selectedCollections, setSelectedCollections] = useState<string[]>(() => {
        return collectionQuery ? [collectionQuery] : [];
    });

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteProducts({
        category: selectedCollections.join(','),
        sort: sortOrder,
        search: debouncedSearch,
        per_page: 12,
    });

    const allLoadedProducts = useMemo<Product[]>(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data]
    );

    const pageTitle = useMemo(() => {
        const currentCollectionDetails = collections.find(c => c.slug === selectedCollections[0]);
        return selectedCollections.length === 1 && currentCollectionDetails
            ? currentCollectionDetails.name || currentCollectionDetails.title
            : selectedCollections.length > 1
                ? "Multiple Collections"
                : "All Collections";
    }, [selectedCollections, collections]);

    const handleCollectionToggle = useCallback((slug: string) => {
        startTransition(() => {
            setSelectedCollections(prev =>
                prev.includes(slug)
                    ? prev.filter(s => s !== slug)
                    : [...prev, slug]
            );
        });
    }, []);

    const clearFilters = useCallback(() => {
        startTransition(() => {
            setSelectedCollections([]);
            setSearchQuery('');
        });
    }, []);

    const removeCollectionFilter = useCallback((slug: string) => {
        startTransition(() => {
            setSelectedCollections(prev => prev.filter(s => s !== slug));
        });
    }, []);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSortChange = useCallback((order: string) => {
        startTransition(() => {
            setSortOrder(order);
        });
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query); // Input stays responsive
    }, []);

    return (
        /* @ts-ignore - Framer Motion m components may have issues with type-safe className in some environments */
        <m.div
            className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <SEO 
                title={(selectedCollections.length === 1 && collections.find(c => c.slug === selectedCollections[0])?.meta_title) || `${pageTitle} | Elite Styling House`}
                description={(selectedCollections.length === 1 && collections.find(c => c.slug === selectedCollections[0])?.meta_description) || `Explore our ${pageTitle}. Expertly curated luxury styles designed for the modern gentleman.`}
            />
            <GrainOverlay />

            <header className="relative z-10 pt-32 pb-16 sm:pt-48 sm:pb-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-8 bg-attire-accent/30" />
                        <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold">Collection</span>
                        <div className="h-px w-8 bg-attire-accent/30" />
                    </div>

                    <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-light text-white mb-10 leading-[0.85] tracking-tighter italic">
                        {pageTitle.split(' ')[0]} <br />
                        <span className="text-attire-silver/40">{pageTitle.split(' ').slice(1).join(' ') || 'Essentials'}</span>
                    </h1>

                    <div className="flex items-center justify-center">
                        <Link to="/collections" className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-attire-accent transition-colors duration-500">
                            <ChevronLeft size={14} className="group-hover:-translate-x-2 transition-transform duration-500" />
                            Back to Gallery
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                <div className="z-50 mb-20 relative">
                    <div className="absolute -top-10 right-0 flex items-center gap-2">
                        {isPending && (
                            /* @ts-ignore */
                            <m.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-attire-accent/60 text-[9px] uppercase tracking-widest font-bold"
                            >
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Refining Selection</span>
                            </m.div>
                        )}
                    </div>
                    <ProductListControls
                        sortOrder={sortOrder}
                        setSortOrder={handleSortChange}
                        searchQuery={searchQuery}
                        setSearchQuery={handleSearchChange}
                        selectedCollections={selectedCollections}
                        collections={collections}
                        handleCollectionToggle={handleCollectionToggle}
                        clearFilters={clearFilters}
                        removeCollectionFilter={removeCollectionFilter}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {isLoading && allLoadedProducts.length === 0 ? (
                        /* @ts-ignore */
                        <m.div
                            key="loading-initial"
                            className="flex flex-col items-center justify-center py-32"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Loader2 className="w-12 h-12 text-attire-accent animate-spin mb-4" />
                            <p className="text-attire-silver/60 text-xs uppercase tracking-widest">Gathering Excellence...</p>
                        </m.div>
                    ) : allLoadedProducts.length > 0 ? (
                        <div
                            key="results"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12"
                            style={{ 
                                contain: 'content',
                                minHeight: '50vh'
                            }}
                        >
                            {allLoadedProducts.map((item) => (
                                <div 
                                    key={item.id} 
                                    style={{ 
                                        contentVisibility: 'auto', 
                                        containIntrinsicSize: 'auto 500px'
                                    }}
                                >
                                    <ItemCard product={item} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* @ts-ignore */
                        <m.div
                            key="empty"
                            className="flex flex-col items-center justify-center py-32 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Search size={32} className="text-attire-silver/50 mb-6" />
                            <h3 className="text-2xl font-serif text-white mb-2">No items found</h3>
                            <button onClick={clearFilters} className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-attire-accent">Reset Filters</button>
                        </m.div>
                    )}
                </AnimatePresence>

                {hasNextPage && (
                    /* @ts-ignore */
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-24"
                    >
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetchingNextPage}
                            className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 relative overflow-hidden"
                        >
                            <span className="relative z-10">{isFetchingNextPage ? 'Loading More...' : 'Load More Products'}</span>
                            {isFetchingNextPage ? 
                                <Loader2 size={18} className="animate-spin text-black/50" /> : 
                                <ChevronDown size={18} className="relative z-10 group-hover:translate-y-1 transition-transform duration-500" />
                            }
                            <div className="absolute inset-0 bg-attire-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        </button>
                    </m.div>
                )}
            </main>
        </m.div>
    );
};

export default ProductListPage;
