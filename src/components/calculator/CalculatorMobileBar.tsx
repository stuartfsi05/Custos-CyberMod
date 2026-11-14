import { ArrowDown, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import { formatCurrency } from '../../utils/formatters';

interface CalculatorMobileBarProps {
    unitSellPrice: number;
    batchSellPrice: number;
    unitProfit: number;
    unitProductionCost: number;
    qty: number;
    markupPercent: number;
    onScrollToSummary: () => void;
    onSellOrder: () => void;
}

export const CalculatorMobileBar = ({
    unitSellPrice,
    batchSellPrice,
    unitProfit,
    unitProductionCost,
    qty,
    markupPercent,
    onScrollToSummary,
    onSellOrder
}: CalculatorMobileBarProps) => {
    const netReturnOnCostPct =
        unitProductionCost > 0
            ? (unitProfit / unitProductionCost) * 100
            : markupPercent;
    const isHealthyMargin = unitProfit > 0 && netReturnOnCostPct >= 79.99;

    return (
        <div className="lg:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl px-3.5 py-2.5 border border-emerald-200/90 dark:border-emerald-900/60 shadow-2xl shadow-black/15 flex items-center justify-between gap-2.5">
            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-zinc-900 dark:text-white tabular-nums truncate">
                        {formatCurrency(unitSellPrice)}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 shrink-0">/peça</span>
                    <span
                        className={clsx(
                            'px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0',
                            isHealthyMargin
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        )}
                    >
                        {isHealthyMargin ? 'Saudável' : 'Apertada'}
                    </span>
                </div>
                <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 tabular-nums truncate">
                    Lote ({qty}x): {formatCurrency(batchSellPrice)} • Lucro {formatCurrency(unitProfit)}
                </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={onScrollToSummary}
                    aria-label="Ir para o resumo completo do preço"
                    className="h-9 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1"
                >
                    <ArrowDown size={13} />
                    Resumo
                </button>
                <button
                    type="button"
                    onClick={onSellOrder}
                    aria-label="Vender e registrar pedido"
                    className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                    <ShoppingBag size={13} />
                    Vender
                </button>
            </div>
        </div>
    );
};
