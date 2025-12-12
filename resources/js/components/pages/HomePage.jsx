import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

const HomePage = () => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const videoRef = useRef(null);
    const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);

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
            {/* Premium Minimalist Hero Section with CROPPED VIDEO BACKGROUND */}
            <section className="relative min-h-screen overflow-hidden">
                {/* Video Background Container with Cropping */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {/* Vertical Video Cropped to Show Top 40% */}
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster="/videos/gentlemen-styling-poster.jpg"
                            onLoadedData={() => setIsVideoLoaded(true)}
                            className={`absolute w-full h-auto min-h-full object-cover transition-opacity duration-1000 ${
                                isVideoLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            {/* Primary MP4 source */}
                            <source
                                src="/videos/hero-background.mp4"
                                type="video/mp4"
                            />
                            {/* Optional WebM for better compression */}
                            <source
                                src="/videos/gentlemen-styling-bg.webm"
                                type="video/webm"
                            />
                            {/* Fallback gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-attire-charcoal/95 via-attire-navy/90 to-attire-dark/95"></div>
                        </video>

                    </div>

                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                </div>

                {/* Main Content Container */}
                <div className="relative z-10 h-full min-h-screen flex items-center">
                    <div className="max-w-7xl mx-auto w-full px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between h-full">
                            {/* Right Side - Text Content (Now centered) */}
                            <div className="w-full h-full flex items-center justify-center py-12 md:py-0">
                                <div className="max-w-2xl text-center">
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
                        <div className="text-white/50 text-xs tracking-widest uppercase">
                            Scroll
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Rest of your sections remain unchanged */}
            {/* Hero 2: Introduction to Business */}
            <section className="relative py-24 px-6 bg-gradient-to-b from-white to-attire-cream overflow-hidden">
                {/* Glass Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-attire-cream/60 to-white/80 backdrop-blur-sm"></div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif text-attire-charcoal mb-6">
                            Cambodia's Premier Gentlemen's House
                        </h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-attire-gold to-attire-accent mx-auto mb-8"></div>
                        <p className="text-lg text-attire-stone max-w-3xl mx-auto leading-relaxed">
                            Established as the first dedicated gentlemen's styling house in Cambodia,
                            we bring international standards of tailoring and personal styling to Phnom Penh.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Heritage Tailoring',
                                description: 'Traditional craftsmanship meets modern techniques for perfect fits',
                                icon: '✂️'
                            },
                            {
                                title: 'Personal Styling',
                                description: 'One-on-one consultations to develop your signature style',
                                icon: '👔'
                            },
                            {
                                title: 'Premium Collections',
                                description: 'Curated selections from international and local designers',
                                icon: '⭐'
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-attire-silver/20"
                            >
                                <div className="text-4xl mb-6">{item.icon}</div>
                                <h3 className="text-xl font-serif font-medium text-attire-charcoal mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-attire-stone leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hero 3: Featured Collections Showcase */}
            <section className="relative py-24 px-6 bg-attire-dark text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l6-6h2l-8 8v-2zm0 4l10-10h2L40 10v-2zm0 4l14-14h2L40 14v-2zm0 4l18-18h2L40 18v-2zm0 4l22-22h2L40 22v-2zm0 4l26-26h2L40 26v-2zm0 4l30-30h2L40 30v-2zm0 4l34-34h2L40 34v-2zm0 4l38-38h2L40 38v-2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif mb-6">
                            Curated Collections
                        </h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Discover our exclusive selections crafted for the modern Cambodian gentleman
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Signature Suits',
                                description: 'Custom-tailored suits for business and special occasions',
                                imageColor: 'from-attire-navy/20 to-attire-dark/20',
                                items: '24 Pieces'
                            },
                            {
                                title: 'Luxury Shirts',
                                description: 'Premium cotton and linen shirts for everyday elegance',
                                imageColor: 'from-attire-charcoal/20 to-attire-stone/20',
                                items: '36 Pieces'
                            },
                            {
                                title: 'Accessories',
                                description: 'Leather goods, ties, and pocket squares to complete your look',
                                imageColor: 'from-attire-gold/20 to-attire-accent/20',
                                items: '18 Pieces'
                            }
                        ].map((collection, index) => (
                            <motion.div
                                key={collection.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02 }}
                                className="group relative overflow-hidden rounded-xl"
                            >
                                {/* Collection Card */}
                                <div className={`bg-gradient-to-br ${collection.imageColor} backdrop-blur-sm border border-white/10 rounded-xl p-8 h-full`}>
                                    <div className="mb-6">
                                        <div className="text-3xl mb-4">👑</div>
                                        <h3 className="text-xl font-serif font-medium mb-3">
                                            {collection.title}
                                        </h3>
                                        <p className="text-gray-300 mb-6">
                                            {collection.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-attire-gold">
                                            {collection.items}
                                        </span>
                                        <button className="text-sm font-medium hover:text-attire-gold transition-colors group-hover:translate-x-2 duration-300">
                                            View Collection →
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mt-16 pt-12 border-t border-white/10"
                    >
                        <Link to="/collections">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-attire-gold to-attire-accent text-white px-10 py-4 rounded-full font-medium hover:shadow-lg hover:shadow-attire-gold/20 transition-all duration-300"
                            >
                                View All Collections
                                <ArrowRight className="w-5 h-5 inline ml-3" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Featured Collections Section (Existing - Updated) */}
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
                                <div className={`bg-gradient-to-br ${item.color} rounded-lg p-8 text-right transition-all duration-300`}>
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
