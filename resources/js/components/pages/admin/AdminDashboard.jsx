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

const MultiTrendChart = ({ data, activeKey = 'appointments', timeframe = 'month' }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!data || data.length === 0) return null;

    const keys = ['appointments', 'customers'];
    const maxValRaw = Math.max(...data.flatMap(d => [d.appointments, d.customers]), 1);
    
    // Tightened maxVal for "Pointier" highs and strong alignment ✨
    const maxVal = maxValRaw > 10 ? Math.ceil(maxValRaw * 1.05) : maxValRaw + 1;
    
    const height = 260; 
    const width = 800;
    const paddingX = 60;
    const paddingY = 30; // Closer to the top for more room
    const chartHeight = height - paddingY * 2;
    const chartWidth = width - paddingX * 2;
    
    const getPoints = (key) => data.map((d, i) => ({
        x: (i / (data.length - 1)) * chartWidth + paddingX,
        y: height - ((d[key] / maxVal) * chartHeight + paddingY),
        value: d[key]
    }));

    const handleMouseMove = (e) => {
        const svg = e.currentTarget, rect = svg.getBoundingClientRect(), mouseX = e.clientX - rect.left;
        const index = Math.round(((mouseX - paddingX) / chartWidth) * (data.length - 1));
        if (index >= 0 && index < data.length) setHoveredIndex(index);
    };

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIndex(null)}>
                <defs>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f5a81c" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#f5a81c" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((line, i) => {
                    const y = height - (line * chartHeight + paddingY);
                    return (
                        <g key={i}>
                            <motion.line x1={paddingX} y1={y} x2={width - paddingX} y2={y} className="stroke-black/[0.03] dark:stroke-white/[0.03]" strokeDasharray="4 4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} />
                            <motion.text x={paddingX - 15} y={y + 4} className="fill-gray-400 dark:fill-white/10 text-[9px] font-mono font-bold text-right" textAnchor="end" initial={{ opacity: 0, x: paddingX - 25 }} animate={{ opacity: 1, x: paddingX - 15 }} transition={{ delay: i * 0.05 }}>{Math.round(line * maxVal)}</motion.text>
                        </g>
                    );
                })}
                {keys.map(key => {
                    const points = getPoints(key);
                    const isActive = activeKey === key;
                    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                    const baselineY = height - paddingY;

                    return (
                        <g key={key}>
                            {isActive && (
                                <motion.path 
                                    d={`${pathData} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`} 
                                    fill="url(#activeGradient)" 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ duration: 0.6, delay: 0.3 }} 
                                />
                            )}
                            <motion.path 
                                key={`${key}-${timeframe}`} 
                                d={pathData} 
                                fill="none" 
                                stroke={isActive ? "#f5a81c" : "currentColor"} 
                                strokeWidth={isActive ? "3.5" : "1"} 
                                strokeLinejoin="miter" // Pointy Peaks ✨
                                strokeMiterlimit="10"
                                className={`transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_12px_rgba(245,168,28,0.4)]' : 'text-gray-300 dark:text-white/5'}`} 
                                initial={{ pathLength: 0 }} 
                                animate={{ pathLength: 1, strokeOpacity: isActive ? 1 : 0.2 }} 
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            />
                            {isActive && points.map((p, i) => (
                                <motion.circle 
                                    key={`${key}-${timeframe}-${i}`} 
                                    cx={p.x} cy={p.y} 
                                    r={hoveredIndex === i ? "7" : "4.5"} 
                                    className="fill-white dark:fill-black stroke-attire-accent stroke-[3] transition-all duration-300" 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.4 + i * 0.02 }} 
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>
            <div className="flex justify-between mt-6 px-[60px] border-t border-black/5 dark:border-white/5 pt-4">
                {data.map((d, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.02 }} className={`text-[9px] font-mono uppercase font-bold transition-colors ${hoveredIndex === i ? 'text-attire-accent' : 'text-gray-400 dark:text-attire-silver/20'}`}>{d.name}</motion.span>
                ))}
            </div>
            <AnimatePresence>
                {hoveredIndex !== null && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute z-[100] pointer-events-none" style={{ left: getPoints(activeKey)[hoveredIndex].x, top: paddingY - 10, transform: 'translateX(-50%)' }}>
                        <div className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl min-w-[160px] space-y-2">
                            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase block border-b border-black/5 dark:border-white/5 pb-2">{data[hoveredIndex].name}</span>
                            <div className="flex justify-between items-center"><span className="text-[9px] text-gray-400 uppercase">Value</span><span className="text-xs font-mono font-black text-attire-accent">{data[hoveredIndex][activeKey]}</span></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DemographicPieChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-white/10 text-[10px] uppercase font-black tracking-widest italic">No demographic data available</div>;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];
    const colors = ['#f5a81c', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#6b7280'];
    return (
        <div className="flex flex-col md:flex-row items-center gap-12 py-4">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full -rotate-90">
                    {data.map((item, i) => {
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        const percent = item.value / total; cumulativePercent += percent;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        return (
                            <motion.path key={item.label} d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`} fill={colors[i % colors.length]} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 15 }} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        );
                    })}
                    <circle cx="0" cy="0" r="0.65" className="fill-white dark:fill-[#0d0d0d]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="text-2xl font-serif text-gray-900 dark:text-white">{total}</motion.span>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total</motion.span>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {data.map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm">
                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} /><span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate max-w-[120px]">{item.label}</span></div>
                        <div className="flex items-center gap-3"><span className="text-xs font-mono font-black text-gray-900 dark:text-white">{item.value}</span><span className="text-[9px] font-mono text-gray-400 dark:text-white/20">{Math.round((item.value / total) * 100)}%</span></div>
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
                <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div><h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2 tracking-tight">Intelligence</h1><div className="flex items-center gap-3"><span className="w-8 h-px bg-attire-accent/40" /><p className="text-gray-400 dark:text-attire-silver text-[10px] font-black uppercase tracking-[0.4em]">Performance Command Center</p></div></div>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Calendar />} title="Appointments" value={stats.appointments} link="/admin/appointments" loading={appointmentsLoading && appointments.length === 0} highlight={dashboardMode === 'services'} />
                    <StatCard icon={<Users />} title="Total Clients" value={stats.total_customers} link="/admin/customer-profiles" loading={appointmentsLoading && appointments.length === 0} highlight={dashboardMode === 'registry'} />
                    <StatCard icon={<ShoppingBag />} title="Total Products" value={stats.products} link="/admin/products" loading={appointmentsLoading && appointments.length === 0} />
                    <StatCard icon={<TrendingUp />} title="Subscribers" value={stats.subscribers} link="/admin/newsletter" loading={appointmentsLoading && appointments.length === 0} />
                </div>
                <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 relative">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                        <div className="flex items-center gap-4"><motion.div key={chartView} initial={{ rotate: -90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} className="p-3 bg-attire-accent/10 rounded-2xl text-attire-accent">{chartView === 'trend' ? <TrendingUp size={24} /> : <PieIcon size={24} />}</motion.div><div><h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">{chartView === 'trend' ? 'Growth Intelligence' : 'Demographics Profile'}</h2><p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">{chartView === 'trend' ? 'performance timeline' : 'Distribution data'}</p></div></div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                                <button onClick={() => setChartView('trend')} className={`p-2 rounded-lg transition-all ${chartView === 'trend' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-400'}`} title="Growth Line"><BarChart size={16} /></button>
                                <button onClick={() => setChartView('distribution')} className={`p-2 rounded-lg transition-all ${chartView === 'distribution' ? 'bg-white dark:bg-white text-black shadow-lg' : 'text-gray-400'}`} title="Demographic Pie"><PieIcon size={16} /></button>
                            </div>
                            <AnimatePresence mode="wait">
                                {chartView === 'trend' ? (
                                    <motion.div key="trend-toggles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-4">
                                        <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">{['Day', 'Week', 'Month'].map((t) => (<button key={t} onClick={() => setTimeframe(t.toLowerCase())} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${timeframe === t.toLowerCase() ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>{t}</button>))}</div>
                                        <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5"><button onClick={() => setDashboardMode('services')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'services' ? 'bg-attire-accent text-black shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>Consults</button><button onClick={() => setDashboardMode('registry')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${dashboardMode === 'registry' ? 'bg-attire-accent text-black shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>Clients</button></div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="dist-toggles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">{[{ id: 'nationality', label: 'Nationality' }, { id: 'shirt_size', label: 'Size' }, { id: 'preferred_color', label: 'Color' }].map((opt) => (<button key={opt.id} onClick={() => setDistType(opt.id)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${distType === opt.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>{opt.label}</button>))}</motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <AnimatePresence mode="wait">{chartView === 'trend' ? (<motion.div key="trend-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><MultiTrendChart data={stats.trends ? stats.trends[timeframe] : []} activeKey={dashboardMode === 'services' ? 'appointments' : 'customers'} timeframe={timeframe} /></motion.div>) : (<motion.div key="dist-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}><DemographicPieChart data={stats.distributions ? stats.distributions[distType] : []} /></motion.div>)}</AnimatePresence>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10"><div className="flex items-center justify-between mb-10"><div className="flex items-center gap-4"><div className={`p-3 rounded-2xl transition-colors ${dashboardMode === 'services' ? 'bg-blue-500/10 text-blue-500' : 'bg-attire-accent/10 text-attire-accent'}`}><Activity size={24} /></div><div><h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">{dashboardMode === 'services' ? 'Recent Journal' : 'Registry Entries'}</h2><p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Latest system events</p></div></div><Link to={dashboardMode === 'services' ? "/admin/appointments" : "/admin/customer-profiles"} className="text-[10px] font-black text-attire-accent hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.3em] bg-attire-accent/5 px-5 py-2.5 rounded-xl border border-attire-accent/10">View All</Link></div>{isLoadingActivity ? (<div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>) : displayItems.length > 0 ? (<motion.ul key={dashboardMode} className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{displayItems.map(item => (<motion.li key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="py-4 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 last:border-0 rounded-2xl transition duration-200 ease-out hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group"><div className="flex items-center space-x-4"><div className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors ${dashboardMode === 'registry' ? 'bg-attire-accent/10 border-attire-accent/20 text-attire-accent' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-400 group-hover:text-attire-accent'}`}>{dashboardMode === 'registry' ? <UserPlus size={18} /> : <Calendar size={18} />}</div><div><p className="font-bold text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors text-[13px] uppercase tracking-wide">{item.name}</p><p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/20">{dashboardMode === 'registry' ? `${item.nationality || 'Cambodian'} • ${item.client_status}` : item.service}</p></div></div><div className="text-[10px] font-mono text-gray-400 dark:text-attire-silver/50 flex items-center bg-black/5 dark:bg-black/20 px-3 py-1 rounded-full border border-black/5 dark:border-white/5"><Clock size={10} className="mr-2" /><span>{new Date(item.created_at || item.date).toLocaleDateString()}</span></div></motion.li>))}</motion.ul>) : (<div className="text-center py-24 bg-black/[0.01] rounded-[2.5rem] border border-dashed border-black/5 dark:border-white/5"><div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-black/5 dark:border-white/5"><Clock className="text-gray-400 dark:text-attire-silver/20" size={32} /></div><p className="text-gray-400 dark:text-attire-silver/40 text-[11px] font-black uppercase tracking-[0.3em] italic">No recent activity detected.</p></div>)}</motion.div>
                    <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 flex flex-col"><div className="flex items-center gap-4 mb-10"><div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><ShieldCheck size={24} /></div><div><h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Terminals</h2><p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Direct access</p></div></div><div className="flex flex-col gap-4 flex-grow"><QuickAction icon={<Users />} title="Client Registry" description="Manage Dossiers" link="/admin/customer-profiles" /><QuickAction icon={<Package />} title="Product Library" description="Curate Collections" link="/admin/products" /><QuickAction icon={<Plus />} title="New Masterpiece" description="Registry Entry" link="/admin/products/new" /><QuickAction icon={<Calendar />} title="Appointment Board" description="Consultations" link="/admin/appointments" /><QuickAction icon={<Gift />} title="Gift Requests" description="Custom Curation" link="/admin/customize-gift" /><div className="mt-10 pt-10 border-t border-black/5 dark:border-white/5"><div className="flex items-center gap-3 mb-6 text-gray-400 dark:text-white/20"><AlertTriangle size={14} /><p className="text-[10px] font-black uppercase tracking-[0.3em]">Priority Alerts</p></div><div className="p-6 bg-yellow-500/5 dark:bg-yellow-400/5 rounded-[2.5rem] border border-yellow-500/10 dark:border-yellow-400/10 shadow-inner"><div className="flex items-center justify-between"><div><span className="text-2xl font-serif text-gray-900 dark:text-white leading-none">{stats.pending_appointments}</span><span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-3">Pending</span></div><Link to="/admin/appointments" className="p-3 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20"><ArrowRight size={16} /></Link></div><p className="text-[9px] font-bold text-yellow-600/60 dark:text-yellow-400/40 uppercase tracking-widest mt-3">Awaiting response</p></div></div></div></motion.div>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
