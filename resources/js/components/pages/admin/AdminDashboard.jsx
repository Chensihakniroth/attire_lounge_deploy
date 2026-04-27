import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Gift,
    ImageIcon,
    ArrowRight,
    Clock,
    AlertTriangle,
    User,
    TrendingUp,
    Package,
    ShoppingBag,
    Plus,
    Users,
    Activity,
    ShieldCheck,
    Briefcase,
    UserPlus,
    Zap,
    Info,
    PieChart as PieIcon,
    BarChart,
} from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import { LumaSpin } from '@/components/ui/luma-spin';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// UI Components
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DailySummaryWidget from './DailySummaryWidget';
import RecentActivityWidget from './RecentActivityWidget';

// Recharts
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// ----------------------------------------------------------------------
// MultiTrendChart (Redesigned with Recharts)
// ----------------------------------------------------------------------
const MultiTrendChart = ({
    data,
    activeKey = 'appointments',
    timeframe = 'month',
}) => {
    const { performanceMode } = useAdmin();

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 rounded-[2rem]">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
                    Gathering Intel...
                </p>
            </div>
        );
    }

    const gradientId = `areaGradient-${activeKey}`;
    const maxValue = Math.max(...data.flatMap((d) => [d.appointments, d.customers]), 1);
    const yAxisMax = maxValue > 10 ? Math.ceil(maxValue * 1.1) : maxValue + 2;

    const CustomActiveDot = (props) => {
        const { cx, cy } = props;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={6}
                className="fill-white dark:fill-[#161b22] stroke-[3px] stroke-[#0d3542] dark:stroke-[#58a6ff] filter drop-shadow-md transition-all duration-100"
            />
        );
    };

    const CustomDot = (props) => {
        const { cx, cy } = props;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={4}
                className="fill-white dark:fill-[#161b22] stroke-2 stroke-[#0d3542] dark:stroke-[#58a6ff] transition-all duration-100"
            />
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={performanceMode ? { duration: 0 } : { duration: 0.6 }}
            className="h-[450px] w-full mt-0 text-[#0d3542] dark:text-[#58a6ff]"
        >
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                    style={{ outline: 'none' }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="currentColor"
                                stopOpacity={0.12}
                            />
                            <stop
                                offset="100%"
                                stopColor="currentColor"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke="currentColor"
                        strokeWidth={1}
                        className="stroke-black/[0.04] dark:stroke-white/[0.04]"
                    />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        tick={{
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fill: 'currentColor',
                        }}
                        className="text-gray-400 dark:text-[#8b949e]/40 font-sans tracking-widest"
                        interval="preserveStartEnd"
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        tick={{
                            fontSize: 12,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fill: 'currentColor',
                        }}
                        className="text-gray-400 dark:text-white/20"
                        domain={[0, yAxisMax]}
                        allowDecimals={false}
                    />

                    <Tooltip
                        isAnimationActive={false}
                        animationDuration={0}
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                                <div className="bg-[#fdfdfc] dark:bg-[#161b22] text-gray-900 dark:text-[#c9d1d9] px-6 py-3 rounded-2xl border border-black/5 dark:border-[#30363d] flex flex-col items-center gap-1 shadow-xl">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{label}</span>
                                    <span className="text-lg font-serif text-[#0d3542] dark:text-[#58a6ff]">{payload[0].value}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{activeKey}</span>
                                </div>
                            );
                        }}
                        cursor={{
                            stroke: 'currentColor',
                            strokeWidth: 1,
                            strokeDasharray: '4 4',
                            className: 'stroke-black/5 dark:stroke-white/5',
                        }}
                    />

                    {/* Inactive series */}
                    {activeKey !== 'appointments' && (
                        <Area
                            type="monotone"
                            dataKey="appointments"
                            stroke="currentColor"
                            strokeWidth={1}
                            fill="none"
                            activeDot={false}
                            dot={false}
                            className="text-gray-300 dark:text-[#30363d] opacity-30 transition-all duration-300"
                            isAnimationActive={!performanceMode}
                            animationDuration={400}
                        />
                    )}
                    {activeKey !== 'customers' && (
                        <Area
                            type="monotone"
                            dataKey="customers"
                            stroke="currentColor"
                            strokeWidth={1}
                            fill="none"
                            activeDot={false}
                            dot={false}
                            className="text-gray-300 dark:text-[#30363d] opacity-30 transition-all duration-300"
                            isAnimationActive={!performanceMode}
                            animationDuration={400}
                        />
                    )}

                    {/* Active series */}
                    <Area
                        type="monotone"
                        dataKey={activeKey}
                        stroke="currentColor"
                        strokeWidth={3}
                        fill={`url(#${gradientId})`}
                        activeDot={<CustomActiveDot />}
                        dot={<CustomDot />}
                        className="transition-all duration-300"
                        isAnimationActive={!performanceMode}
                        animationDuration={400}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

// ----------------------------------------------------------------------
// StatCard
// ----------------------------------------------------------------------
const getCardVariants = (performanceMode) => ({
    hidden: { opacity: 0, y: performanceMode ? 0 : 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: performanceMode
            ? { duration: 0 }
            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
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
            className={`group relative bg-[#fdfdfc] dark:bg-[#161b22] p-6 rounded-2xl border transition-all duration-300 shadow-md hover:shadow-lg dark:shadow-black/30 ${
                highlight
                    ? 'border-[#0d3542] dark:border-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/5'
                    : 'border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30'
            }`}
        >
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e] uppercase tracking-[0.2em]">
                        {title}
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-[#c9d1d9] tracking-tight">
                        {value}
                    </h3>
                </div>
                <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                        highlight
                            ? 'bg-[#0d3542] text-white dark:bg-[#58a6ff]'
                            : 'bg-[#0d3542]/10 text-[#0d3542] dark:bg-[#58a6ff]/10 dark:text-[#58a6ff]'
                    }`}
                >
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

const GlassyStatCard = ({
    label,
    value,
    trend,
    icon: Icon,
    color = 'attire-accent',
}) => {
    const { performanceMode } = useAdmin();
    const cardVariants = getCardVariants(performanceMode);

    return (
        <motion.div
            variants={cardVariants}
            className="relative overflow-hidden group p-6 rounded-2xl bg-[#fdfdfc] dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] transition-all duration-500 shadow-md hover:shadow-lg dark:shadow-black/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
                    <Icon
                        size={20}
                        className="text-[#0d3542] dark:text-[#58a6ff]"
                    />
                </div>
                {trend && (
                    <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                            trend > 0
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                        }`}
                    >
                        <TrendingUp size={10} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <p className="text-xs font-black text-gray-400 dark:text-[#8b949e] uppercase tracking-[0.2em] mb-1">
                {label}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-[#c9d1d9] tracking-tight">
                {value}
            </p>
        </motion.div>
    );
};

// ----------------------------------------------------------------------
// DemographicPieChart
// ----------------------------------------------------------------------
const DemographicPieChart = ({ data }) => {
    const { performanceMode } = useAdmin();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    if (!data || data.length === 0)
        return (
            <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-white/10 text-[10px] uppercase font-black tracking-widest italic">
                No demographic data available
            </div>
        );

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent) => [
        Math.cos(2 * Math.PI * percent),
        Math.sin(2 * Math.PI * percent),
    ];
    const colors = [
        '#0d3542',
        '#3b82f6',
        '#10b981',
        '#8b5cf6',
        '#ef4444',
        '#6b7280',
    ];

    return (
        <div className="flex flex-col lg:flex-row items-center gap-16 py-8">
            <div className="relative w-64 h-64">
                <svg
                    viewBox="-1.1 -1.1 2.2 2.2"
                    className="w-full h-full -rotate-90"
                >
                    {data.map((item, i) => {
                        const [startX, startY] =
                            getCoordinatesForPercent(cumulativePercent);
                        const percent = item.value / total;
                        cumulativePercent += percent;
                        const [endX, endY] =
                            getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = percent > 0.5 ? 1 : 0;
                        const isHovered = hoveredIndex === i;

                        return (
                            <motion.path
                                key={item.label}
                                d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
                                fill={colors[i % colors.length]}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity:
                                        hoveredIndex !== null && !isHovered
                                            ? 0.3
                                            : 1,
                                    scale: isHovered ? 1.05 : 1,
                                }}
                                transition={
                                    performanceMode
                                        ? { duration: 0 }
                                        : {
                                              type: 'spring',
                                              stiffness: 200,
                                              damping: 20,
                                          }
                                }
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer transition-all duration-300"
                            />
                        );
                    })}
                    <circle
                        cx="0"
                        cy="0"
                        r="0.75"
                        className="fill-white dark:fill-[#0d0d0d]"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hoveredIndex ?? 'total'}
                            initial={
                                performanceMode
                                    ? { opacity: 0 }
                                    : { opacity: 0, y: 20 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: performanceMode ? 0 : -10 }}
                            transition={performanceMode ? { duration: 0 } : {}}
                            className="text-center"
                        >
                            <span className="text-4xl font-serif text-gray-900 dark:text-white block leading-none">
                                {hoveredIndex !== null
                                    ? data[hoveredIndex].value
                                    : total}
                            </span>
                            <span className="text-xs font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mt-2 block">
                                {hoveredIndex !== null
                                    ? data[hoveredIndex].label
                                    : 'Total Reach'}
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
                            <div
                                className="w-2.5 h-2.5 rounded-sm"
                                style={{
                                    backgroundColor: colors[i % colors.length],
                                }}
                            />
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider truncate max-w-[140px]">
                                {item.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-black text-gray-900 dark:text-[#c9d1d9]">
                                {item.value}
                            </span>
                            <div className="w-12 text-right">
                                <span className="text-[11px] font-mono text-[#0d3542] dark:text-[#58a6ff] font-bold">
                                    {Math.round((item.value / total) * 100)}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const QuickAction = ({ icon, title, description, link }) => (
    <Link to={link} className="block group">
        <div className="flex items-center gap-5 p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-[1.5rem] border border-black/5 dark:border-white/5 group-hover:bg-white dark:group-hover:bg-[#1c2128] group-hover:border-indigo-500/20 group-hover:-translate-y-1 transition-all duration-500">
            <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#0d1117] rounded-2xl border border-black/5 dark:border-white/5 group-hover:scale-110 group-hover:border-indigo-500/10 transition-all duration-500 text-gray-400 group-hover:text-indigo-500">
                {React.cloneElement(icon, { size: 20, strokeWidth: 2 })}
            </div>
            <div className="flex-grow">
                <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                    {title}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] mt-0.5 font-medium">
                    {description}
                </p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 group-hover:bg-indigo-500/10 transition-all duration-500">
                <ArrowRight size={12} className="text-indigo-500" />
            </div>
        </div>
    </Link>
);

// ----------------------------------------------------------------------
// AdminDashboard
// ----------------------------------------------------------------------
const AdminDashboard = () => {
    const { appointments, appointmentsLoading, stats, performanceMode, activeOutlet } =
        useAdmin();
    const [dashboardMode, setDashboardMode] = useState('services');
    const [chartView, setChartView] = useState('trend');
    const [distType, setDistType] = useState('nationality');
    const [timeframe, setTimeframe] = useState('month');

    const cardVariants = getCardVariants(performanceMode);

    // Note: Activity data now handled inside RecentActivityWidget

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
                        transition: performanceMode
                            ? { duration: 0 }
                            : { staggerChildren: 0.15 },
                    },
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeOutlet === 'attire_lounge' ? (
                        <>
                            <StatCard
                                icon={<Calendar />}
                                title="Appointments"
                                value={stats.appointments}
                                link="/admin/appointments"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                                highlight={dashboardMode === 'services'}
                            />
                            <StatCard
                                icon={<Users />}
                                title="Total Clients"
                                value={stats.total_customers}
                                link="/admin/customer-profiles"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                                highlight={dashboardMode === 'registry'}
                            />
                            <StatCard
                                icon={<ShoppingBag />}
                                title="Total Products"
                                value={stats.products}
                                link="/admin/products"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                            />
                            <StatCard
                                icon={<TrendingUp />}
                                title="Subscribers"
                                value={stats.subscribers}
                                link="/admin/newsletter"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                icon={<ShoppingBag />}
                                title="Menu Items"
                                value={stats.pos_products || 0}
                                link="/admin/drink-manager"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                            />
                            <StatCard
                                icon={<TrendingUp />}
                                title="Total Sales"
                                value={stats.sales || 0}
                                link="/admin/sales-history"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                                highlight={dashboardMode === 'sales'}
                            />
                            <StatCard
                                icon={<Package />}
                                title="Stock Alerts"
                                value={stats.low_stock || 0}
                                link="/admin/drink-manager"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                            />
                            <StatCard
                                icon={<Activity />}
                                title="Daily Orders"
                                value={stats.daily_orders || 0}
                                link="/admin/daily-report"
                                loading={
                                    appointmentsLoading && appointments.length === 0
                                }
                            />
                        </>
                    )}
                </div>

                <motion.div
                    variants={cardVariants}
                    className="bg-[#fdfdfc] dark:bg-[#161b22] p-10 rounded-[3rem] border border-black/5 dark:border-[#30363d] shadow-md hover:shadow-lg dark:shadow-black/30 overflow-hidden relative group"
                >
                    <div className="relative">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    key={chartView}
                                    initial={{
                                        rotate: -180,
                                        scale: 0.5,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        rotate: 0,
                                        scale: 1,
                                        opacity: 1,
                                    }}
                                    className="p-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-3xl"
                                >
                                    {chartView === 'trend' ? (
                                        <TrendingUp size={28} />
                                    ) : (
                                        <PieIcon size={28} />
                                    )}
                                </motion.div>
                                <div>
                                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">
                                        {chartView === 'trend'
                                            ? 'Growth'
                                            : 'Types'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.3em]">
                                            {chartView === 'trend'
                                                ? 'History'
                                                : 'Client Profile'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <button
                                        onClick={() => setChartView('trend')}
                                        className={`p-3 rounded-xl transition-all duration-500 shadow-none ${
                                            chartView === 'trend'
                                                ? 'bg-white dark:bg-white text-black scale-105'
                                                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                        title="Trend Analysis"
                                    >
                                        <BarChart size={18} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setChartView('distribution')
                                        }
                                        className={`p-3 rounded-xl transition-all duration-500 shadow-none ${
                                            chartView === 'distribution'
                                                ? 'bg-white dark:bg-white text-black scale-105'
                                                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
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
                                                {['Day', 'Week', 'Month'].map(
                                                    (t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() =>
                                                                setTimeframe(
                                                                    t.toLowerCase()
                                                                )
                                                            }
                                                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${
                                                                timeframe ===
                                                                t.toLowerCase()
                                                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            {t}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                            <div className="flex gap-1 p-1.5 bg-black/5 dark:bg-[#0d1117] rounded-2xl border border-black/5 dark:border-[#30363d]">
                                                {activeOutlet === 'attire_lounge' ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                setDashboardMode(
                                                                    'services'
                                                                )
                                                            }
                                                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${
                                                                dashboardMode ===
                                                                'services'
                                                                    ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                                                            }`}
                                                        >
                                                            Consults
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setDashboardMode(
                                                                    'registry'
                                                                )
                                                            }
                                                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${
                                                                dashboardMode ===
                                                                'registry'
                                                                    ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                                                            }`}
                                                        >
                                                            Clients
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setDashboardMode(
                                                                'sales'
                                                            )
                                                        }
                                                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${
                                                            dashboardMode ===
                                                            'sales'
                                                                ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                                : 'text-gray-400 hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                                                        }`}
                                                    >
                                                        Sales Data
                                                    </button>
                                                )}
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
                                            {[
                                                {
                                                    id: 'nationality',
                                                    label: 'Nationality',
                                                },
                                                {
                                                    id: 'shirt_size',
                                                    label: 'Size',
                                                },
                                                {
                                                    id: 'preferred_color',
                                                    label: 'Color',
                                                },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() =>
                                                        setDistType(opt.id)
                                                    }
                                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-none ${
                                                        distType === opt.id
                                                            ? 'bg-black dark:bg-white text-white dark:text-black'
                                                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
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
                                        <motion.div
                                            key="trend-view"
                                            initial={{
                                                opacity: 0,
                                                scale: 0.98,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <MultiTrendChart
                                                data={
                                                    stats.trends
                                                        ? stats.trends[
                                                              timeframe
                                                          ]
                                                        : []
                                                }
                                                activeKey={
                                                    dashboardMode === 'services'
                                                        ? 'appointments'
                                                        : 'customers'
                                                }
                                                timeframe={timeframe}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="dist-view"
                                            initial={{
                                                opacity: 0,
                                                scale: 0.98,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <DemographicPieChart
                                                data={
                                                    stats.distributions
                                                        ? stats.distributions[
                                                              distType
                                                          ]
                                                        : []
                                                }
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-[2rem] border border-black/5 dark:border-white/5">
                                    <h3 className="text-xs font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] mb-6">
                                        Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <GlassyStatCard
                                            label="Peak Activity"
                                            value={
                                                stats.trends &&
                                                stats.trends[timeframe]
                                                    ?.length > 0
                                                    ? Math.max(
                                                          ...stats.trends[
                                                              timeframe
                                                          ].map(
                                                              (t) =>
                                                                  t[
                                                                      dashboardMode ===
                                                                      'services'
                                                                          ? 'appointments'
                                                                          : 'customers'
                                                                  ]
                                                          )
                                                      )
                                                    : 0
                                            }
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
                                                <ShieldCheck
                                                    className="text-[#0d3542] dark:text-[#58a6ff]"
                                                    size={14}
                                                />
                                                <span className="text-xs font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">
                                                    State
                                                </span>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        variants={cardVariants}
                        className="bg-[#fdfdfc] dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-md hover:shadow-lg dark:shadow-black/30"
                    >
                        <DailySummaryWidget
                            stats={stats}
                            loading={appointmentsLoading}
                        />
                    </motion.div>

                    <motion.div
                        variants={cardVariants}
                        className="bg-[#fdfdfc] dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-md hover:shadow-lg dark:shadow-black/30"
                    >
                        <RecentActivityWidget />
                    </motion.div>

                    <motion.div
                        variants={cardVariants}
                        className="bg-[#fdfdfc] dark:bg-[#161b22] p-8 rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-md hover:shadow-lg dark:shadow-black/30 flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                    Tools
                                </h2>
                                <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] mt-0.5">
                                    Shortcuts
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {activeOutlet === 'attire_lounge' ? (
                                <>
                                    <QuickAction
                                        icon={<Users />}
                                        title="Clients"
                                        description="Registry"
                                        link="/admin/customer-profiles"
                                    />
                                    <QuickAction
                                        icon={<Package />}
                                        title="Catalog"
                                        description="Inventory"
                                        link="/admin/products"
                                    />
                                    <QuickAction
                                        icon={<Plus />}
                                        title="Creation"
                                        description="New Item"
                                        link="/admin/products/new"
                                    />
                                    <QuickAction
                                        icon={<Calendar />}
                                        title="Bookings"
                                        description="Sessions"
                                        link="/admin/appointments"
                                    />
                                    <QuickAction
                                        icon={<Gift />}
                                        title="Gifting"
                                        description="Requests"
                                        link="/admin/customize-gift"
                                    />
                                </>
                            ) : (
                                <>
                                    <QuickAction 
                                        icon={<Package />} 
                                        title="Drink Menu" 
                                        description="Manage Drinks" 
                                        link="/admin/drink-manager" 
                                    />
                                    <QuickAction 
                                        icon={<TrendingUp />} 
                                        title="Sales" 
                                        description="History" 
                                        link="/admin/sales-history" 
                                    />
                                    <QuickAction 
                                        icon={<Activity />} 
                                        title="Reports" 
                                        description="Daily Summary" 
                                        link="/admin/daily-report" 
                                    />
                                    <QuickAction 
                                        icon={<Users />} 
                                        title="Staff" 
                                        description="User Manager" 
                                        link="/admin/users" 
                                    />
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
