import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { AlertTriangle } from 'lucide-react';
import ModernModal from '../common/ModernModal';
import { cn } from '@/lib/utils';

/**
 * Promise-based, styled confirmation dialog.
 *
 * Usage:
 *   const { confirm } = useConfirm();
 *   if (await confirm({ message: 'Delete 3 records?', danger: true })) { ... }
 *
 * A `window.uiConfirm()` shim is installed too, so legacy `confirm(...)` call
 * sites can be swapped with `await window.uiConfirm(...)`.
 */
const ConfirmContext = createContext({ confirm: () => Promise.resolve(false) });
export const useConfirm = () => useContext(ConfirmContext);

const DEFAULT_OPTIONS = {
    title: 'Are you sure?',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    danger: false,
};

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((options) => {
        const normalized =
            typeof options === 'string' ? { message: options } : options;

        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setState({ ...DEFAULT_OPTIONS, ...normalized });
        });
    }, []);

    const settle = useCallback((result) => {
        setState(null);
        resolveRef.current?.(result);
        resolveRef.current = null;
    }, []);

    useEffect(() => {
        window.uiConfirm = confirm;
        return () => {
            if (window.uiConfirm === confirm) window.uiConfirm = undefined;
        };
    }, [confirm]);

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ModernModal
                isOpen={!!state}
                onClose={() => settle(false)}
                title={state?.title}
                maxWidth="max-w-md"
            >
                {state && (
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <span
                                className={cn(
                                    'w-10 h-10 shrink-0 rounded-xl flex items-center justify-center',
                                    state.danger
                                        ? 'bg-rose-500/10 text-rose-500'
                                        : 'bg-[#58a6ff]/10 text-[#58a6ff]'
                                )}
                            >
                                <AlertTriangle size={18} />
                            </span>
                            {state.message && (
                                <p className="flex-1 min-w-0 pt-1 text-[13px] leading-relaxed text-gray-700 dark:text-[#c9d1d9]">
                                    {state.message}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => settle(false)}
                                className="h-10 px-5 rounded-lg border border-black/10 dark:border-white/10 text-gray-500 dark:text-[#8b949e] text-[11px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            >
                                {state.cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => settle(true)}
                                className={cn(
                                    'h-10 px-5 rounded-lg text-white text-[11px] font-bold uppercase tracking-widest transition-all',
                                    state.danger
                                        ? 'bg-rose-500 hover:bg-rose-600'
                                        : 'bg-[#0d3542] dark:bg-[#58a6ff] dark:text-black hover:opacity-90'
                                )}
                            >
                                {state.confirmLabel}
                            </button>
                        </div>
                    </div>
                )}
            </ModernModal>
        </ConfirmContext.Provider>
    );
}

export default ConfirmProvider;