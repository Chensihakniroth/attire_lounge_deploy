import React from 'react';

/* ─── Cyber-Bespoke Form Components ────────────────────────────────────── */

/**
 * Shared input style string used across all admin forms.
 * Apply via className: `className={inputBase}` or `className={\`${inputBase} font-mono\`}`
 */
export const inputBase =
    'w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-4 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10';

/**
 * A card-style section with a header strip (icon + title + subtitle).
 * Used in PosProductManager, DrinkManager, ProductEditor.
 */
export const Section = ({ title, subtitle, icon: Icon, children, accent = false }) => (
    <div
        className={`rounded-2xl border transition-colors ${accent ? 'border-[#0d3542]/15 dark:border-[#58a6ff]/15 bg-[#0d3542]/[0.02] dark:bg-[#58a6ff]/[0.02]' : 'border-black/5 dark:border-[#30363d] bg-white/50 dark:bg-[#161b22]/50'}`}
    >
        <div className="px-5 py-4 border-b border-black/5 dark:border-[#30363d]/50 flex items-center gap-3">
            {Icon && (
                <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10' : 'bg-black/5 dark:bg-white/5'}`}
                >
                    <Icon
                        size={16}
                        className={
                            accent
                                ? 'text-[#0d3542] dark:text-[#58a6ff]'
                                : 'text-gray-400 dark:text-[#8b949e]'
                        }
                    />
                </div>
            )}
            <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.15em]">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

/**
 * A labelled form field wrapper with optional hint text and char counter.
 * charCount / maxChars are used by ProductEditor's SEO fields.
 */
export const Field = ({ label, children, hint, charCount, maxChars }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.15em] ml-0.5">
                {label}
            </label>
            {maxChars && (
                <span
                    className={`text-[9px] font-bold tabular-nums ${charCount > maxChars ? 'text-red-400' : 'text-gray-300 dark:text-[#8b949e]/20'}`}
                >
                    {charCount}/{maxChars}
                </span>
            )}
        </div>
        {children}
        {hint && (
            <p className="text-[9px] text-gray-300 dark:text-[#8b949e]/20 uppercase tracking-widest ml-0.5">
                {hint}
            </p>
        )}
    </div>
);

/**
 * A compact sidebar section with a small icon + bold title.
 * Used in PosProductManager and DrinkManager filter sidebars.
 */
export const SidebarSection = ({ title, icon: Icon, children }) => (
    <div className="border-b border-black/5 dark:border-[#30363d]/50">
        <div className="px-5 py-3 flex items-center gap-2.5">
            {Icon && (
                <Icon
                    size={12}
                    className="text-[#0d3542] dark:text-[#58a6ff]"
                />
            )}
            <h3 className="text-[10px] font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em]">
                {title}
            </h3>
        </div>
        <div className="px-5 pb-4">{children}</div>
    </div>
);
