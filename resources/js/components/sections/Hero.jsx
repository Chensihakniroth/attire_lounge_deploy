import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background with mirror effect */}
            <div className="absolute inset-0 bg-gradient-elegant">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%230a0a0a' fillOpacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
            </div>

            {/* Floating mirror cards */}
            <div className="absolute top-1/4 left-10 w-64 h-64 mirror-container opacity-20 animate-float"></div>
            <div
                className="absolute bottom-1/4 right-10 w-48 h-48 mirror-container opacity-15 animate-float"
                style={{ animationDelay: '2s' }}
            ></div>

            {/* Main content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Sparkles className="w-4 h-4 text-attire-gold" />
                        <span className="heading-sm">Spring Collection 2024</span>
                        <Sparkles className="w-4 h-4 text-attire-gold" />
                    </div>

                    <h1 className="heading-xl text-attire-charcoal mb-8">
                        Timeless Elegance,
                        <br />
                        <span className="text-attire-stone font-light">Modern Sophistication</span>
                    </h1>

                    <p className="text-lg text-attire-stone/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Curated gentlemen's attire that blends heritage craftsmanship
                        with contemporary design. Experience the Ralph Lauren inspired
                        aesthetic in every detail.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="btn-primary-slim group">
                            Explore Collection
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline" />
                        </button>
                        <button className="btn-secondary-slim">
                            View Lookbook
                        </button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid grid-cols-3 gap-8 max-w-xl mx-auto pt-12 border-t border-attire-silver/30"
                >
                    {[
                        { number: '50+', label: 'Exclusive Pieces' },
                        { number: '3', label: 'Collections' },
                        { number: '∞', label: 'Style Possibilities' },
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-2xl font-serif font-light text-attire-charcoal mb-1">
                                {stat.number}
                            </div>
                            <div className="text-xs tracking-wider text-attire-stone/60">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-px h-16 bg-gradient-to-b from-attire-gold/50 to-transparent"></div>
            </motion.div>
        </section>
    );
};

export default Hero;
