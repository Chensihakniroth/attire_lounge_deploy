import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Gift, LogOut, Menu, X, Package, ShoppingBag, ChevronLeft, ChevronRight, Sun, Moon, Trash2, AlertCircle, Check, Loader } from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const NavItem = ({ item, isCollapsed }) => {
    return (
        <motion.div 
            whileHover={{ x: isCollapsed ? 0 : 4, scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                        isActive
                            ? 'bg-black dark:bg-white/10 text-white dark:text-attire-accent shadow-lg shadow-black/5 dark:shadow-none'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.name : ''}
            >
                <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-300 group-hover:scale-110`} />
                {!isCollapsed && <span className="text-[11px]">{item.name}</span>}
            </NavLink>
        </motion.div>
    );
};

const Sidebar = ({ isOpen, setOpen, isMobile = false }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
        { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
        { name: 'Products', to: '/admin/products', icon: ShoppingBag },
        { name: 'Gift Requests', to: '/admin/customize-gift', icon: Gift },
        { name: 'Gift Inventory', to: '/admin/inventory', icon: Package },
    ];

    const SidebarContent = () => {
        const { isDarkMode, toggleDarkMode } = useTheme();
        
        return (
            <div className={`flex flex-col w-full bg-white dark:bg-[#0a0a0a] border-r border-black/5 dark:border-white/5 flex-shrink-0 h-full overflow-hidden transition-colors duration-300`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5">
                    <h1 className="text-sm font-bold tracking-[0.3em] text-gray-900 dark:text-white uppercase">Attire Lounge</h1>
                    {isMobile && (
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <nav className="flex-grow p-4 space-y-2 mt-4">
                    {navItems.map(item => <NavItem key={item.name} item={item} isCollapsed={false} />)}
                </nav>
                <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {isDarkMode ? (
                            <>
                                <Sun className="w-5 h-5 mr-3" />
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <Moon className="w-5 h-5 mr-3" />
                                <span>Dark Mode</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            className={`fixed inset-y-0 left-0 z-[100] transform lg:hidden`}
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <SidebarContent />
                        </motion.div>

                        <motion.div
                            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        ></motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    return <SidebarContent />;
};

const AdminLayout = () => {
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [isMobileOpen, setMobileOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    return (
        <ThemeProvider>
            <AdminProvider>
                <AdminLayoutContent 
                    isSidebarVisible={isSidebarVisible} 
                    setSidebarVisible={setSidebarVisible} 
                    isMobileOpen={isMobileOpen} 
                    setMobileOpen={setMobileOpen} 
                    isDesktop={isDesktop} 
                    setIsDesktop={setIsDesktop} 
                />
            </AdminProvider>
        </ThemeProvider>
    );
};

const AdminLayoutContent = ({ isSidebarVisible, setSidebarVisible, isMobileOpen, setMobileOpen, isDesktop, setIsDesktop }) => {
    const { isEditing, showCollections, setShowCollections, collections, fetchCollections } = useAdmin();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div id="admin-root" className="flex h-screen bg-gray-50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-attire-accent selection:text-black transition-colors duration-300 relative">
            {/* Global Collection Manager Modal ✨ */}
            <AnimatePresence>
                {showCollections && (
                    <CollectionManagerModal 
                        collections={collections}
                        onClose={() => setShowCollections(false)} 
                        onRefresh={() => fetchCollections()} 
                    />
                )}
            </AnimatePresence>

            {/* Desktop Sidebar with Motion */}
            <AnimatePresence initial={false}>
// ... (Note: This replacement handles the rendering, I will add the component definition next) ...
                {!isEditing && !showCollections && isDesktop && isSidebarVisible && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 256, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden lg:block overflow-hidden h-full flex-shrink-0 bg-white dark:bg-[#0a0a0a]"
                    >
                        <Sidebar isOpen={isMobileOpen} setOpen={setMobileOpen} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            {!isEditing && !showCollections && <Sidebar isMobile={true} isOpen={isMobileOpen} setOpen={setMobileOpen} />}
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!isEditing && !showCollections && (
                    <header className="h-16 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center px-6 justify-between flex-shrink-0 z-20 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        setMobileOpen(true);
                                    } else {
                                        setSidebarVisible(!isSidebarVisible);
                                    }
                                }} 
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-500 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                            >
                                <Menu size={20} />
                            </button>
                            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-2 hidden lg:block" />
                            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-attire-silver/60 hidden sm:block">
                                Styling House <span className="text-black/20 dark:text-white/20 mx-2">/</span> <span className="text-gray-900 dark:text-white uppercase">Admin</span>
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider leading-none mb-1">Administrator</p>
                                <p className="text-[9px] text-attire-accent uppercase tracking-[0.2em]">Master Access</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center">
                                <ShoppingBag size={14} className="text-attire-accent" />
                            </div>
                        </div>
                    </header>
                )}

                <main className={`flex-1 overflow-y-auto relative ${isEditing || showCollections ? 'p-0' : 'p-6 md:p-10'}`}>
                    {/* Background decoration - only show when not editing for cleaner focus */}
                    {!isEditing && !showCollections && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-attire-accent/10 blur-[120px] rounded-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] rounded-full" />
                        </div>
                    )}

                    <div className={`relative z-10 ${isEditing ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

const CollectionManagerModal = ({ collections, onClose, onRefresh }) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('manage'); // 'add' or 'manage'

    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        // Auto-generate slug ✨
        setSlug(val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await axios.post('/api/v1/admin/collections', {
                name,
                slug,
                year: parseInt(year),
                description,
                is_active: true
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                console.log("Collection Created Successfully! (ﾉ´ヮ\`)ﾉ*:･ﾟ✧");
                setName('');
                setSlug('');
                setDescription('');
                onRefresh();
                setActiveTab('manage'); // Show the list after adding
            }
        } catch (err) {
            console.error("Failed to create collection:", err);
            setError(err.response?.data?.message || 'Failed to create collection.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCollection = async (id, collectionName) => {
        if (window.confirm(`Are you sure you want to delete "${collectionName}"? This cannot be undone.`)) {
            try {
                const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const response = await axios.delete(`/api/v1/admin/collections/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.success) {
                    console.log("Collection Deleted! (｡♥‿♥｡)");
                    onRefresh();
                }
            } catch (err) {
                console.error("Failed to delete collection:", err);
                alert(err.response?.data?.message || 'Failed to delete collection. It might still contain products!');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[10000]"
            >
                <div className="p-8 border-b border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-serif text-white">Collections</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                        <button 
                            onClick={() => setActiveTab('manage')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                        >
                            Existing
                        </button>
                        <button 
                            onClick={() => setActiveTab('add')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                        >
                            Add New
                        </button>
                    </div>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto attire-scrollbar">
                    {activeTab === 'manage' ? (
                        <div className="space-y-3">
                            {collections.length > 0 ? (
                                collections.map(col => (
                                    <div key={col.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-wider">{col.name}</p>
                                            <p className="text-[10px] text-white/30 font-mono mt-1">{col.slug}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteCollection(col.id, col.name)}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-12 text-white/30 text-xs uppercase tracking-widest italic">No custom collections found.</p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                                    <AlertCircle size={14} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-widest ml-1">Collection Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={handleNameChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-attire-accent outline-none transition-all"
                                        placeholder="e.g. Autumn / Winter 25"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-widest ml-1">Year</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                        placeholder="2025"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-widest ml-1">Collection Slug</label>
                                <input 
                                    type="text" 
                                    required
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white/50 text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                    placeholder="unique-slug-identifier"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-widest ml-1">Description</label>
                                <textarea 
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:border-attire-accent outline-none transition-all resize-none"
                                    placeholder="Describe the essence of this collection..."
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-grow py-4 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-grow py-4 bg-white text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-attire-accent transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? <Loader className="animate-spin" size={14} /> : <Check size={14} />}
                                    {saving ? 'Creating...' : 'Create Collection'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLayout;
