import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, 
    User, TrendingUp, Package, ShoppingBag, Plus, Users, 
    Activity, ShieldCheck, Briefcase, UserPlus, Zap, Info, PieChart as PieIcon, BarChart
} from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import { LumaSpin } from "@/components/ui/luma-spin";
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DailySummaryWidget from './DailySummaryWidget';

const getCardVariants = (performanceMode) => ({
    hidden: { opacity: 0, y: performanceMode ? 0 : 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: performanceMode 
            ? { duration: 0 } 
            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
});

const StatCard = ({ icon, title, value, link, loading, highlight = false }) => {
    const { performanceMode } = useAdmin();
    const cardVariants = getCardVariants(performanceMode);
    
    if (loading) {
        return (
            <div className="bg-[#fdfdfc] dark:bg-[#161b22] p-8 rounded-2xl border border-black/5 dark:border-[#30363d] flex items-center justify-center min-h-[160px]">
                <LumaSpin size="md" />
            </div>
        );
    }
    return (
        <motion.div 
            variants={cardVariants} 
            className={`group relative bg-[#fdfdfc] dark:bg-[#161b22] p-6 rounded-2xl border transition-all duration-300 shadow-none ${
                highlight 
                    ? 'border-[#0d3542] dark:border-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' 
                    : 'border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30'
            }`}
        >
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e] uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-[#c9d1d9] tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                    highlight 
                        ? 'bg-[#0d3542] text-white dark:bg-[#58a6ff]' 
                        : 'bg-[#0d3542]/10 text-[#0d3542] dark:bg-[#58a6ff]/10 dark:text-[#58a6ff]'
                }`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            </div>
            {link && (
                <Link 
                    to={link} 
                    className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:gap-2 transition-all"
                >
                    View Insights <ArrowRight size={12} className="ml-1" />
                </Link>
            )}
        </motion.div>
    );
};

const GlassyStatCard = ({ label, value, trend, icon: Icon, color = "attire-accent" }) => {
    const { performanceMode } = useAdmin();
    const cardVariants = getCardVariants(performanceMode);

    return (
        <motion.div 
            variants={cardVariants}
            className="relative overflow-hidden group p-6 rounded-2xl bg-[#fdfdfc] dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] transition-all duration-500"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
                    <Icon size={20} className="text-[#0d3542] dark:text-[#58a6ff]" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <TrendingUp size={10} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            
            <p className="text-xs font-black text-gray-400 dark:text-[#8b949e] uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-[#c9d1d9] tracking-tight">{value}</p>
        </motion.div>
    );
};

const MultiTrendChart = ({ data, activeKey = 'appointments', timeframe = 'month' }) => {
    const { performanceMode } = useAdmin();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!data || data.length === 0) return (
        <div className="h-[300px] flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-[2rem]">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Gathering Intel...</p>
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
                const svg = e.currentTarget;
                const pt = svg.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
                const index = Math.round(((svgPt.x - paddingX) / chartWidth) * (data.length - 1));
                if (index >= 0 && index < data.length) setHoveredIndex(index);
            }} onMouseLeave={() => setHoveredIndex(null)}>
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
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
                            <text x={paddingX - 20} y={y + 4} className="fill-gray-400 dark:fill-white/20 text-xs font-mono font-bold" textAnchor="end">{Math.round(line * maxVal)}</text>
                        </g>
                    );
                })}

                {/* Hover Line */}
                {hoveredIndex !== null && (
                    <motion.line 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={performanceMode ? { duration: 0 } : {}}
                        x1={getPoints(activeKey)[hoveredIndex].x} 
                        y1={paddingY} 
                        x2={getPoints(activeKey)[hoveredIndex].x} 
                        y2={height - paddingY} 
                        className="stroke-[#0d3542] dark:stroke-[#58a6ff]/20" 
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
                                stroke={isActive ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "#58a6ff" : "#0d3542") : "currentColor"} 
                                strokeWidth={isActive ? "4" : "1.5"} 
                                className={`transition-all duration-700 ${isActive ? '' : 'text-gray-300 dark:text-[#30363d] opacity-30'}`} 
                                initial={{ pathLength: 0 }} 
                                animate={{ pathLength: 1 }} 
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />

                        </g>
                    );
                })}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-8 px-[60px]">
                {data.map((d, i) => (
                    <span key={i} className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${hoveredIndex === i ? 'text-[#0d3542] dark:text-[#58a6ff] scale-110' : 'text-gray-400 dark:text-[#8b949e]/40'}`}>
                        {d.name}
                    </span>
                ))}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredIndex !== null && (
                    <motion.div 
                        initial={{ opacity: 0, y: performanceMode ? 0 : 10, scale: performanceMode ? 1 : 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: performanceMode ? 0 : 10, scale: performanceMode ? 1 : 0.9 }}
                        transition={performanceMode ? { duration: 0 } : {}}
                        className="absolute z-[100] pointer-events-none"
                        style={{ 
                            left: `${(getPoints(activeKey)[hoveredIndex].x / width) * 100}%`, 
                            top: `${(getPoints(activeKey)[hoveredIndex].y / height) * 100}%`,
                            transform: 'translate(-50%, -140%)' 
                        }}
                    >
                        <div className="bg-[#fdfdfc] dark:bg-[#161b22] text-gray-900 dark:text-[#c9d1d9] px-6 py-3 rounded-2xl border border-black/5 dark:border-[#30363d] flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{data[hoveredIndex].name}</span>
                            <span className="text-lg font-serif">{data[hoveredIndex][activeKey]}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{activeKey}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DemographicPieChart = ({ data }) => {
    const { performanceMode } = useAdmin();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!data || data.length === 0) return <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-white/10 text-[10px] uppercase font-black tracking-widest italic">No demographic data available</div>;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];
    const colors = ['#0d3542', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];

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
                                transition={performanceMode ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
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
                            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: performanceMode ? 0 : -10 }}
                            transition={performanceMode ? { duration: 0 } : {}}
                            className="text-center"
                        >
                            <span className="text-4xl font-serif text-gray-900 dark:text-white block leading-none">
                                {hoveredIndex !== null ? data[hoveredIndex].value : total}
                            </span>
                            <span className="text-xs font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-2 block">
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
                                ? 'bg-white dark:bg-[#161b22] border-[#0d3542]/30 dark:border-[#58a6ff]/30' 
                                : 'bg-black/[0.02] dark:bg-[#0d1117] border-black/5 dark:border-[#30363d] opacity-70'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider truncate max-w-[140px]">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-black text-gray-900 dark:text-[#c9d1d9]">{item.value}</span>
                            <div className="w-12 text-right">
                                <span className="text-[11px] font-mono text-[#0d3542] dark:text-[#58a6ff] font-bold">{Math.round((item.value / total) * 100)}%</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const QuickAction = ({ icon, title, description, link }) => (
    <Link to={link} className="block"><div className="flex items-center gap-4 p-4 bg-black/[0.02] dark:bg-[#161b22] rounded-2xl border border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 hover:bg-white dark:hover:bg-[#21262d] transition-all duration-300 group"><div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-[#0d1117] rounded-xl border border-black/5 dark:border-[#30363d] group-hover:border-[#0d3542]/20 dark:group-hover:border-[#58a6ff]/20 transition-colors">{React.cloneElement(icon, { size: 18, className: "text-gray-400 dark:text-[#8b949e]/40 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors" })}</div><div className="flex-grow"><p className="text-xs font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider">{title}</p><p className="text-[11px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest font-medium">{description}</p></div><ArrowRight size={12} className="text-gray-300 dark:text-[#30363d] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] group-hover:translate-x-1 transition-all" /></div></Link>
);

const AdminDashboard = () => {
    const { appointments, appointmentsLoading, stats, performanceMode } = useAdmin();
    const [dashboardMode, setDashboardMode] = useState('services');
    const [chartView, setChartView] = useState('trend'); 
    const [distType, setDistType] = useState('nationality');
    const [timeframe, setTimeframe] = useState('month');

    const cardVariants = getCardVariants(performanceMode);

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
            <motion.div 
                className="space-y-10 pb-24 font-sans dashboard-page" 
                initial="hidden" 
                animate="visible" 
                variants={{ 
                    hidden: { opacity: 0 }, 
                    visible: { 
                        opacity: 1, 
                        transition: performanceMode ? { duration: 0 } : { staggerChildren: 0.15 } 
                    } 
                }}
            >
                

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Calendar />} title="Appointments" value={stats.appointments} link="/admin/appointments" loading={appointmentsLoading && appointments.length === 0} highlight={dashboardMode === 'services'} />
                    <StatCard icon={<Users />} title="Total Clients" value={stats.total_customers} link="/admin/customer-profiles" loading={appointmentsLoading && appointments.length === 0} highlight={dashboardMode === 'registry'} />
                    <StatCard icon={<ShoppingBag />} title="Total Products" value={stats.products} link="/admin/products" loading={appointmentsLoading && appointments.length === 0} />
                    <StatCard icon={<TrendingUp />} title="Subscribers" value={stats.subscribers} link="/admin/newsletter" loading={appointmentsLoading && appointments.length === 0} />
                </div>

                <motion.div variants={cardVariants} className="bg-[#fdfdfc] dark:bg-[#161b22] p-10 rounded-[3rem] border border-black/5 dark:border-[#30363d] shadow-none overflow-hidden relative group">


                    <div className="relative">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                            <div className="flex items-center gap-5">
                                <motion.div 
                                    key={chartView}
                                    initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                    className="p-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-3xl"
                                >
                                    {chartView === 'trend' ? <TrendingUp size={28} /> : <PieIcon size={28} />}
                                </motion.div>
                                <div>
                                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">
                                        {chartView === 'trend' ? 'Growth' : 'Types'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.3em]">
                                            {chartView === 'trend' ? 'History' : 'Client Profile'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <button 
                                        onClick={() => setChartView('trend')} 
                                        className={`p-3 rounded-xl transition-all duration-500 shadow-none ${chartView === 'trend' ? 'bg-white dark:bg-white text-black scale-105' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                        title="Trend Analysis"
                                    >
                                        <BarChart size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setChartView('distribution')} 
                                        className={`p-3 rounded-xl transition-all duration-500 shadow-none ${chartView === 'distribution' ? 'bg-white dark:bg-white text-black scale-105' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
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
                                                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${timeframe === t.toLowerCase() ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-[#0d1117] rounded-2xl border border-black/5 dark:border-[#30363d]">
                                                <button onClick={() => setDashboardMode('services')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${dashboardMode === 'services' ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}>Consults</button>
                                                <button onClick={() => setDashboardMode('registry')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${dashboardMode === 'registry' ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}>Clients</button>
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
                                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${distType === opt.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
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
                                    <h3 className="text-xs font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] mb-6">Stats</h3>
                                    <div className="space-y-4">
                                        <GlassyStatCard 
                                            label="Peak Activity" 
                                            value={stats.trends && stats.trends[timeframe]?.length > 0 ? Math.max(...stats.trends[timeframe].map(t => t[dashboardMode === 'services' ? 'appointments' : 'customers'])) : 0} 
                                            icon={Activity}
                                            trend={12}
                                        />
                                        <GlassyStatCard 
                                            label="Rate" 
                                            value="84%" 
                                            icon={TrendingUp}
                                            color="green-500"
                                        />
                                        <div className="p-6 bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 rounded-[2rem] border border-[#0d3542]/10 dark:border-[#58a6ff]/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <ShieldCheck className="text-[#0d3542] dark:text-[#58a6ff]" size={14} />
                                                <span className="text-xs font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">State</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-[#8b949e] leading-relaxed">
                                                Everything is running well.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div variants={cardVariants} className="lg:col-span-2">
                        <DailySummaryWidget stats={stats} loading={appointmentsLoading} />
                    </motion.div>

                    <div className="flex flex-col gap-10">
                        <motion.div variants={cardVariants} className="bg-[#fdfdfc] dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-none">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{dashboardMode === 'services' ? 'Recent Journal' : 'Registry Entries'}</h2>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Latest</p>
                                </div>
                                <Link to={dashboardMode === 'services' ? "/admin/appointments" : "/admin/customer-profiles"} className="text-[10px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:opacity-70 transition-opacity uppercase tracking-widest border border-black/5 dark:border-white/5 px-4 py-2 rounded-xl">All</Link>
                            </div>
                            {isLoadingActivity ? (
                                <div className="flex items-center justify-center py-12">
                                    <LumaSpin size="lg" />
                                </div>
                            ) : displayItems.length > 0 ? (
                                <ul className="space-y-1">
                                    {displayItems.slice(0, 4).map(item => (
                                        <li key={item.id} className="p-3 rounded-2xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[140px]">{dashboardMode === 'registry' ? item.customer_name : item.client_name}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-black/5 dark:bg-white/5 text-gray-400'}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 dark:text-white/20 uppercase tracking-widest">{dashboardMode === 'registry' ? item.mobile : item.service_type}</span>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-mono text-gray-300 dark:text-white/10">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {dashboardMode === 'services' && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0d3542]/40 dark:text-[#58a6ff]/40">CONSULT</span>}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest italic px-2 text-center py-10">Stable State</p>
                            )}
                        </motion.div>

                        <motion.div variants={cardVariants} className="bg-[#fdfdfc] dark:bg-[#161b22] p-10 rounded-[3rem] border border-black/5 dark:border-[#30363d] shadow-none flex flex-col">
                            <div className="flex items-center gap-4 mb-10"><div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><ShieldCheck size={24} /></div><div><h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Tools</h2><p className="text-xs font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Direct access</p></div></div>
                            <div className="flex flex-col gap-4">
                                <QuickAction icon={<Users />} title="Clients" description="Registry" link="/admin/customer-profiles" />
                                <QuickAction icon={<Package />} title="Products" description="Items" link="/admin/products" />
                                <QuickAction icon={<Plus />} title="Add New" description="Create Item" link="/admin/products/new" />
                                <QuickAction icon={<Calendar />} title="Sessions" description="Appointments" link="/admin/appointments" />
                                <QuickAction icon={<Gift />} title="Gifts" description="Requests" link="/admin/customize-gift" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
