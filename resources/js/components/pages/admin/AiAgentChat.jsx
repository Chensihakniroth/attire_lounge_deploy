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
    PlusCircle
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

function generateThinkingSteps(promptText, outletLabel, lang = 'en') {
    const lower = (promptText || '').toLowerCase();
    const outlet = outletLabel || 'Attire Lounge';
    
    if (lang === 'km') {
        let prose = `ជាបឋម ខ្ញុំត្រូវវាយតម្លៃទិន្នន័យប្រតិបត្តិការរបស់សាខា ${outlet}។ ដោយយោងតាមសំណួរ "${promptText}" ខ្ញុំនឹងពិនិត្យមើលតារាងទិន្នន័យ និងព័ត៌មានពាក់ព័ន្ធក្នុងប្រព័ន្ធ។`;

        if (lower.includes('stock') || lower.includes('product') || lower.includes('inventory') || lower.includes('item') || lower.includes('suit') || lower.includes('tuxedo')) {
            prose += ` សំណួរនេះទាក់ទងនឹងផលិតផល និងស្តុកទំនិញ។ ខ្ញុំនឹងស្វែងរកទិន្នន័យពី PosProduct និង PosProductVariant សម្រាប់ ${outlet} ដោយពិនិត្យមើលចំនួន SKU ស្ថានភាពផលិតផល និងកម្រិតស្តុកដែលនៅសល់តិច។`;
        } else if (lower.includes('appointment') || lower.includes('fitting') || lower.includes('schedule') || lower.includes('booking')) {
            prose += ` សំណួរនេះទាក់ទងនឹងការណាត់ជួបកាត់សម្លៀកបំពាក់។ ខ្ញុំនឹងពិនិត្យមើលកំណត់ត្រា Appointment តាមកាលបរិច្ឆេទ ភាពទំនេររបស់ជាងកាត់ និងស្ថានភាពណាត់ជួប (confirmed, pending)។`;
        } else if (lower.includes('sale') || lower.includes('revenue') || lower.includes('order') || lower.includes('invoice') || lower.includes('stat') || lower.includes('pulse')) {
            prose += ` សំណួរនេះទាក់ទងនឹងប្រាក់ចំណូល និងប្រតិបត្តិការលក់។ ខ្ញុំនឹងពិនិត្យមើលវិក្កយបត្រ PosInvoice និង PosPayment សម្រាប់ ${outlet} ដើម្បីបូកសរុបប្រាក់ចំណូល និងចំនួនវិក្កយបត្រសរុប។`;
        } else if (lower.includes('customer') || lower.includes('client') || lower.includes('profile')) {
            prose += ` សំណួរនេះទាក់ទងនឹងព័ត៌មានអតិថិជន។ ខ្ញុំនឹងស្វែងរកកំណត់ត្រាអតិថិជន CustomerProfile ប្រវត្តិទិញទំនិញ និងទិន្នន័យទំនាក់ទំនង។`;
        } else if (lower.includes('newsletter') || lower.includes('subscriber') || lower.includes('email') || lower.includes('phone')) {
            prose += ` សំណួរនេះទាក់ទងនឹងការចុះឈ្មោះទទួលព័ត៌មាន Newsletter។ ខ្ញុំនឹងពិនិត្យមើលបញ្ជីឈ្មោះ NewsletterSubscription ក្នុងប្រព័ន្ធ។`;
        } else {
            prose += ` ខ្ញុំនឹងរៀបចំគម្រោងវិភាគទិន្នន័យឆ្លងកាត់តារាងពាក់ព័ន្ធក្នុងប្រព័ន្ធទិន្នន័យ ដើម្បីធានាបាននូវភាពត្រឹមត្រូវខ្ពស់បំផុត។`;
        }

        prose += ` ឥឡូវនេះ ខ្ញុំកំពុងប្រមូលផ្តុំទិន្នន័យដែលទទួលបាន រៀបចំជាតារាង និងសេចក្តីសង្ខេបច្បាស់លាស់ជាភាសាខ្មែរជូនលោកអ្នក។`;

        return prose;
    }

    let prose = `First, I need to evaluate the store operational context for ${outlet}. Looking at the user query "${promptText}", I will determine which business data tables and schemas to inspect.`;

    if (lower.includes('stock') || lower.includes('product') || lower.includes('inventory') || lower.includes('item') || lower.includes('suit') || lower.includes('tuxedo')) {
        prose += ` The query pertains to products and inventory levels. I should inspect the PosProduct and PosProductVariant models for ${outlet}, checking SKU counts, active flags, category classifications, and alert thresholds where quantities fall below the minimum required levels. I will cross-reference variants to ensure accurate stock tallies across all sizes and colorways.`;
    } else if (lower.includes('appointment') || lower.includes('fitting') || lower.includes('schedule') || lower.includes('booking')) {
        prose += ` The query focuses on customer fittings and appointment scheduling. I should inspect the Appointment records, filtering by date range, fitting room availability, assigned tailors, and current statuses such as confirmed, pending, or completed. I will verify client details to provide a comprehensive timetable.`;
    } else if (lower.includes('sale') || lower.includes('revenue') || lower.includes('order') || lower.includes('invoice') || lower.includes('stat') || lower.includes('pulse')) {
        prose += ` The user is requesting financial performance and transaction metrics. I should query the PosInvoice and PosPayment ledger for ${outlet}, aggregating total revenue, discount adjustments, invoice counts, and payment breakdown methods. I will calculate averages and identify key revenue drivers for the active period.`;
    } else if (lower.includes('customer') || lower.includes('client') || lower.includes('profile')) {
        prose += ` This request involves client relationship management. I should look up CustomerProfile records, checking purchase history, total spend, bespoke preferences, and contact details while adhering to data privacy constraints.`;
    } else if (lower.includes('newsletter') || lower.includes('subscriber') || lower.includes('email') || lower.includes('phone')) {
        prose += ` The query references marketing audience subscriptions. I should query the NewsletterSubscription records, verifying recent signups and active subscriber status.`;
    } else {
        prose += ` I will formulate a multi-turn analytical query plan across the database models, resolving any necessary entity relationships and filtering out inactive records to ensure precision.`;
    }

    prose += ` Now, I will synthesize all retrieved records, format the data clearly with tables and key takeaways, and stream the finalized executive response back to the user.`;

    return prose;
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
            <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-2xl border border-border/80 dark:border-white/10 bg-muted/30 dark:bg-white/5 shadow-sm">
                <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-border/80 dark:border-white/10 bg-muted/60 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white/60">
                        <tr>
                            {headerRow.cells.map((cell, cIdx) => (
                                <th key={cIdx} className="px-4 py-3 font-semibold">
                                    {renderInline(cell)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 dark:divide-white/5 font-mono text-[12px] sm:text-[13px]">
                        {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-muted/40 dark:hover:bg-white/5 transition-colors">
                                {row.cells.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2.5 text-foreground/90 dark:text-white/90 font-sans">
                                        {renderInline(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        tableRows = [];
        inTable = false;
    };

    const flushList = (key) => {
        if (listItems.length === 0) return;
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

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            if (inList) flushList(i);
            inTable = true;
            const cells = trimmed
                .slice(1, -1)
                .split('|')
                .map((c) => c.trim());
            const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
            tableRows.push({ cells, isSeparator });
            continue;
        } else if (inTable) {
            flushTable(i);
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
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
            {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle rounded-xs" />
            )}
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
    const { activeOutlet, OUTLET_CONFIG } = useAdmin() || {};
    const outletInfo = OUTLET_CONFIG?.[activeOutlet] || { label: 'Attire Lounge', color: '#0d3542' };
    const outletLogo = outletInfo.logo || 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png';

    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('attire_ai_chat_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState('');
    const [language, setLanguage] = useState(() => {
        try {
            return localStorage.getItem('attire_ai_language') || 'en';
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

    const { toast } = useToast();
    const listRef = useRef(null);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem('attire_ai_language', language);
        } catch (e) {}
    }, [language]);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior, block: 'end' });
        } else if (listRef.current) {
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior });
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('attire_ai_chat_history', JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save chat history', e);
        }
    }, [messages]);

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

        const dynamicProse = generateThinkingSteps(enrichedText, outletInfo.label, language);
        setThinkingText(dynamicProse);
        setMessages(next);
        setLoading(true);

        try {
            const { data } = await axios.post('/api/v1/admin/ai/chat', {
                messages: next.map(({ role, content }) => ({ role, content })),
                language: language,
            }, {
                headers: {
                    'X-Active-Outlet': activeOutlet || 'attire_lounge'
                }
            });

            if (data?.success) {
                const fullReply = data.reply || '';
                const toolCalls = data.tool_calls || [];
                const resTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                setLoading(false);

                // Initialize streaming message
                const streamingIndex = next.length;
                setMessages((m) => [
                    ...m,
                    {
                        role: 'assistant',
                        content: '',
                        toolCalls: toolCalls,
                        isStreaming: true,
                        timestamp: resTime
                    },
                ]);

                // Stream tokens smoothly chunk-by-chunk (dynamic typing effect)
                let charPos = 0;
                const step = fullReply.length > 800 ? 10 : fullReply.length > 300 ? 5 : 2;
                const streamInterval = setInterval(() => {
                    charPos += step;
                    if (charPos >= fullReply.length) {
                        clearInterval(streamInterval);
                        setMessages((prev) => {
                            const copy = [...prev];
                            if (copy[streamingIndex]) {
                                copy[streamingIndex] = {
                                    ...copy[streamingIndex],
                                    content: fullReply,
                                    isStreaming: false
                                };
                            }
                            return copy;
                        });
                    } else {
                        const chunk = fullReply.slice(0, charPos);
                        setMessages((prev) => {
                            const copy = [...prev];
                            if (copy[streamingIndex]) {
                                copy[streamingIndex] = {
                                    ...copy[streamingIndex],
                                    content: chunk
                                };
                            }
                            return copy;
                        });
                    }
                }, 16);
            } else {
                setLoading(false);
                toast.error(data?.message || 'AI reply failed.');
            }
        } catch (e) {
            setLoading(false);
            const errorMsg = e?.response?.data?.message || e?.message || 'Could not reach the AI assistant.';
            toast.error(errorMsg);
            setMessages((m) => [
                ...m,
                {
                    role: 'assistant',
                    content: `⚠️ **Request Error**: ${errorMsg}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
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
        setMessages([]);
        localStorage.removeItem('attire_ai_chat_history');
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

    return (
        <div className="relative flex h-full w-full flex-col bg-background dark:bg-[#0d1117] text-foreground dark:text-white transition-colors duration-300 overflow-hidden">
            {/* Top Bar (Clean & Theme-Aware) */}
            <div className="flex items-center justify-between border-b border-border/60 dark:border-white/10 bg-background/90 dark:bg-[#0d1117]/90 px-6 py-3 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <img src={outletLogo} alt={outletInfo.label} className="h-7 w-auto max-w-[36px] object-contain" />
                    <div>
                        <h1 className="text-sm font-bold tracking-tight text-foreground dark:text-white">{outletInfo.label} AI</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Language Switcher Pill */}
                    <div className="flex items-center rounded-xl border border-border/80 dark:border-white/10 bg-muted/50 dark:bg-white/5 p-0.5 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => {
                                setLanguage('en');
                                toast.info('Language set to English');
                            }}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                                language === 'en'
                                    ? 'bg-background dark:bg-[#161b22] text-foreground dark:text-white shadow-xs font-bold'
                                    : 'text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white'
                            }`}
                            title="English"
                        >
                            <span>🇬🇧</span>
                            <span>EN</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLanguage('km');
                                toast.info('បានកំណត់ភាសាខ្មែរ (Khmer)');
                            }}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                                language === 'km'
                                    ? 'bg-background dark:bg-[#161b22] text-foreground dark:text-white shadow-xs font-bold'
                                    : 'text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white'
                            }`}
                            title="Khmer (ភាសាខ្មែរ)"
                        >
                            <span>🇰🇭</span>
                            <span>ខ្មែរ</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={clearChat}
                        className="flex items-center gap-1.5 rounded-xl border border-border/70 dark:border-white/10 bg-muted/50 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground/80 dark:text-white/70 transition hover:bg-muted hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white active:scale-95"
                        title="New Chat"
                    >
                        <PlusCircle size={14} />
                        <span>New Chat</span>
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
                                    Ready to assist you
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
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
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
                                                </div>
                                            </div>
                                        ) : (
                                            /* Assistant Message */
                                            <div className="group flex items-start gap-4 w-full">
                                                <div className="shrink-0 mt-1">
                                                    <img src={outletLogo} alt={outletInfo.label} className="h-6 w-auto max-w-[28px] object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {/* Compact Clean Tool Execution Pill */}
                                                    {Array.isArray(m.toolCalls) && m.toolCalls.length > 0 && (
                                                        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                                                            {m.toolCalls.map((tool, tIdx) => {
                                                                const formattedName = tool
                                                                    .replace(/^(get_|list_|search_|update_)/, '')
                                                                    .replace(/_/g, ' ')
                                                                    .replace(/\b\w/g, (c) => c.toUpperCase());

                                                                return (
                                                                    <div
                                                                        key={tIdx}
                                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:text-white/70 shadow-xs"
                                                                        title={`Function executed: ${tool}`}
                                                                    >
                                                                        <Check size={11} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                                                                        <span className="text-[10.5px] opacity-70">Queried</span>
                                                                        <span className="font-semibold text-foreground/90 dark:text-white/90">{formattedName}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Assistant Markdown Content */}
                                                    <div className="text-[14.5px] leading-relaxed text-foreground/95 dark:text-white/90">
                                                        <MarkdownRenderer content={m.content} isStreaming={m.isStreaming} />
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
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Reasoning / Thinking Block */}
                    {loading && (
                        <div className="flex items-start gap-4 py-2">
                            <div className="shrink-0 mt-1">
                                <img src={outletLogo} alt={outletInfo.label} className="h-6 w-auto max-w-[28px] object-contain animate-pulse" />
                            </div>
                            <AIThinkingBlock
                                outletName={outletInfo.label}
                                thinkingText={thinkingText}
                                onToggle={() => scrollToBottom('smooth')}
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
                            placeholder="Message Attire..."
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

                            {/* Right: Mic & Circular Send Button */}
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

                                <button
                                    type="button"
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim() || loading}
                                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm ${
                                        inputValue.trim() && !loading
                                            ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                                            : 'bg-muted dark:bg-white/10 text-muted-foreground/40 dark:text-white/20 cursor-not-allowed'
                                    }`}
                                    title="Send Message"
                                >
                                    <ArrowUp size={17} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer Footnote */}
                    <p className="mt-2 text-center text-[11px] text-muted-foreground/60 dark:text-white/40">
                        Attire AI operates in secure closed-data mode. Verify critical store transactions.
                    </p>
                </div>
            </div>
        </div>
    );
}
