import React, { useState, useEffect, useRef } from 'react';

/**
 * QuickEditCell — Shared inline edit cell used by PosProductManager and ShoeManager.
 * Renders an input overlay on top of a table cell for quick editing price/stock.
 * Saves on Enter, cancels on Escape or blur.
 */
const QuickEditCell = ({ value, prefix, onSave, onClose }) => {
    const [val, setVal] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSave(val);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#fdfdfc] dark:bg-[#111] flex items-center px-4 ring-2 ring-inset ring-[#0d3542] dark:ring-[#58a6ff] translate-y-0">
            {prefix && <span className="text-[14px] font-black text-[#0d3542] dark:text-[#58a6ff] mr-2">{prefix}</span>}
            <input
                ref={inputRef}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                className="flex-1 bg-transparent border-none outline-none text-[15.5px] font-black text-gray-900 dark:text-white"
            />
            <div className="flex items-center gap-1 ml-2">
                <div className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/25 dark:border-white/10 rounded text-[10px] font-black uppercase text-[#0d3542] dark:text-[#58a6ff]">Enter: Save</div>
            </div>
        </div>
    );
};

export default QuickEditCell;
