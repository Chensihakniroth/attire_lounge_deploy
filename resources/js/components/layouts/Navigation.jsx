import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Menu, X, User, ShoppingBag, ChevronRight,
    Home, Grid, Camera, BookOpen, Scissors, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Emit menu state changes to HomePage
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('menuStateChange', {
            detail: { isMenuOpen }
        }));
    }, [isMenuOpen]);

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
            name: 'Styling',
            path: '/styling',
            icon: Scissors,
            description: 'Personal styling consultation',
            badge: 'Exclusive'
        },
        {
            name: 'Contact',
            path: '/contact',
            icon: Mail,
            description: 'Personal consultation'
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
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                // Emit event immediately
                window.dispatchEvent(new CustomEvent('menuStateChange', {
                    detail: { isMenuOpen: false }
                }));
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Determine background class based on conditions
    const getNavBackgroundClass = () => {
        if (isMenuOpen) {
            return 'glass-mirror-effect';
        } else if (isMobile) {
            return 'bg-white/95 backdrop-blur-lg';
        } else if (isHovered) {
            return 'bg-white/95 backdrop-blur-lg shadow-sm';
        } else if (isScrolled) {
            return 'bg-transparent backdrop-blur-0';
        } else {
            return 'bg-transparent backdrop-blur-0';
        }
    };

    // Determine text color based on conditions
    const getTextColorClass = () => {
        if (isMenuOpen) {
            return 'text-white/90';
        } else if (isMobile || isHovered) {
            return 'text-black';
        } else {
            return 'text-white';
        }
    };

    // Determine icon color based on conditions
    const getIconColorClass = () => {
        if (isMenuOpen) {
            return 'text-white/80';
        } else if (isMobile || isHovered) {
            return 'text-black/80';
        } else {
            return 'text-white/90';
        }
    };

    // Handle menu open with event emission
    const handleMenuOpen = () => {
        setIsMenuOpen(true);
        // Emit event immediately
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('menuStateChange', {
                detail: { isMenuOpen: true }
            }));
        }, 10);
    };

    // Handle menu close with event emission
    const handleMenuClose = () => {
        setIsMenuOpen(false);
        // Emit event immediately
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('menuStateChange', {
                detail: { isMenuOpen: false }
            }));
        }, 10);
    };

    return (
        <>
            {/* Premium Navigation Bar */}
            <motion.nav
                initial={{ y: 0 }}
                animate={{
                    y: isVisible ? 0 : -120,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                }}
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${getNavBackgroundClass()}`}
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
            >
                {/* Hover gradient transition effect */}
                {!isMobile && (
                    <div
                        className={`absolute inset-0 bg-gradient-to-b from-white via-white to-white/95 transition-opacity duration-300 ${
                            isHovered && !isMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                )}

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex items-center justify-between h-24">
                        {/* Left: Hamburger */}
                        <button
                            onClick={handleMenuOpen}
                            className="p-3 rounded-lg transition-colors duration-200 group"
                            aria-label="Open menu"
                            aria-expanded={isMenuOpen}
                        >
                            <div className="flex flex-col items-center space-y-1">
                                <div className={`w-6 h-px transition-all duration-300 ${
                                    isMenuOpen ? 'rotate-45 translate-y-[6px] bg-black/90' :
                                    (isMobile || isHovered || isMenuOpen ? 'bg-black/90' : 'bg-white/90')
                                }`} />
                                <div className={`w-6 h-px transition-opacity duration-300 ${
                                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                                } ${isMobile || isHovered || isMenuOpen ? 'bg-black/60' : 'bg-white/60'}`} />
                                <div className={`w-6 h-px transition-all duration-300 ${
                                    isMenuOpen ? '-rotate-45 -translate-y-[6px] bg-black/90' :
                                    (isMobile || isHovered || isMenuOpen ? 'bg-black/90' : 'bg-white/90')
                                }`} />
                            </div>
                            <span className={`mt-2 block text-[10px] tracking-widest transition-colors duration-300 ${
                                isMobile || isHovered || isMenuOpen ? 'text-black/80' : 'text-white/80'
                            }`}>
                                MENU
                            </span>
                        </button>

                        {/* Center: Brand Name */}
                        <Link to="/" className="flex flex-col items-center cursor-pointer group">
                            <div className="flex items-center justify-center w-full h-8">
                                <div className={`text-base font-serif font-medium tracking-widest uppercase transition-all duration-300 ${
                                    isMenuOpen ? 'text-white/90' : getTextColorClass()
                                } ${
                                    (isMobile || isHovered || isMenuOpen) ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Attire Lounge
                                </div>
                            </div>
                        </Link>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-2">
                            <button className="p-3 transition-colors hover:scale-105" aria-label="Search">
                                <Search className={`w-5 h-5 transition-colors duration-300 ${getIconColorClass()}`} />
                            </button>
                            <button className="p-3 hidden lg:block transition-colors hover:scale-105" aria-label="Account">
                                <User className={`w-5 h-5 transition-colors duration-300 ${getIconColorClass()}`} />
                            </button>
                            <button className="p-3 transition-colors hover:scale-105" aria-label="Shopping cart">
                                <ShoppingBag className={`w-5 h-5 transition-colors duration-300 ${getIconColorClass()}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Sidebar */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                            onClick={handleMenuClose}
                        />

                        {/* Sidebar Panel - Optimized animations */}
                        <motion.div
                            initial={{ x: -380 }}
                            animate={{ x: 0 }}
                            exit={{ x: -380 }}
                            transition={{
                                duration: 0.35,
                                ease: "easeOut"
                            }}
                            className="sidebar fixed top-0 left-0 bottom-0 w-[360px] bg-gradient-to-b from-white/95 to-attire-cream/90 z-50 border-r border-white/30 shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                            {/* Sidebar Header */}
                            <div className="p-8 border-b border-white/20 bg-gradient-to-b from-white/80 to-white/40">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium tracking-[0.3em] uppercase text-attire-charcoal/90">
                                            Attire Lounge
                                        </div>
                                        <div className="text-xs text-attire-stone/70 tracking-widest mt-1">
                                            Gentlemen's Collection
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleMenuClose}
                                        className="p-2 hover:bg-white/30 transition-colors duration-200 group"
                                    >
                                        <X className="w-5 h-5 text-attire-stone/70 group-hover:text-attire-charcoal transition-colors duration-200" />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Items - Optimized */}
                            <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)] hide-scrollbar">
                                <div className="mb-6">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <div className="h-px w-8 bg-gradient-to-r from-attire-gold/80 to-transparent" />
                                        <div className="text-xs font-medium tracking-[0.3em] uppercase text-attire-stone/70">
                                            Navigation
                                        </div>
                                    </div>

                                    {/* Navigation items with CSS-only animations */}
                                    <div className="space-y-2">
                                        {navItems.map((item, index) => {
                                            const Icon = item.icon;
                                            return (
                                                <div
                                                    key={item.name}
                                                    className="group flex items-center justify-between px-4 py-4 rounded-lg hover:bg-white/50 transition-all duration-200 cursor-pointer"
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                        animationFillMode: 'both'
                                                    }}
                                                >
                                                    <Link
                                                        to={item.path}
                                                        className="flex items-center space-x-4 w-full"
                                                        onClick={handleMenuClose}
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                                <Icon className="w-4 h-4 text-attire-charcoal/80" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-attire-charcoal/90">
                                                                    {item.name}
                                                                </div>
                                                                <div className="text-xs text-attire-stone/70 mt-1">
                                                                    {item.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <ChevronRight className="w-4 h-4 text-attire-stone/50 group-hover:translate-x-1 transition-transform duration-200" />
                                                </div>
                                            );
                                        })}
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
