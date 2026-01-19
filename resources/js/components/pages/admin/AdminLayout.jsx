import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, ImageIcon, Calendar, Gift, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
        { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
        { name: 'Gift Requests', to: '/admin/customize-gift', icon: Gift },
        { name: 'Image Manager', to: '/admin/image-manager', icon: ImageIcon },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.to}
            end={item.to === '/admin'} // Use 'end' for the Dashboard link only
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
            }
        >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.name}</span>
        </NavLink>
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
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
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


export default AdminLayout;
