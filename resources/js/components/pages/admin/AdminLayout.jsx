import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, ImageIcon, Calendar, Gift, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
        { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
        { name: 'Gift Requests', to: '/admin/customize-gift', icon: Gift },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
            }
            onClick={() => setSidebarOpen(false)} // Close sidebar on nav item click
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.name}</span>
        </NavLink>
    );

    const Sidebar = () => (
        <>
            {/* Sidebar for Desktop */}
            <div className="hidden lg:flex lg:flex-col w-64 bg-gray-900 text-white flex-shrink-0">
                <div className="h-20 flex items-center justify-center px-4 border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-wider">ATTIRE LOUNGE</h1>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => <NavItem key={item.name} item={item} />)}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Sidebar for Mobile */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden will-change-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-between px-4 border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-wider">ATTIRE LOUNGE</h1>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => <NavItem key={item.name} item={item} />)}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black z-30 lg:hidden transition-opacity duration-300 ease-in-out ${isSidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none">
                        <Menu size={24} />
                    </button>
                    <div className="flex-grow text-center">
                        <h1 className="text-lg font-semibold">Admin Panel</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
