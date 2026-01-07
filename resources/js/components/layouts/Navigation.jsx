// resources/js/components/layouts/Navigation.jsx - FINAL
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Search, Menu, X, User, ShoppingBag, ChevronRight,
    Home, Grid, Camera, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLookbookFilterOpen, setIsLookbookFilterOpen] = useState(false);

    useEffect(() => {
        const handler = ({ detail }) => setIsLookbookFilterOpen(detail.isFilterOpen);
        window.addEventListener('lookbookFilterStateChange', handler);
        return () => window.removeEventListener('lookbookFilterStateChange', handler);
    }, []);
    
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('menuStateChange', { detail: { isMenuOpen } }));
        }, 50);
        return () => clearTimeout(timer);
    }, [isMenuOpen]);

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Collections', path: '/collections', icon: Grid },
        { name: 'Lookbook', path: '/lookbook', icon: Camera },
        { name: 'Contact', path: '/contact', icon: Mail },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // --- Style & Animation Logic ---
    const isNavVisible = isHovered || isMenuOpen || isMobile;

    const isTransparentNav = isHomePage && !isScrolled && !isMenuOpen && !isMobile && !isHovered;
    
    const showBorder = !isHomePage || isScrolled || isMenuOpen || isMobile;
        
    const navBackgroundClass = isTransparentNav 
        ? 'bg-opacity-0'
        : `bg-opacity-30 backdrop-blur-xl ${showBorder ? 'border-b border-white/10' : 'border-b-0'}`;
        
    const navTextColor = 'text-white';
    const navIconColor = 'text-white/80';
    
    const navVariants = {
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: "-25%" }
    };
    const sidebarVariants = {
        open: { x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
        closed: { x: "-100%", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
    };
    const listVariants = {
        open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
        closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
    };
    const itemVariants = {
        open: { y: 0, opacity: 1, transition: { y: { stiffness: 1000, velocity: -100 } } },
        closed: { y: 50, opacity: 0, transition: { y: { stiffness: 1000 } } }
    };

    if (isLookbookFilterOpen && isMobile) {
        return null;
    }

    return (
        <>
            <motion.nav
                animate={isNavVisible ? "visible" : "hidden"}
                initial="visible"
                variants={navVariants}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-0 left-0 right-0 z-50 bg-attire-dark transition-opacity duration-500 ${navBackgroundClass}`}
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-24">
                        <button onClick={() => setIsMenuOpen(true)} className="p-2" aria-label="Open menu">
                            <Menu className={`w-6 h-6 ${navIconColor}`} />
                        </button>
                        <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <motion.span
                                animate={{ opacity: isTransparentNav ? 0 : 1 }}
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`font-serif text-xl font-medium tracking-widest uppercase ${navTextColor}`}
                            >
                                Attire Lounge
                            </motion.span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 hidden lg:block" aria-label="Search"><Search className={`w-5 h-5 ${navIconColor}`} /></button>
                            <button className="p-2" aria-label="Account"><User className={`w-5 h-5 ${navIconColor}`} /></button>
                            <button className="p-2" aria-label="Shopping cart"><ShoppingBag className={`w-5 h-5 ${navIconColor}`} /></button>
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
                            className="fixed inset-0 bg-attire-dark/50 backdrop-blur-sm z-40"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 bottom-0 w-full max-w-md bg-attire-navy z-50 shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/10">
                                <span className="font-serif text-lg text-attire-cream">Attire Lounge</span>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2" aria-label="Close menu">
                                    <X className="w-6 h-6 text-attire-cream" />
                                </button>
                            </div>
                            <motion.ul variants={listVariants} className="p-6 space-y-3">
                                {navItems.map((item) => (
                                    <motion.li key={item.name} variants={itemVariants}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="group flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <item.icon className="w-5 h-5 text-attire-cream group-hover:text-white transition-colors" />
                                                <span className="font-serif text-xl text-attire-cream">{item.name}</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-attire-silver/50 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </motion.li>
                                ))}
                            </motion.ul>
                            <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/10">
                                <p className="text-xs text-attire-silver text-center">© 2024 Attire Lounge. All rights reserved.</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
