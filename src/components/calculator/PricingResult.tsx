import { CalculatedTier } from '../../hooks/usePricingEngine';
import { formatCurrency } from '../../utils/formatters';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingResultProps {
    tier: CalculatedTier | undefined;
    qty: number;
    onQtyChange: (val: number) => void;
}

export const PricingResult = ({ tier, qty, onQtyChange }: PricingResultProps) => {
    const [copied, setCopied] = useState(false);

    if (!tier) return null;

    const isWholesale = tier.isWholesale;
    // Ensure qty is at least 1
    const safeQty = Math.max(1, qty || 1);
    const totalValue = tier.value * safeQty;

    const handleCopy = () => {
        navigator.clipboard.writeText(`Orçamento [${tier.name}]: ${formatCurrency(totalValue)} (${safeQty} un.)`);
        if (navigator.vibrate) navigator.vibrate(20);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={tier.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative group"
            >
                {/* Dynamic Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-6 md:p-8 rounded-[1.75rem] shadow-2xl shadow-indigo-500/10 overflow-hidden ring-1 ring-white/20">
                    {/* Decorative shine */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Valor Final Estimado</p>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                                {formatCurrency(totalValue)}
                            </h2>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-zinc-700/50 group/btn"
                        >
                            {copied ? (
                                <Check size={22} className="text-emerald-500 stroke-[3]" />
                            ) : (
                                <Copy size={22} className="text-zinc-400 group-hover/btn:text-indigo-500 transition-colors" />
                            )}
                        </button>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        {isWholesale && (
                            <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-white/5 backdrop-blur-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60">
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => onQtyChange(parseInt(e.target.value) || 1)}
                                    className="w-full bg-transparent text-2xl font-bold p-0 border-none focus:ring-0 text-zinc-700 dark:text-zinc-200 placeholder-zinc-300"
                                />
                            </div>
                        )}

                        <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-white/5 backdrop-blur-sm flex items-center justify-between">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-0.5">Unitário</label>
                                <span className="text-lg font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">{formatCurrency(tier.value)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
