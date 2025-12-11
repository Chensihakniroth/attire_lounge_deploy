import React, { useState } from 'react';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeCollection, setActiveCollection] = useState(null);

    const collections = [
        { name: 'Spring/Summer 2024', tag: 'New' },
        { name: 'Signature Suits', tag: 'Heritage' },
        { name: 'Evening Wear', tag: 'Formal' },
        { name: 'Weekend Collection', tag: 'Casual' },
    ];

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Collections', path: '/collections' },
        { name: 'Lookbook', path: '/lookbook' },
        { name: 'Journal', path: '/journal' },
        { name: 'Bespoke', path: '/bespoke' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-attire-silver/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Minimal */}
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-attire-charcoal to-attire-stone rounded-sm flex items-center justify-center">
                            <span className="text-white text-sm font-serif font-light">AL</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="text-xs font-medium tracking-widest uppercase text-attire-stone">
                                Attire Lounge
                            </div>
                            <div className="text-[10px] tracking-wider text-attire-stone/60">
                                Gentlemen's Collection
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation - Slim */}
                    <div className="hidden md:flex items-center space-x-10">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.path}
                                className="nav-link"
                            >
                                {item.name}
                            </a>
                        ))}

                        {/* Collections Dropdown */}
                        <div className="relative"
                             onMouseEnter={() => setActiveCollection('collections')}
                             onMouseLeave={() => setActiveCollection(null)}>
                            <button className="nav-link flex items-center">
                                Browse <ChevronDown className="w-3 h-3 ml-1" />
                            </button>

                            <AnimatePresence>
                                {activeCollection === 'collections' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-attire-silver/30 rounded-xl shadow-mirror-xl py-4"
                                    >
                                        {collections.map((collection) => (
                                            <a
                                                key={collection.name}
                                                href="#"
                                                className="flex items-center justify-between px-6 py-3 hover:bg-attire-cream/50 transition-colors group"
                                            >
                                                <span className="text-sm text-attire-stone group-hover:text-attire-charcoal">
                                                    {collection.name}
                                                </span>
                                                <span className="collection-badge">
                                                    {collection.tag}
                                                </span>
                                            </a>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side - Search */}
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-attire-stone/50" />
                            <input
                                type="text"
                                placeholder="Search collection..."
                                className="input-minimal pl-10 w-64"
                            />
                        </div>

                        <button className="p-2 hover:bg-attire-cream/50 rounded-full transition-colors">
                            <Search className="w-5 h-5 text-attire-stone md:hidden" />
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 hover:bg-attire-cream/50 rounded-full transition-colors"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-attire-stone" />
                            ) : (
                                <Menu className="w-5 h-5 text-attire-stone" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden border-t border-attire-silver/30 mt-4"
                        >
                            <div className="py-6 space-y-4">
                                {navItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.path}
                                        className="block py-2 text-attire-stone hover:text-attire-charcoal transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </a>
                                ))}

                                <div className="pt-4 border-t border-attire-silver/30">
                                    <div className="heading-sm mb-4">COLLECTIONS</div>
                                    {collections.map((collection) => (
                                        <a
                                            key={collection.name}
                                            href="#"
                                            className="flex items-center justify-between py-3"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span className="text-sm">{collection.name}</span>
                                            <span className="collection-badge">
                                                {collection.tag}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navigation;
