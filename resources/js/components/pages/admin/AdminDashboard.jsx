import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, 
    User, TrendingUp, Package, ShoppingBag, Plus, Users, 
    Activity, ShieldCheck, Briefcase, UserPlus, Zap, Info, PieChart as PieIcon, BarChart
} from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const StatCard = ({ icon, title, value, link, loading, highlight = false }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-black/20 p-8 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 space-y-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-4 w-3/4" /></div>
            </div>
        );
    }
    return (
        <motion.div variants={cardVariants} className={`group relative bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-black/[0.02] border transition-all duration-500 ${highlight ? 'border-attire-accent/40 bg-attire-accent/[0.02] dark:bg-attire-accent/[0.05]' : 'border-black/5 dark:border-white/10 hover:border-attire-accent/30'}`}>
            <div className="flex justify-between items-start">
                <div className={`flex items-center justify-center h-14 w-14 rounded-2xl transition-colors border ${highlight ? 'bg-attire-accent/20 border-attire-accent/30 text-attire-accent' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent group-hover:border-attire-accent/20'}`}>{React.cloneElement(icon, { size: 24 })}</div>
                {link && <Link to={link} className="p-2 text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><ArrowRight size={18} /></Link>}
            </div>
            <div className="mt-6">
                <p className={`text-4xl font-serif tracking-tight transition-colors ${highlight ? 'text-attire-accent' : 'text-gray-900 dark:text-white'}`}>{value}</p>
                <p className="text-[10px] font-black text-gray-400 dark:text-attire-silver/40 mt-2 uppercase tracking-[0.2em]">{title}</p>
            </div>
        </motion.div>
    );
};

const GlassyStatCard = ({ label, value, trend, icon: Icon, color = "attire-accent" }) => (
    <motion.div 
        variants={cardVariants}
        className="relative overflow-hidden group p-6 rounded-[2.5rem] bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:border-attire-accent/30 transition-all duration-500 shadow-xl shadow-black/[0.02]"
    >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-attire-accent/5 rounded-full blur-3xl group-hover:bg-attire-accent/10 transition-all duration-700" />
        
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    <TrendingUp size={10} />
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        
        <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">{value}</p>
    </motion.div>
);

const MultiTrendChart = ({ data, activeKey = 'appointments', timeframe = 'month' }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!data || data.length === 0) return (
        <div className="h-[300px] flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Gathering Intel...</p>
        </div>
    );

    const keys = ['appointments', 'customers'];
    const maxValRaw = Math.max(...data.flatMap(d => [d.appointments, d.customers]), 1);
    const maxVal = maxValRaw > 10 ? Math.ceil(maxValRaw * 1.1) : maxValRaw + 2;
    
    const height = 300; 
    const width = 800;
    const paddingX = 60;
    const paddingY = 40;
    const chartHeight = height - paddingY * 2;
    const chartWidth = width - paddingX * 2;
    
    const getPoints = (key) => data.map((d, i) => ({
        x: (i / (data.length - 1)) * chartWidth + paddingX,
        y: height - ((d[key] / maxVal) * chartHeight + paddingY),
        value: d[key]
    }));

    return (
        <div className="relative group/chart">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" onMouseMove={(e) => {
                const svg = e.currentTarget, rect = svg.getBoundingClientRect(), mouseX = e.clientX - rect.left;
                const index = Math.round(((mouseX - paddingX) / chartWidth) * (data.length - 1));
                if (index >= 0 && index < data.length) setHoveredIndex(index);
            }} onMouseLeave={() => setHoveredIndex(null)}>
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f5a81c" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#f5a81c" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Grid Lines */}
                {[0, 0.5, 1].map((line, i) => {
                    const y = height - (line * chartHeight + paddingY);
                    return (
                        <g key={i}>
                            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} className="stroke-black/[0.04] dark:stroke-white/[0.04]" strokeWidth="1" />
                            <text x={paddingX - 20} y={y + 4} className="fill-gray-400 dark:fill-white/20 text-[10px] font-mono font-bold" textAnchor="end">{Math.round(line * maxVal)}</text>
                        </g>
                    );
                })}

                {/* Hover Line */}
                {hoveredIndex !== null && (
                    <motion.line 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        x1={getPoints(activeKey)[hoveredIndex].x} 
                        y1={paddingY} 
                        x2={getPoints(activeKey)[hoveredIndex].x} 
                        y2={height - paddingY} 
                        className="stroke-attire-accent/20" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                    />
                )}

                {keys.map(key => {
                    const points = getPoints(key);
                    const isActive = activeKey === key;
                    const pathData = points.reduce((acc, p, i) => 
                        i === 0 ? `M ${p.x},${p.y}` : `${acc} C ${points[i-1].x + (p.x - points[i-1].x)/2},${points[i-1].y} ${points[i-1].x + (p.x - points[i-1].x)/2},${p.y} ${p.x},${p.y}`, 
                    "");
                    
                    const baselineY = height - paddingY;

                    return (
                        <g key={key}>
                            {isActive && (
                                <motion.path 
                                    d={`${pathData} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`} 
                                    fill="url(#chartGradient)" 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ duration: 1 }} 
                                />
                            )}
                            <motion.path 
                                d={pathData} 
                                fill="none" 
                                stroke={isActive ? "#f5a81c" : "currentColor"} 
                                strokeWidth={isActive ? "4" : "1.5"} 
                                className={`transition-all duration-700 ${isActive ? 'drop-shadow-[0_8px_15px_rgba(245,168,28,0.3)]' : 'text-gray-300 dark:text-white/5 opacity-30'}`} 
                                initial={{ pathLength: 0 }} 
                                animate={{ pathLength: 1 }} 
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                            {isActive && points.map((p, i) => (
                                <motion.circle 
                                    key={i} 
                                    cx={p.x} cy={p.y} 
                                    r={hoveredIndex === i ? "8" : "5"} 
                                    className={`fill-white dark:fill-black stroke-attire-accent stroke-[3] transition-all duration-300 ${hoveredIndex === i ? 'opacity-100' : 'opacity-0 group-hover/chart:opacity-100'}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-8 px-[60px]">
                {data.map((d, i) => (
                    <span key={i} className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${hoveredIndex === i ? 'text-attire-accent scale-110' : 'text-gray-400 dark:text-white/10'}`}>
                        {d.name}
                    </span>
                ))}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredIndex !== null && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute z-[100] pointer-events-none"
                        style={{ 
                            left: `${(getPoints(activeKey)[hoveredIndex].x / width) * 100}%`, 
                            top: `${(getPoints(activeKey)[hoveredIndex].y / height) * 100}%`,
                            transform: 'translate(-50%, -140%)' 
                        }}
                    >
                        <div className="bg-black/90 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 dark:border-black/10 flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">{data[hoveredIndex].name}</span>
                            <span className="text-lg font-serif">{data[hoveredIndex][activeKey]}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest">{activeKey}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DemographicPieChart = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!data || data.length === 0) return <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-white/10 text-[10px] uppercase font-black tracking-widest italic">No demographic data available</div>;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];
    const colors = ['#f5a81c', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];

    return (
        <div className="flex flex-col lg:flex-row items-center gap-16 py-8">
            <div className="relative w-64 h-64">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full -rotate-90">
                    {data.map((item, i) => {
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        const percent = item.value / total; 
                        cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const isHovered = hoveredIndex === i;
                        
                        return (
                            <motion.path 
                                key={item.label} 
                                d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`} 
                                fill={colors[i % colors.length]} 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ 
                                    opacity: hoveredIndex !== null && !isHovered ? 0.3 : 1, 
                                    scale: isHovered ? 1.05 : 1 
                                }} 
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer transition-all duration-300" 
                            />
                        );
                    })}
                    <circle cx="0" cy="0" r="0.75" className="fill-white dark:fill-[#0d0d0d]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={hoveredIndex ?? 'total'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <span className="text-4xl font-serif text-gray-900 dark:text-white block leading-none">
                                {hoveredIndex !== null ? data[hoveredIndex].value : total}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-2 block">
                                {hoveredIndex !== null ? data[hoveredIndex].label : 'Total Reach'}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {data.map((item, i) => (
                    <motion.div 
                        key={item.label} 
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center justify-between p-5 rounded-3xl border transition-all duration-500 ${
                            hoveredIndex === i 
                                ? 'bg-white dark:bg-white/5 border-attire-accent/30 shadow-xl shadow-black/[0.02]' 
                                : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-70'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider truncate max-w-[140px]">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-black text-gray-900 dark:text-white">{item.value}</span>
                            <div className="w-12 text-right">
                                <span className="text-[10px] font-mono text-attire-accent font-bold">{Math.round((item.value / total) * 100)}%</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const QuickAction = ({ icon, title, description, link }) => (
    <Link to={link} className="block"><div className="flex items-center gap-4 p-4 bg-black/[0.02] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-attire-accent/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-black/[0.02]"><div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 group-hover:border-attire-accent/20 transition-colors">{React.cloneElement(icon, { size: 18, className: "text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" })}</div><div className="flex-grow"><p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</p><p className="text-[9px] text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest font-medium">{description}</p></div><ArrowRight size={12} className="text-gray-300 dark:text-white/20 group-hover:text-attire-accent group-hover:translate-x-1 transition-all" /></div></Link>
);

const AdminDashboard = () => {
    const { appointments, appointmentsLoading, stats } = useAdmin();
    const [dashboardMode, setDashboardMode] = useState('services');
    const [chartView, setChartView] = useState('trend'); 
    const [distType, setDistType] = useState('nationality');
    const [timeframe, setTimeframe] = useState('month');

    const { data: recentCustomers = [], isLoading: customersLoading } = useQuery({
        queryKey: ['admin-recent-customers'],
        queryFn: async () => {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await axios.get('/api/v1/admin/customer-profiles?per_page=5', { headers: { 'Authorization': `Bearer ${token}` } });
            return res.data.data;
        },
        enabled: dashboardMode === 'registry'
    });

    const displayItems = dashboardMode === 'services' ? appointments.slice(0, 5) : recentCustomers;
    const isLoadingActivity = dashboardMode === 'services' ? (appointmentsLoading && appointments.length === 0) : customersLoading;

    return (
        <ErrorBoundary>
            <motion.div className="space-y-10 pb-24 font-sans" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}>
                

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Calendar />} title="Appointments" value={stats.appointments} link="/admin/appointments" loading={appointmentsLoading && appointments.length === 0} highlight={dashboardMode === 'services'} />
                    <StatCard icon={<Users />} title="Total Clients" value={stats.total_customers} link="/admin/customer-profiles" loading={appointmentsLoading && appointments.length === 0} highlight={dashboardMode === 'registry'} />
                    <StatCard icon={<ShoppingBag />} title="Total Products" value={stats.products} link="/admin/products" loading={appointmentsLoading && appointments.length === 0} />
                    <StatCard icon={<TrendingUp />} title="Subscribers" value={stats.subscribers} link="/admin/newsletter" loading={appointmentsLoading && appointments.length === 0} />
                </div>

                <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none group-hover:bg-attire-accent/[0.05] transition-all duration-1000" />

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                            <div className="flex items-center gap-5">
                                <motion.div 
                                    key={chartView}
                                    initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                    className="p-4 bg-attire-accent text-black rounded-3xl shadow-[0_10px_30px_rgba(245,168,28,0.3)]"
                                >
                                    {chartView === 'trend' ? <TrendingUp size={28} /> : <PieIcon size={28} />}
                                </motion.div>
                                <div>
                                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">
                                        {chartView === 'trend' ? 'Growth Intelligence' : 'Demographics Profile'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-attire-accent animate-pulse" />
                                        <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em]">
                                            {chartView === 'trend' ? 'Real-time performance analytics' : 'Audience distribution matrix'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <button 
                                        onClick={() => setChartView('trend')} 
                                        className={`p-3 rounded-xl transition-all duration-500 ${chartView === 'trend' ? 'bg-white dark:bg-white text-black shadow-xl scale-105' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                        title="Trend Analysis"
                                    >
                                        <BarChart size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setChartView('distribution')} 
                                        className={`p-3 rounded-xl transition-all duration-500 ${chartView === 'distribution' ? 'bg-white dark:bg-white text-black shadow-xl scale-105' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                        title="Distribution View"
                                    >
                                        <PieIcon size={18} />
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {chartView === 'trend' ? (
                                        <motion.div 
                                            key="trend-toggles"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex gap-4"
                                        >
                                            <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                                {['Day', 'Week', 'Month'].map((t) => (
                                                    <button 
                                                        key={t} 
                                                        onClick={() => setTimeframe(t.toLowerCase())} 
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${timeframe === t.toLowerCase() ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                                <button onClick={() => setDashboardMode('services')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardMode === 'services' ? 'bg-attire-accent text-black shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Consults</button>
                                                <button onClick={() => setDashboardMode('registry')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dashboardMode === 'registry' ? 'bg-attire-accent text-black shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Clients</button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="dist-toggles"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex gap-1.5 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10"
                                        >
                                            {[{ id: 'nationality', label: 'Nationality' }, { id: 'shirt_size', label: 'Size' }, { id: 'preferred_color', label: 'Color' }].map((opt) => (
                                                <button 
                                                    key={opt.id} 
                                                    onClick={() => setDistType(opt.id)} 
                                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${distType === opt.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                            <div className="xl:col-span-3">
                                <AnimatePresence mode="wait">
                                    {chartView === 'trend' ? (
                                        <motion.div key="trend-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}>
                                            <MultiTrendChart data={stats.trends ? stats.trends[timeframe] : []} activeKey={dashboardMode === 'services' ? 'appointments' : 'customers'} timeframe={timeframe} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="dist-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}>
                                            <DemographicPieChart data={stats.distributions ? stats.distributions[distType] : []} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-[2rem] border border-black/5 dark:border-white/5">
                                    <h3 className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] mb-6">Quick Insights</h3>
                                    <div className="space-y-4">
                                        <GlassyStatCard 
                                            label="Peak Activity" 
                                            value={stats.trends && stats.trends[timeframe]?.length > 0 ? Math.max(...stats.trends[timeframe].map(t => t[dashboardMode === 'services' ? 'appointments' : 'customers'])) : 0} 
                                            icon={Activity}
                                            trend={12}
                                        />
                                        <GlassyStatCard 
                                            label="Conversion" 
                                            value="84%" 
                                            icon={TrendingUp}
                                            color="green-500"
                                        />
                                        <div className="p-6 bg-attire-accent/5 rounded-[2rem] border border-attire-accent/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <ShieldCheck className="text-attire-accent" size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-attire-accent">Growth Status</span>
                                            </div>
                                            <p className="text-[11px] text-gray-600 dark:text-white/60 leading-relaxed">
                                                Your {dashboardMode === 'services' ? 'consultation' : 'client'} base is currently expanding at an optimal rate.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-colors ${dashboardMode === 'services' ? 'bg-blue-500/10 text-blue-500' : 'bg-attire-accent/10 text-attire-accent'}`}><Activity size={24} /></div>
                                <div><h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">{dashboardMode === 'services' ? 'Recent Journal' : 'Registry Entries'}</h2><p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Latest system events</p></div>
                            </div>
                            <Link to={dashboardMode === 'services' ? "/admin/appointments" : "/admin/customer-profiles"} className="text-[10px] font-black text-attire-accent hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.3em] bg-attire-accent/5 px-5 py-2.5 rounded-xl border border-attire-accent/10">View All</Link>
                        </div>
                        {isLoadingActivity ? (
                            <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
                        ) : displayItems.length > 0 ? (
                            <motion.ul key={dashboardMode} className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {displayItems.map(item => (
                                    <motion.li key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="py-4 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 last:border-0 rounded-2xl transition duration-200 ease-out hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group">
                                        <div className="flex items-center space-x-4">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors ${dashboardMode === 'registry' ? 'bg-attire-accent/10 border-attire-accent/20 text-attire-accent' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                                {dashboardMode === 'registry' ? <User size={18} /> : <Calendar size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{dashboardMode === 'registry' ? item.customer_name : item.client_name}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-white/20 uppercase tracking-widest">{dashboardMode === 'registry' ? item.mobile : item.service_type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-mono text-gray-900 dark:text-white">{new Date(item.created_at).toLocaleDateString()}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.status === 'completed' ? 'text-green-500' : 'text-attire-accent'}`}>{item.status}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        ) : (
                            <div className="py-20 text-center">
                                <Info className="mx-auto text-gray-300 dark:text-white/10 mb-4" size={40} />
                                <p className="text-sm text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">No entries recorded</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 flex flex-col">
                        <div className="flex items-center gap-4 mb-10"><div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><ShieldCheck size={24} /></div><div><h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Terminals</h2><p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Direct access</p></div></div>
                        <div className="flex flex-col gap-4 flex-grow">
                            <QuickAction icon={<Users />} title="Client Registry" description="Manage Dossiers" link="/admin/customer-profiles" />
                            <QuickAction icon={<Package />} title="Product Library" description="Curate Collections" link="/admin/products" />
                            <QuickAction icon={<Plus />} title="New Masterpiece" description="Registry Entry" link="/admin/products/new" />
                            <QuickAction icon={<Calendar />} title="Appointment Board" description="Consultations" link="/admin/appointments" />
                            <QuickAction icon={<Gift />} title="Gift Requests" description="Custom Curation" link="/admin/customize-gift" />
                            <div className="mt-10 pt-10 border-t border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-6 text-gray-400 dark:text-white/20"><AlertTriangle size={14} /><p className="text-[10px] font-black uppercase tracking-[0.3em]">Priority Alerts</p></div>
                                <div className="p-6 bg-yellow-500/5 dark:bg-yellow-400/5 rounded-[2.5rem] border border-yellow-500/10 dark:border-yellow-400/10 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <div><span className="text-2xl font-serif text-gray-900 dark:text-white leading-none">{stats.pending_appointments || 0}</span><span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-3">Pending</span></div>
                                        <Link to="/admin/appointments" className="p-3 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 transition-colors"><ArrowRight size={16} /></Link>
                                    </div>
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
