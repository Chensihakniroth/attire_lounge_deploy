const minioBaseUrl = 'http://127.0.0.1:9000/product-assets';
import React, { useRef, useEffect, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    const videoRef = useRef(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    // Ensure video loops properly
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleEnded = () => {
                video.currentTime = 0;
                video.play().catch(e => console.log("Autoplay prevented:", e));
            };

            video.addEventListener('ended', handleEnded);

            return () => {
                video.removeEventListener('ended', handleEnded);
            };
        }
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Video Background - REPLACES the gradient background */}
            <div className="absolute inset-0 w-full h-full">
                {/* Optimized video element */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={`${minioBaseUrl}/videos/hero-poster.jpg`} // You should create this from a video frame
                    onLoadedData={() => setIsVideoLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        isVideoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {/* Primary MP4 source - HIGHLY COMPRESSED */}
                    <source
                        src={`${minioBaseUrl}/videos/hero-background.mp4`}
                        type="video/mp4"
                    />
                    {/* Optional WebM for better compression in supporting browsers */}
                    <source
                        src={`${minioBaseUrl}/videos/hero-background.webm`}
                        type="video/webm"
                    />
                    {/* Fallback for browsers that don't support video */}
                    <div className="absolute inset-0 bg-gradient-elegant">
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%230a0a0a' fillOpacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                    </div>
                </video>

                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/30"></div>

                {/* Optional subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
            </div>

            {/* Floating mirror cards (reduced opacity to work with video) */}
            <div className="absolute top-1/4 left-10 w-64 h-64 mirror-container opacity-10 animate-float"></div>
            <div
                className="absolute bottom-1/4 right-10 w-48 h-48 mirror-container opacity-5 animate-float"
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
                        <span className="heading-sm text-white drop-shadow-md">Spring Collection 2024</span>
                        <Sparkles className="w-4 h-4 text-attire-gold" />
                    </div>

                    <h1 className="heading-xl text-white mb-8 drop-shadow-lg">
                        Timeless Elegance,
                        <br />
                        <span className="text-attire-silver font-light">Modern Sophistication</span>
                    </h1>

                    <p className="text-lg text-attire-silver/90 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-md">
                        Curated gentlemen's attire that blends heritage craftsmanship
                        with contemporary design. Experience the Ralph Lauren inspired
                        aesthetic in every detail.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="btn-primary-slim group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20">
                            Explore Collection
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline" />
                        </button>
                        <button className="btn-secondary-slim bg-transparent border border-attire-gold text-attire-gold hover:bg-attire-gold/10">
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
                            <div className="text-2xl font-serif font-light text-white mb-1 drop-shadow-md">
                                {stat.number}
                            </div>
                            <div className="text-xs tracking-wider text-attire-silver/70">
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
                <div className="w-px h-16 bg-gradient-to-b from-attire-gold/70 to-transparent"></div>
            </motion.div>
        </section>
    );
};

export default Hero;
