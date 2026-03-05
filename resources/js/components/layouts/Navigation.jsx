import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu, X, Heart, ChevronRight,
    Home, Grid, Camera, Mail, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../context/FavoritesContext.jsx';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLookbookFilterOpen, setIsLookbookFilterOpen] = useState(false);
    const [showNav, setShowNav] = useState(true);
    const { favorites } = useFavorites();
    const location = useLocation();

    const isHomePage = useMemo(() => location.pathname === '/', [location.pathname]);
    const isAdminRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

    useEffect(() => {
        const handler = ({ detail }) => setIsLookbookFilterOpen(detail.isFilterOpen);
        window.addEventListener('lookbookFilterStateChange', handler);
        return () => window.removeEventListener('lookbookFilterStateChange', handler);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Optimized scroll logic to prevent jitter ✨
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 20); // Faster reaction
            
            if (currentScrollY < 10) {
                setShowNav(true);
            } else if (Math.abs(currentScrollY - lastScrollY) > 5) { // Threshold to prevent jitter
                setShowNav(currentScrollY < lastScrollY);
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('menuStateChange', { detail: { isMenuOpen } }));
        }, 50);
        return () => clearTimeout(timer);
    }, [isMenuOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Latest Collection', path: '/collections', icon: Grid },
        { name: 'Lookbook', path: '/lookbook', icon: Camera },
        { name: 'Customize Gift for Men', path: '/customize-gift', icon: Gift },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    // Cleaner visibility calculation
    const isVisible = isMenuOpen || isHovered || (isMobile ? showNav : (showNav || window.scrollY < 50));
    const isTransparentNav = isHomePage && !isScrolled && !isMenuOpen && !isHovered;

    return (
        <>
            {/* Extended trigger area to prevent flicker */}
            {!isMobile && (
                <div 
                    className="fixed top-0 left-0 right-0 h-32 z-40 bg-transparent"
                    onMouseEnter={() => setIsHovered(true)}
                />
            )}

            <motion.nav
                animate={{ 
                    y: isVisible ? 0 : -20,
                    opacity: isVisible ? 1 : 0,
                    pointerEvents: isVisible ? 'auto' : 'none'
                }} 
                initial={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-700 ${
                    isTransparentNav 
                        ? 'bg-transparent border-transparent' 
                        : 'bg-white/[0.02] border-b border-white/[0.08] shadow-2xl'
                }`}
                style={{ 
                    WebkitBackdropFilter: isTransparentNav ? 'none' : 'blur(40px) saturate(150%) brightness(1.1)',
                    backdropFilter: isTransparentNav ? 'none' : 'blur(40px) saturate(150%) brightness(1.1)',
                    WebkitTransform: 'translateZ(0)',
                    transform: 'translateZ(0)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20 md:h-24">
                        <button 
                            onClick={() => setIsMenuOpen(true)} 
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors" 
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6 text-white transition-colors duration-300 hover:text-attire-accent" />
                        </button>

                        <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
                            <motion.div
                                animate={{ 
                                    opacity: isTransparentNav ? 0 : 1,
                                    scale: isTransparentNav ? 0.95 : 1
                                }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <span className="font-serif text-lg md:text-xl font-medium tracking-[0.2em] uppercase text-white group-hover:text-attire-accent transition-colors">
                                    Attire Lounge Official
                                </span>
                            </motion.div>
                        </Link>

                        <div className="flex items-center space-x-1 md:space-x-4">
                            <Link 
                                to="/favorites" 
                                className="relative p-2 rounded-full hover:bg-white/10 transition-colors" 
                                aria-label="Favorites"
                            >
                                <Heart className="w-5 h-5 text-white transition-colors duration-300 hover:text-attire-accent" />
                                {favorites.length > 0 && (
                                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-attire-accent border border-black shadow-sm" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsMenuOpen(false)}
                            style={{ WebkitBackdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] z-50 border-r border-white/10 shadow-2xl flex flex-col"
                            style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
                        >
                            <div className="p-8 flex items-center justify-between">
                                <span className="font-serif text-xl text-white tracking-[0.2em] uppercase">Menu</span>
                                <button 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" 
                                    aria-label="Close menu"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <ul className="space-y-2">
                                    {navItems.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="p-2 rounded-lg bg-white/5 text-white/50 group-hover:text-attire-accent group-hover:bg-attire-accent/10 transition-colors">
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-serif text-lg text-white/80 group-hover:text-white tracking-wide transition-colors">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-8 border-t border-white/5 text-center">
                                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Attire Lounge Official</p>
                                <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} All rights reserved.</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
