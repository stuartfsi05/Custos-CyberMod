import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipHelpProps {
    text: string;
    label?: string;
}

export const TooltipHelp = ({ text, label }: TooltipHelpProps) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [open]);

    return (
        <div
            ref={wrapperRef}
            className="relative inline-flex items-center"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(prev => !prev);
                }}
                aria-label={label ? `Ajuda: ${label}` : 'Ajuda'}
                aria-expanded={open}
                className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
                <HelpCircle size={13} />
            </button>

            {open && (
                <div
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-60 max-w-[calc(100vw-2rem)] p-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] leading-snug font-medium text-left shadow-xl border border-zinc-700/60 z-50 pointer-events-none"
                >
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
                </div>
            )}
        </div>
    );
};
