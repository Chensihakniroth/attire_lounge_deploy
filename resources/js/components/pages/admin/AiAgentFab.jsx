import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';

/**
 * Floating action button that opens the AI data assistant.
 * Only renders while the admin is authenticated and browsing admin routes
 * (not on the login page or the AI chat page itself).
 */
export default function AiAgentFab({ variant = 'fab' }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        setAuthed(
            !!(
                localStorage.getItem('admin_token') ||
                sessionStorage.getItem('admin_token')
            ),
        );
    }, []);

    if (
        !authed ||
        !pathname.startsWith('/admin') ||
        pathname === '/admin/login' ||
        pathname === '/admin/ai'
    ) {
        return null;
    }

    if (variant === 'header') {
        return (
            <button
                type="button"
                onClick={() => navigate('/admin/ai')}
                aria-label="AI Assistant"
                title="Ask Attire AI"
                className="group relative flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white hover:text-attire-navy transition-all"
            >
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <Bot size={16} className="text-white group-hover:text-attire-navy transition-colors" />
                <span className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-attire-navy hidden sm:block transition-colors">
                    AI
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[1000] flex items-center gap-2">
            <button
                type="button"
                onClick={() => navigate('/admin/ai')}
                aria-label="AI Assistant"
                className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/85 text-primary-foreground shadow-[0_8px_25px_hsl(var(--primary)/0.4)] ring-2 ring-background transition-all duration-300 hover:scale-110 active:scale-95"
            >
                <Bot size={24} className="transition-transform group-hover:rotate-6" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background"></span>
                </span>
                {/* Floating Tooltip */}
                <span className="pointer-events-none absolute right-15 whitespace-nowrap rounded-xl border border-border/70 bg-card/95 px-3 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
                    ✨ Ask Attire AI
                </span>
            </button>
        </div>
    );
}
