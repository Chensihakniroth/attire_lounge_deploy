import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import GalleryItem from './lookbook/GalleryItem';
import Lightbox from './lookbook/Lightbox';
import { wrap } from "popmotion";

const FilterContent = ({ isMobile, setFilter, setIsFilterOpen, currentFilter }) => {
    const categories = [
        { id: 'all', name: 'All' },
        { id: 'sartorial', name: 'Sartorial' },
        { id: 'groom', name: 'Groom' },
        { id: 'office', name: 'Office' },
        { id: 'accessories', name: 'Accessories' },
    ];

    const handleFilterClick = (filterId) => {
        setFilter(filterId);
        if (isMobile) {
            setIsFilterOpen(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-4">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => handleFilterClick(category.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors relative w-full text-left ${
                        currentFilter === category.id ? 'text-white' : 'text-attire-silver/70 hover:text-white'
                    }`}
                >
                    {currentFilter === category.id && (
                        <motion.div
                            layoutId="filter-active"
                            className="absolute inset-0 bg-attire-dark shadow-md rounded-full"
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        />
                    )}
                    <span className="relative z-10">{category.name}</span>
                </button>
            ))}
        </div>
    );
};

const minioBaseUrl = 'http://127.0.0.1:9000/product-assets';

const LookbookPage = () => {
    const [images] = useState([
        { id: 1, src: `${minioBaseUrl}/uploads/collections/model/1.jpg`, title: 'Modern Sartorial', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-2 row-span-2' },
        { id: 2, src: `${minioBaseUrl}/uploads/collections/model/2.jpg`, title: 'Urban Elegance', collection: 'Mocha Mousse 25', category: 'office', span: 'col-span-1 row-span-2' },
        { id: 3, src: `${minioBaseUrl}/uploads/collections/model/3.jpg`, title: 'Evening Sophistication', collection: 'Groom Collection', category: 'groom', span: 'col-span-1 row-span-2' },
        { id: 4, src: `${minioBaseUrl}/uploads/collections/model/4.jpg`, title: 'Business Refined', collection: 'Office Collection', category: 'office', span: 'col-span-1 row-span-2' },
        { id: 5, src: `${minioBaseUrl}/uploads/collections/model/5.jpg`, title: 'Linen Summer', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-2' },
        { id: 6, src: `${minioBaseUrl}/uploads/collections/model/6.jpg`, title: 'Accessory Details', collection: 'The Little Details', category: 'accessories', span: 'col-span-2 row-span-2' },
        { id: 7, src: `${minioBaseUrl}/uploads/lookbook/lookbook-7.jpg`, title: 'Casual Luxury', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 8, src: `${minioBaseUrl}/uploads/lookbook/lookbook-8.jpg`, title: 'Groom Style', collection: 'Groom Collection', category: 'groom', span: 'col-span-1 row-span-1' },
        { id: 9, src: `${minioBaseUrl}/uploads/lookbook/lookbook-9.jpg`, title: 'Office Attire', collection: 'Office Collection', category: 'office', span: 'col-span-1 row-span-1' },
        { id: 10, src: `${minioBaseUrl}/uploads/lookbook/lookbook-10.jpg`, title: 'Summer Linen', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 11, src: `${minioBaseUrl}/uploads/lookbook/lookbook-11.jpg`, title: 'Cufflink Details', collection: 'The Little Details', category: 'accessories', span: 'col-span-1 row-span-1' },
        { id: 12, src: `${minioBaseUrl}/uploads/lookbook/lookbook-12.jpg`, title: 'Evening Wear', collection: 'Groom Collection', category: 'groom', span: 'col-span-1 row-span-1' },
    ]);

    const [[page, direction], setPage] = useState([null, 0]);
    const [filter, setFilter] = useState('all');
    const [favorites, setFavorites] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const filteredImages = images.filter(img => filter === 'all' || img.category === filter);
    const imageIndex = page !== null ? wrap(0, filteredImages.length, page) : null;
    const selectedImage = page !== null ? filteredImages[imageIndex] : null;

    useEffect(() => {
        const savedFavorites = localStorage.getItem('lookbook_favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error("Failed to parse favorites from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('lookbook_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const openLightbox = (index) => setPage([index, 0]);
    const closeLightbox = () => setPage([null, 0]);
    const paginate = (newDirection) => {
        if (page === null || !filteredImages.length) return;
        setPage([page + newDirection, newDirection]);
    };

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const filterState = isMobile ? isFilterOpen : false;
        window.dispatchEvent(new CustomEvent('lookbookFilterStateChange', { detail: { isFilterOpen: filterState } }));
    }, [isFilterOpen, isMobile]);

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

    return (
        <motion.div
        className="h-full w-full flex bg-attire-navy overflow-hidden relative"
        onPanEnd={isMobile ? (event, info) => {
            const threshold = 50;
            const velocityThreshold = 200;

            if (Math.abs(info.velocity.y) > Math.abs(info.velocity.x)) {
                return;
            }

            if (isFilterOpen) {
                if (info.offset.x > threshold && info.velocity.x > velocityThreshold) {
                    setIsFilterOpen(false);
                }
            } else {
                if (info.offset.x < -threshold && info.velocity.x < -velocityThreshold) {
                    setIsFilterOpen(true);
                }
            }
        } : undefined}
    >
            {isMobile && !isFilterOpen && (
                <button
                    className="fixed top-6 right-6 z-30 p-3 bg-attire-dark/50 backdrop-blur-sm rounded-full text-white shadow-lg"
                    onClick={() => setIsFilterOpen(true)}
                >
                    <Filter size={20} />
                </button>
            )}
            {/* Main Content - Grid */}
            <motion.div
                className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-y"
            >
                <motion.div
                    key={filter}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[200px] sm:auto-rows-[25vh] gap-0"
                >
                    {filteredImages.map((image, index) => (
                        <div
                            key={image.id}
                            className={`group relative overflow-hidden bg-neutral-900 cursor-pointer ${image.span}`}
                            onClick={() => openLightbox(index)}
                        >
                            {/* Image */}
                            <img
                                src={image.src}
                                alt={image.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                            />
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 p-8 border-l border-white/10 overflow-y-auto">
                <h2 className="text-2xl font-serif text-white mb-8">Filter by</h2>
                <FilterContent isMobile={isMobile} setFilter={setFilter} setIsFilterOpen={setIsFilterOpen} currentFilter={filter} />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobile && isFilterOpen && (
                    <motion.div
                        className="fixed top-0 right-0 h-full w-64 bg-attire-dark z-40 p-8 border-l border-white/10"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-serif text-white">Filter by</h2>
                            <button className="lg:hidden text-white" onClick={() => setIsFilterOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <FilterContent isMobile={isMobile} setFilter={setFilter} setIsFilterOpen={setIsFilterOpen} currentFilter={filter} />
                    </motion.div>
                )}
            </AnimatePresence>

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
        </motion.div>
    );
};

export default LookbookPage;
