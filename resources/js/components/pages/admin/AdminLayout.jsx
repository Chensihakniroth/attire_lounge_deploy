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
    Loader,
    History,
    Users,
    Mail,
    Search,
    UserCircle,
    LayoutGrid,
    Scissors,
    Ticket,
} from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { isSafari } from '../../../helpers/browserUtils';

const NavItem = ({ item, isCollapsed, setOpen }) => {
    return (
        <motion.div
            whileHover={{ x: isCollapsed ? 0 : 4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            <NavLink
                to={item.to}
                end={item.to === '/admin'}
                onClick={() => setOpen && setOpen(false)}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                        isActive
                            ? 'bg-black dark:bg-white/10 text-white dark:text-attire-accent shadow-lg shadow-black/5 dark:shadow-none'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.name : ''}
            >
                <item.icon
                    className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
                />
                {!isCollapsed && (
                    <span className="text-[11px] whitespace-nowrap overflow-hidden">
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
                className={`flex items-center gap-3 bg-black/[0.03] dark:bg-white/[0.03] border ${isOpen ? 'border-attire-accent' : 'border-black/5 dark:border-white/5'} rounded-2xl px-5 py-2.5 transition-all`}
            >
                <Search
                    size={16}
                    className={isOpen ? 'text-attire-accent' : 'text-gray-400'}
                />
                <input
                    type="text"
                    placeholder="Search identity..."
                    className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest w-full text-gray-900 dark:text-white placeholder:text-gray-400"
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <Loader
                        size={12}
                        className="animate-spin text-attire-accent"
                    />
                )}
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] p-2"
                    >
                        {results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    navigate(`/admin/products/${item.id}/edit`);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="w-full flex items-center gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-left"
                            >
                                <div className="h-10 w-10 rounded-lg bg-black/5 overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.images[0]}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                        {item.name}
                                    </p>
                                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">
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
    const { userRoles } = useAdmin();
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
        { name: 'My Profile', to: '/admin/profile', icon: UserCircle },
        {
            name: 'Customer Profiles',
            to: '/admin/customer-profiles',
            icon: Users,
        },
        { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
        { name: 'Alterings', to: '/admin/alterings', icon: Scissors },
        { name: 'Collections', to: '/admin/collections', icon: LayoutGrid },
        { name: 'Products', to: '/admin/products', icon: ShoppingBag },
        { name: 'Promocodes', to: '/admin/promocodes', icon: Ticket },
        { name: 'SEO Suite', to: '/admin/seo', icon: Search },
        { name: 'Gift Requests', to: '/admin/customize-gift', icon: Gift },
        { name: 'Gift Inventory', to: '/admin/inventory', icon: Package },
        { name: 'Newsletter', to: '/admin/newsletter', icon: Mail },
        {
            name: 'Audit Logs',
            to: '/admin/audit-logs',
            icon: History,
            restricted: true,
        },
        {
            name: 'Team Access',
            to: '/admin/users',
            icon: Users,
            restricted: true,
        },
    ];

    const isSuperAdmin = userRoles.includes('super-admin');
    const filteredNavItems = navItems.filter(
        (item) => !item.restricted || isSuperAdmin
    );

    return (
        <div className="flex flex-col w-[280px] bg-white dark:bg-[#0a0a0a] border-r border-black/5 dark:border-white/5 flex-shrink-0 h-full overflow-hidden transition-colors duration-300 font-sans">
            <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5">
                <h1 className="text-sm font-bold tracking-[0.3em] text-gray-900 dark:text-white uppercase whitespace-nowrap overflow-hidden">
                    Attire Lounge
                </h1>
                <button
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>
            <nav className="flex-grow p-4 space-y-2 mt-4 overflow-y-auto attire-scrollbar">
                {filteredNavItems.map((item) => (
                    <NavItem key={item.name} item={item} isCollapsed={false} setOpen={setOpen} />
                ))}
            </nav>
            <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-2">
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    {isDarkMode ? (
                        <>
                            <Sun className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="text-[10px] whitespace-nowrap overflow-hidden">
                                Light Mode
                            </span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="text-[10px] whitespace-nowrap overflow-hidden">
                                Dark Mode
                            </span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-[10px] whitespace-nowrap overflow-hidden">
                        Logout
                    </span>
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
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[90]"
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
    const { isEditing } = useAdmin();
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
            className="flex h-screen bg-gray-50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-attire-accent selection:text-black transition-colors duration-300 relative"
        >
            {/* Unified Sidebar Overlay */}
            <Sidebar
                isOpen={!isEditing && isSidebarOpen}
                setOpen={setSidebarOpen}
                isDesktop={isDesktop}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!isEditing && (
                    <header className="h-16 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center px-6 justify-between flex-shrink-0 z-20 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-500 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-2 hidden lg:block" />
                            <GlobalSearch />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider leading-none mb-1">
                                    Administrator
                                </p>
                                <p className="text-[9px] text-attire-accent uppercase tracking-[0.2em]">
                                    Master Access
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center">
                                <ShoppingBag
                                    size={14}
                                    className="text-attire-accent"
                                />
                            </div>
                        </div>
                    </header>
                )}

                <main
                    className={`flex-1 overflow-y-auto relative ${isEditing ? 'p-0' : 'p-6 md:p-10'}`}
                >
                    {/* Background decoration */}
                    {!isSafariBrowser && !isEditing && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-attire-accent/10 blur-[120px] rounded-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] rounded-full" />
                        </div>
                    )}

                    <div
                        className={`relative z-10 w-full ${isEditing ? 'max-w-none' : 'max-w-7xl mx-auto'}`}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{
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
