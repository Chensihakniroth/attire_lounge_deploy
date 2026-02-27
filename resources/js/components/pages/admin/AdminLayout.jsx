import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Gift, LogOut, Menu, X, Package, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeProvider } from './ThemeContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ item, isCollapsed }) => {
// ... existing NavItem ...
// (I will use a more precise replacement for the layout structure)

    return (
        <motion.div whileHover={{ x: isCollapsed ? 0 : 5 }} whileTap={{ scale: 0.95 }}>
            <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                            ? 'bg-white/10 text-attire-accent'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.name : ''}
            >
                <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && <span>{item.name}</span>}
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

    const SidebarContent = () => (
        <div className={`flex flex-col w-full bg-[#0a0a0a] border-r border-white/5 flex-shrink-0 h-full overflow-hidden`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                <h1 className="text-sm font-bold tracking-[0.3em] text-white uppercase">Attire Lounge</h1>
                {isMobile && (
                    <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
                        <X size={20} />
                    </button>
                )}
            </div>
            <nav className="flex-grow p-4 space-y-2 mt-4">
                {navItems.map(item => <NavItem key={item.name} item={item} isCollapsed={false} />)}
            </nav>
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

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
    const { isEditing } = useAdmin();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        const adminRoot = document.getElementById('admin-root');
        if (adminRoot) {
            adminRoot.classList.add('dark');
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div id="admin-root" className="flex h-screen bg-[#050505] font-sans text-white selection:bg-attire-accent selection:text-black">
            {/* Desktop Sidebar with Motion */}
            <AnimatePresence initial={false}>
                {!isEditing && isDesktop && isSidebarVisible && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 256, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="hidden lg:block overflow-hidden h-full flex-shrink-0 bg-[#0a0a0a]"
                    >
                        <Sidebar isOpen={isMobileOpen} setOpen={setMobileOpen} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            {!isEditing && <Sidebar isMobile={true} isOpen={isMobileOpen} setOpen={setMobileOpen} />}
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!isEditing && (
                    <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 justify-between flex-shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        setMobileOpen(true);
                                    } else {
                                        setSidebarVisible(!isSidebarVisible);
                                    }
                                }} 
                                className="p-2 hover:bg-white/5 rounded-xl text-attire-silver hover:text-white transition-all active:scale-95"
                            >
                                <Menu size={20} />
                            </button>
                            <div className="h-4 w-px bg-white/10 mx-2 hidden lg:block" />
                            <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-attire-silver/60 hidden sm:block">
                                Styling House <span className="text-white/20 mx-2">/</span> <span className="text-white uppercase">Admin</span>
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none mb-1">Administrator</p>
                                <p className="text-[9px] text-attire-accent uppercase tracking-[0.2em]">Master Access</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center">
                                <ShoppingBag size={14} className="text-attire-accent" />
                            </div>
                        </div>
                    </header>
                )}

                <main className={`flex-1 overflow-y-auto relative ${isEditing ? 'p-0' : 'p-6 md:p-10'}`}>
                    {/* Background decoration - only show when not editing for cleaner focus */}
                    {!isEditing && (
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

export default AdminLayout;
