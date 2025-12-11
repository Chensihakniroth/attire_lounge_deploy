// resources/js/components/layouts/Navigation.jsx - ENHANCED
import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Collections for sidebar
    const collections = [
        { name: 'Spring/Summer 2024', tag: 'New', icon: '🌸' },
        { name: 'Signature Suits', tag: 'Heritage', icon: '👔' },
        { name: 'Evening Wear', tag: 'Formal', icon: '🎩' },
        { name: 'Weekend Collection', tag: 'Casual', icon: '🧥' },
        { name: 'Leather Goods', tag: 'Accessories', icon: '🧳' },
        { name: 'Footwear', tag: 'Crafted', icon: '👞' },
    ];

    // Navigation items for sidebar
    const navItems = [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Collections', path: '/collections', icon: '📦' },
        { name: 'Lookbook', path: '/lookbook', icon: '📸' },
        { name: 'Journal', path: '/journal', icon: '📝' },
        { name: 'Bespoke', path: '/bespoke', icon: '✂️' },
        { name: 'Contact', path: '/contact', icon: '✉️' },
    ];

    // Scroll handler for hide/show effect
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Add shadow when scrolled
            setIsScrolled(currentScrollY > 10);

            // Hide/show on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false); // Hide on scroll down
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true); // Show on scroll up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <>
            {/* Main Navigation Bar */}
            <motion.nav
                initial={{ y: 0 }}
                animate={{
                    y: isVisible ? 0 : -100,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-attire-silver/20'
                        : 'bg-white/80 backdrop-blur-sm'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Left: Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="hamburger-btn p-2 rounded-full hover:bg-attire-cream/50 transition-all duration-300 group"
                            aria-label="Open menu"
                        >
                            <motion.div
                                animate={isMenuOpen ? "open" : "closed"}
                                className="relative"
                            >
                                <Menu className="w-6 h-6 text-attire-charcoal group-hover:text-attire-accent transition-colors" />
                                <motion.div
                                    className="absolute inset-0 bg-attire-accent/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"
                                    initial={false}
                                />
                            </motion.div>
                        </button>

                        {/* Center: Logo */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex items-center space-x-2 group cursor-pointer">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-attire-charcoal to-attire-stone rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                        <span className="text-white text-lg font-serif font-light">AL</span>
                                    </div>
                                    <motion.div
                                        className="absolute -inset-2 bg-attire-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-sm font-medium tracking-widest uppercase text-attire-charcoal group-hover:text-attire-gold transition-colors">
                                        Attire Lounge
                                    </div>
                                    <div className="text-xs tracking-wider text-attire-stone/60 group-hover:text-attire-stone/80 transition-colors">
                                        Gentlemen's Collection
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Search & Icons */}
                        <div className="flex items-center space-x-2">
                            {/* Search Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-full hover:bg-attire-cream/50 transition-all duration-300 group relative"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5 text-attire-stone group-hover:text-attire-charcoal transition-colors" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-attire-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>

                            {/* User Account */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-full hover:bg-attire-cream/50 transition-all duration-300 group hidden md:block"
                                aria-label="Account"
                            >
                                <User className="w-5 h-5 text-attire-stone group-hover:text-attire-charcoal transition-colors" />
                            </motion.button>

                            {/* Cart/Bag */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-full hover:bg-attire-cream/50 transition-all duration-300 group relative"
                                aria-label="Shopping cart"
                            >
                                <ShoppingBag className="w-5 h-5 text-attire-stone group-hover:text-attire-charcoal transition-colors" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-attire-burgundy rounded-full animate-pulse" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 200
                            }}
                            className="sidebar fixed top-0 left-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl z-50 border-r border-attire-silver/30 shadow-2xl overflow-hidden"
                        >
                            {/* Sidebar Header */}
                            <div className="p-6 border-b border-attire-silver/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-attire-charcoal to-attire-stone rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg font-serif font-light">AL</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium tracking-widest uppercase text-attire-charcoal">
                                                Attire Lounge
                                            </div>
                                            <div className="text-xs text-attire-stone/60">
                                                Menu
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 rounded-full hover:bg-attire-cream/50 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-attire-stone" />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                                <div className="mb-6">
                                    <h3 className="text-xs font-medium tracking-widest uppercase text-attire-stone mb-4 px-2">
                                        Navigation
                                    </h3>
                                    <div className="space-y-1">
                                        {navItems.map((item) => (
                                            <motion.a
                                                key={item.name}
                                                href={item.path}
                                                whileHover={{ x: 5 }}
                                                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-attire-cream/50 group transition-all duration-200"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg">{item.icon}</span>
                                                    <span className="text-attire-stone group-hover:text-attire-charcoal transition-colors">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-attire-silver group-hover:text-attire-accent transition-colors opacity-0 group-hover:opacity-100" />
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>

                                {/* Collections */}
                                <div>
                                    <h3 className="text-xs font-medium tracking-widest uppercase text-attire-stone mb-4 px-2">
                                        Collections
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {collections.map((collection) => (
                                            <motion.a
                                                key={collection.name}
                                                href="#"
                                                whileHover={{ scale: 1.02 }}
                                                className="bg-attire-cream/30 rounded-lg p-3 border border-attire-silver/20 hover:border-attire-accent/30 group transition-all duration-200"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xl">{collection.icon}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-attire-accent/10 text-attire-accent rounded-full">
                                                        {collection.tag}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-medium text-attire-charcoal group-hover:text-attire-accent transition-colors">
                                                    {collection.name}
                                                </div>
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-attire-silver/20 bg-white/80 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-attire-stone/60">
                                        Spring Collection 2024
                                    </div>
                                    <Sparkles className="w-4 h-4 text-attire-gold" />
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
