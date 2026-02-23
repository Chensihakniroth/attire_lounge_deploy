import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion as m, useTransform, useScroll } from 'framer-motion';
import { ChevronLeft, Heart, ArrowRight, ChevronUp, Loader2 } from 'lucide-react';
// @ts-ignore
import OptimizedImage from '../common/OptimizedImage';
import { useFavorites } from '../../context/FavoritesContext';
import { useProduct } from '../../hooks/useProducts';

const motion = m as any;

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

const ProductDetailPage: React.FC = () => {
    const { productId: slug } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { favorites, toggleFavorite } = useFavorites();

    const leftPaneRef = useRef(null);
    const rightPaneRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // -- Fetch Data --
    const { data: product, isLoading, isError } = useProduct(slug || '');

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const { scrollYProgress } = useScroll();
    const scaleTransform = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const scale = isReady ? scaleTransform : 1;

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="text-attire-accent animate-spin" size={32} />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-serif text-white mb-4 italic">Product Not Found</h2>
                <Link to="/products" className="text-attire-accent text-[10px] uppercase tracking-[0.2em] font-bold underline">
                    Return to Collections
                </Link>
            </div>
        );
    }

    const pageMotion = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
    };

    const isFavorited = favorites.includes(product.id as string);

    return (
        <motion.div
            className="bg-[#0a0a0a] text-white selection:bg-attire-accent selection:text-black relative min-h-screen"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageMotion}
        >

            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    .vertical-text { writing-mode: vertical-rl; }
                `}
            </style>

            {/* Absolute Fixed Actions (Top Layer) */}
            <div className="fixed top-0 left-0 w-full z-[999] px-6 lg:px-12 py-8 flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group pointer-events-auto cursor-pointer hover:bg-white transition-all duration-500 backdrop-blur-md bg-black/20"
                >
                    <ChevronLeft size={20} className="group-hover:text-black transition-colors" />
                </button>

                <button
                    onClick={() => toggleFavorite(product.id as string)}
                    className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center pointer-events-auto cursor-pointer hover:border-white/20 transition-all duration-500 group backdrop-blur-md bg-black/20"
                >
                    <Heart
                        size={20}
                        className={`transition-all duration-500 ${isFavorited ? 'fill-attire-accent text-attire-accent' : 'text-white/40 group-hover:text-white'}`}
                    />
                </button>
            </div>

            {/* MOBILE VIEW: FIXED IMAGE BACKGROUND */}
            <div className="lg:hidden fixed inset-0 z-0">
                <motion.div style={{ scale }} className="absolute inset-0">
                    <OptimizedImage
                        src={product.images[0]}
                        alt={product.name}
                        objectFit="cover"
                        containerClassName="w-full h-full"
                        className="w-full h-full"
                        priority={true}
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/10" />

                {/* Mobile Swipe Indicator */}
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

                {/* RIGHT: CONTENT PANE (SCROLLS OVER IMAGE ON MOBILE) */}
                <section
                    ref={rightPaneRef}
                    className="w-full lg:w-[40%] xl:w-[35%] no-scrollbar bg-transparent lg:bg-[#0a0a0a] lg:border-l border-white/5 scroll-smooth"
                >
                    {/* Spacer for Mobile: Set to full screen so text starts completely hidden */}
                    <div className="h-screen lg:hidden pointer-events-none" />

                    <motion.div
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className="p-8 md:p-12 lg:p-16 xl:p-20 pt-16 lg:pt-32 space-y-12 lg:bg-transparent lg:rounded-none lg:shadow-none product-detail-mobile-arch"
                    >
                        {/* 1. BRANDING */}
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

                        {/* 2. TECHNICAL SPECIFICATIONS GRID */}
                        <motion.div variants={slideUp} className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden rounded-sm">
                            {[
                                { label: 'Fabric', value: product.fabric || 'Premium Wool Blend' },
                                { label: 'Color', value: product.color || 'Signature Hue' },
                                { label: 'Silhouette', value: 'Modern Tailored' },
                                { label: 'Details', value: 'Hand-Finished' }
                            ].map((spec) => (
                                <div key={spec.label} className="bg-[#0a0a0a] p-5 space-y-1">
                                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-bold">{spec.label}</span>
                                    <p className="text-xs xl:text-sm font-serif italic text-white/80">{spec.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* 3. THE NARRATIVE */}
                        <div className="space-y-8">
                            <motion.div variants={slideUp} className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                            <motion.div variants={slideUp} className="space-y-6">
                                <p className="text-base xl:text-lg text-attire-silver/70 leading-relaxed font-light font-serif italic">
                                    {product.detailed_description || product.description || "An exceptional piece of tailoring, merging classic heritage with a contemporary silhouette."}
                                </p>
                            </motion.div>

                            <motion.div variants={slideUp} className="space-y-4">
                                <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Availability</h4>
                                <p className="text-xs text-white/60 font-light leading-relaxed">
                                    Available in {product.color || 'Consult Stylist'}.
                                    Each piece is meticulously inspected by our Milan-certified styling team before delivery.
                                </p>
                            </motion.div>
                        </div>

                        {/* 4. CALL TO ACTION */}
                        <motion.div variants={slideUp} className="pt-8 pb-32 space-y-4">
                            <Link
                                to="/contact"
                                className="group w-full py-8 bg-white text-black text-[12px] font-bold uppercase tracking-[0.5em]
                                           rounded-full transition-all duration-500 ease-out
                                           flex items-center justify-center gap-4
                                           relative overflow-hidden
                                           hover:bg-attire-accent hover:scale-[1.02] active:scale-[0.98]
                                           shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                            >
                                <span className="relative z-10">Request Appointment</span>
                                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </Link>

                            <p className="text-center mt-8 text-[9px] uppercase tracking-[0.2em] text-white/20">
                                Complimentary Alterations Included
                            </p>
                        </motion.div>
                    </motion.div>
                </section>

            </main>
        </motion.div>
    );
};

export default ProductDetailPage;
