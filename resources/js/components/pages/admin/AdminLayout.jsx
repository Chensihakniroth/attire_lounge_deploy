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
    ZapOff,
    BarChart2,
    Store,
    ChevronDown,
    Coffee,
    Footprints
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { ThemeProvider, useTheme } from './ThemeContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { isSafari } from '../../../helpers/browserUtils';
import ModernModal from '../../common/ModernModal';

const NavItem = ({ item, isCollapsed, setOpen }) => {
    return (
        <div className="group/nav">
            <NavLink
                to={item.to}
                end={item.to === '/admin'}
                onClick={() => setOpen && setOpen(false)}
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg transition-colors duration-200 ${isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center px-2' : ''} active:scale-[0.98] transform group-hover/nav:translate-x-1 transition-transform`
                }
                title={isCollapsed ? item.name : ''}
            >
                <item.icon
                    className={`w-4 h-4 ${isCollapsed ? '' : 'mr-4'} transition-transform duration-300 flex-shrink-0 opacity-80`}
                />
                {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden">
                        {item.name}
                    </span>
                )}
            </NavLink>
        </div>
    );
};


const OutletSwitcher = () => {
    const { activeOutlet, setActiveOutlet, OUTLET_CONFIG } = useAdmin();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const current = OUTLET_CONFIG[activeOutlet];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all group"
            >
                <div
                    className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-white/20"
                    style={{ backgroundColor: current.color }}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white hidden sm:block">
                    {current.label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white sm:hidden">
                    {current.shortLabel}
                </span>
                <ChevronDown size={12} className={`text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[90]"
                            onClick={() => setIsOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] p-1.5"
                        >
                            <div className="px-3 py-2 mb-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Switch Outlet</p>
                            </div>
                            {Object.entries(OUTLET_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setActiveOutlet(key);
                                        setIsOpen(false);
                                        navigate('/admin');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeOutlet === key
                                            ? 'bg-white/15 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activeOutlet === key ? 'ring-2 ring-white/40' : ''
                                            }`}
                                        style={{ backgroundColor: config.color }}
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                                        {config.label}
                                    </span>
                                    {activeOutlet === key && (
                                        <Check size={12} className="ml-auto text-white/60" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarContent = ({ setOpen, isMobile }) => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { userRoles, performanceMode, setPerformanceMode, activeOutlet, OUTLET_CONFIG, logout } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
        { name: 'Admin Profile', to: '/admin/profile', icon: UserCircle },
        { name: 'Customer Profiles', to: '/admin/customer-profiles', icon: Users, outlets: ['attire_lounge'] },
        { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
        { name: 'Altering Manager', to: '/admin/alterings', icon: Scissors, outlets: ['attire_lounge'] },
        { name: 'Collections', to: '/admin/collections', icon: LayoutGrid, outlets: ['attire_lounge'] },
        { name: 'Product Manager', to: '/admin/products', icon: ShoppingBag, outlets: ['attire_lounge'] },
        { name: 'POS Products', to: '/admin/pos-products', icon: Package, outlets: ['attire_lounge'] },
        { name: 'Drink Manager', to: '/admin/drink-manager', icon: Coffee, outlets: ['caffeine', 'kravat'] },
        { name: 'Shoe Manager', to: '/admin/shoe-manager', icon: Footprints, outlets: ['nile'] },
        { name: 'Order Manager', to: '/admin/order-manager', icon: ShoppingBag, outlets: ['nile'] },
        { name: 'Promocodes', to: '/admin/promocodes', icon: Ticket },
        { name: 'Sales History', to: '/admin/sales-history', icon: History },
        { name: 'Daily Report', to: '/admin/daily-report', icon: BarChart2 },
        { name: 'SEO Manager', to: '/admin/seo', icon: Search },
        { name: 'Gift Manager', to: '/admin/customize-gift', icon: Gift, outlets: ['attire_lounge'] },
        { name: 'Inventory Manager', to: '/admin/inventory', icon: Package, outlets: ['attire_lounge'] },
        { name: 'Newsletter', to: '/admin/newsletter', icon: Mail, outlets: ['attire_lounge'] },
        { name: 'Audit Logs', to: '/admin/audit-logs', icon: History, restricted: true },
        { name: 'User Manager', to: '/admin/users', icon: Users, restricted: true }
    ];

    const isSuperAdmin = userRoles.includes('super-admin');
    const filteredNavItems = navItems.filter((item) => {
        // Role-based filter
        if (item.restricted && !isSuperAdmin) return false;
        // Outlet-based filter — if `outlets` is defined, only show for those outlets
        if (item.outlets && !item.outlets.includes(activeOutlet)) return false;
        return true;
    });

    return (
        <div className="flex flex-col w-[260px] bg-attire-navy border-r border-white/5 shadow-none flex-shrink-0 h-full overflow-hidden transition-colors duration-300 font-sans">
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5">
                <h1 className="text-[11px] font-black tracking-[0.5em] text-white uppercase whitespace-nowrap overflow-hidden opacity-90">
                    {OUTLET_CONFIG[activeOutlet]?.label || 'Admin'}
                </h1>
                {isMobile && (
                    <button
                        onClick={() => setOpen(false)}
                        className="text-white/40 hover:text-white"
                    >
                        <ArrowLeftRight size={16} />
                    </button>
                )}
            </div>

            <nav className="flex-grow p-5 space-y-1.5 mt-2 overflow-y-auto no-scrollbar">
                {filteredNavItems.map((item) => (
                    <NavItem key={item.name} item={item} isCollapsed={false} setOpen={setOpen} />
                ))}
            </nav>

            <div className="p-5 space-y-2 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => toggleDarkMode()}
                        className="flex items-center justify-center p-3 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <button
                        onClick={() => setPerformanceMode(!performanceMode)}
                        className={`flex items-center justify-center p-3 rounded-lg transition-all ${performanceMode ? 'bg-white text-attire-navy' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                    >
                        <Zap size={14} />
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
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
    const { isEditing, setIsEditing, performanceMode, activeOutlet, OUTLET_CONFIG } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const currentOutlet = useOutlet();
    const [isSafariBrowser, setIsSafariBrowser] = useState(false);
    const [showPOSWarning, setShowPOSWarning] = useState(false);

    useEffect(() => {
        setIsSafariBrowser(isSafari());
    }, []);

    // Adjust sidebar based on editing state
    useEffect(() => {
        if (isEditing) {
            setSidebarOpen(false);
        }
    }, [isEditing, setSidebarOpen]);

    const handlePOSSwitch = () => {
        if (isEditing) {
            setShowPOSWarning(true);
        } else {
            navigate('/admin/pos');
        }
    };

    return (
        <div
            id="admin-root"
            className={`flex h-screen bg-[#fdfdfc] dark:bg-[#0d1117] font-sans text-gray-900 dark:text-[#c9d1d9] selection:bg-[#0d3542] selection:text-white transition-colors duration-300 relative ${performanceMode ? 'performance-mode' : ''}`}
        >
            {/* Warning Modal */}
            <ModernModal
                isOpen={showPOSWarning}
                onClose={() => setShowPOSWarning(false)}
                title="Discard Unsaved Changes?"
                maxWidth="max-w-md"
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unsaved Progress Detected</p>
                            <p className="text-xs text-gray-500 dark:text-[#8b949e] leading-relaxed">
                                You are currently editing a record. Switching to the POS system will discard your unsaved changes.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={() => setShowPOSWarning(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#8b949e] text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                        >
                            Stay in Admin
                        </button>
                        <button
                            onClick={() => {
                                setShowPOSWarning(false);
                                setIsEditing(false); // Clear editing state
                                navigate('/admin/pos');
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                        >
                            Yes, Discard
                        </button>
                    </div>
                </div>
            </ModernModal>

            {/* Unified Sidebar Overlay */}
            {isDesktop ? (
                !isEditing && <SidebarContent setOpen={setSidebarOpen} isMobile={false} />
            ) : (
                <Sidebar
                    isOpen={!isEditing && isSidebarOpen}
                    setOpen={setSidebarOpen}
                    isDesktop={isDesktop}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!isEditing && (
                    <header className="h-16 bg-attire-navy border-b border-white/10 flex items-center px-6 justify-between flex-shrink-0 z-20 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all active:scale-95 lg:hidden"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <div className="h-4 w-px bg-white/20 mx-2 hidden lg:block" />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* POS Switcher Button */}
                            <button
                                onClick={handlePOSSwitch}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white hover:text-attire-navy transition-all group"
                                title="Open POS System"
                            >
                                <ArrowLeftRight size={14} className="text-white group-hover:text-attire-navy" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-attire-navy hidden sm:block">Open POS</span>
                            </button>

                            <div className="h-4 w-px bg-white/20 mx-1" />

                            {/* Outlet Switcher */}
                            <OutletSwitcher />

                            <div className="h-4 w-px bg-white/20 mx-2" />

                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-white uppercase tracking-wider leading-none mb-1">
                                    Administrator
                                </p>
                                <p className="text-[11px] text-white/60 uppercase tracking-[0.2em]">
                                    {OUTLET_CONFIG[activeOutlet]?.label || 'Master Access'}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                <ShoppingBag
                                    size={14}
                                    className="text-white"
                                />
                            </div>
                        </div>
                        {performanceMode && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-30" title="Sovereign Sync Active" />
                        )}
                    </header>
                )}

                <main className="flex-1 overflow-y-auto relative p-6 bg-background dark:bg-[#0d1117]">
                    <div className="relative z-10 w-full max-w-none">
                        <React.Suspense fallback={
                            <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
                                <LumaSpin size="lg" />
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Loading Module...</p>
                            </div>
                        }>
                            {currentOutlet}
                        </React.Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Removed CollectionManagerModal ✨

export default AdminLayout;
