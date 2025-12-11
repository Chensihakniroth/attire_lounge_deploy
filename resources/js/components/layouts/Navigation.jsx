// resources/js/components/layouts/Navigation.jsx - FIXED
import React, { useState, useEffect } from 'react';
import {
    Search, Menu, X, User, ShoppingBag, ChevronRight,
    Home, Grid, Camera, BookOpen, Scissors, Mail,
    Sun, Briefcase, Moon, Shirt, Watch, Sparkles,
    MapPin, Calendar, Gift, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Premium navigation items
    const navItems = [
        {
            name: 'Home',
            path: '/',
            icon: Home,
            description: 'Welcome to Attire Lounge'
        },
        {
            name: 'Collections',
            path: '/collections',
            icon: Grid,
            description: 'Curated selections'
        },
        {
            name: 'Lookbook',
            path: '/lookbook',
            icon: Camera,
            description: 'Style inspiration'
        },
        {
            name: 'Journal',
            path: '/journal',
            icon: BookOpen,
            description: 'Style insights'
        },
        {
            name: 'Bespoke',
            path: '/bespoke',
            icon: Scissors,
            description: 'Made-to-measure',
            badge: 'Exclusive'
        },
        {
            name: 'Contact',
            path: '/contact',
            icon: Mail,
            description: 'Personal consultation'
        },
    ];

    // Luxury collections
    const collections = [
        {
            name: 'Spring/Summer 2024',
            season: 'New Season',
            icon: Sun,
            items: 24
        },
        {
            name: 'Signature Suits',
            season: 'Tailored',
            icon: Briefcase,
            items: 18
        },
        {
            name: 'Evening Attire',
            season: 'Formal',
            icon: Moon,
            items: 12
        },
        {
            name: 'Linen & Cotton',
            season: 'Essential',
            icon: Shirt,
            items: 36
        },
        {
            name: 'Leather Goods',
            season: 'Accessories',
            icon: Watch,
            items: 22
        },
        {
            name: 'Italian Footwear',
            season: 'Handcrafted',
            icon: Star,
            items: 16
        },
    ];

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsScrolled(currentScrollY > 20);

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            {/* Premium Navigation Bar */}
            <motion.nav
                initial={{ y: 0 }}
                animate={{
                    y: isVisible ? 0 : -120,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1]
                }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled
                        ? 'bg-white/98 backdrop-blur-xl shadow-sm border-b border-attire-silver/20'
                        : 'bg-white/95 backdrop-blur-lg'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-24">
                        {/* Left: Elegant Hamburger */}
                        <motion.button
                            onClick={() => setIsMenuOpen(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-3 rounded-lg transition-colors duration-200 group"
                            aria-label="Open menu"
                        >
                            <div className="flex flex-col items-center space-y-1">
                                <motion.div
                                    animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                    className="w-6 h-px bg-black/90"
                                />
                                <motion.div
                                    animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                    className="w-6 h-px bg-black/60"
                                />
                                <motion.div
                                    animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                    className="w-6 h-px bg-black/90"
                                />
                            </div>
                            <span className="mt-2 text-[10px] tracking-widest text-black/80">
                                MENU
                            </span>
                        </motion.button>

                        {/* Center: Luxury Monogram */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex flex-col items-center cursor-pointer group"
                        >
                            <div className="flex items-center justify-center w-full">
                                <div className="text-base font-serif font-medium tracking-widest text-black uppercase">
                                    Attire Lounge
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Premium Actions */}
                        <div className="flex items-center space-x-2">
                            {/* Search */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    className="p-3 rounded-lg transition-colors"
                                    aria-label="Search"
                                >
                                    <Search className="w-5 h-5 text-black/80" />
                                </motion.button>

                            {/* Account */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    className="p-3 rounded-lg hidden lg:block"
                                    aria-label="Account"
                                >
                                    <User className="w-5 h-5 text-black/80" />
                                </motion.button>

                            {/* Cart */}
                            <motion.button className="p-3 rounded-lg" aria-label="Shopping cart">
                                <ShoppingBag className="w-5 h-5 text-black/80" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Luxury Sidebar */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Elegant Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/10 backdrop-blur-md z-40"
                        />

                        {/* Premium Sidebar */}
                        <motion.div
                            initial={{ x: -360 }}
                            animate={{ x: 0 }}
                            exit={{ x: -360 }}
                            transition={{ type: "spring", damping: 28, stiffness: 220 }}
                            className="sidebar fixed top-0 left-0 bottom-0 w-[360px] bg-white z-50 border-r border-gray-200 shadow-lg overflow-hidden"
                        >
                            {/* Sidebar Header */}
                            <div className="p-8 border-b border-attire-silver/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-attire-charcoal to-attire-dark rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white text-base font-serif font-light tracking-[0.2em]">AL</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium tracking-[0.3em] uppercase text-attire-charcoal">
                                                Attire Lounge
                                            </div>
                                            <div className="text-xs text-attire-stone/50 tracking-widest mt-1">
                                                Gentlemen's Collection
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 rounded-lg hover:bg-attire-cream/30 transition-colors group"
                                    >
                                        <X className="w-5 h-5 text-attire-stone/60 group-hover:text-attire-charcoal transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Premium Navigation */}
                            <div className="p-6 overflow-y-auto max-h-[calc(100vh-220px)]">
                                {/* Main Navigation */}
                                <div className="mb-10">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <div className="w-8 h-px bg-gradient-to-r from-attire-gold to-transparent" />
                                        <div className="text-xs font-medium tracking-[0.3em] uppercase text-attire-stone/60">
                                            Navigation
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <motion.a
                                                    key={item.name}
                                                    href={item.path}
                                                    whileHover={{ x: 6 }}
                                                    className="flex items-center justify-between px-6 py-5 rounded-lg hover:bg-gray-100 transition duration-200"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-2 rounded-lg bg-transparent">
                                                            <Icon className="w-4 h-4 text-black/80" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-black">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {item.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </motion.a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Luxury Collections */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-6">
                                        <div className="w-8 h-px bg-gradient-to-r from-attire-gold to-transparent" />
                                        <div className="text-xs font-medium tracking-[0.3em] uppercase text-attire-stone/60">
                                            Collections
                                        </div>
                                        <Sparkles className="w-3 h-3 text-attire-gold" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {collections.map((collection) => {
                                            const Icon = collection.icon;
                                            return (
                                                <motion.a
                                                    key={collection.name}
                                                    href="#"
                                                    whileHover={{ y: -2 }}
                                                    className="bg-white rounded-lg p-4 border border-gray-100 hover:bg-gray-50 transition"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="p-2 rounded-lg bg-transparent">
                                                            <Icon className="w-4 h-4 text-black/80" />
                                                        </div>
                                                        <div className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded-full tracking-wider">
                                                            {collection.items} items
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium text-black mb-1">
                                                        {collection.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {collection.season}
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <div className="text-[11px] text-black tracking-widest">
                                                            EXPLORE →
                                                        </div>
                                                    </div>
                                                </motion.a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Premium Services */}
                                <div className="mt-10 pt-8 border-t border-attire-silver/10">
                                    <div className="flex space-x-3">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            className="flex-1 py-3.5 text-xs font-medium text-attire-charcoal border border-attire-silver/20 rounded-xl hover:border-attire-silver/40 transition-all duration-300 flex items-center justify-center space-x-2"
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>Store Locator</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            className="flex-1 py-3.5 text-xs font-medium bg-gradient-to-r from-attire-charcoal to-attire-dark text-white rounded-xl hover:from-attire-dark hover:to-attire-charcoal transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                                        >
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Book Appointment</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Luxury Footer */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-attire-silver/10 bg-gradient-to-t from-white via-white to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] text-attire-silver/60 tracking-[0.3em] uppercase">
                                        EST. 2024
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Gift className="w-3.5 h-3.5 text-attire-silver/50" />
                                        <Star className="w-3.5 h-3.5 text-attire-silver/50" />
                                        <Sparkles className="w-3.5 h-3.5 text-attire-gold" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </>
    );
};

export default Navigation;
