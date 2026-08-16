import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Search,
    Mic,
    ArrowUp,
    Plus,
    FileText,
    TrendingUp,
    Sparkles,
    Calendar,
    Receipt,
    Users,
    AlertTriangle,
    Bot,
    User,
    Trash2,
    Copy,
    Check,
    Wrench,
    RefreshCw,
    BrainCircuit,
    Layers,
    X,
    SlidersHorizontal,
    ShoppingBag,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    PlusCircle,
    Download,
    ChevronUp,
    Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../ui/toast';
import { useAdmin } from './AdminContext';
import { AIThinkingBlock } from '../../ui/ai-thinking-block';

const WELCOME_SUGGESTIONS = [
    {
        title: "Today's Business Pulse",
        desc: "Overview stats, revenue & orders today",
        prompt: "Show me today's overview stats, revenue, and order volume.",
        icon: TrendingUp,
        color: "text-emerald-500 dark:text-emerald-400"
    },
    {
        title: "Low Stock Watchlist",
        desc: "Active products at or below min stock",
        prompt: "List all active products that are low in stock or out of stock.",
        icon: AlertTriangle,
        color: "text-amber-500 dark:text-amber-400"
    },
    {
        title: "Pending Appointments",
        desc: "Scheduled fittings & bespoke sessions",
        prompt: "What appointments are scheduled or pending for today?",
        icon: Calendar,
        color: "text-blue-500 dark:text-blue-400"
    },
    {
        title: "Suit & Tuxedo Lookup",
        desc: "Explore stock, sizes, variants & prices",
        prompt: "Search for all suit, tuxedo, and blazer products in inventory.",
        icon: ShoppingBag,
        color: "text-purple-500 dark:text-purple-400"
    },
];



function renderTableCell(cell) {
    const trimmed = (cell || '').trim();
    if (!trimmed) return <span className="text-muted-foreground/50">—</span>;
    const lower = trimmed.toLowerCase();
    
    // Status Pills
    if (lower === 'active' || lower === 'yes' || lower === 'completed' || lower === 'done' || lower === 'approved') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {trimmed}
            </span>
        );
    }
    if (lower === 'low stock' || lower === 'pending' || lower === 'processing' || lower.includes('low')) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {trimmed}
            </span>
        );
    }
    if (lower === 'out of stock' || lower === 'cancelled' || lower === 'no' || lower === 'inactive' || lower === 'void' || lower === 'refunded') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-rose-600 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {trimmed}
            </span>
        );
    }
    
    // Price / Money
    if (/^\$\s*[\d,]+(\.\d{2})?$/.test(trimmed)) {
        return <span className="font-mono font-semibold text-foreground dark:text-white">{trimmed}</span>;
    }

    // SKU / Product ID (e.g. #123, SKU-01, etc.)
    if (/^#\d+$/.test(trimmed)) {
        return <span className="font-mono text-[11.5px] font-semibold text-muted-foreground dark:text-white/70">{trimmed}</span>;
    }

    return renderInline(trimmed);
}

/**
 * Custom Markdown parser for tables, lists, bold text, inline code, and alert boxes.
 */
function MarkdownRenderer({ content, isStreaming = false }) {
    if (!content && !isStreaming) return null;

    const lines = (content || '').split('\n');
    const elements = [];
    let tableRows = [];
    let inTable = false;
    let listItems = [];
    let inList = false;

    const flushTable = (key) => {
        if (tableRows.length === 0) return;
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1).filter((r) => !r.isSeparator);

        elements.push(
            <div key={`table-${key}`} className="my-3.5 overflow-hidden rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 dark:bg-[#161b22]/70 backdrop-blur-md shadow-sm">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[620px] text-left text-xs sm:text-[13px] border-collapse">
                        <thead className="border-b border-border/80 dark:border-white/10 bg-muted/60 dark:bg-white/[0.04] text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/60">
                            <tr>
                                {headerRow.cells.map((cell, cIdx) => (
                                    <th key={cIdx} className="px-4 py-3 font-semibold whitespace-nowrap">
                                        {renderInline(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 dark:divide-white/5 font-sans">
                            {bodyRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-muted/40 dark:hover:bg-white/[0.03] transition-colors even:bg-muted/20 dark:even:bg-white/[0.015]">
                                    {row.cells.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-4 py-2.5 text-foreground/90 dark:text-white/90">
                                            {renderTableCell(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
        tableRows = [];
        inTable = false;
    };

    const flushList = (key) => {
        if (listItems.length === 0) return;

        // Auto-convert structured pipe list items (e.g. "- #1 Item | SKU: 123 | stock: 0 | $22.00 | Cat: ...") into a table!
        const pipeItems = listItems.filter((it) => (it.match(/\|/g) || []).length >= 2);
        if (pipeItems.length >= 2 && pipeItems.length >= listItems.length * 0.6) {
            const rows = listItems.map((item) => {
                if ((item.match(/\|/g) || []).length < 2) return [item];
                return item.split('|').map((part) => part.trim());
            });

            const colCount = Math.max(...rows.map((r) => r.length));
            const defaultHeaders = ['Item / Title', 'SKU / Code', 'Stock Level', 'Price', 'Category / Details', 'Status', 'Notes'];
            const headerCells = defaultHeaders.slice(0, colCount);

            elements.push(
                <div key={`pipe-table-${key}`} className="my-3.5 overflow-hidden rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 dark:bg-[#161b22]/70 backdrop-blur-md shadow-sm">
                    <div className="overflow-x-auto max-w-full">
                        <table className="w-full min-w-[620px] text-left text-xs sm:text-[13px] border-collapse">
                            <thead className="border-b border-border/80 dark:border-white/10 bg-muted/60 dark:bg-white/[0.04] text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/60">
                                <tr>
                                    {headerCells.map((h, hIdx) => (
                                        <th key={hIdx} className="px-4 py-3 font-semibold whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 dark:divide-white/5 font-sans">
                                {rows.map((r, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-muted/40 dark:hover:bg-white/[0.03] transition-colors even:bg-muted/20 dark:even:bg-white/[0.015]">
                                        {r.map((cell, cIdx) => (
                                            <td key={cIdx} className="px-4 py-2.5 text-foreground/90 dark:text-white/90">
                                                {renderTableCell(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
            listItems = [];
            inList = false;
            return;
        }

        elements.push(
            <ul key={`list-${key}`} className="my-2.5 space-y-1.5 pl-5 text-[14px] sm:text-[15px] list-disc list-outside text-foreground/90 dark:text-white/90">
                {listItems.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                        {renderInline(item)}
                    </li>
                ))}
            </ul>
        );
        listItems = [];
        inList = false;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check for table row (starts with | or contains multiple pipes)
        const isTableLine = (trimmed.startsWith('|') && (trimmed.match(/\|/g) || []).length >= 1) || 
                            (!trimmed.startsWith('- ') && !trimmed.startsWith('* ') && (trimmed.match(/\|/g) || []).length >= 2);

        if (isTableLine) {
            if (inList) flushList(i);
            inTable = true;
            let rawCells = trimmed;
            if (rawCells.startsWith('|')) rawCells = rawCells.slice(1);
            if (rawCells.endsWith('|')) rawCells = rawCells.slice(0, -1);
            const cells = rawCells.split('|').map((c) => c.trim());
            const isSeparator = cells.length > 0 && cells.every((c) => /^[:\s-]+$/.test(c));
            tableRows.push({ cells, isSeparator });
            continue;
        } else if (inTable) {
            flushTable(i);
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            inList = true;
            listItems.push(trimmed.slice(2));
            continue;
        } else if (inList) {
            flushList(i);
        }

        if (trimmed.startsWith('### ')) {
            elements.push(
                <h4 key={i} className="mt-4 mb-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                    {renderInline(trimmed.slice(4))}
                </h4>
            );
            continue;
        }
        if (trimmed.startsWith('## ')) {
            elements.push(
                <h3 key={i} className="mt-5 mb-2 text-base font-bold text-foreground dark:text-white">
                    {renderInline(trimmed.slice(3))}
                </h3>
            );
            continue;
        }

        if (!trimmed) {
            elements.push(<div key={i} className="h-2" />);
            continue;
        }

        if (trimmed.startsWith('⚠️') || trimmed.startsWith('Note:')) {
            elements.push(
                <div key={i} className="my-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs sm:text-sm text-amber-600 dark:text-amber-200">
                    {renderInline(trimmed)}
                </div>
            );
            continue;
        }

        elements.push(
            <p key={i} className="leading-relaxed text-[14px] sm:text-[15px] text-foreground/90 dark:text-white/90">
                {renderInline(trimmed)}
            </p>
        );
    }

    if (inTable) flushTable(lines.length);
    if (inList) flushList(lines.length);

    return (
        <div className="space-y-1.5">
            {elements}
        </div>
    );
}

function renderInline(text) {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-foreground dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="italic text-foreground/90 dark:text-white/90">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="rounded bg-muted dark:bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-primary">
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

export default function AiAgentChat() {
    const { user, activeOutlet, OUTLET_CONFIG } = useAdmin() || {};
    const outletInfo = OUTLET_CONFIG?.[activeOutlet] || { label: 'Attire Lounge', color: '#0d3542' };
    const outletLogo = outletInfo.logo || 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png';

    const storageKey = `attire_ai_chat_${user?.id || 'admin'}_${activeOutlet || 'attire_lounge'}`;

    const [messages, setMessages] = useState(() => {
        try {
            const key = `attire_ai_chat_${user?.id || 'admin'}_${activeOutlet || 'attire_lounge'}`;
            const saved = localStorage.getItem(key);
            if (saved) return JSON.parse(saved);
            const legacy = localStorage.getItem('attire_ai_chat_history');
            return legacy ? JSON.parse(legacy) : [];
        } catch (e) {
            return [];
        }
    });

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState('Evaluating query and preparing tools...');
    const [liveTools, setLiveTools] = useState([]);
    const [language, setLanguage] = useState(() => {
        try {
            return localStorage.getItem(`attire_ai_language_${user?.id || 'admin'}`) || localStorage.getItem('attire_ai_language') || 'en';
        } catch (e) {
            return 'en';
        }
    });
    const [searchEnabled, setSearchEnabled] = useState(false);
    const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
    const [reasonEnabled, setReasonEnabled] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showUploadAnimation, setShowUploadAnimation] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [confirmClear, setConfirmClear] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const abortRef = useRef(null);

    const { toast } = useToast();
    const listRef = useRef(null);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    // Sync chat history whenever user account or active outlet changes
    useEffect(() => {
        try {
            const key = `attire_ai_chat_${user?.id || 'admin'}_${activeOutlet || 'attire_lounge'}`;
            const saved = localStorage.getItem(key);
            setMessages(saved ? JSON.parse(saved) : []);
        } catch (e) {
            setMessages([]);
        }
    }, [user?.id, activeOutlet]);

    useEffect(() => {
        try {
            localStorage.setItem(`attire_ai_language_${user?.id || 'admin'}`, language);
            localStorage.setItem('attire_ai_language', language);
        } catch (e) {}
    }, [language, user?.id]);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior, block: 'end' });
        } else if (listRef.current) {
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior });
        }
    }, []);

    useEffect(() => {
        try {
            const key = `attire_ai_chat_${user?.id || 'admin'}_${activeOutlet || 'attire_lounge'}`;
            localStorage.setItem(key, JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save chat history', e);
        }
    }, [messages, user?.id, activeOutlet]);

    // Auto-scroll when messages stream or change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    // Smooth scroll when thinking block expands
    useEffect(() => {
        if (loading) {
            scrollToBottom('smooth');
            const t1 = setTimeout(() => scrollToBottom('smooth'), 80);
            const t2 = setTimeout(() => scrollToBottom('smooth'), 220);
            const t3 = setTimeout(() => scrollToBottom('smooth'), 450);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [loading, scrollToBottom]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
        }
    }, [inputValue]);

    // ── Keyboard shortcut: Ctrl/Cmd+K to focus input ──
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                textareaRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // ── Scroll-to-top visibility ──
    useEffect(() => {
        const container = listRef.current;
        if (!container) return;
        const handleScroll = () => {
            setShowScrollTop(container.scrollTop > 400);
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const handleUploadFile = () => {
        setShowUploadAnimation(true);
        setTimeout(() => {
            const docName = `Outlet_Context_${activeOutlet || 'Store'}.pdf`;
            setUploadedFiles((prev) => [...prev, docName]);
            setShowUploadAnimation(false);
            toast.success(`Attached ${docName}`);
        }, 1000);
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error('Voice dictation is not supported on this browser.');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            toast('Listening… speak now.', { icon: '🎙️' });
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast.error('Voice recognition stopped.');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSendMessage = async (textToSend = inputValue) => {
        const text = (typeof textToSend === 'string' ? textToSend : inputValue).trim();
        if (!text || loading) return;

        let enrichedText = text;
        if (deepResearchEnabled) {
            enrichedText = `[Deep Analysis Mode] ${enrichedText}`;
        }
        if (uploadedFiles.length > 0) {
            enrichedText += `\n(Attached context references: ${uploadedFiles.join(', ')})`;
        }

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const next = [...messages, { role: 'user', content: enrichedText, timestamp: timeStr }];

        setInputValue('');
        setUploadedFiles([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setThinkingText('Evaluating query and preparing database tools...');
        setLiveTools([]);
        setMessages(next);
        setLoading(true);

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');

        try {
            // Use native fetch with SSE streaming for real-time tool call tracking
            const response = await fetch('/api/v1/admin/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-Active-Outlet': activeOutlet || 'attire_lounge',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    messages: next.map(({ role, content }) => ({ role, content })),
                    language: language,
                    stream: true,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`HTTP ${response.status}: ${errBody.slice(0, 300)}`);
            }

            // Parse SSE stream from response body
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalReply = '';
            let finalToolCalls = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE lines from buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // keep incomplete line in buffer

                let currentEvent = '';
                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        currentEvent = line.slice(7).trim();
                    } else if (line.startsWith('data: ')) {
                        const rawData = line.slice(6);
                        let eventData;
                        try {
                            eventData = JSON.parse(rawData);
                        } catch {
                            continue;
                        }

                        const eventType = currentEvent || eventData.type || 'message';

                        if (eventType === 'tool_start') {
                            setLiveTools((prev) => [
                                ...prev,
                                {
                                    name: eventData.name,
                                    args: eventData.args || {},
                                    status: 'running',
                                    tool_call_id: eventData.tool_call_id,
                                },
                            ]);
                            setThinkingText(`Executing ${eventData.name}...`);
                        } else if (eventType === 'tool_end') {
                            setLiveTools((prev) =>
                                prev.map((t) =>
                                    (t.tool_call_id === eventData.tool_call_id || t.name === eventData.name) && t.status === 'running'
                                        ? {
                                              ...t,
                                              status: 'completed',
                                              duration_ms: eventData.duration_ms,
                                              summary: eventData.summary,
                                          }
                                        : t
                                )
                            );
                        } else if (eventType === 'status') {
                            setThinkingText(eventData.message || '');
                        } else if (eventType === 'done') {
                            finalReply = eventData.reply || '';
                            finalToolCalls = eventData.tool_calls || [];
                        } else if (eventType === 'error') {
                            finalReply = `⚠️ **Error**: ${eventData.message || 'Unknown error'}`;
                        }

                        currentEvent = '';
                    }
                }
            }

            // Finalize response
            const fullReply = (finalReply && finalReply.trim() !== '')
                ? finalReply
                : 'I have processed the request, but no summary content was generated. Please ask for specific details or next page.';
            const resTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            setLoading(false);
            setLiveTools([]);

            // Show the full reply instantly (no typing or streaming text animation)
            setMessages((m) => [
                ...m,
                {
                    role: 'assistant',
                    content: fullReply,
                    toolCalls: finalToolCalls,
                    isStreaming: false,
                    timestamp: resTime,
                },
            ]);
        } catch (e) {
            setLoading(false);
            setLiveTools([]);
            if (e?.name === 'AbortError') return;
            const errorMsg = e?.message || 'Could not reach the AI assistant.';
            toast.error(errorMsg);
            setMessages((m) => [
                ...m,
                {
                    role: 'assistant',
                    content: `⚠️ **Request Error**: ${errorMsg}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        if (!confirmClear) {
            setConfirmClear(true);
            setTimeout(() => setConfirmClear(false), 2500);
            return;
        }
        setMessages([]);
        const key = `attire_ai_chat_${user?.id || 'admin'}_${activeOutlet || 'attire_lounge'}`;
        localStorage.removeItem(key);
        localStorage.removeItem('attire_ai_chat_history');
        setConfirmClear(false);
        toast.success('Started new chat.');
    };

    const handleRetry = (idx) => {
        const previousUserMsg = [...messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
        if (previousUserMsg) {
            handleSendMessage(previousUserMsg.content);
        }
    };

    const copyMessage = (content, index) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const deleteMessage = (idx) => {
        setMessages((prev) => prev.filter((_, i) => i !== idx));
        toast.success('Message removed.');
    };

    const exportChat = () => {
        if (messages.length === 0) {
            toast.error('No messages to export.');
            return;
        }
        const lines = messages.map((m) => {
            const role = m.role === 'user' ? 'You' : `${outletInfo.label} AI`;
            return `[${m.timestamp || '—'}] ${role}:\n${m.content}\n`;
        });
        const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${outletInfo.label.replace(/\s+/g, '_')}_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Chat exported!');
    };

    const stopGeneration = () => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        setLoading(false);
        setLiveTools([]);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="relative flex h-full w-full flex-col bg-background dark:bg-[#0d1117] text-foreground dark:text-white transition-colors duration-300 overflow-hidden">
            {/* Top Bar (Clean & Theme-Aware) */}
            <div className="flex items-center justify-between border-b border-border/60 dark:border-white/10 bg-background/90 dark:bg-[#0d1117]/90 px-6 py-3 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <img src={outletLogo} alt={outletInfo.label} className="h-7 w-auto max-w-[36px] object-contain" />
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold tracking-tight text-foreground dark:text-white">{outletInfo.label} AI</h1>
                        {messages.length > 0 && (
                            <span className="rounded-full bg-muted/70 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground dark:text-white/60">
                                {messages.length} {messages.length === 1 ? 'msg' : 'msgs'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Export Chat */}
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={exportChat}
                            className="flex items-center gap-1.5 rounded-lg border border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 dark:text-white/70 transition hover:bg-muted dark:hover:bg-white/10 active:scale-95"
                            title="Export conversation as text"
                        >
                            <Download size={13} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    )}

                    {/* Language Toggle — compact single-click flip */}
                    <button
                        type="button"
                        onClick={() => {
                            const next = language === 'en' ? 'km' : 'en';
                            setLanguage(next);
                            toast.info(next === 'km' ? 'ភាសាខ្មែរ' : 'English');
                        }}
                        className="relative flex items-center gap-1 rounded-lg border border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/5 px-2 py-1 text-[11px] font-semibold tracking-wide text-foreground/80 dark:text-white/70 transition-all hover:bg-muted dark:hover:bg-white/10 active:scale-95"
                        title={language === 'en' ? 'Switch to Khmer' : 'Switch to English'}
                    >
                        <span className="text-sm leading-none">{language === 'en' ? '🇬🇧' : '🇰🇭'}</span>
                        <span className="uppercase">{language === 'en' ? 'EN' : 'KH'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={clearChat}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
                            confirmClear
                                ? 'border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse'
                                : 'border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/5 text-foreground/80 dark:text-white/70 hover:bg-muted dark:hover:bg-white/10'
                        }`}
                        title={confirmClear ? 'Click again to confirm clearing chat' : 'New Chat'}
                    >
                        {confirmClear ? (
                            <>
                                <Trash2 size={13} />
                                <span>Clear?</span>
                            </>
                        ) : (
                            <>
                                <PlusCircle size={13} />
                                <span>New</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Centered Chat Container (Wider: max-w-4xl lg:max-w-5xl) */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
            >
                <div className="mx-auto max-w-4xl lg:max-w-5xl w-full px-4 sm:px-8 py-8 min-h-full flex flex-col justify-between">
                    {/* Empty State Hero */}
                    {messages.length === 0 ? (
                        <div className="my-auto py-8 flex flex-col items-center text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <img src={outletLogo} alt={outletInfo.label} className="h-16 w-auto max-w-[130px] object-contain drop-shadow-md mb-4" />
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-white mb-2">
                                    {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                                </h2>
                                <p className="text-sm sm:text-base text-muted-foreground dark:text-white/60 max-w-md mb-8">
                                    Ask anything about products, inventory, revenue, appointments, or clients at <span className="text-foreground dark:text-white font-semibold">{outletInfo.label}</span>.
                                </p>
                            </motion.div>

                            {/* Quick Suggestion Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-3xl text-left">
                                {WELCOME_SUGGESTIONS.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            type="button"
                                            onClick={() => handleSendMessage(item.prompt)}
                                            className="group flex items-start gap-3.5 rounded-2xl border border-border/80 dark:border-white/10 bg-card/70 dark:bg-[#161b22]/70 p-4.5 transition-all hover:border-primary/50 dark:hover:border-white/25 hover:bg-card dark:hover:bg-[#161b22] hover:shadow-lg active:scale-[0.98]"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-white/5 text-foreground dark:text-white group-hover:text-primary transition-colors">
                                                <Icon size={17} className={item.color} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground dark:text-white group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground dark:text-white/50 mt-0.5 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Conversation Messages */
                        <div className="space-y-8 pb-6">
                            {messages.map((m, idx) => {
                                const isUser = m.role === 'user';
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start w-full'}`}
                                    >
                                        {/* User Message */}
                                        {isUser ? (
                                            <div className="group flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
                                                <div className="rounded-3xl bg-muted/90 dark:bg-[#21262d] text-foreground dark:text-white px-5 py-3 text-[14.5px] leading-relaxed shadow-sm border border-border/60 dark:border-white/10">
                                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-2 px-2 text-[11px] text-muted-foreground dark:text-white/50">
                                                    <span>{m.timestamp}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyMessage(m.content, idx)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground dark:hover:text-white"
                                                        title="Copy"
                                                    >
                                                        {copiedIndex === idx ? <Check size={12} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={12} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteMessage(idx)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500 dark:hover:text-rose-400"
                                                        title="Delete message"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Assistant Message (Clean Full-Width without Logo) */
                                            <div className="group flex flex-col items-start w-full">
                                                <div className="w-full">
                                                    {/* Assistant Markdown Content */}
                                                    <div className="text-[14.5px] leading-relaxed text-foreground/95 dark:text-white/90">
                                                        <MarkdownRenderer content={m.content} />
                                                    </div>

                                                    {/* Assistant Action Bar */}
                                                    <div className="mt-3 flex items-center gap-1 text-muted-foreground dark:text-white/50 opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[11px] mr-2">{m.timestamp}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyMessage(m.content, idx)}
                                                            className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors"
                                                            title="Copy response"
                                                        >
                                                            {copiedIndex === idx ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={13} />}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRetry(idx)}
                                                            className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors"
                                                            title="Retry"
                                                        >
                                                            <RotateCcw size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toast.success('Feedback recorded: Helpful!')}
                                                            className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors"
                                                            title="Good response"
                                                        >
                                                            <ThumbsUp size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toast.success('Feedback recorded: Will improve.')}
                                                            className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors"
                                                            title="Bad response"
                                                        >
                                                            <ThumbsDown size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteMessage(idx)}
                                                            className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-white/10 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                            title="Delete message"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Reasoning / Thinking Indicator */}
                    {loading && (
                        <div className="py-2 px-1">
                            <AIThinkingBlock
                                outletName={outletInfo.label}
                                thinkingText={thinkingText}
                                liveTools={liveTools}
                            />
                        </div>
                    )}

                    {/* Bottom Scroll Anchor */}
                    <div ref={bottomRef} className="h-4 w-full shrink-0 pointer-events-none" />
                </div>
            </div>

            {/* Bottom Centered Floating Composer (Wider: max-w-4xl lg:max-w-5xl) */}
            <div className="w-full bg-gradient-to-t from-background via-background/95 to-transparent dark:from-[#0d1117] dark:via-[#0d1117]/95 dark:to-transparent pt-4 pb-4 px-4">
                <div className="mx-auto max-w-4xl lg:max-w-5xl w-full">
                    {/* Attached file tags */}
                    {uploadedFiles.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2 px-1">
                            {uploadedFiles.map((file, fIdx) => (
                                <div
                                    key={fIdx}
                                    className="flex items-center gap-1.5 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-[#161b22] px-3 py-1 text-xs text-foreground dark:text-white shadow-sm"
                                >
                                    <FileText size={13} className="text-primary" />
                                    <span>{file}</span>
                                    <button
                                        type="button"
                                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== fIdx))}
                                        className="ml-1 text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Unified Floating Pill Box with clean seamless focus */}
                    <div className="relative rounded-3xl border border-border/80 dark:border-white/10 bg-card/95 dark:bg-[#161b22]/95 shadow-2xl backdrop-blur-2xl focus-within:border-primary/50 dark:focus-within:border-white/30 focus-within:ring-1 focus-within:ring-primary/20 dark:focus-within:ring-white/20 transition-all overflow-hidden">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            rows={1}
                            placeholder="Message Attire... (Press ⌘K / Ctrl+K to focus)"
                            className="w-full max-h-44 resize-none bg-transparent !border-0 !border-none px-5 pt-4 pb-2 text-[15px] text-foreground dark:text-white placeholder-muted-foreground/50 dark:placeholder-white/30 !outline-none !ring-0 !shadow-none focus:!border-0 focus:!border-none focus:!ring-0 focus:!outline-none leading-relaxed"
                        />

                        {/* Controls Toolbar */}
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                            {/* Feature Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={handleUploadFile}
                                    className="flex items-center gap-1 rounded-full p-2 text-muted-foreground dark:text-white/60 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-colors"
                                    title="Attach Context Document"
                                >
                                    {showUploadAnimation ? (
                                        <RefreshCw size={15} className="animate-spin text-primary" />
                                    ) : (
                                        <Plus size={16} />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSearchEnabled(!searchEnabled)}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                        searchEnabled
                                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                            : 'bg-muted/70 dark:bg-white/5 text-muted-foreground dark:text-white/60 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white'
                                    }`}
                                >
                                    <Search size={12} />
                                    <span>Search</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDeepResearchEnabled(!deepResearchEnabled)}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                        deepResearchEnabled
                                            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                                            : 'bg-muted/70 dark:bg-white/5 text-muted-foreground dark:text-white/60 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white'
                                    }`}
                                >
                                    <Layers size={12} />
                                    <span>Deep Analysis</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setReasonEnabled(!reasonEnabled)}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                        reasonEnabled
                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                            : 'bg-muted/70 dark:bg-white/5 text-muted-foreground dark:text-white/60 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white'
                                    }`}
                                >
                                    <BrainCircuit size={12} />
                                    <span>Reason</span>
                                </button>
                            </div>

                            {/* Right: Mic & Send / Stop Button */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleVoiceInput}
                                    className={`p-2 rounded-full transition-colors ${
                                        isListening
                                            ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 animate-pulse'
                                            : 'text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-white/10'
                                    }`}
                                    title="Voice Input"
                                >
                                    <Mic size={17} />
                                </button>

                                {loading ? (
                                    <button
                                        type="button"
                                        onClick={stopGeneration}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground dark:bg-white text-background dark:text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                                        title="Stop generating"
                                    >
                                        <Square size={13} className="fill-current" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage()}
                                        disabled={!inputValue.trim()}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm ${
                                            inputValue.trim()
                                                ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                                                : 'bg-muted dark:bg-white/10 text-muted-foreground/40 dark:text-white/20 cursor-not-allowed'
                                        }`}
                                        title="Send Message"
                                    >
                                        <ArrowUp size={17} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Floating Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        type="button"
                        onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-28 right-6 sm:right-10 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 dark:border-white/15 bg-card/90 dark:bg-[#161b22]/90 text-foreground dark:text-white shadow-lg backdrop-blur-md transition hover:bg-muted dark:hover:bg-white/10 active:scale-95"
                        title="Scroll to top"
                    >
                        <ChevronUp size={16} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
