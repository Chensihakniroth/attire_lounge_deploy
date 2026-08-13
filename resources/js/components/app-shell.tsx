import React, { useEffect, useState } from 'react';
import { useAdmin } from './pages/admin/AdminContext';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, RotateCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function useClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return now;
}

function greeting(h: number) {
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const { activeOutlet, OUTLET_CONFIG } = useAdmin();
    const qc = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const cfg = OUTLET_CONFIG[activeOutlet] || { label: 'Admin', color: '#0d3542' };
    const label = cfg.label;
    const now = useClock();
    const today = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
    const time = now.toLocaleTimeString('en-US', { hour12: false });

    const onRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        Promise.resolve(qc.invalidateQueries()).finally(() =>
            setTimeout(() => setRefreshing(false), 600)
        );
    };

    return (
        <div className="relative min-h-full">
            {/* Ambient floating glow blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-attire-gold/20 blur-3xl animate-float" />
                <div
                    className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-attire-navy/10 blur-3xl animate-float"
                    style={{ animationDelay: '2s' }}
                />
            </div>

            {/* Hero header */}
            <header className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-attire-navy via-attire-navy/90 to-attire-navy/70 p-5 text-white shadow-lg">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,107,77,0.45),transparent_55%)]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                Live · {label}
                            </span>
                        </div>
                        <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                            Good {greeting(now.getHours())}, honey{' '}
                            <span className="text-attire-gold">♡</span>
                        </h1>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} /> {today}
                            </span>
                            <span className="inline-flex items-center gap-1.5 tabular-nums">
                                <Clock size={14} /> {time}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-70"
                        >
                            <RotateCw size={14} className={cn(refreshing && 'animate-spin')} />
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-attire-gold text-lg font-bold text-white shadow-md ring-2 ring-white/30">
                            {label.charAt(0)}
                        </div>
                    </div>
                </div>
                <Sparkles
                    size={120}
                    className="pointer-events-none absolute -bottom-8 right-10 text-white/5"
                />
            </header>

            <div className="space-y-5">{children}</div>
        </div>
    );
}

export default AppShell;
