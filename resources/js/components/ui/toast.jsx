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
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

/**
 * Minimal, shared toast system for the admin panel.
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
    success: { icon: CheckCircle2, iconClass: 'text-emerald-500', chipClass: 'bg-emerald-500/10' },
    error: { icon: XCircle, iconClass: 'text-rose-500', chipClass: 'bg-rose-500/10' },
    warning: { icon: AlertTriangle, iconClass: 'text-amber-500', chipClass: 'bg-amber-500/10' },
    info: { icon: Info, iconClass: 'text-[#58a6ff]', chipClass: 'bg-[#58a6ff]/10' },
};

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
            // Auto-dismiss after 4.5s
            window.setTimeout(() => dismiss(id), 4500);
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
                    <div className="fixed top-4 right-4 z-[999998] flex flex-col items-end gap-2 max-w-[95vw] w-full sm:w-auto pointer-events-none" aria-live="polite">
                        <AnimatePresence>
                            {toasts.map((t) => {
                                const meta = TYPE_META[t.type] || TYPE_META.info;
                                const Icon = meta.icon;
                                return (
                                    <motion.div
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, y: -14, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 32, transition: { duration: 0.18 } }}
                                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                        className="pointer-events-auto w-full sm:w-[340px] rounded-xl border border-black/10 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-lg shadow-black/10 flex items-start gap-3 px-4 py-3"
                                    >
                                        <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${meta.chipClass}`}>
                                            <Icon size={16} className={meta.iconClass} />
                                        </span>
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <p className="text-[12px] font-bold leading-snug text-gray-900 dark:text-[#c9d1d9]">{t.title}</p>
                                            {t.description && (
                                                <p className="text-[11px] leading-relaxed text-gray-500 dark:text-[#8b949e] mt-0.5">{t.description}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => dismiss(t.id)}
                                            aria-label="Dismiss notification"
                                            className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
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