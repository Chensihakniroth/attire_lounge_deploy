import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Plus, ArrowRight } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage.jsx';
import { products as allProducts } from '../../data/products.js';
import { useFavorites } from '../../context/FavoritesContext.jsx';

const transitionBase = { duration: 1, ease: [0.22, 1, 0.36, 1] };
const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const slideUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: transitionBase },
    exit: { opacity: 0, y: 20 }
};

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { favorites, toggleFavorite } = useFavorites();
    
    const leftPaneRef = useRef(null);
    const rightPaneRef = useRef(null);
    const [activePane, setActivePane] = useState('right');
    const [progressLeft, setProgressLeft] = useState(0);
    const [progressRight, setProgressRight] = useState(0);

    const product = useMemo(() => 
        allProducts.find(p => p.id === productId), 
    [productId]);

    const handleScroll = (e, pane) => {
        const target = e.currentTarget;
        const scrollableHeight = target.scrollHeight - target.clientHeight;
        const progress = scrollableHeight > 0 ? target.scrollTop / scrollableHeight : 0;
        
        if (pane === 'left') setProgressLeft(progress);
        else setProgressRight(progress);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [productId]);

    if (!product) return null;

    const activeProgress = activePane === 'left' ? progressLeft : progressRight;

    return (
        <div className="h-screen bg-[#0a0a0a] text-white selection:bg-attire-accent selection:text-black overflow-hidden relative">
            
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    .vertical-text { writing-mode: vertical-rl; }
                `}
            </style>

            {/* Absolute Fixed Actions (Top Layer) */}
            <div className="fixed top-0 left-0 w-full z-[100] px-6 lg:px-12 py-8 flex justify-between items-center pointer-events-none">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group pointer-events-auto hover:bg-white transition-all duration-500 backdrop-blur-md"
                >
                    <ChevronLeft size={20} className="group-hover:text-black transition-colors" />
                </button>

                <button 
                    onClick={() => toggleFavorite(product.id)}
                    className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center pointer-events-auto hover:border-white/20 transition-all duration-500 group backdrop-blur-md"
                >
                    <Heart 
                        size={20} 
                        className={`transition-all duration-500 ${favorites.includes(product.id) ? 'fill-attire-accent text-attire-accent' : 'text-white/40 group-hover:text-white'}`} 
                    />
                </button>
            </div>

            {/* MOBILE VIEW: FIXED IMAGE BACKGROUND */}
            <div className="lg:hidden fixed inset-0 z-0">
                <OptimizedImage
                    src={product.images[0]}
                    alt={product.name}
                    objectFit="cover"
                    containerClassName="w-full h-full"
                    className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <main className="h-full flex flex-col lg:flex-row overflow-hidden relative z-10">
                
                {/* LEFT: IMAGE PANE (DESKTOP FULL SCREEN) */}
                <section 
                    ref={leftPaneRef}
                    onMouseEnter={() => setActivePane('left')}
                    onScroll={(e) => handleScroll(e, 'left')}
                    data-lenis-prevent
                    className="hidden lg:block w-full lg:w-[60%] xl:w-[65%] h-full overflow-y-auto no-scrollbar bg-black scroll-smooth"
                >
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full relative"
                    >
                        {/* Image Container - Using min-h-[150vh] to guarantee scroll space for large images */}
                        <div className="w-full min-h-[150vh] relative bg-[#0a0a0a]">
                            <div className="w-full h-screen sticky top-0 overflow-hidden flex items-center justify-center">
                                <OptimizedImage
                                    src={product.images[0]}
                                    alt={product.name}
                                    objectFit="cover"
                                    containerClassName="w-full h-full"
                                    className="w-full h-full"
                                />
                                {/* Depth overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* RIGHT: CONTENT PANE (SCROLLS OVER IMAGE ON MOBILE) */}
                <section 
                    ref={rightPaneRef}
                    onMouseEnter={() => setActivePane('right')}
                    onScroll={(e) => handleScroll(e, 'right')}
                    data-lenis-prevent
                    className="w-full lg:w-[40%] xl:w-[35%] h-full overflow-y-auto no-scrollbar lg:bg-[#0a0a0a] lg:border-l border-white/5 scroll-smooth"
                >
                    {/* Spacer for Mobile to show the fixed image initially */}
                    <div className="h-[85vh] lg:hidden pointer-events-none" />

                    <motion.div 
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className="p-8 md:p-12 lg:p-20 xl:p-24 pt-16 lg:pt-48 space-y-16 lg:space-y-24 bg-[#0a0a0a] lg:bg-transparent rounded-t-[40px] lg:rounded-none shadow-[0_-20px_50px_rgba(0,0,0,0.5)] lg:shadow-none min-h-screen"
                    >
                        {/* Header Branding */}
                        <div className="space-y-8">
                            <motion.div variants={slideUp} className="flex items-center gap-4">
                                <div className="h-px w-8 bg-attire-accent" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-attire-accent">
                                    {product.collection}
                                </span>
                            </motion.div>
                            
                            <motion.h1 
                                variants={slideUp}
                                className="text-5xl xl:text-8xl font-serif text-white leading-[0.9] tracking-tighter italic"
                            >
                                {product.name}
                            </motion.h1>
                        </div>

                        {/* Summary */}
                        <motion.div variants={slideUp} className="space-y-8">
                            <p className="text-attire-silver/60 text-lg xl:text-xl leading-relaxed font-light max-w-sm">
                                {product.description || "An exceptional piece of tailoring, merging classic heritage with a contemporary silhouette."}
                            </p>
                        </motion.div>

                        {/* Accordion List */}
                        <motion.div variants={slideUp} className="pt-8 border-t border-white/5 divide-y divide-white/5">
                            {[
                                { label: 'Specifications', value: product.category },
                                { label: 'Craftsmanship', value: 'Traditional Sartorial' },
                                { label: 'Material', value: 'Premium Selection' },
                                { label: 'Delivery', value: 'Complimentary Shipping' }
                            ].map((item) => (
                                <div key={item.label} className="group py-8 flex justify-between items-center cursor-pointer hover:bg-white/[0.01] transition-all">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-attire-accent transition-colors">{item.label}</span>
                                        <p className="text-lg font-serif italic text-white/10 group-hover:text-white/80 transition-colors">{item.value}</p>
                                    </div>
                                    <Plus size={16} className="text-white/10 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                                </div>
                            ))}
                        </motion.div>

                        {/* CTA */}
                        <motion.div variants={slideUp} className="space-y-8 pb-48">
                            <button className="group w-full py-8 bg-white hover:bg-attire-accent text-black text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 flex items-center justify-center gap-4 relative overflow-hidden">
                                <span className="relative z-10">Inquire Details</span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-attire-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            </button>
                        </motion.div>
                    </motion.div>
                </section>

                {/* DYNAMIC SCROLL INDICATOR (HomePage Design) */}
                <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 h-[25vh] flex-col items-center justify-center mix-blend-difference pointer-events-none">
                    <span className="text-[8px] tracking-[0.4em] text-white/30 uppercase vertical-text transform rotate-180 mb-4">
                        {activePane === 'left' ? 'Imagery' : 'Details'}
                    </span>
                    {/* Glass Track */}
                    <div className="relative w-[1px] h-full bg-white/10 backdrop-blur-sm rounded-full overflow-visible border-0">
                        {/* Active Indicator Pill */}
                        <motion.div 
                            className="absolute left-[-0.5px] w-0.5 bg-attire-accent shadow-[0_0_10px_rgba(212,168,76,0.8)] rounded-full"
                            initial={false}
                            animate={{ 
                                top: `${activeProgress * 100}%`,
                                y: '-50%'
                            }}
                            style={{
                                height: '15%', // Pill height
                                top: 0 
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>
                </div>
            </main>

            {/* Subtle Texture Layer */}
            <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.02] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" /></filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>
        </div>
    );
};

export default ProductDetailPage;
