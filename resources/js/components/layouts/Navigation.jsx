import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ChevronRight, Home, Grid, Camera, Mail, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../context/FavoritesContext.jsx';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLookbookFilterOpen, setIsLookbookFilterOpen] = useState(false);
  const { favorites } = useFavorites();
  const navRef = useRef(null);

  useEffect(() => {
    const handler = ({ detail }) => setIsLookbookFilterOpen(detail.isFilterOpen);
    window.addEventListener('lookbookFilterStateChange', handler);
    return () => window.removeEventListener('lookbookFilterStateChange', handler);
  }, []);

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');

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
    { name: 'Latest Collection', path: '/collections', icon: Grid },
    { name: 'Lookbook', path: '/lookbook', icon: Camera },
    { name: 'Customize Gift for Men', path: '/customize-gift', icon: Gift },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  useEffect(() => {
    const onNativeScroll = () => setIsScrolled(window.scrollY >= 5);
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    return () => window.removeEventListener('scroll', onNativeScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isVisible = true;
  const isTransparentNav = isHomePage && !isScrolled && !isMenuOpen;

  const navBackgroundClass = isTransparentNav
    ? 'bg-transparent border-transparent'
    : 'bg-black/20 backdrop-blur-xl border-b border-white/5 shadow-2xl';

  const navTextColor = 'text-white';
  const navIconColor = 'text-white transition-colors duration-300 hover:text-attire-accent';

  const navVariants = { visible: { y: '0%', opacity: 1 }, hidden: { y: '-100%', opacity: 0 } };
  const navTransition = { duration: 0.2, ease: 'easeInOut' };
  const sidebarVariants = { 
    open: { x: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } }, 
    closed: { x: '-100%', transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } } 
  };
  const listVariants = { 
    open: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } }, 
    closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } } 
  };
  const itemVariants = { 
    open: { y: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }, 
    closed: { y: 10, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } } 
  };

  if ((isLookbookFilterOpen && isMobile) || isAdminRoute) return null;

  return (
    <>
      <motion.nav
        ref={navRef}
        animate={isVisible ? 'visible' : 'hidden'}
        initial="visible"
        variants={navVariants}
        transition={navTransition}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500 ${navBackgroundClass}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20 md:h-24">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Open menu">
              <Menu className={`w-6 h-6 ${navIconColor}`} />
            </button>

            <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
              <motion.div animate={{ opacity: isTransparentNav ? 0 : 1, y: isTransparentNav ? 10 : 0 }} initial={{ opacity: 0, y: 10 }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                <span className={`font-serif text-lg md:text-xl font-medium tracking-[0.2em] uppercase ${navTextColor} group-hover:text-attire-accent transition-colors`}>Attire Lounge Official</span>
              </motion.div>
            </Link>

            <div className="flex items-center space-x-1 md:space-x-4">
              <Link to="/favorites" className="relative p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Favorites">
                <Heart className={`w-5 h-5 ${navIconColor}`} />
                {favorites.length > 0 && <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-attire-accent border border-black shadow-sm" />}
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)} />
            <motion.div variants={sidebarVariants} initial="closed" animate="open" exit="closed" className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-attire-navy z-50 border-r border-white/10 shadow-2xl flex flex-col">
              <div className="p-8 flex items-center justify-between">
                <span className="font-serif text-xl text-white tracking-[0.2em] uppercase">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Close menu">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <motion.ul variants={listVariants} className="space-y-2">
                  {navItems.map((item) => (
                    <motion.li key={item.name} variants={itemVariants}>
                      <Link to={item.path} onClick={() => setIsMenuOpen(false)} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300">
                        <div className="flex items-center gap-5">
                          <div className="p-2 rounded-lg bg-white/5 text-white/50 group-hover:text-attire-accent group-hover:bg-attire-accent/10 transition-colors">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <span className="font-serif text-lg text-white/80 group-hover:text-white tracking-wide transition-colors">{item.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              <div className="p-8 border-t border-white/5">
                <div className="flex flex-col gap-4 text-center">
                  <p className="text-xs text-white/30 uppercase tracking-widest">Attire Lounge Official</p>
                  <p className="text-[10px] text-white/20">&copy; {new Date().getFullYear()} All rights reserved.</p>
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
