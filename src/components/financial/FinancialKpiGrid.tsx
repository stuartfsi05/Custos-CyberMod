import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { FinancialMetrics } from '../../utils/financialBackup';

interface FinancialKpiGridProps {
    metrics: FinancialMetrics;
}

export const FinancialKpiGrid = ({ metrics }: FinancialKpiGridProps) => {
    const rawTotal = metrics.productionCosts + metrics.totalExpenses + Math.max(0, metrics.netBalance);
    const prodPct = rawTotal > 0 ? (metrics.productionCosts / rawTotal) * 100 : 0;
    const expPct = rawTotal > 0 ? (metrics.totalExpenses / rawTotal) * 100 : 0;
    const profitPct = rawTotal > 0 ? (Math.max(0, metrics.netBalance) / rawTotal) * 100 : 0;

    return (
        <>
            {/* Primary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-200/50 dark:border-cyan-800/40 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                        <Wallet size={13} />
                        Faturamento ({metrics.confirmedCount})
                    </div>
                    <p className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
                        {formatCurrency(metrics.grossRevenue)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Recebido: {formatCurrency(metrics.receivedAmount)}
                    </p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-800/40 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                        <TrendingUp size={13} />
                        Lucro Líquido Real
                    </div>
                    <p
                        className={`text-xl md:text-2xl font-black tabular-nums tracking-tight ${
                            metrics.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}
                    >
                        {formatCurrency(metrics.netBalance)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Margem líquida: {metrics.avgMargin.toFixed(1)}%
                    </p>
                </Card>

                <Card className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                        <Clock size={13} />
                        A Receber
                    </div>
                    <p className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
                        {formatCurrency(metrics.receivables)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {metrics.pendingCount} orçamentos ({formatCurrency(metrics.pendingTotal)})
                    </p>
                </Card>

                <Card className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-1.5 text-rose-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                        <TrendingDown size={13} />
                        Custos + Despesas
                    </div>
                    <p className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
                        {formatCurrency(metrics.productionCosts + metrics.totalExpenses)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Prod.: {formatCurrency(metrics.productionCosts)} • Desp.: {formatCurrency(metrics.totalExpenses)}
                    </p>
                </Card>
            </div>

            {/* Comparative Breakdown Bar */}
            <Card className="space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Composição do Fluxo de Caixa
                </p>
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="bg-amber-500 h-full transition-all" style={{ width: `${prodPct}%` }} title="Custos de Produção" />
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${expPct}%` }} title="Despesas Operacionais" />
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${profitPct}%` }} title="Lucro Líquido" />
                </div>
                <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Produção ({prodPct.toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        Despesas ({expPct.toFixed(0)}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Lucro Líquido ({profitPct.toFixed(0)}%)
                    </span>
                </div>
            </Card>
        </>
    );
};
