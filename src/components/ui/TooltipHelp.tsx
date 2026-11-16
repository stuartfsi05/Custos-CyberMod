import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface TooltipHelpProps {
    text: string;
    label?: string;
}

interface TooltipCoords {
    top: number;
    left: number;
    width: number;
    arrowLeft: number;
    placement: 'top' | 'bottom';
}

export const TooltipHelp = ({ text, label }: TooltipHelpProps) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<TooltipCoords | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const hoverRef = useRef(false);

    const computeCoords = (): TooltipCoords | null => {
        const btn = buttonRef.current;
        if (!btn || typeof window === 'undefined') return null;

        const rect = btn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const width = Math.min(256, Math.max(160, viewportWidth - 24));
        const triggerCenterX = rect.left + rect.width / 2;
        const left = Math.max(12, Math.min(viewportWidth - width - 12, triggerCenterX - width / 2));
        const arrowLeft = Math.max(14, Math.min(width - 14, triggerCenterX - left));
        const placement: 'top' | 'bottom' = rect.top < 140 ? 'bottom' : 'top';
        const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8;

        return { top, left, width, arrowLeft, placement };
    };

    const openWithCoords = () => {
        const next = computeCoords();
        if (next) {
            setCoords(next);
            setOpen(true);
        }
    };

    useEffect(() => {
        if (!open) return;

        const handlePositionUpdate = () => {
            const next = computeCoords();
            if (next) setCoords(next);
        };

        const handleOutside = (e: MouseEvent) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node) &&
                (!tooltipRef.current || !tooltipRef.current.contains(e.target as Node))
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('scroll', handlePositionUpdate, true);
        window.addEventListener('resize', handlePositionUpdate);
        document.addEventListener('mousedown', handleOutside);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', handlePositionUpdate, true);
            window.removeEventListener('resize', handlePositionUpdate);
            document.removeEventListener('mousedown', handleOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    return (
        <span className="inline-flex items-center">
            <button
                ref={buttonRef}
                type="button"
                onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') {
                        hoverRef.current = true;
                        openWithCoords();
                    }
                }}
                onPointerLeave={(e) => {
                    if (e.pointerType !== 'touch') {
                        hoverRef.current = false;
                        setOpen(false);
                    }
                }}
                onFocus={(e) => {
                    if (e.currentTarget.matches(':focus-visible')) {
                        openWithCoords();
                    }
                }}
                onBlur={() => setOpen(false)}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (open && !hoverRef.current) {
                        setOpen(false);
                    } else {
                        openWithCoords();
                    }
                }}
                aria-label={label ? `Ajuda: ${label}` : 'Ajuda'}
                aria-expanded={open}
                className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
                <HelpCircle size={13} />
            </button>

            {open &&
                coords &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        role="tooltip"
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`
                        }}
                        className={`fixed z-[9999] pointer-events-none select-none p-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-zinc-100 text-xs leading-relaxed font-sans font-normal normal-case tracking-normal whitespace-normal break-words text-left shadow-2xl border border-zinc-700/80 ${
                            coords.placement === 'top' ? '-translate-y-full' : ''
                        }`}
                    >
                        {text}
                        <div
                            style={{ left: `${coords.arrowLeft}px` }}
                            className={`absolute -translate-x-1/2 w-0 h-0 border-4 border-transparent ${
                                coords.placement === 'top'
                                    ? 'top-full border-t-zinc-900 dark:border-t-zinc-800'
                                    : 'bottom-full border-b-zinc-900 dark:border-b-zinc-800'
                            }`}
                        />
                    </div>,
                    document.body
                )}
        </span>
    );
};
