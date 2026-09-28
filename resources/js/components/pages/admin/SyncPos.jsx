import React, { useState } from 'react';
import {
    RefreshCw, CheckCircle, XCircle, ArrowRight, Clock,
    AlertTriangle, Play, ChevronDown, Info,
} from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LumaSpin } from '../../ui/luma-spin';

const timeAgo = (iso) => {
    if (!iso) return 'never';
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const fmtTime = (iso) =>
    iso ? new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : '—';

const statusStyles = {
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    skipped: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusStyles[status] || statusStyles.skipped}`}>
        {status === 'success' && <CheckCircle size={12} />}
        {status === 'error' && <XCircle size={12} />}
        {status}
    </span>
);

const ChangeDetails = ({ details }) => {
    const [open, setOpen] = useState(false);
    const rows = Array.isArray(details) ? details : [];
    if (rows.length === 0) return null;

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                {rows.length} change{rows.length === 1 ? '' : 's'}
            </button>
            {open && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                    {rows.map((r, i) => (
                        <div key={`${r.sku}-${i}`} className="flex items-center justify-between gap-3 text-[11px] px-3 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
                            <span className="font-mono font-bold shrink-0">{r.sku}</span>
                            <span className="truncate text-gray-500 dark:text-gray-400 flex-1 text-left">{r.name}</span>
                            <span className="font-mono shrink-0 whitespace-nowrap">
                                {r.from === null || r.from === undefined ? '—' : Number(r.from).toLocaleString()}
                                <ArrowRight size={10} className="inline mx-1" />
                                <span className="font-bold">{Number(r.to).toLocaleString()}</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const JobCard = ({ job, onRun, running }) => {
    const last = job.last_run;
    const isError = last?.status === 'error';

    return (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d1117] p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-black uppercase tracking-wider">{job.label}</h3>
                        {last && <StatusBadge status={last.status} />}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                        {job.summary}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onRun(job.key)}
                    disabled={running}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-attire-accent text-black text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Play size={13} />
                    {running === job.key ? 'Running…' : 'Run now'}
                </button>
            </div>

            {/* Direction */}
            <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{job.source}</span>
                <ArrowRight size={14} className="text-attire-accent shrink-0" />
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{job.target}</span>
                <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-gray-400">
                    runs hourly
                </span>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Last run', value: timeAgo(last?.created_at) },
                    { label: 'Matched', value: last?.matched ?? '—' },
                    { label: 'Changed', value: last?.changed ?? '—' },
                    { label: 'Duration', value: last?.duration_ms != null ? `${(last.duration_ms / 1000).toFixed(1)}s` : '—' },
                ].map((s) => (
                    <div key={s.label} className="px-3 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                        <p className="mt-1 text-sm font-bold font-mono">{s.value}</p>
                    </div>
                ))}
            </div>

            {last && (
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        {isError
                            ? <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
                            : <Info size={13} className="shrink-0 mt-0.5" />}
                        <span className="flex-1">
                            {last.message}
                            {last.not_on_store > 0 && (
                                <span className="block mt-0.5 text-gray-400">
                                    {last.not_on_store} product(s) are not published to the website and are left alone.
                                </span>
                            )}
                        </span>
                        <span className="shrink-0 flex items-center gap-1 text-gray-400">
                            <Clock size={11} />{fmtTime(last.created_at)}
                        </span>
                    </div>
                    <ChangeDetails details={last.details} />
                </div>
            )}

            {job.total_runs > 0 && job.total_errors > 0 && (
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-500">
                    {job.total_errors} of {job.total_runs} runs reported an error
                </p>
            )}
        </div>
    );
};

const SyncPos = () => {
    const queryClient = useQueryClient();
    const [running, setRunning] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['nile-sync'],
        queryFn: async () => (await axios.get('/api/v1/admin/nile-sync', { params: { limit: 30 } })).data,
        refetchInterval: 60000,
    });

    const runMutation = useMutation({
        mutationFn: async (job) => (await axios.post('/api/v1/admin/nile-sync/run', { job })).data,
        onMutate: (job) => setRunning(job),
        onSettled: () => {
            setRunning(null);
            queryClient.invalidateQueries({ queryKey: ['nile-sync'] });
        },
    });

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><LumaSpin size={40} /></div>;
    }

    const jobs = data?.jobs || [];
    const runs = data?.runs || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest">Sync POS</h1>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                        The Nile outlet and the nilecambodia.com website each own different facts, so two jobs run
                        in opposite directions. Prices follow the website because that is where promotions are set.
                        Stock follows the POS because that is where the shoes physically are.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['nile-sync'] })}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-[11px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            {jobs.map((job) => (
                <JobCard key={job.key} job={job} onRun={(j) => runMutation.mutate(j)} running={running} />
            ))}

            {/* History */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d1117] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
                    <h2 className="text-sm font-black uppercase tracking-widest">Run history</h2>
                </div>
                {runs.length === 0 ? (
                    <p className="px-6 py-10 text-center text-xs text-gray-400">
                        No runs recorded yet. The first hourly run will appear here.
                    </p>
                ) : (
                    <div className="divide-y divide-black/5 dark:divide-white/5">
                        {runs.map((run, i) => (
                            <motion.div
                                key={run.id}
                                initial={i < 6 ? { opacity: 0, y: 6 } : false}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-6 py-3.5"
                            >
                                <div className="flex items-center gap-3 flex-wrap">
                                    <StatusBadge status={run.status} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                                        {run.job}
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-1 min-w-[200px]">
                                        {run.message}
                                    </span>
                                    <span className="text-[11px] font-mono text-gray-400">
                                        {run.changed} changed · {run.matched} matched
                                    </span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Clock size={11} />{fmtTime(run.created_at)}
                                    </span>
                                </div>
                                <ChangeDetails details={run.details} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SyncPos;
