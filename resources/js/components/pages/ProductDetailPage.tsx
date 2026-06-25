import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, Loader2, ArrowRight } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage.jsx';
import { useProduct, useFeaturedProducts } from '../../hooks/useProducts';
import SEO from '../common/SEO';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
// import minioBaseUrl from '../../config.js'; // Reserved for future use
const transitionBase = { duration: 0.8, ease: [0.22, 1, 0.36, 1] };
const stagger: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

const slideUp: Variants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: transitionBase },
    exit: { opacity: 0, y: 16 }
};

// Color name → hex mapping for swatches
const COLOR_MAP: Record<string, string> = {
    'black': '#1a1a1a',
    'dark-chocolate': '#3d2b1f',
    'brown': '#6b4226',
    'burgundy': '#722f37',
    'navy': '#1b2a4a',
    'charcoal': '#36454f',
    'tan': '#d2b48c',
    'cream': '#f5f0e1',
    'white': '#ffffff',
    'olive': '#556b2f',
};

function getColorHex(colorName: string): string {
    return COLOR_MAP[colorName.toLowerCase()] || colorName;
}

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

    const { data: product, isLoading, isError } = useProduct(productId || '');
    const { data: relatedProducts } = useFeaturedProducts();

    useEffect(() => {
        if (product) {
            if (product.colors && product.colors.length > 0) {
                setSelectedColor(product.colors[0]);
            } else if (product.color) {
                setSelectedColor(product.color);
            }
            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0]);
            }
        }
    }, [product]);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [productId]);

    const pageMotion: Variants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-attire-accent animate-spin mb-4" />
                <p className="text-attire-silver/60 text-[10px] uppercase tracking-[0.4em]">Loading...</p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-2xl font-serif text-white mb-4">Product Not Found</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="text-attire-accent uppercase tracking-[0.3em] text-[10px] border-b border-attire-accent pb-1"
                >
                    Back to Collections
                </button>
            </div>
        );
    }

    // Support both old API format (images[]) and new format (image_path string)
    const hasImages = (product.images && product.images.length > 0) || !!(product as any).image_path;
    const productImages = product.images && product.images.length > 0
        ? product.images
        : ((product as any).image_path ? [(product as any).image_path] : []);

    const productColors = product.colors || (product.color ? [product.color] : []);
    const productSizes = product.sizes || [];

    // Filter out current product from related
    const filteredRelated = relatedProducts
        ?.filter((p: Product) => p.slug !== product.slug && p.collection === product.collection)
        ?.slice(0, 4) || [];

    return (
        <motion.div
            className="bg-[#0a0a0a] text-white selection:bg-attire-accent selection:text-black relative"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageMotion}
        >
            <SEO
                title={product.meta_title || `${product.name} | ${product.collection}`}
                description={product.meta_description || product.description || `Experience the ${product.name} from our ${product.collection}. Premium styling excellence at Attire Lounge Official.`}
                image={hasImages ? productImages[0] : undefined}
            />

            {/* ─── Fixed Top Nav ─── */}
            <div className="fixed top-0 left-0 w-full z-[100] px-4 lg:px-10 py-4 lg:py-6 pointer-events-none bg-gradient-to-b from-black/60 to-transparent">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-white/10 flex items-center justify-center group pointer-events-auto hover:bg-white transition-all duration-500 backdrop-blur-md"
                >
                    <ChevronLeft size={18} className="group-hover:text-black transition-colors" />
                </button>
            </div>

            {/* ─── Breadcrumbs (Desktop) ─── */}
            <div className="hidden lg:flex items-center gap-2 px-10 pt-20 pb-4 text-[10px] tracking-[0.2em] text-white/30 uppercase">
                <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-white/60 transition-colors">Collections</Link>
                {product.collection && (
                    <>
                        <span>/</span>
                        <Link to={`/collections/${product.collectionSlug || product.collection.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white/60 transition-colors">
                            {product.collection}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="text-white/60">{product.name}</span>
            </div>

            {/* ─── Main Content: Image + Details ─── */}
            <main className="flex flex-col lg:flex-row">

                {/* ─── LEFT: Image Gallery ─── */}
                <section className="w-full lg:w-[60%] xl:w-[65%]">
                    {/* Mobile: Full-width image */}
                    <div className="lg:hidden">
                        <div className="relative aspect-[4/5] bg-[#111] overflow-hidden">
                            {hasImages ? (
                                <OptimizedImage
                                    src={productImages[selectedImageIndex]}
                                    fallback={productImages.length > 1 ? productImages[1] : null}
                                    alt={product.name}
                                    objectFit="cover"
                                    containerClassName="w-full h-full"
                                    className="w-full h-full"
                                    priority={true}
                                    loading="eager"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/10">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                </div>
                            )}
                            {/* Image counter dots */}
                            {productImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {productImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImageIndex(i)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                                i === selectedImageIndex ? 'bg-white w-4' : 'bg-white/30'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop: Sticky full-height image */}
                    <div className="hidden lg:block sticky top-0 h-screen">
                        <div className="relative w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                            {hasImages ? (
                                <OptimizedImage
                                    src={productImages[selectedImageIndex]}
                                    fallback={productImages.length > 1 ? productImages[1] : null}
                                    alt={product.name}
                                    objectFit="contain"
                                    containerClassName="w-full h-full max-h-[85vh]"
                                    className="w-full h-auto"
                                    bgClassName="bg-transparent"
                                    priority={true}
                                    loading="eager"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-white/10 gap-3">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">No Image Available</span>
                                </div>
                            )}
                            {/* Desktop carousel dots */}
                            {productImages.length > 1 && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                                    {productImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImageIndex(i)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                i === selectedImageIndex ? 'bg-attire-accent scale-125' : 'bg-white/20 hover:bg-white/40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── RIGHT: Product Details ─── */}
                <section className="w-full lg:w-[40%] xl:w-[35%] lg:border-l border-white/5">
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className="px-5 md:px-8 lg:px-12 xl:px-16 pt-6 lg:pt-20 pb-24 lg:pb-12 space-y-6 lg:space-y-8"
                    >
                        {/* Collection + Category */}
                        <motion.div variants={slideUp} className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-attire-accent">
                                {product.collection || 'Attire Lounge'}
                            </span>
                            <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium">
                                {product.category}
                            </span>
                            {product.is_new && (
                                <span className="inline-block w-fit mt-1 px-2.5 py-0.5 bg-attire-accent/10 border border-attire-accent/20 text-attire-accent text-[9px] uppercase tracking-[0.3em] font-bold rounded-full">
                                    New Arrival
                                </span>
                            )}
                        </motion.div>

                        {/* Product Name */}
                        <motion.div variants={slideUp}>
                            <h1 className="text-3xl md:text-4xl xl:text-5xl font-serif text-white leading-none tracking-tight italic">
                                {product.name}
                            </h1>
                        </motion.div>

                        {/* Divider */}
                        <motion.div variants={slideUp} className="h-px w-full bg-white/10" />

                        {/* Color Selection */}
                        {productColors.length > 0 && (
                            <motion.div variants={slideUp} className="space-y-3">
                                <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
                                    Color{selectedColor ? ` : ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}` : ''}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {productColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                                                selectedColor === color
                                                    ? 'border-attire-accent scale-110'
                                                    : 'border-white/10 hover:border-white/30'
                                            }`}
                                            style={{ backgroundColor: getColorHex(color) }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Size Selection (Preview) */}
                        {productSizes.length > 0 && (
                            <motion.div variants={slideUp} className="space-y-3">
                                <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">
                                    Size{selectedSize ? ` : ${selectedSize}` : ''}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {productSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`min-w-[40px] h-10 px-3 border text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${
                                                selectedSize === size
                                                    ? 'border-attire-accent bg-attire-accent/10 text-attire-accent'
                                                    : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* CTA Button */}
                        <motion.div variants={slideUp} className="pt-2">
                            <button
                                onClick={() => navigate('/contact')}
                                className="group w-full h-14 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden hover:bg-attire-accent hover:text-white"
                            >
                                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-500" />
                                <span className="relative z-10">Make Appointment</span>
                            </button>
                        </motion.div>

                        {/* Divider */}
                        <motion.div variants={slideUp} className="h-px w-full bg-white/10" />

                        {/* Tabs: Description / Details */}
                        <motion.div variants={slideUp} className="space-y-4">
                            <div className="flex gap-6 border-b border-white/5">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-3 text-[10px] uppercase tracking-[0.3em] font-bold transition-colors relative ${
                                        activeTab === 'description' ? 'text-white' : 'text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    Description
                                    {activeTab === 'description' && (
                                        <motion.div
                                            layoutId="descTab"
                                            className="absolute bottom-0 left-0 right-0 h-px bg-attire-accent"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-3 text-[10px] uppercase tracking-[0.3em] font-bold transition-colors relative ${
                                        activeTab === 'details' ? 'text-white' : 'text-white/30 hover:text-white/60'
                                    }`}
                                >
                                    Details
                                    {activeTab === 'details' && (
                                        <motion.div
                                            layoutId="descTab"
                                            className="absolute bottom-0 left-0 right-0 h-px bg-attire-accent"
                                        />
                                    )}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'description' ? (
                                    <motion.div
                                        key="desc"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="text-sm text-attire-silver/70 leading-relaxed font-light">
                                            {product.description || product.detailed_description || "An exceptional piece of tailoring, merging classic heritage with a contemporary silhouette."}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="det"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-3"
                                    >
                                        {product.fabric && (
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/40 text-[10px] uppercase tracking-wider">Fabric</span>
                                                <span className="text-white/80">{product.fabric}</span>
                                            </div>
                                        )}
                                        {product.fit && (
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/40 text-[10px] uppercase tracking-wider">Fit</span>
                                                <span className="text-white/80">{product.fit}</span>
                                            </div>
                                        )}
                                        {product.silhouette && (
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/40 text-[10px] uppercase tracking-wider">Silhouette</span>
                                                <span className="text-white/80">{product.silhouette}</span>
                                            </div>
                                        )}
                                        {product.details && (
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/40 text-[10px] uppercase tracking-wider">Details</span>
                                                <span className="text-white/80">{product.details}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            {/* ─── "You Might Also Like" Section ─── */}
            {filteredRelated.length > 0 && (
                <section className="border-t border-white/5 py-12 lg:py-16 px-5 md:px-8 lg:px-12 xl:px-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-2xl lg:text-3xl font-serif text-white text-center mb-8 lg:mb-10">
                            You Might Also Like
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {filteredRelated.map((item: Product) => (
                                <Link
                                    key={item.id}
                                    to={`/products/${item.slug}`}
                                    className="group"
                                >
                                    <div className="relative aspect-[3/4] bg-[#111] overflow-hidden mb-3">
                                        <OptimizedImage
                                            src={item.images?.[0] || ''}
                                            alt={item.name}
                                            objectFit="cover"
                                            containerClassName="w-full h-full"
                                            className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <h3 className="text-xs lg:text-sm font-medium text-white group-hover:text-attire-accent transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-[10px] text-white/40 mt-0.5">
                                        {item.collection}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </section>
            )}

            {/* ─── Back to Collections Link ─── */}
            <div className="text-center py-8 border-t border-white/5">
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
                >
                    <ChevronLeft size={14} />
                    Back to Collections
                </Link>
            </div>
        </motion.div>
    );
};

export default ProductDetailPage;
