import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Download, Heart, Share2 } from 'lucide-react';

const LookbookPage = () => {
    const [images, setImages] = useState([
        { id: 1, src: '/uploads/lookbook/lookbook-1.jpg', title: 'Modern Sartorial', collection: 'Havana Collection', category: 'sartorial' },
        { id: 2, src: '/uploads/lookbook/lookbook-2.jpg', title: 'Urban Elegance', collection: 'Mocha Mousse 25', category: 'office' },
        { id: 3, src: '/uploads/lookbook/lookbook-3.jpg', title: 'Evening Sophistication', collection: 'Groom Collection', category: 'groom' },
        { id: 4, src: '/uploads/lookbook/lookbook-4.jpg', title: 'Business Refined', collection: 'Office Collection', category: 'office' },
        { id: 5, src: '/uploads/lookbook/lookbook-5.jpg', title: 'Linen Summer', collection: 'Havana Collection', category: 'sartorial' },
        { id: 6, src: '/uploads/lookbook/lookbook-6.jpg', title: 'Accessory Details', collection: 'The Little Details', category: 'accessories' },
        { id: 7, src: '/uploads/lookbook/lookbook-7.jpg', title: 'Casual Luxury', collection: 'Mocha Mousse 25', category: 'sartorial' },
        { id: 8, src: '/uploads/lookbook/lookbook-8.jpg', title: 'Groom Style', collection: 'Groom Collection', category: 'groom' },
        { id: 9, src: '/uploads/lookbook/lookbook-9.jpg', title: 'Office Attire', collection: 'Office Collection', category: 'office' },
        { id: 10, src: '/uploads/lookbook/lookbook-10.jpg', title: 'Summer Linen', collection: 'Havana Collection', category: 'sartorial' },
        { id: 11, src: '/uploads/lookbook/lookbook-11.jpg', title: 'Cufflink Details', collection: 'The Little Details', category: 'accessories' },
        { id: 12, src: '/uploads/lookbook/lookbook-12.jpg', title: 'Evening Wear', collection: 'Groom Collection', category: 'groom' },
    ]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [filter, setFilter] = useState('all');
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Categories from your website
    const categories = [
        { id: 'all', name: 'All Collections' },
        { id: 'sartorial', name: 'Sartorial' },
        { id: 'groom', name: 'Groom' },
        { id: 'office', name: 'Office' },
        { id: 'accessories', name: 'Accessories' },
    ];

    const filteredImages = filter === 'all'
        ? images
        : images.filter(img => img.category === filter);

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('lookbook_favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
        // Simulate loading delay for better UX
        setTimeout(() => setIsLoading(false), 800);
    }, []);

    // Save favorites to localStorage
    useEffect(() => {
        localStorage.setItem('lookbook_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const openLightbox = (index) => {
        setSelectedImage(filteredImages[index]);
        setCurrentIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'auto';
        setIsFullscreen(false);
    };

    const nextImage = useCallback(() => {
        if (filteredImages.length === 0) return;
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setSelectedImage(filteredImages[nextIndex]);
        setCurrentIndex(nextIndex);
    }, [currentIndex, filteredImages]);

    const prevImage = useCallback(() => {
        if (filteredImages.length === 0) return;
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setSelectedImage(filteredImages[prevIndex]);
        setCurrentIndex(prevIndex);
    }, [currentIndex, filteredImages]);

    const toggleFavorite = (id, e) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(favId => favId !== id)
                : [...prev, id]
        );
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;

            switch(e.key) {
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'Escape':
                    closeLightbox();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, nextImage, prevImage]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const imageVariants = {
        rest: { scale: 1 },
        hover: {
            scale: 1.02,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-attire-gold/30 border-t-attire-gold rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-attire-stone">Loading Lookbook...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-attire-cream/30">
            {/* Hero Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-attire-charcoal mb-4">
                        Lookbook
                    </h1>
                    <p className="text-lg md:text-xl text-attire-stone max-w-3xl mx-auto mb-8">
                        Discover style inspiration from our curated collections.
                        Cambodia's first sartorial gentlemen's styling house.
                    </p>

                    {/* Collection Stats */}
                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        <div className="text-center">
                            <div className="text-2xl font-serif text-attire-gold">{images.length}</div>
                            <div className="text-sm text-attire-stone">Total Looks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-serif text-attire-gold">{favorites.length}</div>
                            <div className="text-sm text-attire-stone">Favorites</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-serif text-attire-gold">{categories.length - 1}</div>
                            <div className="text-sm text-attire-stone">Collections</div>
                        </div>
                    </div>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setFilter(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                filter === category.id
                                    ? 'bg-attire-charcoal text-white'
                                    : 'bg-white text-attire-stone hover:bg-attire-cream hover:text-attire-charcoal border border-attire-silver/30'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredImages.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-attire-stone">No images found in this collection.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                variants={itemVariants}
                                className="relative group cursor-pointer"
                                onClick={() => openLightbox(index)}
                            >
                                <motion.div
                                    variants={imageVariants}
                                    initial="rest"
                                    whileHover="hover"
                                    className="aspect-square overflow-hidden rounded-xl bg-white shadow-lg border border-attire-silver/20"
                                >
                                    {/* Placeholder for image */}
                                    <div className="w-full h-full bg-gradient-to-br from-attire-cream to-attire-light flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="text-attire-gold text-3xl mb-2">{image.title.charAt(0)}</div>
                                            <p className="text-attire-charcoal font-medium">{image.title}</p>
                                            <p className="text-attire-stone text-sm mt-1">{image.collection}</p>
                                        </div>
                                    </div>

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl" />

                                    {/* Favorite button */}
                                    <button
                                        onClick={(e) => toggleFavorite(image.id, e)}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${
                                                favorites.includes(image.id)
                                                    ? 'fill-red-500 text-red-500'
                                                    : 'text-attire-stone'
                                            }`}
                                        />
                                    </button>

                                    {/* Collection badge */}
                                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                                        {image.collection}
                                    </div>
                                </motion.div>

                                {/* Image info */}
                                <div className="mt-3">
                                    <h3 className="font-medium text-attire-charcoal">{image.title}</h3>
                                    <p className="text-sm text-attire-stone mt-1">{image.collection}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/95 z-50 backdrop-blur-md"
                            onClick={closeLightbox}
                        />

                        {/* Lightbox Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25 }}
                            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
                                isFullscreen ? 'cursor-zoom-out' : 'cursor-default'
                            }`}
                            onClick={closeLightbox}
                        >
                            {/* Lightbox Content */}
                            <div
                                className={`relative ${
                                    isFullscreen ? 'w-full h-full' : 'max-w-5xl max-h-[90vh]'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Image Container */}
                                <motion.div
                                    layoutId={`image-${selectedImage.id}`}
                                    className={`relative rounded-xl overflow-hidden ${
                                        isFullscreen ? 'w-full h-full' : 'max-h-[80vh]'
                                    }`}
                                >
                                    {/* Placeholder for image */}
                                    <div className={`w-full ${
                                        isFullscreen ? 'h-full' : 'aspect-square'
                                    } bg-gradient-to-br from-attire-cream/20 to-attire-light/20 flex items-center justify-center`}>
                                        <div className="text-center p-12">
                                            <div className="text-attire-gold text-6xl mb-6">{selectedImage.title.charAt(0)}</div>
                                            <h2 className="text-3xl font-serif text-attire-charcoal mb-2">{selectedImage.title}</h2>
                                            <p className="text-attire-stone">{selectedImage.collection}</p>
                                            <p className="text-sm text-attire-silver mt-4">Image ID: {selectedImage.id}</p>
                                        </div>
                                    </div>

                                    {/* Image Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h2 className="text-2xl font-serif text-white">{selectedImage.title}</h2>
                                                <p className="text-attire-gold/90">{selectedImage.collection}</p>
                                                <p className="text-sm text-white/70 mt-2">
                                                    {currentIndex + 1} of {filteredImages.length}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => toggleFavorite(selectedImage.id, e)}
                                                    className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                                                >
                                                    <Heart
                                                        className={`w-5 h-5 ${
                                                            favorites.includes(selectedImage.id)
                                                                ? 'fill-red-500 text-red-500'
                                                                : 'text-white'
                                                        }`}
                                                    />
                                                </button>
                                                <button
                                                    onClick={toggleFullscreen}
                                                    className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                                                >
                                                    <Maximize2 className="w-5 h-5 text-white" />
                                                </button>
                                                <button className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                                                    <Share2 className="w-5 h-5 text-white" />
                                                </button>
                                                <button
                                                    onClick={closeLightbox}
                                                    className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>

                                {/* Thumbnail Strip */}
                                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                                    {filteredImages.slice(Math.max(0, currentIndex - 3), Math.min(filteredImages.length, currentIndex + 4)).map((img, idx) => (
                                        <button
                                            key={img.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const actualIndex = filteredImages.findIndex(i => i.id === img.id);
                                                setSelectedImage(img);
                                                setCurrentIndex(actualIndex);
                                            }}
                                            className={`w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                                                selectedImage.id === img.id
                                                    ? 'ring-2 ring-attire-gold scale-110'
                                                    : 'opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="w-full h-full bg-attire-gold/20 flex items-center justify-center">
                                                <span className="text-xs font-medium">{img.id}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Keyboard Hint */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/50">
                                    Use ← → arrows to navigate • ESC to close • F for fullscreen
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Footer Note */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-attire-silver/20">
                <div className="text-center text-sm text-attire-stone/70">
                    <p>© {new Date().getFullYear()} Attire Lounge Lookbook. Cambodia's first sartorial gentlemen's styling house.</p>
                    <p className="mt-1">{images.length} curated looks across {categories.length - 1} collections.</p>
                </div>
            </div>
        </div>
    );
};

export default LookbookPage;
