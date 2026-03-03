import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, 
    User, TrendingUp, Package, ShoppingBag, Plus, Users, 
    Activity, ShieldCheck, Briefcase, UserPlus, Zap, Info
} from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import axios from 'axios';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StatCard = ({ icon, title, value, link, loading, highlight = false }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-black/20 p-8 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 space-y-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            variants={cardVariants} 
            className={`group relative bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-black/[0.02] border transition-all duration-500 ${
                highlight 
                    ? 'border-attire-accent/40 bg-attire-accent/[0.02] dark:bg-attire-accent/[0.05]' 
                    : 'border-black/5 dark:border-white/10 hover:border-attire-accent/30'
            }`}
        >
            <div className="flex justify-between items-start">
                <div className={`flex items-center justify-center h-14 w-14 rounded-2xl transition-colors border ${
                    highlight 
                        ? 'bg-attire-accent/20 border-attire-accent/30 text-attire-accent' 
                        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent group-hover:border-attire-accent/20'
                }`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                {link && (
                    <Link to={link} className="p-2 text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <ArrowRight size={18} />
                    </Link>
                )}
            </div>
            <div className="mt-6">
                <p className={`text-4xl font-serif tracking-tight transition-colors ${highlight ? 'text-attire-accent' : 'text-gray-900 dark:text-white'}`}>
                    {value}
                </p>
                <p className="text-[10px] font-black text-gray-400 dark:text-attire-silver/40 mt-2 uppercase tracking-[0.2em]">{title}</p>
            </div>
        </motion.div>
    );
};

const MultiTrendChart = ({ data, activeKey = 'appointments' }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    
    if (!data || data.length === 0) return null;

    const keys = ['appointments', 'customers'];
    const maxValRaw = Math.max(...data.flatMap(d => [d.appointments, d.customers]), 1);
    // Round up maxVal to a nice interval (e.g., 10, 20, 50)
    const maxVal = Math.ceil(maxValRaw / 5) * 5 + 5;
    
    const height = 220;
    const width = 800;
    const paddingX = 60;
    const paddingY = 40;
    const chartHeight = height - paddingY * 2;
    const chartWidth = width - paddingX * 2;
    
    const getPoints = (key) => data.map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth + paddingX;
        const y = height - ((d[key] / maxVal) * chartHeight + paddingY);
        return { x, y, value: d[key] };
    });

    const handleMouseMove = (e) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        // Find closest point index
        const index = Math.round(((mouseX - paddingX) / chartWidth) * (data.length - 1));
        if (index >= 0 && index < data.length) {
            setHoveredIndex(index);
            const xPos = (index / (data.length - 1)) * chartWidth + paddingX;
            setTooltipPos({ x: xPos, y: e.clientY - rect.top });
        }
    };

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
        <div className="mt-4 relative group/chart">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-attire-accent" />
                    <p className="text-[10px] font-black text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.3em]">Growth Intelligence</p>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-all ${activeKey === 'appointments' ? 'bg-attire-accent shadow-[0_0_10px_rgba(245,168,28,0.5)]' : 'bg-gray-300 dark:bg-white/10 opacity-30'}`} />
                        <span className={`text-[9px] uppercase font-black tracking-widest ${activeKey === 'appointments' ? 'text-gray-900 dark:text-white' : 'text-gray-400 opacity-40'}`}>Consultations</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-all ${activeKey === 'customers' ? 'bg-attire-accent shadow-[0_0_10px_rgba(245,168,28,0.5)]' : 'bg-gray-300 dark:bg-white/10 opacity-30'}`} />
                        <span className={`text-[9px] uppercase font-black tracking-widest ${activeKey === 'customers' ? 'text-gray-900 dark:text-white' : 'text-gray-400 opacity-40'}`}>Registry Growth</span>
                    </div>
                </div>
            </div>
            
            <div className="relative">
                <svg 
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-full overflow-visible cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f5a81c" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#f5a81c" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Horizontal Grid Lines & Y-Axis Labels */}
                    {gridLines.map((line, i) => {
                        const y = height - (line * chartHeight + paddingY);
                        const val = Math.round(line * maxVal);
                        return (
                            <g key={i}>
                                <line 
                                    x1={paddingX} 
                                    y1={y} 
                                    x2={width - paddingX} 
                                    y2={y} 
                                    className="stroke-black/[0.03] dark:stroke-white/[0.03]" 
                                    strokeDasharray="4 4"
                                />
                                <text 
                                    x={paddingX - 15} 
                                    y={y + 4} 
                                    className="fill-gray-400 dark:fill-white/10 text-[9px] font-mono font-bold text-right"
                                    textAnchor="end"
                                >
                                    {val}
                                </text>
                            </g>
                        );
                    })}

                    {/* Hover Guide Line */}
                    {hoveredIndex !== null && (
                        <line 
                            x1={getPoints(activeKey)[hoveredIndex].x}
                            y1={paddingY}
                            x2={getPoints(activeKey)[hoveredIndex].x}
                            y2={height - paddingY}
                            className="stroke-attire-accent opacity-20"
                            strokeWidth="1"
                        />
                    )}

                    {keys.map(key => {
                        const points = getPoints(key);
                        const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                        const isActive = activeKey === key;

                        return (
                            <g key={key}>
                                {isActive && (
                                    <path
                                        d={`${pathData} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`}
                                        fill="url(#activeGradient)"
                                        className="transition-all duration-1000"
                                    />
                                )}
                                <motion.path
                                    d={pathData}
                                    fill="none"
                                    stroke={isActive ? "#f5a81c" : "currentColor"}
                                    strokeWidth={isActive ? "3" : "1"}
                                    className={`transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_8px_rgba(245,168,28,0.3)]' : 'text-gray-300 dark:text-white/5'}`}
                                    initial={false}
                                    animate={{ 
                                        strokeOpacity: isActive ? 1 : 0.2,
                                    }}
                                />
                                
                                {/* Always show points for active key */}
                                {isActive && points.map((p, i) => (
                                    <motion.circle
                                        key={`${key}-${i}`}
                                        cx={p.x}
                                        cy={p.y}
                                        r={hoveredIndex === i ? "6" : "4"}
                                        className="fill-white dark:fill-black stroke-attire-accent stroke-[2.5] transition-all duration-300"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    />
                                ))}
                            </g>
                        );
                    })}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-6 px-[60px] border-t border-black/5 dark:border-white/5 pt-4">
                    {data.map((d, i) => (
                        <span key={i} className={`text-[9px] font-mono uppercase font-bold transition-colors ${hoveredIndex === i ? 'text-attire-accent' : 'text-gray-400 dark:text-attire-silver/20'}`}>
                            {d.name}
                        </span>
                    ))}
                </div>

                {/* Rich Tooltip ✨ */}
                <AnimatePresence>
                    {hoveredIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute z-[100] pointer-events-none"
                            style={{ 
                                left: getPoints(activeKey)[hoveredIndex].x,
                                top: paddingY - 10,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <div className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl min-w-[160px] space-y-3">
                                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{data[hoveredIndex].name} 2026</span>
                                    <Calendar size={10} className="text-attire-accent" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-white/40 uppercase">Consults</span>
                                        </div>
                                        <span className="text-xs font-mono font-black text-gray-900 dark:text-white">{data[hoveredIndex].appointments}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-attire-accent" />
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-white/40 uppercase">Clients</span>
                                        </div>
                                        <span className="text-xs font-mono font-black text-gray-900 dark:text-white">{data[hoveredIndex].customers}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ActivityItem = ({ item, type }) => (
    <motion.li 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 last:border-0 rounded-2xl 
                   transition duration-200 ease-out hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group"
    >
        <div className="flex items-center space-x-4">
            <div className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors ${
                type === 'customer' 
                    ? 'bg-attire-accent/10 border-attire-accent/20 text-attire-accent' 
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-400 group-hover:text-attire-accent'
            }`}>
                {type === 'customer' ? <UserPlus size={18} /> : <Calendar size={18} />}
            </div>
            <div>
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors text-[13px] uppercase tracking-wide">{item.name}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/20">
                    {type === 'customer' ? `${item.nationality || 'Cambodian'} • ${item.client_status}` : item.service}
                </p>
            </div>
        </div>
        <div className="text-[10px] font-mono text-gray-400 dark:text-attire-silver/50 flex items-center bg-black/5 dark:bg-black/20 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">
            <Clock size={10} className="mr-2" />
            <span>{new Date(item.created_at || item.date).toLocaleDateString()}</span>
        </div>
    </motion.li>
);

const QuickAction = ({ icon, title, description, link }) => (
    <Link to={link} className="block">
        <div className="flex items-center gap-4 p-4 bg-black/[0.02] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-attire-accent/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-black/[0.02]">
            <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 group-hover:border-attire-accent/20 transition-colors">
                {React.cloneElement(icon, { size: 18, className: "text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" })}
            </div>
            <div className="flex-grow">
                <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</p>
                <p className="text-[9px] text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest font-medium">{description}</p>
            </div>
            <ArrowRight size={12} className="text-gray-300 dark:text-white/20 group-hover:text-attire-accent group-hover:translate-x-1 transition-all" />
        </div>
    </Link>
);

const AdminDashboard = () => {
    const { 
        appointments, 
        appointmentsLoading, 
        fetchAppointments,
        stats,
        fetchStats
    } = useAdmin();

    const [dashboardMode, setDashboardMode] = useState('services'); // 'services' or 'registry'
    const [recentCustomers, setRecentCustomers] = useState([]);
    const [customersLoading, setCustomersCustomersLoading] = useState(false);

    useEffect(() => {
        fetchAppointments();
        fetchStats();
    }, [fetchAppointments, fetchStats]);

    // Fetch recent customers when mode switches to registry
    useEffect(() => {
        if (dashboardMode === 'registry') {
            const fetchRecentClients = async () => {
                setCustomersCustomersLoading(true);
                try {
                    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                    const res = await axios.get('/api/v1/admin/customer-profiles?per_page=5', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setRecentCustomers(res.data.data);
                } catch (error) {
                    console.error('Error fetching recent clients:', error);
                } finally {
                    setCustomersCustomersLoading(false);
                }
            };
            fetchRecentClients();
        }
    }, [dashboardMode]);

    const displayItems = dashboardMode === 'services' ? appointments.slice(0, 5) : recentCustomers;
    const isLoadingActivity = dashboardMode === 'services' ? (appointmentsLoading && appointments.length === 0) : customersLoading;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <ErrorBoundary>
            <motion.div 
                className="space-y-10 pb-24 font-sans"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Dashboard Header */}
                <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2 tracking-tight">Intelligence</h1>
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-px bg-attire-accent/40" />
                            <p className="text-gray-400 dark:text-attire-silver text-[10px] font-black uppercase tracking-[0.4em]">Performance Command Center</p>
                        </div>
                    </div>

                    {/* Dashboard Global Mode Switcher ✨ */}
                    <div className="flex gap-2 p-1.5 bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl shadow-xl shadow-black/[0.02]">
                        <button
                            onClick={() => setDashboardMode('services')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                dashboardMode === 'services' 
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Calendar size={14} />
                            <span>Services</span>
                        </button>
                        <button
                            onClick={() => setDashboardMode('registry')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                dashboardMode === 'registry' 
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Users size={14} />
                            <span>Registry</span>
                        </button>
                    </div>
                </motion.div>

                {/* Key Metrics */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    <StatCard 
                        icon={<Calendar />} 
                        title="Appointments" 
                        value={stats.appointments} 
                        link="/admin/appointments" 
                        loading={appointmentsLoading && appointments.length === 0}
                        highlight={dashboardMode === 'services'}
                    />
                    <StatCard 
                        icon={<Users />} 
                        title="Total Clients" 
                        value={stats.total_customers} 
                        link="/admin/customer-profiles" 
                        loading={appointmentsLoading && appointments.length === 0}
                        highlight={dashboardMode === 'registry'}
                    />
                    <StatCard icon={<ShoppingBag />} title="Total Products" value={stats.products} link="/admin/products" loading={appointmentsLoading && appointments.length === 0} />
                    <StatCard icon={<TrendingUp />} title="Subscribers" value={stats.subscribers} link="/admin/newsletter" loading={appointmentsLoading && appointments.length === 0} />
                </motion.div>

                {/* Growth Trends Section */}
                <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 relative">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-attire-accent/10 rounded-2xl text-attire-accent">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Growth Trend</h2>
                                <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">6-month performance</p>
                            </div>
                        </div>

                        {/* Local Card Switcher ✨ */}
                        <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                            <button
                                onClick={() => setDashboardMode('services')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    dashboardMode === 'services' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                Consults
                            </button>
                            <button
                                onClick={() => setDashboardMode('registry')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    dashboardMode === 'registry' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                Clients
                            </button>
                        </div>
                    </div>

                    <MultiTrendChart 
                        data={stats.trends} 
                        activeKey={dashboardMode === 'services' ? 'appointments' : 'customers'} 
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Adaptive Activity Feed */}
                    <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-colors ${dashboardMode === 'services' ? 'bg-blue-500/10 text-blue-500' : 'bg-attire-accent/10 text-attire-accent'}`}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">
                                        {dashboardMode === 'services' ? 'Recent Journal' : 'Registry Entries'}
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Latest system events</p>
                                </div>
                            </div>
                            <Link 
                                to={dashboardMode === 'services' ? "/admin/appointments" : "/admin/customer-profiles"} 
                                className="text-[10px] font-black text-attire-accent hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.3em] bg-attire-accent/5 px-5 py-2.5 rounded-xl border border-attire-accent/10"
                            >
                                View All
                            </Link>
                        </div>
                        
                        {isLoadingActivity ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                            </div>
                        ) : displayItems.length > 0 ? (
                            <motion.ul 
                                key={dashboardMode}
                                className="space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                variants={containerVariants}
                            >
                                {displayItems.map(item => (
                                    <ActivityItem 
                                        key={item.id} 
                                        item={item} 
                                        type={dashboardMode === 'services' ? 'appointment' : 'customer'} 
                                    />
                                ))}
                            </motion.ul>
                        ) : (
                            <div className="text-center py-24 bg-black/[0.01] rounded-[2.5rem] border border-dashed border-black/5 dark:border-white/5">
                                <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 dark:border-white/5">
                                    <Clock className="text-gray-400 dark:text-attire-silver/20" size={32} />
                                </div>
                                <p className="text-gray-400 dark:text-attire-silver/40 text-[11px] font-black uppercase tracking-[0.3em] italic">No recent activity detected.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Access Sidebar */}
                    <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 flex flex-col">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Terminals</h2>
                                <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Direct access</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 flex-grow">
                            <QuickAction icon={<Users />} title="Client Registry" description="Manage Dossiers" link="/admin/customer-profiles" />
                            <QuickAction icon={<Package />} title="Product Library" description="Curate Collections" link="/admin/products" />
                            <QuickAction icon={<Plus />} title="New Masterpiece" description="Registry Entry" link="/admin/products/new" />
                            <QuickAction icon={<Calendar />} title="Appointment Board" description="Consultations" link="/admin/appointments" />
                            <QuickAction icon={<Gift />} title="Gift Requests" description="Custom Curation" link="/admin/customize-gift" />
                            
                            <div className="mt-10 pt-10 border-t border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6 text-gray-400 dark:text-white/20">
                                    <AlertTriangle size={14} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Priority Alerts</p>
                                </div>
                                <div className="p-6 bg-yellow-500/5 dark:bg-yellow-400/5 rounded-[2.5rem] border border-yellow-500/10 dark:border-yellow-400/10 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-serif text-gray-900 dark:text-white leading-none">{stats.pending_appointments}</span>
                                            <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-3">Pending</span>
                                        </div>
                                        <Link to="/admin/appointments" className="p-3 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20">
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                    <p className="text-[9px] font-bold text-yellow-600/60 dark:text-yellow-400/40 uppercase tracking-widest mt-3">Awaiting response</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
