import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info, X, XCircle } from 'lucide-react';

/**
 * Minimal, ultra-clean glassmorphic toast system for the admin panel.
 *
 * Usage (inside the provider tree):
 *   const { toast } = useToast();
 *   toast.success('Saved!');
 *   toast.error('Could not save invoice.');
 *   toast.info('Refreshing…');
 *
 * A global `window.uiToast` shim is also installed so non-React helpers can
 * surface feedback without a hook.
 */
const ToastContext = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const TYPE_META = {
    success: {
        icon: Check,
        iconClass: 'text-emerald-500 dark:text-emerald-400',
        chipClass: 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        barClass: 'bg-emerald-500/60',
    },
    error: {
        icon: XCircle,
        iconClass: 'text-rose-500 dark:text-rose-400',
        chipClass: 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
        barClass: 'bg-rose-500/60',
    },
    warning: {
        icon: AlertTriangle,
        iconClass: 'text-amber-500 dark:text-amber-400',
        chipClass: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        barClass: 'bg-amber-500/60',
    },
    info: {
        icon: Info,
        iconClass: 'text-sky-500 dark:text-sky-400',
        chipClass: 'bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20 shadow-[0_0_12px_rgba(14,165,233,0.2)]',
        barClass: 'bg-sky-500/60',
    },
};

const DURATION_MS = 4000;
let toastSeq = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (type, title, description) => {
            const id = ++toastSeq;
            setToasts((prev) => [...prev, { id, type, title, description }]);
            window.setTimeout(() => dismiss(id), DURATION_MS);
            return id;
        },
        [dismiss]
    );

    const toast = useMemo(() => {
        const fn = (title, description) => push('info', title, description);
        fn.success = (title, description) => push('success', title, description);
        fn.error = (title, description) => push('error', title, description);
        fn.info = (title, description) => push('info', title, description);
        fn.dismiss = dismiss;
        return fn;
    }, [push, dismiss]);

    // Global shim for non-hook helpers.
    useEffect(() => {
        window.uiToast = toast;
        return () => {
            if (window.uiToast === toast) window.uiToast = undefined;
        };
    }, [toast]);

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {typeof document !== 'undefined' &&
                createPortal(
                    <div
                        className="fixed bottom-5 left-5 z-[999998] flex flex-col items-start gap-2.5 max-w-[92vw] sm:max-w-md pointer-events-none"
                        aria-live="polite"
                    >
                        <AnimatePresence mode="popLayout">
                            {toasts.map((t) => {
                                const meta = TYPE_META[t.type] || TYPE_META.info;
                                const Icon = meta.icon;
                                return (
                                    <motion.div
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, y: 18, scale: 0.92, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                        exit={{
                                            opacity: 0,
                                            x: -24,
                                            scale: 0.95,
                                            filter: 'blur(4px)',
                                            transition: { duration: 0.18 }
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                                        className="pointer-events-auto group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-sm transition-colors"
                                    >
                                        {/* Status Icon Badge */}
                                        <span className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${meta.chipClass}`}>
                                            <Icon size={14} className={meta.iconClass} strokeWidth={2.5} />
                                        </span>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-1">
                                            <p className="text-[13px] font-semibold tracking-tight text-gray-900 dark:text-white leading-snug">
                                                {t.title}
                                            </p>
                                            {t.description && (
                                                <p className="text-[11.5px] leading-relaxed text-gray-500 dark:text-white/60 mt-0.5">
                                                    {t.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Close Button */}
                                        <button
                                            type="button"
                                            onClick={() => dismiss(t.id)}
                                            aria-label="Dismiss notification"
                                            className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <X size={13} />
                                        </button>

                                        {/* Micro Progress Line */}
                                        <motion.div
                                            initial={{ scaleX: 1 }}
                                            animate={{ scaleX: 0 }}
                                            transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
                                            style={{ originX: 0 }}
                                            className={`absolute bottom-0 left-0 right-0 h-[2px] ${meta.barClass}`}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>,
                    document.body
                )}
        </ToastContext.Provider>
    );
}

export default ToastProvider;