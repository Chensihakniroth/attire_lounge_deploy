import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from './lookbook/Lightbox';
import { wrap } from "popmotion";
import minioBaseUrl from '../../config.js';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

const PageHeader = () => (
    <div className="relative text-center py-20 sm:py-32 px-6 z-10 pointer-events-none">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <span className="text-attire-accent text-xs tracking-[0.3em] uppercase mb-4 inline-block">Curated</span>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                The Lookbook
            </h1>
            <p className="text-lg text-attire-silver max-w-2xl mx-auto leading-relaxed font-light">
                A visual journey through our latest sartorial creations. 
                Find inspiration for your next bespoke ensemble.
            </p>
        </motion.div>
    </div>
);

const LookbookPage = () => {
    const { favorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
    const [images] = useState([
        // Havana Collection - Sartorial
        { id: 'hvn0-lookbook', src: `${minioBaseUrl}/uploads/collections/default/hvn0.jpg`, title: 'Havana Breezy', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-2 row-span-2' },
        { id: 'hvn1', src: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`, title: 'Sunset Casual', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'hvn2', src: `${minioBaseUrl}/uploads/collections/default/hvn2.jpg`, title: 'Cuban Nights', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 'hvn3', src: `${minioBaseUrl}/uploads/collections/default/hvn3.jpg`, title: 'Linen Classic', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'hvn4', src: `${minioBaseUrl}/uploads/collections/default/hvn4.jpg`, title: 'Tropical Sophistication', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 'hvn5', src: `${minioBaseUrl}/uploads/collections/default/hvn5.jpg`, title: 'Coastal Charm', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'hvn6', src: `${minioBaseUrl}/uploads/collections/default/hvn6.jpg`, title: 'Island Elegance', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'hvn7', src: `${minioBaseUrl}/uploads/collections/default/hvn7.jpg`, title: 'Seaside Style', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-2 row-span-1' },

        // Mocha Mousse Collection - Sartorial
        { id: 'mm1', src: `${minioBaseUrl}/uploads/collections/default/mm1.jpg`, title: 'Espresso Edge', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 'mm2', src: `${minioBaseUrl}/uploads/collections/default/mm2.jpg`, title: 'Urban Comfort', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'mm3', src: `${minioBaseUrl}/uploads/collections/default/mm3.jpg`, title: 'Downtown Vibe', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'mm4', src: `${minioBaseUrl}/uploads/collections/default/mm4.jpg`, title: 'City Classic', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 'mm5', src: `${minioBaseUrl}/uploads/collections/default/mm5.jpg`, title: 'Metro Style', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-2 row-span-2' },
        { id: 'mm6', src: `${minioBaseUrl}/uploads/collections/default/mm6.jpg`, title: 'Modern Mocha', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 'mm7', src: `${minioBaseUrl}/uploads/collections/default/mm7.jpg`, title: 'Refined Casual', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },

        // Business Collection (formerly Office)
        { id: 'of1', src: `${minioBaseUrl}/uploads/collections/default/of1.jpg`, title: 'Boardroom Ready', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-1' },
        { id: 'of2', src: `${minioBaseUrl}/uploads/collections/default/of2.jpg`, title: 'Executive Presence', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-2' },
        { id: 'of3', src: `${minioBaseUrl}/uploads/collections/default/of3.jpg`, title: 'Corporate Style', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-1' },
        { id: 'of4', src: `${minioBaseUrl}/uploads/collections/default/of4.jpg`, title: 'Business Formal', collection: 'Office Collection', category: ['business', 'formal'], span: 'col-span-2 row-span-1' },
        { id: 'of5', src: `${minioBaseUrl}/uploads/collections/default/of5.jpg`, title: 'Professional Polish', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-1' },

        // Groom & Formal Collection
        { id: 'g1', src: `${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`, title: 'Classic Tuxedo', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 'g2', src: `${minioBaseUrl}/uploads/collections/default/g2.webp?v=new`, title: 'Wedding Day', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-2' },
        { id: 'g3', src: `${minioBaseUrl}/uploads/collections/default/g3.webp?v=new`, title: 'Groomsmen Style', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 'g4', src: `${minioBaseUrl}/uploads/collections/default/g4.webp?v=new`, title: 'Elegant Ceremony', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-2 row-span-1' },
        { id: 'g5', src: `${minioBaseUrl}/uploads/collections/default/g5.webp?v=new`, title: 'Reception Look', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 'g6', src: `${minioBaseUrl}/uploads/collections/default/g6.webp?v=new`, title: 'Tailored Perfection', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-2' },
        { id: 'g7', src: `${minioBaseUrl}/uploads/collections/default/g7.webp?v=new`, title: 'Celebration Suit', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 'g8', src: `${minioBaseUrl}/uploads/collections/default/g8.webp?v=new`, title: 'Formal Event', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-2 row-span-2' },
    ]);

    const [[page, direction], setPage] = useState([null, 0]);
    const [filter, setFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16;

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredImages = React.useMemo(() => 
        images.filter(img => filter === 'all' || img.category.includes(filter)), 
    [images, filter]);
    
    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
    
    const paginatedImages = React.useMemo(() => 
        filteredImages.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        ), 
    [filteredImages, currentPage, itemsPerPage]);

    const imageIndex = page !== null ? wrap(0, filteredImages.length, page) : null;
    const selectedImage = page !== null ? filteredImages[imageIndex] : null;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const openLightbox = (index) => setPage([index, 0]);
    const closeLightbox = () => setPage([null, 0]);
    const paginate = (newDirection) => {
        if (page === null || !filteredImages.length) return;
        setPage([page + newDirection, newDirection]);
    };

    const toggleFavorite = (id) => {
        if (isFavorited(id)) {
            removeFavorite(id);
        } else {
            addFavorite(id);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (page === null) return;
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [page]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.2 }
        }
    };

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'sartorial', name: 'Sartorial' },
        { id: 'grooms', name: 'Grooms' },
        { id: 'formal', name: 'Formal' },
        { id: 'business', name: 'Business' },
    ];

    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-hidden">
            {/* Background Decorations - Softened to prevent pixelation */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.05] rounded-full blur-[140px]" />
            </div>

            <PageHeader />

            <div className="relative z-10 sticky top-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pointer-events-auto">
                <div className="w-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-2 md:p-3 flex items-center shadow-2xl">
                    <button 
                        onClick={() => scroll(-1)}
                        className="p-2 text-white/50 hover:text-white md:hidden z-20"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div ref={scrollContainerRef} className="flex-grow flex items-center justify-start md:justify-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2">
                        <span className="text-xs font-medium text-attire-silver/60 uppercase tracking-wider flex-shrink-0 mr-2 hidden md:block">Categories</span>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setFilter(category.id)}
                                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm transition-all duration-300 border ${
                                    filter === category.id 
                                        ? 'bg-attire-accent text-black border-attire-accent font-medium shadow-[0_0_15px_rgba(212,168,76,0.3)]' 
                                        : 'bg-white/5 text-attire-silver border-white/5 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => scroll(1)}
                        className="p-2 text-white/50 hover:text-white md:hidden z-20"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <motion.div
                    key={filter + currentPage}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    {paginatedImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            layout
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 shadow-lg h-[28rem]"
                            onClick={() => openLightbox((currentPage - 1) * itemsPerPage + index)}
                        >
                            <img
                                src={image.src}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                        </motion.div>
                    ))}
                </motion.div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-6 mt-20">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group p-3 rounded-full border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <span className="text-attire-silver font-medium text-sm tracking-wider">
                            PAGE {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="group p-3 rounded-full border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {selectedImage && (
                    <Lightbox
                        key="lightbox"
                        selectedImage={selectedImage}
                        closeLightbox={closeLightbox}
                        direction={direction}
                        paginate={paginate}
                        toggleFavorite={toggleFavorite}
                        favorites={favorites}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default LookbookPage;
