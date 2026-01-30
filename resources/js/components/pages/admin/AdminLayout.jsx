import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Gift, LogOut, Menu, X } from 'lucide-react';
import { ThemeProvider } from './ThemeContext';
import { AdminProvider } from './AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ item }) => {
    return (
        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
            <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`
                }
            >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
            </NavLink>
        </motion.div>
    );
};

const Sidebar = ({ isOpen, setOpen }) => {
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
        { name: 'Gift Requests', to: '/admin/customize-gift', icon: Gift },
    ];

    const SidebarContent = () => (
        <div 
            className="flex flex-col w-64 bg-gray-800 flex-shrink-0 h-full"
        >
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-700">
                <h1 className="text-xl font-bold tracking-wider text-white">ATTIRE LOUNGE</h1>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white lg:hidden">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {navItems.map(item => <NavItem key={item.name} item={item} />)}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Sidebar for Desktop */}
            <div className="hidden lg:block h-full">
                <SidebarContent />
            </div>

            {/* Sidebar for Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            className={`fixed inset-y-0 left-0 z-40 transform lg:hidden`}
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <SidebarContent />
                        </motion.div>

                        {/* Overlay */}
                        <motion.div
                            className={`fixed inset-0 bg-black z-30 lg:hidden`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        ></motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const adminRoot = document.getElementById('admin-root');
        if (adminRoot) {
            adminRoot.classList.add('dark');
        }
    }, []);

    return (
        <ThemeProvider>
            <AdminProvider>
                <div id="admin-root" className="flex h-screen bg-gray-900 font-sans">
                    <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
                    
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between flex-shrink-0">
                            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 focus:outline-none lg:hidden">
                                <Menu size={24} />
                            </button>
                            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
                        </header>
                        <main className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Outlet />
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </div>
            </AdminProvider>
        </ThemeProvider>
    );
};

export default AdminLayout;
