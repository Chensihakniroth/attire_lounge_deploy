import React, { useState, useEffect, useCallback } from 'react';
import {
    NavLink,
    useNavigate,
    Outlet,
    useLocation,
    useOutlet,
} from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Gift,
    LogOut,
    Menu,
    X,
    Package,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
    Trash2,
    AlertCircle,
    Check,
    History,
    Users,
    Mail,
    Search,
    UserCircle,
    LayoutGrid,
    Scissors,
    Ticket,
    ArrowLeftRight,
    Zap,
    ZapOff
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { ThemeProvider, useTheme } from './ThemeContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { isSafari } from '../../../helpers/browserUtils';

const NavItem = ({ item, isCollapsed, setOpen }) => {
    return (
        <motion.div
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            <NavLink
                to={item.to}
                end={item.to === '/admin'}
                onClick={() => setOpen && setOpen(false)}
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-300 ${
                        isActive
                            ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                            : 'text-gray-400 dark:text-[#8b949e]/40 hover:bg-black/5 dark:hover:bg-[#21262d] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.name : ''}
            >
                <item.icon
                    className={`w-4 h-4 ${isCollapsed ? '' : 'mr-4'} transition-transform duration-300 flex-shrink-0 opacity-70`}
                />
                {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden">
                        {item.name}
                    </span>
                )}
            </NavLink>
        </motion.div>
    );
};

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = useCallback(async (val) => {
        if (val.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const token =
                localStorage.getItem('admin_token') ||
                sessionStorage.getItem('admin_token');
            const response = await axios.get(`/api/v1/search?q=${val}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setResults(response.data.data.slice(0, 5));
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => handleSearch(query), 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    return (
        <div className="relative w-full max-w-md hidden md:block font-sans">
            <div
                className={`flex items-center gap-3 bg-black/[0.03] dark:bg-[#161b22] border ${isOpen ? 'border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/5 dark:border-[#30363d]'} rounded-2xl px-5 py-2.5 transition-all`}
            >
                <Search
                    size={16}
                    className={isOpen ? 'text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-400 dark:text-[#8b949e]/40'}
                />
                <input
                    type="text"
                    placeholder="Search identity..."
                    className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-[0.2em] w-full text-gray-900 dark:text-[#c9d1d9] placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <LumaSpin
                        size="sm"
                    />
                )}
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl shadow-none overflow-hidden z-[100] p-2"
                    >
                        {results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    navigate(`/admin/products/${item.id}/edit`);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="w-full flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-[#0d1117] rounded-xl transition-all text-left"
                            >
                                <div className="h-10 w-10 rounded-lg bg-black/5 overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.images[0]}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-[#c9d1d9]">
                                        {item.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">
                                        {item.category?.name || 'Product'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarContent = ({ setOpen, isMobile }) => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { userRoles, performanceMode, setPerformanceMode } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all storage
        const storages = [sessionStorage, localStorage];
        storages.forEach((storage) => {
            storage.removeItem('admin_token');
            storage.removeItem('admin_user');
            storage.removeItem('user_roles');
            storage.removeItem('user_permissions');
            storage.removeItem('isAdmin');
        });
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
        { name: 'Admin Profile', to: '/admin/profile', icon: UserCircle },
        { name: 'Customer Profiles', to: '/admin/customer-profiles', icon: Users },
        { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
        { name: 'Altering Manager', to: '/admin/alterings', icon: Scissors },
        { name: 'Collections', to: '/admin/collections', icon: LayoutGrid },
        { name: 'Product Manager', to: '/admin/products', icon: ShoppingBag },
        { name: 'POS Products', to: '/admin/pos-products', icon: Package },
        { name: 'Promocodes', to: '/admin/promocodes', icon: Ticket },
        { name: 'Sales History', to: '/admin/sales-history', icon: History },
        { name: 'SEO Manager', to: '/admin/seo', icon: Search },
        { name: 'Gift Manager', to: '/admin/customize-gift', icon: Gift },
        { name: 'Inventory Manager', to: '/admin/inventory', icon: Package },
        { name: 'Newsletter', to: '/admin/newsletter', icon: Mail },
        { name: 'Audit Logs', to: '/admin/audit-logs', icon: History, restricted: true },
        { name: 'User Manager', to: '/admin/users', icon: Users, restricted: true }
    ];

    const isSuperAdmin = userRoles.includes('super-admin');
    const filteredNavItems = navItems.filter(
        (item) => !item.restricted || isSuperAdmin
    );

    return (
        <div className="flex flex-col w-[260px] bg-[#fdfdfc] dark:bg-[#0d1117] border-r border-black/[0.03] dark:border-[#30363d] shadow-none flex-shrink-0 h-full overflow-hidden transition-colors duration-300 font-sans">
            <div className="h-20 flex items-center justify-between px-8 border-b border-black/[0.03] dark:border-[#30363d]">
                <h1 className="text-[11px] font-black tracking-[0.5em] text-gray-900 dark:text-[#c9d1d9] uppercase whitespace-nowrap overflow-hidden opacity-40">
                    Alounge Admin
                </h1>
                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-300 dark:text-[#8b949e]/20 hover:text-gray-900 dark:hover:text-[#c9d1d9]"
                >
                    <ArrowLeftRight size={16} />
                </button>
            </div>
            
            <nav className="flex-grow p-5 space-y-1.5 mt-2 overflow-y-auto no-scrollbar">
                {filteredNavItems.map((item) => (
                    <NavItem key={item.name} item={item} isCollapsed={false} setOpen={setOpen} />
                ))}
            </nav>

            <div className="p-5 space-y-2 border-t border-black/[0.03] dark:border-[#30363d]">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => toggleDarkMode()}
                        className="flex items-center justify-center p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <button
                        onClick={() => setPerformanceMode(!performanceMode)}
                        className={`flex items-center justify-center p-3 rounded-lg transition-all ${performanceMode ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-400'}`}
                    >
                        <Zap size={14} />
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-red-500/5 text-red-400/60 hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                    <LogOut size={14} />
                    <span>Exit</span>
                </button>
            </div>
        </div>
    );
};

const Sidebar = ({ isOpen, setOpen, isDesktop }) => {
    return (
        <AnimatePresence mode="popLayout">
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-y-0 left-0 z-[100] flex-shrink-0 h-full overflow-hidden"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <SidebarContent setOpen={setOpen} isMobile={!isDesktop} />
                    </motion.div>

                    <motion.div
                        className="fixed inset-0 bg-black/60 dark:bg-black/70 z-[90]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    ></motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-close sidebar on resize transition instead
    useEffect(() => {
        setSidebarOpen(false);
    }, [isDesktop]);

    return (
        <AdminLayoutContent
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isDesktop={isDesktop}
        />
    );
};

const AdminLayoutContent = ({
    isSidebarOpen,
    setSidebarOpen,
    isDesktop
}) => {
    const { isEditing, performanceMode } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const currentOutlet = useOutlet();
    const [isSafariBrowser, setIsSafariBrowser] = useState(false);

    useEffect(() => {
        setIsSafariBrowser(isSafari());
    }, []);

    // Adjust sidebar based on editing state
    useEffect(() => {
        if (isEditing) {
            setSidebarOpen(false);
        }
    }, [isEditing, setSidebarOpen]);

    return (
        <div
            id="admin-root"
            className={`flex h-screen bg-[#fdfdfc] dark:bg-[#0d1117] font-sans text-gray-900 dark:text-[#c9d1d9] selection:bg-[#0d3542] selection:text-white transition-colors duration-300 relative ${performanceMode ? 'performance-mode' : ''}`}
        >
            {/* Unified Sidebar Overlay */}
            <Sidebar
                isOpen={!isEditing && isSidebarOpen}
                setOpen={setSidebarOpen}
                isDesktop={isDesktop}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!isEditing && (
                    <header className="h-16 bg-[#fdfdfc] dark:bg-[#0d1117] border-b border-black/15 dark:border-[#30363d] flex items-center px-6 justify-between flex-shrink-0 z-20 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-black/5 dark:hover:bg-[#21262d] rounded-xl text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-all active:scale-95"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <div className="h-4 w-px bg-black/10 dark:bg-[#30363d] mx-2 hidden lg:block" />
                            <GlobalSearch />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* POS Switcher Button */}
                             <button
                                onClick={() => navigate('/admin/pos')}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 border border-[#0d3542]/20 dark:border-[#58a6ff]/20 rounded-xl hover:bg-[#0d3542] dark:hover:bg-[#58a6ff] hover:text-white dark:hover:text-black transition-all group"
                                title="Open POS System"
                            >
                                <ArrowLeftRight size={14} className="text-[#0d3542] dark:text-[#58a6ff] group-hover:text-white dark:group-hover:text-black" />
                                <span className="text-xs font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] group-hover:text-white dark:group-hover:text-black hidden sm:block">Open POS</span>
                            </button>

                            <div className="h-4 w-px bg-black/10 dark:bg-[#30363d] mx-2" />

                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider leading-none mb-1">
                                    Administrator
                                </p>
                                <p className="text-[11px] text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.2em]">
                                    Master Access
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 border border-[#0d3542]/20 dark:border-[#58a6ff]/20 flex items-center justify-center">
                                <ShoppingBag
                                    size={14}
                                    className="text-[#0d3542] dark:text-[#58a6ff]"
                                />
                            </div>
                        </div>
                        {performanceMode && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d3542] dark:bg-[#58a6ff] z-30" title="Sovereign Sync Active" />
                        )}
                    </header>
                )}

                <main className="flex-1 overflow-y-auto relative p-6 bg-background dark:bg-[#0d1117] transition-colors duration-300">
                    <div className="relative z-10 w-full max-w-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={performanceMode ? { opacity: 0 } : { opacity: 0, y: -15 }}
                                transition={performanceMode ? { duration: 0 } : {
                                    duration: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {currentOutlet}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Removed CollectionManagerModal ✨

export default AdminLayout;
