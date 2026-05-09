import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Target, TrendingUp, TrendingDown, BarChart2, Award,
    Calendar, RefreshCw, Download, ChevronLeft, ChevronRight,
    Edit3, Check, X, Wallet, ShoppingBag, Package,
    ArrowUpRight, ArrowDownRight, Minus, AlertCircle,
    CreditCard, Banknote, QrCode, Clock, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from '../../ui/DatePicker';

// ─── helpers ────────────────────────────────────────────────────────────────
const authHeaders = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    return { Authorization: `Bearer ${token}` };
};

const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtNum = (n) => parseFloat(n || 0).toLocaleString('en-US');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const PAY_ICONS = {
    cash: <Banknote size={13} />,
    card: <CreditCard size={13} />,
    credit: <CreditCard size={13} />,
    debit: <CreditCard size={13} />,
    khqr: <QrCode size={13} />,
    qr_code: <QrCode size={13} />,
    deposit: <Clock size={13} />,
    aba: <QrCode size={13} />,
    acleda: <QrCode size={13} />,
    true_money: <Wallet size={13} />,
    foodpanda: <Wallet size={13} />,
    grab: <Wallet size={13} />,
    wownow: <Wallet size={13} />,
};

// ─── mini bar chart ──────────────────────────────────────────────────────────
const MiniBar = ({ data, targetRevenue }) => {
    if (!data || data.length === 0) return (
        <div className="h-32 flex items-center justify-center opacity-20 text-xs uppercase tracking-widest">No data</div>
    );

    const max = Math.max(...data.map(d => parseFloat(d.revenue)), 1);
    const dailyTarget = targetRevenue ? targetRevenue / data.length : null;

    return (
        <div className="flex items-end gap-[3px] h-32 w-full">
            {data.map((d, i) => {
                const pct = (parseFloat(d.revenue) / max) * 100;
                const dayNum = parseInt(d.day.split('-')[2]);
                const isToday = d.day === new Date().toISOString().split('T')[0];
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0d1117] text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border border-white/10">
                            <p className="font-bold">{d.day}</p>
                            <p>{fmt(d.revenue)}</p>
                            <p className="text-white/40">{d.invoices} invoices</p>
                        </div>
                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-sm relative overflow-hidden" style={{ height: '100%' }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${pct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
                                className={`absolute bottom-0 w-full rounded-sm ${isToday ? 'bg-[#0d3542] dark:bg-[#58a6ff]' : 'bg-[#0d3542]/40 dark:bg-[#58a6ff]/40'}`}
                            />
                        </div>
                        {dayNum % 5 === 0 && (
                            <span className="text-[8px] text-gray-400 dark:text-[#8b949e]/40 font-bold">{dayNum}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── progress ring ───────────────────────────────────────────────────────────
const ProgressRing = ({ value, max, size = 80, strokeWidth = 7 }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min((value / max) * 100, 100);
    const offset = circumference - (pct / 100) * circumference;
    const color = pct >= 100 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#0d3542';

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke="currentColor" strokeWidth={strokeWidth} className="text-black/5 dark:text-white/5" />
            <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                strokeLinecap="round" />
        </svg>
    );
};

// ─── stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, trend, color = 'text-[#0d3542] dark:text-[#58a6ff]' }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl group">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/50">{label}</p>
                <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
                {sub && <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl bg-black/[0.03] dark:bg-[#0d1117] ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
        {trend !== undefined && (
            <div className={`mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {trend > 0 ? <ArrowUpRight size={12} /> : trend < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                <span>{trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : 'No change'} vs prev month</span>
            </div>
        )}
    </motion.div>
);

// ─── Export helpers ───────────────────────────────────────────────────────────
const exportCSV = (monthly, daily, selectedDate) => {
    const rows = [];
    rows.push(['ATTIRE LOUNGE — DAILY REPORT', selectedDate]);
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Revenue', daily?.total_revenue ?? '']);
    rows.push(['Total Refunds', daily?.total_refunds ?? '']);
    rows.push(['Net Revenue', daily?.net_revenue ?? '']);
    rows.push(['Invoice Count', daily?.invoice_count ?? '']);
    rows.push(['Avg Order Value', daily?.avg_order_value ?? '']);
    rows.push([]);
    rows.push(['TOP SELLERS']);
    rows.push(['Product', 'SKU', 'Qty Sold', 'Revenue']);
    (daily?.top_sellers ?? []).forEach(p => {
        rows.push([`${p.product_name} ${p.product_variant ?? ''}`.trim(), p.product_sku ?? '', p.total_qty, p.total_revenue]);
    });
    rows.push([]);
    rows.push(['PAYMENT BREAKDOWN']);
    rows.push(['Method', 'Total']);
    (daily?.payment_breakdown ?? []).forEach(p => {
        rows.push([p.method.toUpperCase(), p.total]);
    });

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attire-lounge-report-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DailyReportManager = () => {
    const today = new Date().toISOString().split('T')[0];
    const [view, setView] = useState('daily'); // 'daily' | 'monthly'
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Target editor
    const [editingTarget, setEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState('');
    const [targetNotes, setTargetNotes] = useState('');
    const [savingTarget, setSavingTarget] = useState(false);

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchDaily = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/sales-report/daily', {
                params: { date: selectedDate },
                headers: authHeaders(),
            });
            setDailyData(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    }, [selectedDate]);

    const fetchMonthly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/sales-report/monthly', {
                params: { year: selectedYear, month: selectedMonth },
                headers: authHeaders(),
            });
            setMonthlyData(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    }, [selectedYear, selectedMonth]);

    const fetchTargets = useCallback(async () => {
        try {
            const res = await axios.get('/api/v1/admin/sales-report/targets', { headers: authHeaders() });
            setTargets(res.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { if (view === 'daily') fetchDaily(); }, [view, fetchDaily]);
    useEffect(() => { if (view === 'monthly') { fetchMonthly(); fetchTargets(); } }, [view, fetchMonthly, fetchTargets]);

    // ── target for current month ─────────────────────────────────────────────
    const currentTarget = targets.find(t => t.year === selectedYear && t.month === selectedMonth);
    const targetRevenue = parseFloat(currentTarget?.target_revenue ?? 0);
    const netRevenue = parseFloat(monthlyData?.net_revenue ?? 0);
    const targetPct = targetRevenue > 0 ? Math.min((netRevenue / targetRevenue) * 100, 100) : 0;

    const openTargetEditor = () => {
        setTargetInput(currentTarget?.target_revenue ?? '');
        setTargetNotes(currentTarget?.notes ?? '');
        setEditingTarget(true);
    };

    const saveTarget = async () => {
        if (!targetInput || isNaN(targetInput)) return;
        setSavingTarget(true);
        try {
            await axios.post('/api/v1/admin/sales-report/targets', {
                year: selectedYear, month: selectedMonth,
                target_revenue: parseFloat(targetInput),
                notes: targetNotes || null,
            }, { headers: authHeaders() });
            await fetchTargets();
            await fetchMonthly();
            setEditingTarget(false);
        } catch (e) { console.error(e); }
        finally { setSavingTarget(false); }
    };

    // ── navigate month ────────────────────────────────────────────────────────
    const prevMonth = () => {
        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
        else setSelectedMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
        else setSelectedMonth(m => m + 1);
    };

    // ── daily date nav ────────────────────────────────────────────────────────
    const prevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };
    const nextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        if (d.toISOString().split('T')[0] <= today) setSelectedDate(d.toISOString().split('T')[0]);
    };

    const data = view === 'daily' ? dailyData : monthlyData;

    return (
        <div className="p-6 md:p-8 space-y-8 font-sans">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em]">
                        Daily Report
                    </h1>
                    <p className="text-xs text-gray-400 dark:text-[#8b949e]/50 mt-1 uppercase tracking-widest">
                        Revenue insights, goals & top performers
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-black/[0.03] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl p-1">
                        {['daily', 'monthly'].map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-400 dark:text-[#8b949e]/50 hover:text-[#0d3542] dark:hover:text-[#58a6ff]'}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => view === 'daily' ? fetchDaily() : fetchMonthly()}
                        className="p-2.5 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {view === 'daily' && (
                        <button onClick={() => exportCSV(monthlyData, dailyData, selectedDate)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                            <Download size={13} /> Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* ── Date / Month Navigator ── */}
            <div className="flex items-center gap-3 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl p-4">
                <button onClick={view === 'daily' ? prevDay : prevMonth}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all">
                    <ChevronLeft size={16} />
                </button>

                {view === 'daily' ? (
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <DatePicker 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-48 mx-auto -mt-2"
                            inputClassName="bg-transparent border-none outline-none text-center text-sm font-black uppercase tracking-widest text-gray-900 dark:text-[#c9d1d9] shadow-none !py-0 !px-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:ring-0"
                            placeholder="SELECT DATE"
                        />
                        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-1">
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-[#c9d1d9]">
                            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-1">Monthly Overview</p>
                    </div>
                )}

                <button onClick={view === 'daily' ? nextDay : nextMonth}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-5 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl animate-pulse h-28" />
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                        {/* ── KPI Grid ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Net Revenue" value={fmt(data?.net_revenue)} icon={<Wallet size={18} />} />
                            <StatCard label="Total Sales" value={fmt(data?.total_revenue)} icon={<TrendingUp size={18} />} />
                            <StatCard label="Refunds" value={fmt(data?.total_refunds)} icon={<TrendingDown size={18} />} color="text-red-500" />
                            <StatCard
                                label={view === 'daily' ? 'Avg Order Value' : 'Invoices'}
                                value={view === 'daily' ? fmt(data?.avg_order_value) : fmtNum(data?.daily_breakdown?.reduce((a, d) => a + d.invoices, 0))}
                                icon={<ShoppingBag size={18} />}
                            />
                        </div>

                        {/* ── Monthly: Target Progress + Chart ── */}
                        {view === 'monthly' && (
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Target Card */}
                                <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/50">Monthly Target</p>
                                            {editingTarget ? (
                                                <div className="mt-2 space-y-2">
                                                    <input type="number" value={targetInput} onChange={e => setTargetInput(e.target.value)}
                                                        placeholder="e.g. 20000"
                                                        className="w-full bg-black/[0.03] dark:bg-[#0d1117] border border-black/10 dark:border-[#30363d] rounded-lg px-3 py-2 text-sm font-black outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] text-gray-900 dark:text-[#c9d1d9]" />
                                                    <textarea value={targetNotes} onChange={e => setTargetNotes(e.target.value)}
                                                        placeholder="Notes (optional)"
                                                        rows={2}
                                                        className="w-full bg-black/[0.03] dark:bg-[#0d1117] border border-black/10 dark:border-[#30363d] rounded-lg px-3 py-2 text-xs outline-none text-gray-700 dark:text-[#8b949e] resize-none" />
                                                    <div className="flex gap-2">
                                                        <button onClick={saveTarget} disabled={savingTarget}
                                                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                            {savingTarget ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />} Save
                                                        </button>
                                                        <button onClick={() => setEditingTarget(false)}
                                                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-black/5 dark:bg-white/5 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                            <X size={12} /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-black tracking-tight text-[#0d3542] dark:text-[#58a6ff] mt-1">
                                                    {targetRevenue > 0 ? fmt(targetRevenue) : <span className="text-gray-300 dark:text-[#30363d]">Not set</span>}
                                                </p>
                                            )}
                                        </div>
                                        {!editingTarget && (
                                            <button onClick={openTargetEditor}
                                                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all">
                                                <Edit3 size={15} />
                                            </button>
                                        )}
                                    </div>

                                    {!editingTarget && targetRevenue > 0 && (
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <ProgressRing value={netRevenue} max={targetRevenue} size={72} strokeWidth={6} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[11px] font-black text-gray-900 dark:text-[#c9d1d9]">{Math.round(targetPct)}%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest">Achieved</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-[#c9d1d9]">{fmt(netRevenue)}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                    {targetRevenue - netRevenue > 0 ? `${fmt(targetRevenue - netRevenue)} to go` : '🎉 Target hit!'}
                                                </p>
                                                {currentTarget?.notes && (
                                                    <p className="text-[10px] text-gray-400 italic mt-1">"{currentTarget.notes}"</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!editingTarget && targetRevenue === 0 && (
                                        <button onClick={openTargetEditor}
                                            className="mt-3 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-black/10 dark:border-[#30363d] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 transition-all">
                                            <Target size={13} /> Set Target for {MONTHS[selectedMonth - 1]}
                                        </button>
                                    )}
                                </div>

                                {/* Chart */}
                                <div className="md:col-span-2 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl p-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/50 mb-4">Daily Revenue — {MONTHS[selectedMonth - 1]} {selectedYear}</p>
                                    <MiniBar data={monthlyData?.daily_breakdown} targetRevenue={targetRevenue} />
                                </div>
                            </div>
                        )}

                        {/* ── Top Sellers ── */}
                        <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-black/5 dark:border-[#30363d] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-[#c9d1d9]">Top Sellers</p>
                                </div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">by qty sold</p>
                            </div>
                            <div className="divide-y divide-black/5 dark:divide-[#30363d]">
                                {(data?.top_sellers ?? []).length === 0 ? (
                                    <div className="px-6 py-12 text-center opacity-30 text-xs uppercase tracking-widest">No sales data</div>
                                ) : (
                                    (data?.top_sellers ?? []).map((item, i) => {
                                        const maxQty = data.top_sellers[0]?.total_qty ?? 1;
                                        const barPct = (item.total_qty / maxQty) * 100;
                                        return (
                                            <div key={i} className="px-6 py-4 flex items-center gap-4 group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                                <span className={`w-6 text-center text-[10px] font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-300 dark:text-white/20'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3 mb-1">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <p className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-[#c9d1d9] truncate">
                                                                {item.product_name} {item.product_variant ?? ''}
                                                            </p>
                                                            {item.product_sku && (
                                                                <span className="text-[9px] px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-gray-400 dark:text-[#8b949e]/50 font-bold uppercase tracking-widest whitespace-nowrap">
                                                                    {item.product_sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-xs font-black text-[#0d3542] dark:text-[#58a6ff]">{fmtNum(item.total_qty)} units</p>
                                                            <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">{fmt(item.total_revenue)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
                                                            transition={{ duration: 0.7, delay: i * 0.05 }}
                                                            className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-[#0d3542]/40 dark:bg-[#58a6ff]/40'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* ── Bottom Row: Category + Payment ── */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Category breakdown */}
                            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-black/5 dark:border-[#30363d] flex items-center gap-2">
                                    <Layers size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-[#c9d1d9]">Category Breakdown</p>
                                </div>
                                <div className="divide-y divide-black/5 dark:divide-[#30363d]">
                                    {(data?.category_breakdown ?? []).length === 0 ? (
                                        <div className="px-6 py-10 text-center opacity-30 text-xs uppercase tracking-widest">No data</div>
                                    ) : (
                                        (data?.category_breakdown ?? []).map((cat, i) => {
                                            const maxRev = data.category_breakdown[0]?.total_revenue ?? 1;
                                            return (
                                                <div key={i} className="px-6 py-3 flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-[#c9d1d9]">{cat.category}</p>
                                                            <p className="text-[10px] font-black text-[#0d3542] dark:text-[#58a6ff]">{fmt(cat.total_revenue)}</p>
                                                        </div>
                                                        <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.total_revenue / maxRev) * 100}%` }}
                                                                transition={{ duration: 0.7, delay: i * 0.04 }}
                                                                className="h-full bg-[#0d3542]/50 dark:bg-[#58a6ff]/50 rounded-full" />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest whitespace-nowrap">{fmtNum(cat.total_qty)} pcs</p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Payment breakdown */}
                            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-black/5 dark:border-[#30363d] flex items-center gap-2">
                                    <CreditCard size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-[#c9d1d9]">Payment Methods</p>
                                </div>
                                {(data?.payment_breakdown ?? []).length === 0 ? (
                                    <div className="px-6 py-10 text-center opacity-30 text-xs uppercase tracking-widest">No data</div>
                                ) : (
                                    <div className="p-6 space-y-3">
                                        {(data?.payment_breakdown ?? []).map((p, i) => {
                                            const maxTotal = data.payment_breakdown.reduce((a, x) => a + parseFloat(x.total), 0) || 1;
                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-[#c9d1d9]">
                                                            {PAY_ICONS[p.method] ?? <Banknote size={13} />}
                                                            {p.method.replace('_', ' ')}
                                                        </div>
                                                        <p className="text-[10px] font-black text-[#0d3542] dark:text-[#58a6ff]">{fmt(p.total)}</p>
                                                    </div>
                                                    <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(parseFloat(p.total) / maxTotal) * 100}%` }}
                                                            transition={{ duration: 0.7, delay: i * 0.05 }}
                                                            className="h-full bg-[#0d3542]/60 dark:bg-[#58a6ff]/60 rounded-full" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Daily Transactions ── */}
                        {view === 'daily' && (data?.invoices ?? []).length > 0 && (
                            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden mt-6">
                                <div className="px-6 py-4 border-b border-black/5 dark:border-[#30363d] flex items-center gap-2">
                                    <Clock size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-[#c9d1d9]">Daily Transactions</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[9px] uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50">
                                            <tr>
                                                <th className="px-6 py-3 font-bold">Invoice</th>
                                                <th className="px-6 py-3 font-bold">Customer</th>
                                                <th className="px-6 py-3 font-bold">Items</th>
                                                <th className="px-6 py-3 font-bold text-right">Total</th>
                                                <th className="px-6 py-3 font-bold text-right">Payment Methods</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                                            {data.invoices.map((inv, i) => (
                                                <tr key={i} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-black text-gray-900 dark:text-[#c9d1d9]">{inv.invoice_number}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 mt-0.5">{new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-[#c9d1d9]">
                                                        {inv.customer ? `${inv.customer.first_name} ${inv.customer.last_name || ''}`.trim() : 'Walk-in'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-[#8b949e]">
                                                        {inv.items?.reduce((a, item) => a + item.quantity, 0) || 0} pcs
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-black text-[#0d3542] dark:text-[#58a6ff] text-right">
                                                        {fmt(inv.grand_total)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 flex-wrap">
                                                            {(inv.payments ?? []).map((p, j) => (
                                                                <span key={j} className="flex items-center gap-1 px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-[#8b949e]">
                                                                    {PAY_ICONS[p.method] ?? null}
                                                                    {p.method.replace('_', ' ')}
                                                                    {inv.payments.length > 1 && ` (${fmt(p.amount)})`}
                                                                </span>
                                                            ))}
                                                            {(!inv.payments || inv.payments.length === 0) && (
                                                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">N/A</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default DailyReportManager;
