import { CalculatedTier } from '../../hooks/usePricingEngine';
import { formatCurrency } from '../../utils/formatters';
import { Copy, Check, Info } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden group"
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl" />

                <div className="relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/5 p-6 rounded-3xl shadow-xl shadow-indigo-500/10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Valor Final</p>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(totalValue)}
                            </h2>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-white dark:bg-zinc-800 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm border border-zinc-100 dark:border-zinc-700"
                        >
                            {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-zinc-500" />}
                        </button>
                    </div>

                    <div className="flex gap-3">
                        {isWholesale && (
                            <div className="flex-1 bg-white/50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-white/20 dark:border-white/5">
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => onQtyChange(parseInt(e.target.value) || 1)}
                                    className="w-full bg-transparent text-xl font-bold p-0 border-none focus:ring-0"
                                />
                            </div>
                        )}

                        <div className="flex-1 bg-white/50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-white/20 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-0.5">Unitário</label>
                                <span className="text-base font-bold opacity-80">{formatCurrency(tier.value)}</span>
                            </div>
                            <Info size={16} className="text-zinc-400" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
