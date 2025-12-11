import React, { useEffect, useRef } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

const HomePage = () => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [controls, isInView]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { x: 20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 100,
                mass: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen">
            {/* Premium Minimalist Hero Section - Normal Layout */}
            <section className="relative min-h-screen bg-attire-dark overflow-hidden">
                <div className="absolute inset-0">
                    {/* Background for whole section */}
                    <div className="absolute inset-0 bg-gradient-to-r from-attire-charcoal/95 via-attire-navy/90 to-attire-dark/95">
                        {/* Subtle texture */}
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>

                    {/* Left side gradient for artwork area */}
                    <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-attire-gold/5 via-transparent to-transparent" />

                    {/* Right side minimal gradient */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-attire-accent/3 via-transparent to-transparent" />
                </div>

                {/* Main Content Container - Normal Flex Layout */}
                <div className="relative z-10 h-full min-h-screen flex items-center">
                    <div className="max-w-7xl mx-auto w-full px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between h-full">
                            {/* Left Side - Artwork Area */}
                            <div className="w-full md:w-1/2 h-full flex items-center justify-center py-12 md:py-0">
                                {/* Placeholder for your artwork - Add your image here */}
                                <div className="relative w-full max-w-lg aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-attire-charcoal/30 via-attire-navy/20 to-attire-dark/30 border border-white/5">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center text-white/20">
                                            <div className="text-6xl mb-6">👔</div>
                                            <div className="text-sm tracking-widest uppercase">Artwork Area</div>
                                            <div className="text-xs mt-2 opacity-50">Your image goes here</div>
                                        </div>
                                    </div>

                                    {/* Subtle animated glow */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            opacity: [0.1, 0.2, 0.1],
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 bg-gradient-to-br from-attire-gold/10 via-transparent to-attire-accent/10"
                                    />
                                </div>
                            </div>

                            {/* Right Side - Text Content */}
                            <div className="w-full md:w-1/2 h-full flex items-center justify-center md:justify-end py-12 md:py-0">
                                <div className="max-w-md text-right">
                                    <motion.div
                                        ref={ref}
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate={controls}
                                        className="space-y-8"
                                    >
                                        {/* Gentlemen's Collection */}
                                        <motion.div variants={itemVariants}>
                                            <div className="inline-block">
                                                <span className="text-xs tracking-[0.3em] uppercase text-white/50 font-light">
                                                    Gentlemen's Collection
                                                </span>
                                            </div>
                                        </motion.div>

                                        {/* Timeless Elegance */}
                                        <motion.div variants={itemVariants}>
                                            <h1 className="text-4xl md:text-5xl font-serif font-light text-white leading-tight">
                                                <span className="block font-extralight tracking-tight">Timeless</span>
                                                <span className="block font-light mt-2 tracking-tight">Elegance</span>
                                            </h1>
                                        </motion.div>

                                        {/* Description */}
                                        <motion.div variants={itemVariants}>
                                            <div className="text-white/60 text-sm leading-relaxed font-light max-w-xs ml-auto space-y-3">
                                                <p>Premium menswear with contemporary edge.</p>
                                                <p>Crafted for the modern gentleman.</p>
                                            </div>
                                        </motion.div>

                                        {/* Explore Collection Button */}
                                        <motion.div variants={itemVariants} className="pt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="group relative overflow-hidden border border-white/20 text-white px-8 py-3 rounded-full font-light text-sm hover:border-white/40 transition-all duration-500 ml-auto flex items-center justify-end gap-2 w-full md:w-auto"
                                            >
                                                <span className="relative z-10 tracking-wide">
                                                    Explore Collection
                                                </span>
                                                <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                                <motion.div
                                                    className="absolute inset-0 bg-white/5"
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                />
                                            </motion.button>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator - Bottom Center */}
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    >
                        <div className="text-white/30 text-xs tracking-widest uppercase">
                            Scroll
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Collections - Normal Flow */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-right mb-16">
                        <h2 className="text-2xl font-serif text-attire-dark mb-4 font-light">
                            Collections
                        </h2>
                        <p className="text-sm text-gray-600 max-w-md ml-auto">
                            Minimalist essentials for everyday sophistication
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Suits',
                                desc: 'Tailored precision',
                                color: 'from-attire-charcoal/5 to-attire-dark/5'
                            },
                            {
                                title: 'Shirts',
                                desc: 'Essential craftsmanship',
                                color: 'from-attire-stone/5 to-attire-silver/5'
                            },
                            {
                                title: 'Accessories',
                                desc: 'Finishing details',
                                color: 'from-attire-gold/5 to-attire-accent/5'
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -4 }}
                                className="group text-right"
                            >
                                <div className={`bg-gradient-to-br ${item.color} rounded-lg p-8 transition-all duration-300 hover:shadow-lg`}>
                                    <h3 className="text-xl font-light text-attire-charcoal mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        {item.desc}
                                    </p>
                                    <button className="text-xs tracking-widest text-attire-stone hover:text-attire-charcoal transition-colors duration-300 group-hover:tracking-wider inline-flex items-center gap-1">
                                        VIEW <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
