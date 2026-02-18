import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage.jsx';
import { wrap } from "../../helpers/math.js";
import minioBaseUrl from '../../config.js';
import { ChevronLeft, ChevronRight, Filter, Star, MapPin, Calendar, Users } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

// --- Styled Components (Memoized for Performance) ---

const GrainOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
));

const PageHeader = memo(() => (
    <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-6 z-10">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
        >
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-8 bg-attire-accent/30" />
                <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold">Archives</span>
                <div className="h-px w-8 bg-attire-accent/30" />
            </div>
            
            <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-light text-white mb-10 leading-[0.85] tracking-tighter italic">
                Sartorial <br /> <span className="text-attire-silver/40">Lookbook</span>
            </h1>
            
            <p className="text-sm md:text-base text-attire-silver/60 max-w-xl mx-auto leading-relaxed font-light tracking-wide">
                A definitive visual catalog of bespoke excellence. Explore the intersection of traditional craftsmanship and contemporary silhouette.
            </p>
        </motion.div>
    </div>
));

const LookbookPage = () => {
    const navigate = useNavigate();
    const { favorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
    const [images] = useState([
        // Havana Collection - Sartorial
        { id: 'hvn1', src: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`, title: 'Havana Breezy', collection: 'Havana Collection', category: ['sartorial'] },
        { id: 'hvn2', src: `${minioBaseUrl}/uploads/collections/default/hvn2.jpg`, title: 'Cuban Nights', collection: 'Havana Collection', category: ['sartorial'] },
        { id: 'hvn3', src: `${minioBaseUrl}/uploads/collections/default/hvn3.jpg`, title: 'Linen Classic', collection: 'Havana Collection', category: ['sartorial'] },
        { id: 'hvn4', src: `${minioBaseUrl}/uploads/collections/default/hvn4.jpg`, title: 'Tropical Sophistication', collection: 'Havana Collection', category: ['sartorial'] },
        { id: 'hvn5', src: `${minioBaseUrl}/uploads/collections/default/hvn5.jpg`, title: 'Coastal Charm', collection: 'Havana Collection', category: ['sartorial'] },
        { id: 'hvn6', src: `${minioBaseUrl}/uploads/collections/default/hvn6.jpg`, title: 'Island Elegance', collection: 'Havana Collection', category: ['sartorial'] },
        { id: 'hvn7', src: `${minioBaseUrl}/uploads/collections/default/hvn7.jpg`, title: 'Seaside Style', collection: 'Havana Collection', category: ['sartorial'] },

        // Mocha Mousse Collection - Sartorial
        { id: 'mm1', src: `${minioBaseUrl}/uploads/collections/default/mm1.jpg`, title: 'Espresso Edge', collection: 'Mocha Mousse 25', category: ['sartorial'] },
        { id: 'mm2', src: `${minioBaseUrl}/uploads/collections/default/mm2.jpg`, title: 'Urban Comfort', collection: 'Mocha Mousse 25', category: ['sartorial'] },
        { id: 'mm3', src: `${minioBaseUrl}/uploads/collections/default/mm3.jpg`, title: 'Downtown Vibe', collection: 'Mocha Mousse 25', category: ['sartorial'] },
        { id: 'mm4', src: `${minioBaseUrl}/uploads/collections/default/mm4.jpg`, title: 'City Classic', collection: 'Mocha Mousse 25', category: ['sartorial'] },
        { id: 'mm5', src: `${minioBaseUrl}/uploads/collections/default/mm5.jpg`, title: 'Metro Style', collection: 'Mocha Mousse 25', category: ['sartorial'] },
        { id: 'mm6', src: `${minioBaseUrl}/uploads/collections/default/mm6.jpg`, title: 'Modern Mocha', collection: 'Mocha Mousse 25', category: ['sartorial'] },
        { id: 'mm7', src: `${minioBaseUrl}/uploads/collections/default/mm7.jpg`, title: 'Refined Casual', collection: 'Mocha Mousse 25', category: ['sartorial'] },

        // Business Collection (formerly Office)
        { id: 'of1', src: `${minioBaseUrl}/uploads/collections/default/of1.jpg`, title: 'Boardroom Ready', collection: 'Office Collection', category: ['business'] },
        { id: 'of2', src: `${minioBaseUrl}/uploads/collections/default/of2.jpg`, title: 'Executive Presence', collection: 'Office Collection', category: ['business'] },
        { id: 'of3', src: `${minioBaseUrl}/uploads/collections/default/of3.jpg`, title: 'Corporate Style', collection: 'Office Collection', category: ['business'] },
        { id: 'of4', src: `${minioBaseUrl}/uploads/collections/default/of4.jpg`, title: 'Business Formal', collection: 'Office Collection', category: ['business', 'formal'] },
        { id: 'of5', src: `${minioBaseUrl}/uploads/collections/default/of5.jpg`, title: 'Professional Polish', collection: 'Office Collection', category: ['business'] },

        // Groom & Formal Collection
        { id: 'g1', src: `${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`, title: 'Classic Tuxedo', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g2', src: `${minioBaseUrl}/uploads/collections/default/g2.webp?v=new`, title: 'Wedding Day', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g3', src: `${minioBaseUrl}/uploads/collections/default/g3.webp?v=new`, title: 'Groomsmen Style', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g4', src: `${minioBaseUrl}/uploads/collections/default/g4.webp?v=new`, title: 'Elegant Ceremony', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g5', src: `${minioBaseUrl}/uploads/collections/default/g5.webp?v=new`, title: 'Reception Look', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g6', src: `${minioBaseUrl}/uploads/collections/default/g6.webp?v=new`, title: 'Tailored Perfection', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g7', src: `${minioBaseUrl}/uploads/collections/default/g7.webp?v=new`, title: 'Celebration Suit', collection: 'Groom Collection', category: ['grooms', 'formal'] },
        { id: 'g8', src: `${minioBaseUrl}/uploads/collections/default/g8.webp?v=new`, title: 'Formal Event', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    ]);

    const [filter, setFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredImages = useMemo(() => 
        images.filter(img => filter === 'all' || img.category.includes(filter)), 
    [images, filter]);
    
    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
    
    const paginatedImages = useMemo(() => 
        filteredImages.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        ), 
    [filteredImages, currentPage, itemsPerPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };

    const toggleFavorite = (id) => {
        if (isFavorited(id)) {
            removeFavorite(id);
        } else {
            addFavorite(id);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
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
            scrollContainerRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-x-hidden selection:bg-attire-accent selection:text-white">
            <GrainOverlay />
            
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            
            {/* Background Texture & Ambient Light - Hardware Accelerated */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-attire-accent/[0.03] rounded-full blur-[180px] will-change-transform" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px] will-change-transform" />
            </div>

            <PageHeader />

            {/* Floating Filter Bar */}
            <div className="relative z-40 sticky top-24 max-w-2xl mx-auto px-6 mb-20 pointer-events-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-full bg-white/[0.03] backdrop-blur-md md:backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center shadow-2xl"
                >
                    <button 
                        onClick={() => scroll(-1)}
                        className="flex-shrink-0 p-2 text-white/20 hover:text-white transition-colors md:hidden"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div ref={scrollContainerRef} className="flex-grow flex items-center justify-start md:justify-center gap-1 overflow-x-auto no-scrollbar px-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setFilter(category.id)}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all duration-500 font-bold ${
                                    filter === category.id 
                                        ? 'bg-white text-black shadow-lg' 
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => scroll(1)}
                        className="flex-shrink-0 p-2 text-white/20 hover:text-white transition-colors md:hidden"
                    >
                        <ChevronRight size={16} />
                    </button>
                </motion.div>
            </div>

            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                <motion.div
                    key={filter + currentPage}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
                >
                    {paginatedImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
                            }}
                            className="group relative cursor-pointer overflow-hidden aspect-[3/4.2] rounded-[2px] shadow-2xl border border-white/5"
                            onClick={() => navigate(`/product/${image.id}`)}
                        >
                            <OptimizedImage
                                src={image.src}
                                alt={image.title}
                                containerClassName="w-full h-full"
                                className="w-full h-full object-cover"
                                objectFit="cover"
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-12 mt-32">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-700"
                        >
                            <ChevronLeft size={24} strokeWidth={1} className="group-hover:-translate-x-4 transition-transform duration-700" />
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Previous</span>
                        </button>
                        
                        <div className="flex flex-col items-center gap-2">
                             <div className="text-attire-accent font-serif italic text-xl">
                                {currentPage.toString().padStart(2, '0')}
                            </div>
                            <div className="w-12 h-px bg-white/10" />
                            <div className="text-white/20 text-[10px] font-bold">
                                {totalPages.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-700"
                        >
                            <ChevronRight size={24} strokeWidth={1} className="group-hover:translate-x-4 transition-transform duration-700" />
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Next Page</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Editorial Decoration */}
            <div className="py-24 text-center opacity-10 select-none">
                <span className="font-serif italic text-base tracking-[0.5em] uppercase text-white">Attire Lounge Official</span>
            </div>
        </div>
    );
};

export default LookbookPage;
