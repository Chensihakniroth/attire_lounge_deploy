import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    Target, TrendingUp, TrendingDown, BarChart2, Award,
    Calendar, RefreshCw, Download, ChevronLeft, ChevronRight,
    Edit3, Check, X, Wallet, ShoppingBag, Package,
    ArrowUpRight, ArrowDownRight, Minus, AlertCircle,
    CreditCard, Banknote, QrCode, Clock, Layers,
    Trash2, Copy, Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from '../../ui/DatePicker';
import { useAdmin } from './AdminContext';
import { useNavigate } from 'react-router-dom';

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

// ─── Timezone-safe local date helpers ─────────────────────────────────────────
export const toLocalDateStr = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = String(dateStr).split('T')[0].split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const addDays = (dateStr, days) => {
    const d = parseLocalDate(dateStr);
    d.setDate(d.getDate() + days);
    return toLocalDateStr(d);
};

// ─── week helpers ────────────────────────────────────────────────────────────
const getWeekStart = (dateStr) => {
    const d = parseLocalDate(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return toLocalDateStr(d);
};
const getWeekEnd = (dateStr) => {
    const start = parseLocalDate(getWeekStart(dateStr));
    start.setDate(start.getDate() + 6);
    return toLocalDateStr(start);
};
const formatWeekRange = (startStr) => {
    const start = parseLocalDate(startStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};
const formatPeriodRange = (startStr, endStr) => {
    const start = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);
    const yearOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) {
        return start.toLocaleDateString('en-US', yearOpts);
    }
    if (start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', yearOpts)}`;
    }
    return `${start.toLocaleDateString('en-US', yearOpts)} - ${end.toLocaleDateString('en-US', yearOpts)}`;
};
const periodSpanDays = (startStr, endStr) =>
    Math.round((parseLocalDate(endStr) - parseLocalDate(startStr)) / 86400000) + 1;

// ─── outlet-aware unit label ────────────────────────────────────────────────
const useUnitLabel = (outlet) => {
    if (outlet === 'kravat' || outlet === 'caffeine') return { sold: 'Cups Sold', unit: 'cups', shortUnit: 'cups' };
    if (outlet === 'attire_lounge') return { sold: 'Items Sold', unit: 'items', shortUnit: 'items' };
    return { sold: 'Pairs Sold', unit: 'pairs', shortUnit: 'pairs' }; // nile (default)
};

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
    woocommerce: <Wallet size={13} />,
    wc: <Wallet size={13} />,
};

const getOutletName = (slug) => {
    if (slug === 'kravat') return 'Kravat';
    if (slug === 'caffeine') return 'Caffeine';
    if (slug === 'attire_lounge') return 'Attire Lounge';
    return 'Nile';
};

// ─── Fill missing days helpers ────────────────────────────────────────────────
const fillDays = (data, year, month) => {
    if (!year || !month) return data || [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const lookup = {};
    (data || []).forEach(d => { lookup[d.day] = d; });
    const filled = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        filled.push(lookup[key] || { day: key, revenue: 0, invoices: 0 });
    }
    return filled;
};

const fillPeriodDays = (data, startStr, endStr) => {
    if (!startStr || !endStr) return data || [];
    const lookup = {};
    (data || []).forEach(d => { lookup[d.day] = d; });
    const filled = [];
    const cur = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');

    while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        filled.push(lookup[key] || { day: key, revenue: 0, invoices: 0 });
        cur.setDate(cur.getDate() + 1);
    }
    return filled;
};

// ─── trend chart ──────────────────────────────────────────────────────────
const TrendChart = ({ data, height = 'h-40' }) => {
    if (!data || data.length === 0) {
        return (
            <div className={`${height} flex flex-col items-center justify-center text-gray-400 dark:text-white/30 text-xs gap-1.5`}>
                <BarChart2 size={20} className="opacity-30" />
                <span className="font-semibold text-[10px] uppercase tracking-wider">No sales data in this period</span>
            </div>
        );
    }

    const revenues = data.map(d => parseFloat(d.revenue || 0));
    const max = Math.max(...revenues, 1);
    const totalRev = revenues.reduce((a, b) => a + b, 0);

    return (
        <div className={`w-full ${height} flex flex-col justify-between pt-1 select-none`}>
            {/* Chart Columns Area */}
            <div className="w-full flex-1 flex items-end justify-between gap-1 sm:gap-1.5 pb-2 relative">
                {data.map((d, i) => {
                    const rev = parseFloat(d.revenue || 0);
                    const pct = max > 0 && rev > 0 ? Math.max((rev / max) * 100, 6) : 0;
                    const dateObj = new Date(d.day + 'T00:00:00');
                    const dayNum = dateObj.getDate();
                    const isToday = d.day === new Date().toISOString().split('T')[0];
                    const hasRevenue = rev > 0;
                    const showLabel = data.length <= 14 || dayNum % 5 === 0 || i === 0 || i === data.length - 1;

                    return (
                        <div key={i} className="h-full flex-1 flex flex-col items-center justify-end relative group">
                            {/* Hover Floating Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-950/95 dark:bg-[#161b22]/95 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none border border-white/10 shadow-2xl z-30 min-w-[120px] text-center scale-95 group-hover:scale-100">
                                <p className="font-semibold text-white/60 text-[9px] uppercase tracking-wider">
                                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                </p>
                                <p className="text-emerald-400 font-bold text-xs mt-0.5">{fmt(rev)}</p>
                                <p className="text-white/40 text-[9px] mt-0.5">{d.invoices || 0} {d.invoices === 1 ? 'order' : 'orders'}</p>
                            </div>

                            {/* Bar Track & Fill */}
                            <div className={`w-full max-w-[34px] h-full bg-black/[0.03] dark:bg-white/[0.04] rounded-lg relative overflow-hidden flex flex-col justify-end p-0.5 border transition-all duration-200 ${
                                isToday 
                                    ? 'border-[#0d3542]/30 dark:border-white/30 bg-black/[0.05] dark:bg-white/[0.06]' 
                                    : 'border-black/[0.02] dark:border-white/[0.03] group-hover:border-black/10 dark:group-hover:border-white/15 group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.07]'
                            }`}>
                                {hasRevenue ? (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        transition={{ duration: 0.5, delay: Math.min(i * 0.02, 0.3), ease: [0.22, 1, 0.36, 1] }}
                                        className={`w-full rounded-md transition-opacity ${
                                            isToday
                                                ? 'bg-[#0d3542] dark:bg-white shadow-xs'
                                                : 'bg-[#0d3542]/85 dark:bg-white/85 group-hover:bg-[#0d3542] dark:group-hover:bg-white'
                                        }`}
                                    />
                                ) : (
                                    <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full" />
                                )}
                            </div>

                            {/* Day Axis Label */}
                            <div className="h-4 flex items-center justify-center mt-1">
                                {showLabel ? (
                                    <span className={`text-[9px] font-bold transition-colors ${
                                        isToday 
                                            ? 'text-[#0d3542] dark:text-white font-black underline underline-offset-2' 
                                            : 'text-gray-400 dark:text-white/30 group-hover:text-gray-900 dark:group-hover:text-white'
                                    }`}>
                                        {dayNum}
                                    </span>
                                ) : (
                                    <span className="size-1 rounded-full bg-black/10 dark:bg-white/10" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── progress ring ───────────────────────────────────────────────────────────
const ProgressRing = ({ value, max, size = 80, strokeWidth = 7 }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
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
const StatCard = ({ label, value, sub, icon, trend, color = 'text-gray-900 dark:text-white' }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl shadow-2xs group hover:border-black/10 dark:hover:border-white/15 transition-all">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">{label}</p>
                <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
                {sub && <p className="text-[10px] text-gray-400 dark:text-white/40 font-medium">{sub}</p>}
            </div>
            <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-[#0d3542] dark:text-white group-hover:scale-105 transition-transform">
                {icon}
            </div>
        </div>
        {trend !== undefined && (
            <div className={`mt-2.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                {trend > 0 ? <ArrowUpRight size={12} /> : trend < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                <span>{trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : '0%'} vs prev month</span>
            </div>
        )}
    </motion.div>
);

// ─── Export helpers ───────────────────────────────────────────────────────────
const downloadCSV = (rows, filename) => {
    const formatCell = (val) => {
        if (val === null || val === undefined) return '""';
        let str = String(val);
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    };

    // Prepend UTF-8 BOM (\uFEFF) so Excel properly decodes Unicode characters and currency formats
    const csvContent = '\uFEFF' + rows.map(r => r.map(formatCell).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const exportDailyCSV = (daily, selectedDate, outlet, endDate) => {
    const unitLabel = useUnitLabel(outlet);
    const outletName = getOutletName(outlet).toUpperCase();
    const isPeriod = !!endDate;
    const rangeLabel = isPeriod
        ? (endDate === selectedDate ? selectedDate : `${selectedDate} to ${endDate}`)
        : selectedDate;
    const rows = [];

    // Title
    rows.push([`${outletName} — ${isPeriod ? 'PERIOD SALES REPORT' : 'DAILY SALES REPORT'}`, rangeLabel]);
    rows.push(['Generated At', new Date().toLocaleString('en-US')]);
    rows.push([]);

    // Summary
    rows.push(['SUMMARY KEY PERFORMANCE INDICATORS']);
    rows.push(['Metric', 'Value']);
    if (isPeriod) rows.push(['Period Range', rangeLabel]);
    rows.push(['Total Revenue ($)', parseFloat(daily?.total_revenue || 0).toFixed(2)]);
    rows.push(['Net Revenue ($)', parseFloat(daily?.net_revenue || 0).toFixed(2)]);
    rows.push(['Total Refunds ($)', parseFloat(daily?.total_refunds || 0).toFixed(2)]);
    rows.push([unitLabel.sold, daily?.total_items ?? 0]);
    rows.push(['Invoice Count', daily?.invoice_count ?? 0]);
    rows.push(['Avg Order Value ($)', parseFloat(daily?.avg_order_value || 0).toFixed(2)]);
    rows.push([]);

    // Daily Breakdown (for period)
    if (isPeriod) {
        rows.push(['DAILY BREAKDOWN']);
        rows.push(['Date', 'Day of Week', 'Revenue ($)', 'Invoices', 'Avg / Order ($)']);
        const filled = fillPeriodDays(daily?.daily_breakdown ?? [], selectedDate, endDate || selectedDate);
        filled.forEach(d => {
            const dateObj = new Date(d.day + 'T00:00:00');
            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const rev = parseFloat(d.revenue || 0);
            const invs = parseInt(d.invoices || 0);
            const avg = invs > 0 ? (rev / invs).toFixed(2) : '0.00';
            rows.push([d.day, weekday, rev.toFixed(2), invs, avg]);
        });
        rows.push([]);
    }

    // Category Breakdown
    if (daily?.category_breakdown && daily.category_breakdown.length > 0) {
        rows.push(['CATEGORY BREAKDOWN']);
        rows.push(['Category', 'Qty Sold', 'Revenue ($)']);
        daily.category_breakdown.forEach(c => {
            rows.push([c.category || 'Uncategorized', c.total_qty || 0, parseFloat(c.total_revenue || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Top Sellers
    if (daily?.top_sellers && daily.top_sellers.length > 0) {
        rows.push(['TOP SELLING PRODUCTS']);
        rows.push(['Product Name', 'Variant', 'SKU', 'Qty Sold', 'Revenue ($)']);
        daily.top_sellers.forEach(p => {
            rows.push([p.product_name || '', p.product_variant || '', p.product_sku || '', p.total_qty || 0, parseFloat(p.total_revenue || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Payment Breakdown
    if (daily?.payment_breakdown && daily.payment_breakdown.length > 0) {
        rows.push(['PAYMENT METHODS BREAKDOWN']);
        rows.push(['Payment Method', 'Total Amount ($)']);
        daily.payment_breakdown.forEach(p => {
            rows.push([p.method.toUpperCase(), parseFloat(p.total || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Detailed Invoices / Transactions
    if (daily?.invoices && daily.invoices.length > 0) {
        rows.push(['TRANSACTION DETAILS']);
        rows.push(['Invoice #', 'Date', 'Time', 'Customer', 'Items Qty', 'Grand Total ($)', 'Payment Methods', 'Status']);
        daily.invoices.forEach(inv => {
            const dateStr = inv.date || (inv.created_at ? inv.created_at.split('T')[0] : '');
            const timeStr = inv.created_at ? new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
            const customerName = inv.order_source === 'woocommerce' || inv.wc_order_id
                ? 'Website'
                : inv.customer ? `${inv.customer.first_name || ''} ${inv.customer.last_name || ''}`.trim() : 'Walk-in';
            const itemsQty = inv.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
            const payMethods = (inv.payments ?? []).map(p => `${p.method.toUpperCase()} ($${parseFloat(p.amount || 0).toFixed(2)})`).join('; ') || (inv.order_source === 'woocommerce' || inv.wc_order_id ? 'WC' : 'N/A');
            rows.push([
                inv.invoice_number || `#${inv.id}`,
                dateStr,
                timeStr,
                customerName || 'Walk-in',
                itemsQty,
                parseFloat(inv.grand_total || 0).toFixed(2),
                payMethods,
                (inv.status || 'completed').toUpperCase()
            ]);
        });
    }

    const slug = (outlet || 'store').replace(/_/g, '-');
    downloadCSV(rows, isPeriod
        ? `${slug}-period-report-${selectedDate}-to-${endDate || selectedDate}.csv`
        : `${slug}-daily-report-${selectedDate}.csv`);
};

const exportMonthlyCSV = (monthly, selectedYear, selectedMonth, outlet, targetRevenue, currentTarget) => {
    const unitLabel = useUnitLabel(outlet);
    const outletName = getOutletName(outlet).toUpperCase();
    const monthName = MONTH_NAMES[selectedMonth - 1];
    const rows = [];

    // Title
    rows.push([`${outletName} — MONTHLY SALES REPORT`, `${monthName} ${selectedYear}`]);
    rows.push(['Generated At', new Date().toLocaleString('en-US')]);
    rows.push([]);

    // Summary
    rows.push(['SUMMARY KEY PERFORMANCE INDICATORS']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Revenue ($)', parseFloat(monthly?.total_revenue || 0).toFixed(2)]);
    rows.push(['Net Revenue ($)', parseFloat(monthly?.net_revenue || 0).toFixed(2)]);
    rows.push(['Total Refunds ($)', parseFloat(monthly?.total_refunds || 0).toFixed(2)]);
    rows.push([unitLabel.sold, monthly?.total_items ?? 0]);
    rows.push(['Monthly Target ($)', targetRevenue > 0 ? parseFloat(targetRevenue).toFixed(2) : 'Not set']);
    if (targetRevenue > 0) {
        const achieved = parseFloat(monthly?.net_revenue ?? 0);
        const pct = Math.min((achieved / targetRevenue) * 100, 100);
        rows.push(['Target Achieved %', `${pct.toFixed(1)}%`]);
        rows.push(['Remaining to Target ($)', Math.max(targetRevenue - achieved, 0).toFixed(2)]);
    }
    if (currentTarget?.notes) {
        rows.push(['Target Notes', currentTarget.notes]);
    }
    rows.push([]);

    // Daily Breakdown
    rows.push(['DAILY BREAKDOWN']);
    rows.push(['Date', 'Day of Week', 'Revenue ($)', 'Invoices', 'Avg / Order ($)']);
    const filled = fillDays(monthly?.daily_breakdown ?? [], selectedYear, selectedMonth);
    filled.forEach(d => {
        const dateObj = new Date(d.day + 'T00:00:00');
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const rev = parseFloat(d.revenue || 0);
        const invs = parseInt(d.invoices || 0);
        const avg = invs > 0 ? (rev / invs).toFixed(2) : '0.00';
        rows.push([d.day, weekday, rev.toFixed(2), invs, avg]);
    });
    rows.push([]);

    // Category Breakdown
    if (monthly?.category_breakdown && monthly.category_breakdown.length > 0) {
        rows.push(['CATEGORY BREAKDOWN']);
        rows.push(['Category', 'Qty Sold', 'Revenue ($)']);
        monthly.category_breakdown.forEach(c => {
            rows.push([c.category || 'Uncategorized', c.total_qty || 0, parseFloat(c.total_revenue || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Top Sellers
    if (monthly?.top_sellers && monthly.top_sellers.length > 0) {
        rows.push(['TOP SELLING PRODUCTS']);
        rows.push(['Product Name', 'Variant', 'SKU', 'Qty Sold', 'Revenue ($)']);
        monthly.top_sellers.forEach(p => {
            rows.push([p.product_name || '', p.product_variant || '', p.product_sku || '', p.total_qty || 0, parseFloat(p.total_revenue || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Payment Breakdown
    if (monthly?.payment_breakdown && monthly.payment_breakdown.length > 0) {
        rows.push(['PAYMENT METHODS BREAKDOWN']);
        rows.push(['Payment Method', 'Total Amount ($)']);
        monthly.payment_breakdown.forEach(p => {
            rows.push([p.method.toUpperCase(), parseFloat(p.total || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    const slug = (outlet || 'store').replace(/_/g, '-');
    downloadCSV(rows, `${slug}-monthly-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`);
};

const exportWeeklyCSV = (weekly, weekStart, outlet) => {
    const unitLabel = useUnitLabel(outlet);
    const outletName = getOutletName(outlet).toUpperCase();
    const range = formatWeekRange(weekStart);
    const rows = [];

    // Title
    rows.push([`${outletName} — WEEKLY SALES REPORT`, range]);
    rows.push(['Generated At', new Date().toLocaleString('en-US')]);
    rows.push([]);

    // Summary
    rows.push(['SUMMARY KEY PERFORMANCE INDICATORS']);
    rows.push(['Metric', 'Value']);
    rows.push(['Week Period', `${getWeekStart(weekStart)} to ${getWeekEnd(weekStart)}`]);
    rows.push(['Total Revenue ($)', parseFloat(weekly?.total_revenue || 0).toFixed(2)]);
    rows.push(['Net Revenue ($)', parseFloat(weekly?.net_revenue || 0).toFixed(2)]);
    rows.push(['Total Refunds ($)', parseFloat(weekly?.total_refunds || 0).toFixed(2)]);
    rows.push([unitLabel.sold, weekly?.total_items ?? 0]);
    rows.push(['Invoice Count', weekly?.invoice_count ?? 0]);
    rows.push([]);

    // Daily Breakdown
    rows.push(['DAILY BREAKDOWN']);
    rows.push(['Date', 'Day of Week', 'Revenue ($)', 'Invoices', 'Avg / Order ($)']);
    const filled = fillPeriodDays(weekly?.daily_breakdown ?? [], getWeekStart(weekStart), getWeekEnd(weekStart));
    filled.forEach(d => {
        const dateObj = new Date(d.day + 'T00:00:00');
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const rev = parseFloat(d.revenue || 0);
        const invs = parseInt(d.invoices || 0);
        const avg = invs > 0 ? (rev / invs).toFixed(2) : '0.00';
        rows.push([d.day, weekday, rev.toFixed(2), invs, avg]);
    });
    rows.push([]);

    // Category Breakdown
    if (weekly?.category_breakdown && weekly.category_breakdown.length > 0) {
        rows.push(['CATEGORY BREAKDOWN']);
        rows.push(['Category', 'Qty Sold', 'Revenue ($)']);
        weekly.category_breakdown.forEach(c => {
            rows.push([c.category || 'Uncategorized', c.total_qty || 0, parseFloat(c.total_revenue || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Top Sellers
    if (weekly?.top_sellers && weekly.top_sellers.length > 0) {
        rows.push(['TOP SELLING PRODUCTS']);
        rows.push(['Product Name', 'Variant', 'SKU', 'Qty Sold', 'Revenue ($)']);
        weekly.top_sellers.forEach(p => {
            rows.push([p.product_name || '', p.product_variant || '', p.product_sku || '', p.total_qty || 0, parseFloat(p.total_revenue || 0).toFixed(2)]);
        });
        rows.push([]);
    }

    // Detailed Invoices
    if (weekly?.invoices && weekly.invoices.length > 0) {
        rows.push(['TRANSACTION DETAILS']);
        rows.push(['Invoice #', 'Date', 'Time', 'Customer', 'Items Qty', 'Grand Total ($)', 'Payment Methods', 'Status']);
        weekly.invoices.forEach(inv => {
            const dateStr = inv.date || (inv.created_at ? inv.created_at.split('T')[0] : '');
            const timeStr = inv.created_at ? new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
            const customerName = inv.order_source === 'woocommerce' || inv.wc_order_id
                ? 'Website'
                : inv.customer ? `${inv.customer.first_name || ''} ${inv.customer.last_name || ''}`.trim() : 'Walk-in';
            const itemsQty = inv.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
            const payMethods = (inv.payments ?? []).map(p => `${p.method.toUpperCase()} ($${parseFloat(p.amount || 0).toFixed(2)})`).join('; ') || (inv.order_source === 'woocommerce' || inv.wc_order_id ? 'WC' : 'N/A');
            rows.push([
                inv.invoice_number || `#${inv.id}`,
                dateStr,
                timeStr,
                customerName || 'Walk-in',
                itemsQty,
                parseFloat(inv.grand_total || 0).toFixed(2),
                payMethods,
                (inv.status || 'completed').toUpperCase()
            ]);
        });
    }

    const slug = (outlet || 'store').replace(/_/g, '-');
    downloadCSV(rows, `${slug}-weekly-report-${getWeekStart(weekStart)}-to-${getWeekEnd(weekStart)}.csv`);
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DailyReportManager = () => {
    const { activeOutlet } = useAdmin();
    const navigate = useNavigate();
    const today = toLocalDateStr();
    const [view, setView] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
    const [selectedDate, setSelectedDate] = useState(today);
    const [dailyMode, setDailyMode] = useState('day'); // 'day' | 'period'
    const [periodEnd, setPeriodEnd] = useState(today);
    const [sellerMode, setSellerMode] = useState('top'); // 'top' | 'lowest'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [selectedWeekStart, setSelectedWeekStart] = useState(getWeekStart(today));

    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Target editor
    const [editingTarget, setEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState('');
    const [targetNotes, setTargetNotes] = useState('');
    const [savingTarget, setSavingTarget] = useState(false);

    // Delete invoice
    const [deletingInvoice, setDeletingInvoice] = useState(null);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchDaily = useCallback(async () => {
        setLoading(true);
        try {
            const params = dailyMode === 'period'
                ? { date: selectedDate, end_date: periodEnd }
                : { date: selectedDate };
            const res = await axios.get('/api/v1/admin/sales-report/daily', {
                params,
                headers: { ...authHeaders(), 'X-Active-Outlet': activeOutlet },
            });
            setDailyData(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    }, [selectedDate, periodEnd, dailyMode, activeOutlet]);

    const fetchMonthly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/sales-report/monthly', {
                params: { year: selectedYear, month: selectedMonth },
                headers: { ...authHeaders(), 'X-Active-Outlet': activeOutlet },
            });
            setMonthlyData(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    }, [selectedYear, selectedMonth, activeOutlet]);

    const fetchWeekly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/sales-report/weekly', {
                params: { date: selectedWeekStart },
                headers: { ...authHeaders(), 'X-Active-Outlet': activeOutlet },
            });
            setWeeklyData(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    }, [selectedWeekStart, activeOutlet]);

    const fetchTargets = useCallback(async () => {
        try {
            const res = await axios.get('/api/v1/admin/sales-report/targets', {
                params: { year: selectedYear },
                headers: { ...authHeaders(), 'X-Active-Outlet': activeOutlet },
            });
            setTargets(res.data || []);
        } catch (e) { console.error(e); }
    }, [selectedYear, activeOutlet]);

    // Initial and reactive fetches
    useEffect(() => {
        if (view === 'daily') fetchDaily();
        else if (view === 'weekly') fetchWeekly();
        else fetchMonthly();
    }, [view, fetchDaily, fetchWeekly, fetchMonthly]);

    useEffect(() => {
        if (view === 'monthly') fetchTargets();
    }, [view, selectedYear, fetchTargets]);

    // Target modal helpers
    const currentTarget = (targets || []).find(t => t.year === selectedYear && t.month === selectedMonth) || null;
    const targetRevenue = currentTarget?.target_revenue ? parseFloat(currentTarget.target_revenue) : 0;
    const netRevenue = parseFloat(monthlyData?.net_revenue ?? monthlyData?.total_revenue ?? 0);
    const targetPct = targetRevenue > 0 ? Math.min((netRevenue / targetRevenue) * 100, 100) : 0;

    const openTargetEditor = () => {
        setTargetInput(targetRevenue > 0 ? String(targetRevenue) : '');
        setTargetNotes(currentTarget?.notes || '');
        setEditingTarget(true);
    };
    const openEditTarget = openTargetEditor;

    const saveTarget = async () => {
        if (!targetInput || isNaN(targetInput)) return;
        setSavingTarget(true);
        try {
            await axios.post('/api/v1/admin/sales-report/targets', {
                year: selectedYear, month: selectedMonth,
                target_revenue: parseFloat(targetInput),
                notes: targetNotes || null,
            }, { headers: { ...authHeaders(), 'X-Active-Outlet': activeOutlet } });
            await fetchTargets();
            await fetchMonthly();
            setEditingTarget(false);
        } catch (e) { console.error(e); }
        finally { setSavingTarget(false); }
    };

    // ── delete invoice ──────────────────────────────────────────────────────
    const openDeleteConfirm = (invoice) => {
        setDeletingInvoice(invoice);
        setDeleteConfirmVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingInvoice) return;
        setDeleting(true);
        try {
            await axios.delete(`/api/v1/admin/pos/invoices/${deletingInvoice.id}`, {
                headers: { ...authHeaders(), 'X-Active-Outlet': activeOutlet },
            });
            // Refresh the data for the current view
            if (view === 'daily') await fetchDaily();
            else if (view === 'weekly') await fetchWeekly();
            else await fetchMonthly();
        } catch (e) {
            console.error('Delete failed:', e);
            alert(e.response?.data?.message || 'Failed to delete invoice.');
        } finally {
            setDeleting(false);
            setDeleteConfirmVisible(false);
            setDeletingInvoice(null);
        }
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
        if (dailyMode === 'period') {
            const span = Math.max(1, periodSpanDays(selectedDate, periodEnd));
            setSelectedDate(prev => addDays(prev, -span));
            setPeriodEnd(prev => addDays(prev, -span));
            return;
        }
        setSelectedDate(prev => addDays(prev, -1));
    };
    const nextDay = () => {
        if (dailyMode === 'period') {
            const span = Math.max(1, periodSpanDays(selectedDate, periodEnd));
            setSelectedDate(prev => addDays(prev, span));
            setPeriodEnd(prev => addDays(prev, span));
            return;
        }
        setSelectedDate(prev => addDays(prev, 1));
    };

    // ── week nav ──────────────────────────────────────────────────────────────
    const prevWeek = () => {
        setSelectedWeekStart(prev => addDays(prev, -7));
    };
    const nextWeek = () => {
        setSelectedWeekStart(prev => addDays(prev, 7));
    };

    const data = view === 'daily' ? dailyData : view === 'weekly' ? weeklyData : monthlyData;
    const sellers = sellerMode === 'top' ? (data?.top_sellers ?? []) : (data?.lowest_sellers ?? []);
    const unitLabel = useUnitLabel(activeOutlet);

    const reportTitle = view === 'monthly'
        ? 'Monthly Report'
        : view === 'weekly'
        ? 'Weekly Report'
        : dailyMode === 'period'
        ? 'Period Report'
        : 'Daily Report';

    return (
        <div className="p-6 md:p-8 space-y-7 font-sans max-w-7xl mx-auto">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {reportTitle}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                        Performance analytics, targets & product trends for <span className="font-semibold text-gray-700 dark:text-white/80">{getOutletName(activeOutlet)}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 rounded-xl p-1">
                        {['daily', 'weekly', 'monthly'].map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${view === v ? 'bg-[#0d3542] dark:bg-white text-white dark:text-black shadow-xs' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => view === 'daily' ? fetchDaily() : view === 'weekly' ? fetchWeekly() : fetchMonthly()}
                        className="p-2.5 bg-white dark:bg-[#161b22] border border-black/10 dark:border-white/10 rounded-xl text-gray-500 hover:text-[#0d3542] dark:hover:text-white transition-all shadow-2xs hover:bg-black/5 dark:hover:bg-white/5"
                        title="Refresh data">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {view === 'daily' && (
                        <button onClick={() => exportDailyCSV(dailyData, selectedDate, activeOutlet, dailyMode === 'period' ? periodEnd : undefined)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-[#0d3542] dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all shadow-xs active:scale-98">
                            <Download size={13} /> Export Excel
                        </button>
                    )}
                    {view === 'monthly' && (
                        <button onClick={() => exportMonthlyCSV(monthlyData, selectedYear, selectedMonth, activeOutlet, targetRevenue, currentTarget)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-[#0d3542] dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all shadow-xs active:scale-98">
                            <Download size={13} /> Export Excel
                        </button>
                    )}
                    {view === 'weekly' && (
                        <button onClick={() => exportWeeklyCSV(weeklyData, selectedWeekStart, activeOutlet)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-[#0d3542] dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all shadow-xs active:scale-98">
                            <Download size={13} /> Export Excel
                        </button>
                    )}
                </div>
            </div>

            {/* ── Date / Month Navigator ── */}
            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl px-3.5 py-2.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Left: Mode toggle (Day vs Period) */}
                    <div className="flex items-center gap-2">
                        {view === 'daily' ? (
                            <div className="flex bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-0.5 border border-black/5 dark:border-white/5">
                                {['day', 'period'].map(m => (
                                    <button key={m} onClick={() => setDailyMode(m)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${dailyMode === m ? 'bg-[#0d3542] dark:bg-white text-white dark:text-black shadow-xs' : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'}`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-black/5 dark:border-white/5">
                                <Calendar size={13} className="text-[#0d3542] dark:text-white" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-white/80">
                                    {view === 'weekly' ? 'Weekly View' : 'Monthly View'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Center: Grouped navigation (< Date/Month >) */}
                    <div className="flex items-center justify-center gap-2">
                        {/* Prev button */}
                        <button 
                            onClick={view === 'daily' ? prevDay : view === 'weekly' ? prevWeek : prevMonth}
                            className="p-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-black/5 dark:border-white/5"
                            title="Previous">
                            <ChevronLeft size={15} />
                        </button>

                        {/* Date Content */}
                        {view === 'daily' ? (
                            dailyMode === 'period' ? (
                                <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl px-3 py-1.5">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={(e) => { const v = e.target.value; setSelectedDate(v); if (v > periodEnd) setPeriodEnd(v); }}
                                        showIcon={false}
                                        showChevron={false}
                                        className="w-auto"
                                        inputClassName="bg-transparent border-none !p-0 text-xs font-bold text-gray-900 dark:text-white shadow-none hover:bg-transparent"
                                        placeholder="From"
                                    />
                                    <span className="text-gray-400 dark:text-white/30 text-xs font-bold">→</span>
                                    <DatePicker
                                        value={periodEnd}
                                        minDate={selectedDate}
                                        onChange={(e) => { const v = e.target.value; setPeriodEnd(v); if (v < selectedDate) setSelectedDate(v); }}
                                        showIcon={false}
                                        showChevron={false}
                                        className="w-auto"
                                        inputClassName="bg-transparent border-none !p-0 text-xs font-bold text-gray-900 dark:text-white shadow-none hover:bg-transparent"
                                        placeholder="To"
                                    />
                                    <span className="text-[10px] px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded font-semibold text-gray-500 dark:text-white/60 ml-1">
                                        {periodSpanDays(selectedDate, periodEnd)}d
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl px-3 py-1.5">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        showIcon={true}
                                        showChevron={false}
                                        className="w-auto"
                                        inputClassName="bg-transparent border-none !p-0 text-xs font-bold text-gray-900 dark:text-white shadow-none hover:bg-transparent"
                                        placeholder="Select date"
                                    />
                                    <span className="text-gray-300 dark:text-white/20">·</span>
                                    <span className="text-[11px] font-medium text-gray-500 dark:text-white/50">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            )
                        ) : view === 'weekly' ? (
                            <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl px-3 py-1.5">
                                <DatePicker 
                                    value={selectedWeekStart}
                                    onChange={(e) => setSelectedWeekStart(getWeekStart(e.target.value))}
                                    showIcon={true}
                                    showChevron={false}
                                    className="w-auto"
                                    inputClassName="bg-transparent border-none !p-0 text-xs font-bold text-gray-900 dark:text-white shadow-none hover:bg-transparent"
                                    placeholder="Select week"
                                />
                                <span className="text-gray-300 dark:text-white/20">·</span>
                                <span className="text-[11px] font-medium text-gray-500 dark:text-white/50">
                                    {formatWeekRange(selectedWeekStart)}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl px-2.5 py-1">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer pr-1"
                                >
                                    {MONTH_NAMES.map((name, idx) => (
                                        <option key={idx} value={idx + 1} className="bg-white dark:bg-[#161b22] text-gray-900 dark:text-white">
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                                >
                                    {[2024, 2025, 2026, 2027].map((yr) => (
                                        <option key={yr} value={yr} className="bg-white dark:bg-[#161b22] text-gray-900 dark:text-white">
                                            {yr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Next button */}
                        <button 
                            onClick={view === 'daily' ? nextDay : view === 'weekly' ? nextWeek : nextMonth}
                            className="p-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-black/5 dark:border-white/5"
                            title="Next">
                            <ChevronRight size={15} />
                        </button>
                    </div>

                    {/* Right: Jump to Today button */}
                    <div className="flex items-center justify-end">
                        <button
                            onClick={() => {
                                const todayStr = toLocalDateStr();
                                if (view === 'daily') {
                                    setSelectedDate(todayStr);
                                    setPeriodEnd(todayStr);
                                } else if (view === 'weekly') {
                                    setSelectedWeekStart(getWeekStart(todayStr));
                                } else {
                                    const now = new Date();
                                    setSelectedYear(now.getFullYear());
                                    setSelectedMonth(now.getMonth() + 1);
                                }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/5 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-all"
                        >
                            Today
                        </button>
                    </div>
                </div>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                            <StatCard label={unitLabel.sold} value={fmtNum(data?.total_items)} sub={`${unitLabel.unit} sold`} icon={<ShoppingBag size={17} />} />
                            <StatCard label="Total Sales" value={fmt(data?.total_revenue)} sub={data?.net_revenue ? `${fmt(data?.net_revenue)} net` : undefined} icon={<TrendingUp size={17} />} />
                            <StatCard label="Refunds" value={fmt(data?.total_refunds)} sub={data?.refund_count ? `${data.refund_count} refunded` : undefined} icon={<TrendingDown size={17} />} color={parseFloat(data?.total_refunds || 0) > 0 ? "text-rose-500" : "text-gray-900 dark:text-white"} />
                            <StatCard
                                label={view === 'daily' && dailyMode !== 'period' ? 'Avg Order Value' : 'Total Orders'}
                                value={view === 'daily' && dailyMode !== 'period' ? fmt(data?.avg_order_value) : fmtNum(data?.invoice_count || data?.daily_breakdown?.reduce((a, d) => a + (d.invoices || 0), 0) || (data?.invoices ?? []).length)}
                                sub={view === 'daily' && dailyMode !== 'period' ? `${(data?.invoices ?? []).length} orders today` : 'Completed orders'}
                                icon={<Wallet size={17} />}
                            />
                        </div>



                        {/* ── Daily: Period Mode Trend + Insights + Table ── */}
                        {view === 'daily' && dailyMode === 'period' && (
                            <>
                                <div className="grid lg:grid-cols-12 gap-5">
                                    {/* Period Trend Chart */}
                                    <div className="lg:col-span-5 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <BarChart2 size={15} className="text-[#0d3542] dark:text-white" />
                                                <p className="text-xs font-bold text-gray-900 dark:text-white">Period Trend</p>
                                            </div>
                                            {(() => {
                                                const breakdown = data?.daily_breakdown ?? [];
                                                const maxRev = Math.max(...breakdown.map(d => parseFloat(d.revenue || 0)), 0);
                                                return maxRev > 0 ? (
                                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-semibold">
                                                        Peak: {fmt(maxRev)}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-white/40 mb-3 font-medium">
                                            {formatPeriodRange(selectedDate, periodEnd)} · {periodSpanDays(selectedDate, periodEnd)} days
                                        </p>
                                        <TrendChart data={fillPeriodDays(data?.daily_breakdown ?? [], selectedDate, periodEnd)} height="h-40" />
                                    </div>

                                    {/* Period Insights */}
                                    <div className="lg:col-span-7 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 shadow-2xs">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp size={15} className="text-[#0d3542] dark:text-white" />
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Period Insights</p>
                                        </div>

                                        {(() => {
                                            const breakdown = data?.daily_breakdown ?? [];
                                            const daysWithSales = breakdown.filter(d => parseFloat(d.revenue) > 0);
                                            const spanDays = periodSpanDays(selectedDate, periodEnd);
                                            const avgDaily = spanDays > 0 ? parseInt(data?.total_items ?? 0) / spanDays : 0;
                                            const bestDay = daysWithSales.length > 0
                                                ? daysWithSales.reduce((a, b) => parseFloat(a.revenue) >= parseFloat(b.revenue) ? a : b)
                                                : null;
                                            const totalInvoices = breakdown.reduce((a, d) => a + (d.invoices || 0), 0);

                                            const insights = [
                                                {
                                                    label: 'Best Day',
                                                    value: bestDay ? new Date(bestDay.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—',
                                                    sub: bestDay ? `${fmt(bestDay.revenue)} (${fmtNum(bestDay.invoices)} orders)` : 'No sales yet',
                                                    icon: <Award size={16} />,
                                                    accent: 'text-amber-500',
                                                },
                                                {
                                                    label: 'Avg / Day',
                                                    value: fmtNum(Math.round(avgDaily)),
                                                    sub: `${unitLabel.unit} per day (${spanDays}d span)`,
                                                    icon: <TrendingUp size={16} />,
                                                    accent: 'text-emerald-500',
                                                },
                                                {
                                                    label: 'Active Days',
                                                    value: `${daysWithSales.length} / ${spanDays}`,
                                                    sub: `${totalInvoices} total orders placed`,
                                                    icon: <Calendar size={16} />,
                                                    accent: 'text-[#0d3542] dark:text-white',
                                                },
                                                {
                                                    label: 'Total Revenue',
                                                    value: fmt(data?.total_revenue),
                                                    sub: `${fmt(data?.net_revenue)} net revenue`,
                                                    icon: <Wallet size={16} />,
                                                    accent: 'text-purple-500',
                                                },
                                            ];

                                            return (
                                                <div className="grid grid-cols-2 gap-3.5">
                                                    {insights.map((item, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] rounded-xl p-3.5 flex items-start gap-3"
                                                        >
                                                            <div className={`mt-0.5 ${item.accent}`}>{item.icon}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                                                                <p className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{item.value}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-white/40 mt-1 font-medium truncate">{item.sub}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* ── Period Daily Breakdown Table ── */}
                                <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl overflow-hidden shadow-2xs">
                                    <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[#0d3542] dark:text-white" />
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Daily Breakdown</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-white/40 font-semibold uppercase tracking-wider">
                                            {periodSpanDays(selectedDate, periodEnd)} {periodSpanDays(selectedDate, periodEnd) === 1 ? 'day' : 'days'}
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 border-b border-black/5 dark:border-white/5">
                                                <tr>
                                                    <th className="px-5 py-2.5 font-semibold">Date</th>
                                                    <th className="px-5 py-2.5 font-semibold">Day</th>
                                                    <th className="px-5 py-2.5 font-semibold text-right">Orders</th>
                                                    <th className="px-5 py-2.5 font-semibold text-right">Revenue</th>
                                                    <th className="px-5 py-2.5 font-semibold text-right">Avg / Order</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                                                {fillPeriodDays(data?.daily_breakdown ?? [], selectedDate, periodEnd).map((d, i) => {
                                                    const dateObj = new Date(d.day + 'T00:00:00');
                                                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                                                    const rev = parseFloat(d.revenue || 0);
                                                    const invCount = parseInt(d.invoices || 0);
                                                    const avg = invCount > 0 ? rev / invCount : 0;
                                                    const isToday = d.day === new Date().toISOString().split('T')[0];

                                                    return (
                                                        <tr key={i} className={`hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors ${isToday ? 'bg-[#0d3542]/[0.03] dark:bg-white/[0.04]' : ''}`}>
                                                            <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">
                                                                {d.day}
                                                                {isToday && <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-[#0d3542]/10 dark:bg-white/15 text-[#0d3542] dark:text-white rounded font-bold uppercase tracking-wider">Today</span>}
                                                            </td>
                                                            <td className="px-5 py-3 font-medium text-gray-500 dark:text-white/60">
                                                                {weekday}
                                                            </td>
                                                            <td className="px-5 py-3 text-right font-semibold text-gray-700 dark:text-white/80">
                                                                {invCount > 0 ? `${invCount} ${invCount === 1 ? 'order' : 'orders'}` : '—'}
                                                            </td>
                                                            <td className={`px-5 py-3 font-bold text-right ${rev > 0 ? 'text-[#0d3542] dark:text-white' : 'text-gray-300 dark:text-white/20'}`}>
                                                                {fmt(rev)}
                                                            </td>
                                                            <td className="px-5 py-3 font-medium text-right text-gray-500 dark:text-white/60">
                                                                {invCount > 0 ? fmt(avg) : '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Monthly: Target Progress + Insights + Trend ── */}
                        {view === 'monthly' && (
                            <div className="space-y-5">
                                <div className="grid lg:grid-cols-12 gap-5">
                                    {/* Target Card */}
                                    <div className="lg:col-span-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">Monthly Target</p>
                                                {!editingTarget && (
                                                    <button onClick={openTargetEditor}
                                                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                                        title="Edit Monthly Target">
                                                        <Edit3 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {editingTarget ? (
                                                <div className="space-y-2 mt-1">
                                                    <input type="number" value={targetInput} onChange={e => setTargetInput(e.target.value)}
                                                        placeholder="e.g. 20000"
                                                        className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-[#0d3542] dark:focus:border-white text-gray-900 dark:text-white" />
                                                    <textarea value={targetNotes} onChange={e => setTargetNotes(e.target.value)}
                                                        placeholder="Notes (optional)"
                                                        rows={2}
                                                        className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-gray-700 dark:text-white/80 resize-none" />
                                                    <div className="flex gap-2 pt-1">
                                                        <button onClick={saveTarget} disabled={savingTarget}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0d3542] dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold uppercase tracking-wider">
                                                            {savingTarget ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />} Save
                                                        </button>
                                                        <button onClick={() => setEditingTarget(false)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-black/5 dark:bg-white/5 text-gray-500 rounded-xl text-xs font-semibold uppercase tracking-wider">
                                                            <X size={12} /> Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                                                    {targetRevenue > 0 ? fmt(targetRevenue) : <span className="text-gray-300 dark:text-white/20">Not set</span>}
                                                </p>
                                            )}
                                        </div>

                                        {!editingTarget && targetRevenue > 0 && (
                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                                <div className="relative shrink-0">
                                                    <ProgressRing value={netRevenue} max={targetRevenue} size={64} strokeWidth={6} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">{Math.round(targetPct)}%</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5 flex-1 min-w-0">
                                                    <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wider font-semibold">Achieved</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(netRevenue)}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-white/40 font-medium">
                                                        {targetRevenue - netRevenue > 0 ? `${fmt(targetRevenue - netRevenue)} to go` : '🎉 Target hit!'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {!editingTarget && targetRevenue === 0 && (
                                            <button onClick={openTargetEditor}
                                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-black/15 dark:border-white/15 rounded-xl text-xs font-semibold text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all">
                                                <Target size={13} /> Set Target for {MONTHS[selectedMonth - 1]}
                                            </button>
                                        )}
                                    </div>

                                    {/* Monthly Insights */}
                                    <div className="lg:col-span-8 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 shadow-2xs">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp size={15} className="text-[#0d3542] dark:text-white" />
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Monthly Insights</p>
                                        </div>

                                        {(() => {
                                            const breakdown = monthlyData?.daily_breakdown ?? [];
                                            const daysWithSales = breakdown.filter(d => parseFloat(d.revenue) > 0);
                                            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                                            const today = new Date();
                                            const daysElapsed = (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1)
                                                ? today.getDate() : daysInMonth;
                                            const totalItems = parseInt(monthlyData?.total_items ?? 0);
                                            const avgDaily = daysElapsed > 0 ? totalItems / daysElapsed : 0;
                                            const projected = avgDaily * daysInMonth;
                                            const bestDay = daysWithSales.length > 0
                                                ? daysWithSales.reduce((a, b) => parseFloat(a.revenue) >= parseFloat(b.revenue) ? a : b)
                                                : null;
                                            const totalInvoices = breakdown.reduce((a, d) => a + (d.invoices || 0), 0);

                                            const insights = [
                                                {
                                                    label: 'Best Day',
                                                    value: bestDay ? new Date(bestDay.day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
                                                    sub: bestDay ? fmt(bestDay.revenue) : 'No sales yet',
                                                    icon: <Award size={16} />,
                                                    accent: 'text-amber-500',
                                                },
                                                {
                                                    label: 'Avg / Day',
                                                    value: fmtNum(Math.round(avgDaily)),
                                                    sub: `${unitLabel.unit} over ${daysElapsed}d`,
                                                    icon: <TrendingUp size={16} />,
                                                    accent: 'text-emerald-500',
                                                },
                                                {
                                                    label: 'Projected',
                                                    value: fmtNum(Math.round(projected)),
                                                    sub: `${daysInMonth - daysElapsed} days left`,
                                                    icon: <Target size={16} />,
                                                    accent: 'text-orange-400',
                                                },
                                                {
                                                    label: 'Active Days',
                                                    value: `${daysWithSales.length} / ${daysElapsed}`,
                                                    sub: `${totalInvoices} total orders`,
                                                    icon: <Calendar size={16} />,
                                                    accent: 'text-[#0d3542] dark:text-white',
                                                },
                                            ];

                                            return (
                                                <div className="grid grid-cols-2 gap-3.5">
                                                    {insights.map((item, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] rounded-xl p-3.5 flex items-start gap-3"
                                                        >
                                                            <div className={`mt-0.5 ${item.accent}`}>{item.icon}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                                                                <p className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{item.value}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-white/40 mt-1 font-medium truncate">{item.sub}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Monthly Trend Bar Chart */}
                                <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 shadow-2xs">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <BarChart2 size={15} className="text-[#0d3542] dark:text-white" />
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                Monthly Daily Revenue Trend ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                                            </p>
                                        </div>
                                    </div>
                                    <TrendChart data={fillDays(monthlyData?.daily_breakdown, selectedYear, selectedMonth)} height="h-44" />
                                </div>
                            </div>
                        )}

                        {/* ── Weekly: Trend + Insights ── */}
                        {view === 'weekly' && (
                            <div className="grid lg:grid-cols-12 gap-5">
                                {/* Week Trend */}
                                <div className="lg:col-span-5 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <BarChart2 size={15} className="text-[#0d3542] dark:text-white" />
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">7-Day Trend</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-white/40 mb-3 font-medium">
                                        {formatWeekRange(selectedWeekStart)}
                                    </p>
                                    <TrendChart data={fillPeriodDays(data?.daily_breakdown ?? [], getWeekStart(selectedWeekStart), getWeekEnd(selectedWeekStart))} height="h-40" />
                                </div>

                                {/* Week Insights */}
                                <div className="lg:col-span-7 bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl p-5 shadow-2xs">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp size={15} className="text-[#0d3542] dark:text-white" />
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Weekly Insights</p>
                                    </div>

                                    {(() => {
                                        const breakdown = data?.daily_breakdown ?? [];
                                        const daysWithSales = breakdown.filter(d => parseFloat(d.revenue) > 0);
                                        const totalItems = parseInt(data?.total_items ?? 0);
                                        const avgDaily = 7 > 0 ? totalItems / 7 : 0;
                                        const bestDay = daysWithSales.length > 0
                                            ? daysWithSales.reduce((a, b) => parseFloat(a.revenue) >= parseFloat(b.revenue) ? a : b)
                                            : null;
                                        const totalInvoices = breakdown.reduce((a, d) => a + (d.invoices || 0), 0);

                                        const insights = [
                                            {
                                                label: 'Best Day',
                                                value: bestDay ? new Date(bestDay.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—',
                                                sub: bestDay ? `${fmt(bestDay.revenue)} (${fmtNum(bestDay.invoices)} orders)` : 'No sales yet',
                                                icon: <Award size={16} />,
                                                accent: 'text-amber-500',
                                            },
                                            {
                                                label: 'Avg / Day',
                                                value: fmtNum(Math.round(avgDaily)),
                                                sub: `${unitLabel.unit} per day this week`,
                                                icon: <TrendingUp size={16} />,
                                                accent: 'text-emerald-500',
                                            },
                                            {
                                                label: 'Active Days',
                                                value: `${daysWithSales.length} / 7`,
                                                sub: `${totalInvoices} total orders`,
                                                icon: <Calendar size={16} />,
                                                accent: 'text-[#0d3542] dark:text-white',
                                            },
                                            {
                                                label: 'Weekly Revenue',
                                                value: fmt(data?.total_revenue),
                                                sub: `${fmt(data?.net_revenue)} net revenue`,
                                                icon: <Wallet size={16} />,
                                                accent: 'text-purple-500',
                                            },
                                        ];

                                        return (
                                            <div className="grid grid-cols-2 gap-3.5">
                                                {insights.map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] rounded-xl p-3.5 flex items-start gap-3"
                                                    >
                                                        <div className={`mt-0.5 ${item.accent}`}>{item.icon}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                                                            <p className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{item.value}</p>
                                                            <p className="text-[10px] text-gray-400 dark:text-white/40 mt-1 font-medium truncate">{item.sub}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* ── Top Sellers / Lowest Sellers ── */}
                        <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl overflow-hidden shadow-2xs">
                            <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/8 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {sellerMode === 'top'
                                        ? <Award size={15} className="text-[#0d3542] dark:text-white" />
                                        : <TrendingDown size={15} className="text-[#0d3542] dark:text-white" />}
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                        {sellerMode === 'top' ? 'Top Selling Products' : 'Lowest Selling Products'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-black/[0.03] dark:bg-white/[0.04] rounded-lg p-0.5">
                                        {['top', 'lowest'].map(m => (
                                            <button key={m} onClick={() => setSellerMode(m)}
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all duration-150 ${sellerMode === m ? 'bg-[#0d3542] dark:bg-white text-white dark:text-black shadow-2xs' : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'}`}>
                                                {m === 'top' ? 'Top Sales' : 'Lowest Sales'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                {sellers.length === 0 ? (
                                    <div className="px-6 py-10 text-center opacity-40 text-xs font-medium uppercase tracking-wider">No sales data for this period</div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-black/5 dark:border-white/5">
                                                <th className="pl-5 pr-2 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 w-10">#</th>
                                                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">Product</th>
                                                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 text-right w-24">Qty Sold</th>
                                                <th className="pl-3 pr-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 text-right w-28">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                            {sellers.map((item, i) => (
                                                <tr key={i} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="pl-5 pr-2 py-3">
                                                        <span className={`text-xs font-bold ${sellerMode === 'lowest'
                                                            ? (i === 0 ? 'text-rose-500' : 'text-gray-400 dark:text-white/30')
                                                            : (i === 0 ? 'text-amber-500 font-extrabold' : i === 1 ? 'text-gray-500 dark:text-white/70' : i === 2 ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-white/30')}`}>
                                                            {i + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                                {item.product_name}
                                                            </span>
                                                            {item.product_variant && (
                                                                <span className="text-[11px] font-medium text-gray-500 dark:text-white/50">
                                                                    {String(item.product_variant).replace(/\\/g, '•').replace(/\s*•\s*/g, ' • ').trim()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.product_sku && (
                                                            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded text-gray-500 dark:text-white/50 font-mono font-medium tracking-wide">
                                                                {item.product_sku}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{fmtNum(item.total_qty)}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-white/40 font-medium">{unitLabel.unit}</p>
                                                    </td>
                                                    <td className="pl-3 pr-5 py-3 text-right">
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{fmt(item.total_revenue)}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* ── Bottom Row: Category + Payment ── */}
                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Category breakdown */}
                            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl overflow-hidden shadow-2xs">
                                <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/8 flex items-center gap-2">
                                    <Layers size={14} className="text-[#0d3542] dark:text-white" />
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Category Breakdown</p>
                                </div>
                                <div className="divide-y divide-black/5 dark:divide-white/5">
                                    {(data?.category_breakdown ?? []).length === 0 ? (
                                        <div className="px-6 py-10 text-center opacity-40 text-xs font-medium uppercase tracking-wider">No category data</div>
                                    ) : (
                                        (data?.category_breakdown ?? []).map((cat, i) => {
                                            const maxRev = parseFloat(data.category_breakdown[0]?.total_revenue) || 1;
                                            return (
                                                <div key={i} className="px-5 py-3 flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1.5">
                                                            <p className="text-xs font-semibold text-gray-800 dark:text-white">{cat.category}</p>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{fmt(cat.total_revenue)}</p>
                                                        </div>
                                                        <div className="h-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(parseFloat(cat.total_revenue) / maxRev) * 100}%` }}
                                                                transition={{ duration: 0.6, delay: i * 0.04 }}
                                                                className="h-full bg-[#0d3542] dark:bg-white rounded-full" />
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 dark:text-white/40 font-medium whitespace-nowrap pt-3">{fmtNum(cat.total_qty)} {unitLabel.unit}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Payment breakdown */}
                            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl overflow-hidden shadow-2xs">
                                <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/8 flex items-center gap-2">
                                    <CreditCard size={14} className="text-[#0d3542] dark:text-white" />
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Payment Methods</p>
                                </div>
                                {(data?.payment_breakdown ?? []).length === 0 ? (
                                    <div className="px-6 py-10 text-center opacity-40 text-xs font-medium uppercase tracking-wider">No payment data</div>
                                ) : (
                                    <div className="p-5 space-y-3.5">
                                        {(data?.payment_breakdown ?? []).map((p, i) => {
                                            const maxTotal = data.payment_breakdown.reduce((a, x) => a + parseFloat(x.total), 0) || 1;
                                            const pct = Math.round((parseFloat(p.total) / maxTotal) * 100);
                                            return (
                                                <div key={i} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
                                                            {PAY_ICONS[p.method] ?? <Banknote size={13} />}
                                                            <span className="capitalize">{p.method.replaceAll('_', ' ')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-400 dark:text-white/40">{pct}%</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">{fmt(p.total)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                                            className="h-full bg-[#0d3542] dark:bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Transactions Table (Daily & Weekly) ── */}
                        {(view === 'daily' || view === 'weekly') && (data?.invoices ?? []).length > 0 && (
                            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/8 rounded-2xl overflow-hidden shadow-2xs">
                                <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/8 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-[#0d3542] dark:text-white" />
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                                            {view === 'weekly' ? 'Weekly Transactions' : view === 'daily' && dailyMode === 'period' ? 'Period Transactions' : 'Daily Transactions'}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-white/40 font-semibold uppercase tracking-wider">
                                        {(data?.invoices ?? []).length} {(data?.invoices ?? []).length === 1 ? 'order' : 'orders'}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 border-b border-black/5 dark:border-white/5">
                                            <tr>
                                                <th className="px-5 py-2.5 font-semibold">Invoice</th>
                                                <th className="px-5 py-2.5 font-semibold">Customer</th>
                                                <th className="px-5 py-2.5 font-semibold">Items</th>
                                                <th className="px-5 py-2.5 font-semibold text-right">Total</th>
                                                <th className="px-5 py-2.5 font-semibold text-right">Payment</th>
                                                <th className="px-5 py-2.5 font-semibold text-right w-20">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                                            {data.invoices.map((inv, i) => (
                                                <tr key={i} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-5 py-3">
                                                        <p className="font-bold text-gray-900 dark:text-white">{inv.invoice_number}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5 font-medium">
                                                            {view === 'daily' && dailyMode !== 'period'
                                                                ? new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                                                : `${new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                                                            }
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-3 font-medium text-gray-700 dark:text-white/80">
                                                        {inv.order_source === 'woocommerce' || inv.wc_order_id ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md text-[10px] font-semibold">
                                                                Online Store
                                                            </span>
                                                        ) : inv.customer ? (
                                                            <span>{`${inv.customer.first_name} ${inv.customer.last_name || ''}`.trim()}</span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-white/40">Walk-in</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500 dark:text-white/60 font-medium">
                                                        {inv.items?.reduce((a, item) => a + item.quantity, 0) || 0} {unitLabel.unit}
                                                    </td>
                                                    <td className="px-5 py-3 font-bold text-gray-900 dark:text-white text-right">
                                                        {fmt(inv.grand_total)}
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1 flex-wrap">
                                                            {(inv.payments ?? []).length > 0 ? (
                                                                (inv.payments ?? []).map((p, j) => (
                                                                    <span key={j} className="flex items-center gap-1 px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-md text-[10px] font-semibold uppercase tracking-wider text-gray-700 dark:text-white/80">
                                                                        {PAY_ICONS[p.method] ?? null}
                                                                        {p.method.replaceAll('_', ' ')}
                                                                        {inv.payments.length > 1 && ` (${fmt(p.amount)})`}
                                                                    </span>
                                                                ))
                                                            ) : inv.order_source === 'woocommerce' || inv.wc_order_id ? (
                                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                                                                    {PAY_ICONS['wc']} WC
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-semibold text-gray-400">N/A</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => navigate(`/admin/pos?action=clone&invoice=${inv.id}`)}
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                                                title="Clone Invoice"
                                                            >
                                                                <Copy size={13} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/admin/pos?action=refund&invoice=${inv.id}`)}
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                                title="Refund"
                                                            >
                                                                <Undo2 size={13} />
                                                            </button>
                                                            {!['void', 'refunded'].includes(inv.status) && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm('Void this invoice? Stock will be restored and the invoice will be marked as voided.')) return;
                                                                        try {
                                                                            await axios.post(`/api/v1/admin/pos/invoices/${inv.id}/void`, { reason: 'Voided from admin' });
                                                                            if (view === 'daily') fetchDaily();
                                                                            else if (view === 'weekly') fetchWeekly();
                                                                            else fetchMonthly();
                                                                        } catch (err) {
                                                                            alert(err.response?.data?.message || 'Failed to void invoice');
                                                                        }
                                                                    }}
                                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                                                                    title="Void Invoice"
                                                                >
                                                                    <X size={13} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => openDeleteConfirm(inv)}
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                                title="Delete receipt"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
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

            {/* ── Delete Confirmation Modal ── */}
            <AnimatePresence>
                {deleteConfirmVisible && deletingInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs"
                        onClick={(e) => { if (e.target === e.currentTarget) { setDeleteConfirmVisible(false); setDeletingInvoice(null); }}}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white dark:bg-[#161b22] border border-black/8 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10">
                                    <AlertCircle size={18} className="text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Receipt</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wider font-semibold">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] rounded-xl p-4 mb-5">
                                <p className="text-xs text-gray-700 dark:text-white/80">
                                    Are you sure you want to permanently delete invoice <span className="font-bold text-gray-900 dark:text-white">{deletingInvoice.invoice_number}</span>?
                                </p>
                                <p className="text-[10px] text-gray-400 dark:text-white/40 mt-1.5">
                                    Stock will be restored. This invoice and its transaction history will be removed from records.
                                </p>
                            </div>

                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => { setDeleteConfirmVisible(false); setDeletingInvoice(null); }}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-white/70 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-rose-700 transition-all disabled:opacity-50 shadow-xs"
                                >
                                    {deleting ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    {deleting ? 'Deleting...' : 'Delete Receipt'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyReportManager;
