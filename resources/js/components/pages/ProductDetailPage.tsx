import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useTransform, useScroll, Variants } from 'framer-motion';
import { ChevronLeft, Heart, ArrowRight, ChevronUp, Loader2 } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { useProduct } from '../../hooks/useProducts';
import SEO from '../common/SEO';

const transitionBase = { duration: 1, ease: [0.22, 1, 0.36, 1] };
const stagger: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const slideUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: transitionBase },
    exit: { opacity: 0, y: 20 }
};

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>(); // This is the slug (e.g., 'g1')
    const navigate = useNavigate();
    const { favorites, toggleFavorite } = useFavorites();
    
    const leftPaneRef = useRef<HTMLDivElement>(null);
    const rightPaneRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    // Fetch product data using our "Gold Standard" hook! ✨
    const { data: product, isLoading, isError } = useProduct(productId || '');

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const { scrollYProgress } = useScroll();
    const scaleTransform = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const scale = isReady ? scaleTransform : 1;

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [productId]);

    const pageMotion: Variants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-attire-accent animate-spin mb-4" />
                <p className="text-attire-silver/60 text-xs uppercase tracking-widest">Unveiling Perfection...</p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-3xl font-serif text-white mb-4">Product Not Found</h2>
                <button onClick={() => navigate('/products')} className="text-attire-accent uppercase tracking-widest text-xs border-b border-attire-accent pb-1">Back to Collections</button>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-[#0a0a0a] text-white selection:bg-attire-accent selection:text-black relative min-h-screen"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageMotion}
        >
            <SEO 
                title={`${product.name} | ${product.collection}`}
                description={product.description || `Experience the ${product.name} from our ${product.collection}. Premium bespoke tailoring at Attire Lounge.`}
                image={product.images[0]}
            />
            
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
                    onClick={() => toggleFavorite(product.slug || '')}
                    className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center pointer-events-auto hover:border-white/20 transition-all duration-500 group backdrop-blur-md"
                >
                    <Heart 
                        size={20} 
                        className={`transition-all duration-500 ${favorites.includes(product.slug || '') ? 'fill-attire-accent text-attire-accent' : 'text-white/40 group-hover:text-white'}`} 
                    />
                </button>
            </div>

            {/* MOBILE VIEW: FIXED IMAGE BACKGROUND */}
            <div className="lg:hidden fixed inset-0 z-0">
                <motion.div style={{ scale }} className="absolute inset-0">
                    <OptimizedImage
                        src={product.images[0]}
                        fallback={product.images.length > 1 ? product.images[1] : null}
                        alt={product.name}
                        objectFit="cover"
                        containerClassName="w-full h-full"
                        className="w-full h-full"
                        priority={true}
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/10" />

                <motion.div 
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-10"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center gap-2"
                    >
                        <span className="text-[9px] tracking-[0.5em] uppercase text-white/50 font-bold">Swipe Up</span>
                        <ChevronUp size={20} className="text-attire-accent" strokeWidth={1.5} />
                    </motion.div>
                </motion.div>
            </div>

            <main className="flex flex-col lg:flex-row relative z-10">
                
                {/* LEFT: IMAGE PANE (DESKTOP FULL SCREEN) */}
                <section 
                    ref={leftPaneRef}
                    className="hidden lg:block w-full lg:w-[60%] xl:w-[65%] no-scrollbar bg-[#0a0a0a] scroll-smooth"
                >
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full flex flex-col"
                    >
                        <OptimizedImage
                            src={product.images[0]}
                            fallback={product.images.length > 1 ? product.images[1] : null}
                            alt={product.name}
                            objectFit="contain"
                            containerClassName="w-full min-h-screen"
                            className="w-full h-auto"
                            bgClassName="bg-transparent"
                            priority={true}
                            loading="eager"
                        />
                    </motion.div>
                </section>

                {/* RIGHT: CONTENT PANE */}
                <section 
                    ref={rightPaneRef}
                    className="w-full lg:w-[40%] xl:w-[35%] no-scrollbar lg:bg-[#0a0a0a] lg:border-l border-white/5 scroll-smooth"
                >
                    <div className="h-screen lg:hidden pointer-events-none" />

                    <motion.div 
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className="p-8 md:p-12 lg:p-16 xl:p-20 pt-16 lg:pt-32 space-y-12 bg-[#0a0a0a] lg:bg-transparent rounded-t-[40px] lg:rounded-none shadow-[0_-40px_80px_rgba(0,0,0,0.8)] lg:shadow-none"
                    >
                        <div className="space-y-6">
                            <motion.div variants={slideUp} className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-attire-accent">
                                    {product.collection}
                                </span>
                                <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium">
                                    {product.category}
                                </span>
                            </motion.div>
                            
                            <div className="space-y-4">
                                <motion.h1 
                                    variants={slideUp}
                                    className="text-5xl xl:text-7xl font-serif text-white leading-none tracking-tighter italic"
                                >
                                    {product.name}
                                </motion.h1>
                            </div>
                        </div>

                        <motion.div variants={slideUp} className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden rounded-sm">
                            {[
                                { label: 'Fabric', value: product.fabric || 'Premium Wool Blend' },
                                { label: 'Status', value: product.in_stock ? 'Available' : 'Consult Stylist' },
                                { label: 'Silhouette', value: 'Modern Tailored' },
                                { label: 'Details', value: 'Hand-Finished' }
                            ].map((spec) => (
                                <div key={spec.label} className="bg-[#0a0a0a] p-5 space-y-1">
                                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-bold">{spec.label}</span>
                                    <p className="text-xs xl:text-sm font-serif italic text-white/80">{spec.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        <div className="space-y-8">
                            <motion.div variants={slideUp} className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                            
                            <motion.div variants={slideUp} className="space-y-6">
                                <p className="text-base xl:text-lg text-attire-silver/70 leading-relaxed font-light font-serif italic">
                                    {product.description || "An exceptional piece of tailoring, merging classic heritage with a contemporary silhouette."}
                                </p>
                            </motion.div>

                            {product.sizes && (
                                <motion.div variants={slideUp} className="space-y-4">
                                    <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Available Sizes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(product.sizes) ? product.sizes.map(size => (
                                            <span key={size} className="px-3 py-1 border border-white/10 text-[10px] text-white/60">{size}</span>
                                        )) : <span className="text-xs text-white/60 italic">Consult Stylist for sizing</span>}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <motion.div variants={slideUp} className="pt-8 pb-32">
                            <button className="group w-full py-7 bg-white text-black text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 flex items-center justify-center gap-4 relative overflow-hidden">
                                <span className="relative z-10">Request Appointment</span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-attire-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            </button>
                            <p className="text-center mt-6 text-[9px] uppercase tracking-[0.2em] text-white/20">
                                Complimentary Alterations Included
                            </p>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.02] mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" /></filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>
        </motion.div>
    );
};

export default ProductDetailPage;
