import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '../../ui/toast';

const WELCOME =
    "Hi ��� I'm your data assistant for the Attire Lounge admin. " +
    "Ask me about products, orders, customers, appointments, inventory, or today's stats — " +
    "and I can help update product prices/stock or appointment statuses. " +
    "I can't touch source code, configuration, schema, or files.";

export default function AiAgentChat() {
    const [messages, setMessages] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('ai-chat') || 'null') || [
                { role: 'assistant', content: WELCOME },
            ];
        } catch (e) {
            return [{ role: 'assistant', content: WELCOME }];
        }
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const listRef = useRef(null);

    useEffect(() => {
        sessionStorage.setItem('ai-chat', JSON.stringify(messages));
        const el = listRef.current;
        if (el) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) {
            return;
        }
        setInput('');
        const next = [...messages, { role: 'user', content: text }];
        setMessages(next);
        setLoading(true);
        try {
                        const { data } = await axios.post('/api/v1/admin/ai/chat', { messages: next });
            if (data?.success) {
                setMessages((m) => [
                    ...m,
                    { role: 'assistant', content: data.reply, toolCalls: data.tool_calls || [] },
                ]);
            } else {
                toast.error(data?.message || 'AI reply failed');
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Could not reach the AI assistant.');
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const clear = () => setMessages([{ role: 'assistant', content: WELCOME }]);

    return (
        <div className="flex h-full min-h-[500px] flex-col">
            <div className="border-b border-border px-4 py-2.5 text-sm font-medium text-foreground">
                AI Data Assistant
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto py-4 space-y-3">
                {messages.map((m, i) => (
                    <MessageBubble
                        key={m.role + '-' + i}
                        role={m.role}
                        content={m.content}
                        toolCalls={m.toolCalls}
                    />
                ))}
                {loading && (
                    <div className="flex items-start gap-2.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot size={14} className="text-primary" />
                        </div>
                        <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                            <RefreshCw size={14} className="animate-spin" />
                            <span className="ml-1.5 align-top">reasoning…</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-end gap-2 border-t border-border p-3">
                <button
                    type="button"
                    onClick={clear}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground opacity-70 hover:opacity-100"
                    title="Clear conversation"
                >
                    <Trash2 size={14} />
                </button>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={2}
                    placeholder="Ask about products, orders, customers…"
                    className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="button"
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="rounded-lg bg-primary px-3 py-2 text-primary-foreground opacity-90 transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}

function MessageBubble({ role, content, toolCalls }) {
    const isUser = role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
            >
                <p className="whitespace-pre-wrap break-words">{content}</p>
                {Array.isArray(toolCalls) && toolCalls.length > 0 && (
                    <div
                        className={`mt-1.5 flex flex-wrap gap-1 ${
                            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                    >
                        {toolCalls.map((t, i) => (
                            <span
                                key={i}
                                className={`text-[10px] uppercase tracking-wider ${
                                    isUser ? 'bg-primary-foreground/20' : 'bg-black/5'
                                } rounded px-1.5 py-0.5`}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
