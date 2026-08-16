import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';

/**
 * Floating action button that opens the AI data assistant.
 * Only renders while the admin is authenticated and browsing admin routes
 * (not on the login page or the AI chat page itself).
 */
export default function AiAgentFab() {
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

    return (
        <button
            type="button"
            onClick={() => navigate('/admin/ai')}
            aria-label="AI assistant"
            className="fixed bottom-6 right-6 z-[1000] flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/0.35)] ring-2 ring-background transition hover:scale-105"
        >
            <Bot size={24} />
        </button>
    );
}
