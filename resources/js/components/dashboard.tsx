import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin } from './pages/admin/AdminContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import RecentActivityWidget from './pages/admin/RecentActivityWidget';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceDot,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    AlertTriangle,
    Calendar,
    FileText,
    Package,
    ShoppingBag,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TIMEFRAMES = ['day', 'week', 'month'] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

/* ── count-up animation ── */
function useCountUp(target: number, duration = 900) {
    const [val, setVal] = useState(0);
    const prev = useRef(0);
    useEffect(() => {
        let raf = 0;
        const start = performance.now();
        const from = prev.current;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(from + (target - from) * eased);
            if (t < 1) raf = requestAnimationFrame(tick);
            else prev.current = target;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return val;
}

/* ── progress ring (draws in on mount) ── */
function ProgressRing({
    value,
    max = 15,
    size = 96,
    stroke = 9,
    color,
}: {
    value: number;
    max?: number;
    size?: number;
    stroke?: number;
    color: string;
}) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.min(1, Math.max(0, value / max));
    const offset = c * (1 - pct);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);
    return (
        <svg width={size} height={size} className="shrink-0">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={mounted ? offset : c}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
            />
        </svg>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    index,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string | number;
    index: number;
}) {
    const animated = useCountUp(typeof value === 'number' ? value : 0);
    const display =
        typeof value === 'number' ? Math.round(animated).toLocaleString() : value;
    return (
        <div
            style={{ animationDelay: `${index * 70}ms` }}
            className="group relative animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-card p-4 opacity-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_16px_hsl(var(--primary)/0.45)]">
                    <Icon size={17} />
                </span>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {display}
            </div>
        </div>
    );
}

const FADE = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` });

export function Dashboard() {
    const { stats, activeOutlet, setActiveOutlet, OUTLET_CONFIG } = useAdmin();
    const qc = useQueryClient();
    const [timeframe, setTimeframe] = useState<Timeframe>('month');
    const [chartReady, setChartReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setChartReady(true), 80);
        return () => clearTimeout(t);
    }, []);
    const isAttire = activeOutlet === 'attire_lounge';

    const seriesKey = isAttire ? 'appointments' : 'sales';
    const trendData = useMemo(() => {
        const raw = (stats.trends?.[timeframe] ?? []) as Array<Record<string, any>>;
        return raw.map((t, i) => ({
            name: t.name ?? t.label ?? t.date ?? t.period ?? `#${i + 1}`,
            value: Number(t[seriesKey] ?? 0),
        }));
    }, [stats, timeframe, seriesKey]);

    // Billing health — daily report (real)
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: daily } = useQuery({
        queryKey: ['sales-report-daily', todayStr],
        queryFn: () => API.getDailySalesReport(todayStr),
    });
    const dailyStats = ((daily as any)?.stats ?? {}) as Record<string, any>;
    const revenue = Number(dailyStats.total_revenue || 0);
    const invoicesToday = Number(dailyStats.total_invoices || 0);
    const refunds = Number(stats.pos_summary?.total_refunds || 0);
    const refundRate = revenue > 0 ? (refunds / revenue) * 100 : 0;

    // Invoices — real endpoint
    const { data: invoicesRaw } = useQuery({
        queryKey: ['pos-invoices', 'recent'],
        queryFn: () => API.getPosInvoices({ per_page: 6 }),
    });
    const invoices = Array.isArray(invoicesRaw)
        ? (invoicesRaw as any[])
        : ((invoicesRaw as any)?.data ?? []);

    // KPI values (real, per outlet)
    const kpis = isAttire
        ? [
              { icon: Calendar, label: 'Appointments', value: stats.appointments ?? 0 },
              { icon: Users, label: 'Clients', value: stats.total_customers ?? 0 },
              { icon: ShoppingBag, label: 'Products', value: stats.products ?? 0 },
              { icon: TrendingUp, label: 'Subscribers', value: stats.subscribers ?? 0 },
          ]
        : [
              { icon: ShoppingBag, label: 'Menu Items', value: stats.pos_products ?? 0 },
              { icon: TrendingUp, label: 'Total Sales', value: stats.sales ?? 0 },
              { icon: AlertTriangle, label: 'Stock Alerts', value: stats.low_stock ?? 0 },
              { icon: Package, label: 'Daily Orders', value: stats.daily_orders ?? 0 },
          ];

    const outlets = Object.entries(OUTLET_CONFIG ?? {}) as Array<[string, any]>;
    const activeRevenue = Number(stats.pos_summary?.total_revenue || stats.sales || 0);
    const lastPoint = trendData.length > 0 ? trendData[trendData.length - 1] : null;

    return (
        <div className="space-y-5">
            {/* KPI grid — dense, animated */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((k, i) => (
                    <KpiCard
                        key={k.label}
                        index={i}
                        icon={k.icon}
                        label={k.label}
                        value={k.value}
                    />
                ))}
            </div>

            {/* Revenue chart + right column */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card
                    className="animate-fade-in-up p-4 opacity-0 lg:col-span-2 min-w-0"
                    style={FADE(120)}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles size={15} className="text-attire-gold" /> Revenue Trend
                        </CardTitle>
                        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
                            {TIMEFRAMES.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTimeframe(t)}
                                    className={cn(
                                        'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                                        timeframe === t
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div
                        className="h-64 w-full min-w-0"
                        style={{ filter: 'drop-shadow(0 12px 24px hsl(var(--primary)/0.12))' }}
                    >
                        {chartReady ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="0%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="hsl(var(--primary))"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                                        <stop offset="100%" stopColor="hsl(var(--attire-gold))" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickFormatter={(v: number) =>
                                        v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                                    }
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={50}
                                    tickCount={6}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 12,
                                        border: '1px solid hsl(var(--border))',
                                        background: 'hsl(var(--background))',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#revStroke)"
                                    strokeWidth={2.5}
                                    fill="url(#rev)"
                                />
                                {lastPoint && (
                                    <ReferenceDot
                                        x={lastPoint.name}
                                        y={lastPoint.value}
                                        r={5}
                                        fill="hsl(var(--attire-gold))"
                                        stroke="hsl(var(--background))"
                                        strokeWidth={2}
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="h-64 w-full" />
                        )}
                    </div>
                </Card>

                <div className="flex flex-col gap-4">
                    {/* Billing health — ring */}
                    <Card className="animate-fade-in-up p-4 opacity-0" style={FADE(180)}>
                        <CardTitle className="mb-3 flex items-center gap-2 text-base">
                            <Sparkles size={15} className="text-attire-gold" /> Billing Health
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <ProgressRing
                                    value={refundRate}
                                    max={15}
                                    color={refundRate < 5 ? '#10b981' : '#f59e0b'}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold tabular-nums text-foreground">
                                        {refundRate.toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        refund
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <span
                                    className={cn(
                                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                                        refundRate < 5
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-amber-500/10 text-amber-500'
                                    )}
                                >
                                    {refundRate < 5 ? 'Healthy' : 'Watch'}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    Refunds vs. today's revenue. Lower is better, honey.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-muted p-3 transition-colors hover:bg-muted/70">
                                <p className="text-xs text-muted-foreground">Revenue (today)</p>
                                <p className="font-semibold tabular-nums text-foreground">
                                    ${Math.floor(revenue).toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted p-3 transition-colors hover:bg-muted/70">
                                <p className="text-xs text-muted-foreground">Invoices (today)</p>
                                <p className="font-semibold tabular-nums text-foreground">
                                    {invoicesToday}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Channel sales */}
                    <Card className="animate-fade-in-up p-4 opacity-0" style={FADE(240)}>
                        <CardTitle className="mb-3 flex items-center gap-2 text-base">
                            <Sparkles size={15} className="text-attire-gold" /> Sales Channels
                        </CardTitle>
                        <div className="space-y-2">
                            {outlets.map(([key, cfg]) => {
                                const active = key === activeOutlet;
                                return (
                                    <div
                                        key={key}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setActiveOutlet(key)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setActiveOutlet(key);
                                            }
                                        }}
                                        className={cn(
                                            'flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition-all duration-200 hover:translate-x-1',
                                            active
                                                ? 'border-primary/40 bg-primary/5'
                                                : 'border-border hover:border-primary/30'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    backgroundColor: cfg.color,
                                                    boxShadow: `0 0 8px ${cfg.color}80`,
                                                }}
                                            />
                                            <span className="text-sm font-medium text-foreground">
                                                {cfg.label}
                                            </span>
                                            {active && (
                                                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                                    active
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                                            {active
                                                ? `$${Math.floor(activeRevenue).toLocaleString()}`
                                                : '—'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Invoices + Activity */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card
                    className="animate-fade-in-up p-4 opacity-0 lg:col-span-2"
                    style={FADE(300)}
                >
                    <CardTitle className="mb-3 flex items-center gap-2 text-base">
                        <FileText size={16} /> Recent Invoices
                    </CardTitle>
                    {invoices.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No recent invoices
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="pb-2 font-medium">Ref</th>
                                        <th className="pb-2 font-medium">Customer</th>
                                        <th className="pb-2 font-medium">Amount</th>
                                        <th className="pb-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv: any, i: number) => (
                                        <tr
                                            key={inv.id ?? i}
                                            className="border-t border-border transition-colors hover:bg-muted/40"
                                        >
                                            <td className="py-2 font-mono text-xs text-foreground">
                                                #
                                                {inv.reference_id ??
                                                    inv.reference ??
                                                    inv.id ??
                                                    i + 1}
                                            </td>
                                            <td className="py-2 text-foreground">
                                                {inv.customer_name ?? inv.customer ?? 'Walk-in'}
                                            </td>
                                            <td className="py-2 tabular-nums text-foreground">
                                                $
                                                {Number(
                                                    inv.total ?? inv.amount ?? 0
                                                ).toLocaleString()}
                                            </td>
                                            <td className="py-2">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-xs font-medium',
                                                        inv.status === 'paid' ||
                                                            inv.status === 'completed'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : inv.status === 'refunded' ||
                                                              inv.status === 'cancelled'
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                    )}
                                                >
                                                    {inv.status ?? 'pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card className="animate-fade-in-up p-4 opacity-0" style={FADE(360)}>
                    <RecentActivityWidget />
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
