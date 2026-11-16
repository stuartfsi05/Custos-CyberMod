import { useState } from 'react';
import { ChevronDown, Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { TaxIncidenceMode, TaxPassThroughMode } from '../../../hooks/usePricingEngine';
import { MarketplaceChannel } from '../../../types/settings';
import { parseNumber, sanitizeNumericInputString } from '../../../utils/formatters';
import { NumericInput } from '../../ui/NumericInput';
import { TooltipHelp } from '../../ui/TooltipHelp';

interface Step5TaxesAndMarketplaceProps {
    onFocusStep: () => void;
    marketplaces: MarketplaceChannel[];
    selectedMarketplaceId: string;
    onSelectMarketplace: (id: string) => void;
    onCreateChannel: (name: string, commissionPercent: number, fixedFee: number) => boolean;
    taxMode: TaxIncidenceMode;
    onTaxModeChange: (mode: TaxIncidenceMode) => void;
    taxPassThrough: TaxPassThroughMode;
    onTaxPassThroughChange: (mode: TaxPassThroughMode) => void;
    commissionPercent: number;
    onCommissionPercentChange: (val: number) => void;
    fixedFee: number;
    onFixedFeeChange: (val: number) => void;
    taxPercent: number;
    onTaxPercentChange: (val: number) => void;
}

export const Step5TaxesAndMarketplace = ({
    onFocusStep,
    marketplaces,
    selectedMarketplaceId,
    onSelectMarketplace,
    onCreateChannel,
    taxMode,
    onTaxModeChange,
    taxPassThrough,
    onTaxPassThroughChange,
    commissionPercent,
    onCommissionPercentChange,
    fixedFee,
    onFixedFeeChange,
    taxPercent,
    onTaxPercentChange
}: Step5TaxesAndMarketplaceProps) => {
    const [showNewChannel, setShowNewChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelComm, setNewChannelComm] = useState('14');
    const [newChannelFixed, setNewChannelFixed] = useState('6');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const activeChannelName = marketplaces.find(m => m.id === selectedMarketplaceId)?.name || 'Personalizado';
    const summaryText = `${activeChannelName} • ${commissionPercent}%`;

    const handleQuickSubmit = () => {
        if (onCreateChannel(newChannelName, parseNumber(newChannelComm), parseNumber(newChannelFixed))) {
            setNewChannelName('');
            setShowNewChannel(false);
        }
    };

    return (
        <section
            id="step-5"
            onFocus={onFocusStep}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 scroll-mt-24"
        >
            <button
                type="button"
                onClick={() => setIsCollapsed(prev => !prev)}
                aria-expanded={!isCollapsed}
                className="w-full flex items-center justify-between gap-3 text-left"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                        5
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            Taxas e Impostos
                        </h2>
                        <p className="text-xs text-zinc-400 truncate">Marketplace, taxa fixa e imposto de venda (DAS/NF)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className={clsx(
                            'items-center px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 max-w-[190px] truncate tabular-nums',
                            isCollapsed ? 'inline-flex' : 'hidden sm:inline-flex'
                        )}
                    >
                        {summaryText}
                    </span>
                    <ChevronDown
                        size={18}
                        className={clsx('text-zinc-400 transition-transform shrink-0', !isCollapsed && 'rotate-180')}
                    />
                </div>
            </button>

            {!isCollapsed && (
                <div className="space-y-4">
                    {/* Canal de Venda Pills */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Canal de Venda</span>
                            <button
                                type="button"
                                onClick={() => setShowNewChannel(prev => !prev)}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <Plus size={14} />
                                {showNewChannel ? 'Fechar' : 'Criar canal'}
                            </button>
                        </div>

                        {showNewChannel && (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <input
                                    type="text"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    placeholder="Nome do canal"
                                    className="sm:col-span-2 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs font-medium"
                                />
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.1"
                                        value={newChannelComm}
                                        onChange={(e) => {
                                            const cleaned = sanitizeNumericInputString(e.target.value);
                                            if (cleaned !== e.target.value) e.currentTarget.value = cleaned;
                                            setNewChannelComm(cleaned);
                                        }}
                                        placeholder="14"
                                        aria-label="Comissão do novo canal"
                                        className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-2.5 pr-7 text-xs font-bold tabular-nums"
                                    />
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                        %
                                    </span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            value={newChannelFixed}
                                            onChange={(e) => {
                                                const cleaned = sanitizeNumericInputString(e.target.value);
                                                if (cleaned !== e.target.value) e.currentTarget.value = cleaned;
                                                setNewChannelFixed(cleaned);
                                            }}
                                            placeholder="6"
                                            aria-label="Taxa fixa do novo canal"
                                            className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-2.5 pr-8 text-xs font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                            R$
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleQuickSubmit}
                                        className="px-3 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/70 text-xs font-bold shrink-0 transition-colors"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {marketplaces.map(ch => (
                                <button
                                    type="button"
                                    key={ch.id}
                                    onClick={() => onSelectMarketplace(ch.id)}
                                    className={clsx(
                                        'px-3.5 py-2 rounded-full text-xs font-bold border transition-all',
                                        selectedMarketplaceId === ch.id
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/25 shadow-sm'
                                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'
                                    )}
                                >
                                    {ch.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Segmented Controls: Tax Incidence & Pass-Through */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => onTaxModeChange('per_piece')}
                                className={clsx(
                                    'py-2 px-2 rounded-lg text-center transition-all',
                                    taxMode === 'per_piece'
                                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                )}
                            >
                                <span className="block text-[11px] font-bold">Taxa por Peça</span>
                                <span className={clsx('block text-[9px] font-medium', taxMode === 'per_piece' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-zinc-400')}>
                                    Taxa fixa em cada unidade.
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onTaxModeChange('per_sale')}
                                className={clsx(
                                    'py-2 px-2 rounded-lg text-center transition-all',
                                    taxMode === 'per_sale'
                                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                )}
                            >
                                <span className="block text-[11px] font-bold">Taxa por Venda</span>
                                <span className={clsx('block text-[9px] font-medium', taxMode === 'per_sale' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-zinc-400')}>
                                    Taxa fixa 1x no pedido total.
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => onTaxPassThroughChange('gross_up')}
                                className={clsx(
                                    'py-2 px-2 rounded-lg text-center transition-all',
                                    taxPassThrough === 'gross_up'
                                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                )}
                            >
                                <span className="block text-[11px] font-bold">Recompor (Gross-Up)</span>
                                <span className={clsx('block text-[9px] font-medium', taxPassThrough === 'gross_up' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-zinc-400')}>
                                    Protege seu lucro líquido.
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onTaxPassThroughChange('direct')}
                                className={clsx(
                                    'py-2 px-2 rounded-lg text-center transition-all',
                                    taxPassThrough === 'direct'
                                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                )}
                            >
                                <span className="block text-[11px] font-bold">Incide Direto</span>
                                <span className={clsx('block text-[9px] font-medium', taxPassThrough === 'direct' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-zinc-400')}>
                                    Desconta a taxa do lucro.
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* 3 Tax Inputs with Tooltips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Comissão Market ({taxMode === 'per_piece' ? 'pç' : 'total'})
                                <TooltipHelp text="Comissão % do marketplace (ML, Shopee...). Por peça ou no total, conforme o modo." label="Comissão Market" />
                            </label>
                            <div className="relative">
                                <NumericInput
                                    step="0.1"
                                    min={0}
                                    value={commissionPercent}
                                    onValueChange={onCommissionPercentChange}
                                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 pl-3 pr-8 text-sm font-bold tabular-nums"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                    %
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Taxa Fixa ({taxMode === 'per_piece' ? 'pç' : 'venda'})
                                <TooltipHelp text="Taxa fixa do anúncio/venda (R$), se o canal cobrar além da %." label="Taxa Fixa" />
                            </label>
                            <div className="relative">
                                <NumericInput
                                    step="0.01"
                                    min={0}
                                    value={fixedFee}
                                    onValueChange={onFixedFeeChange}
                                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 pl-3 pr-9 text-sm font-bold tabular-nums"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                    R$
                                </span>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Imposto Venda / DAS
                                <TooltipHelp text="Imposto ou DAS estimado sobre a venda. Ajuste à sua realidade fiscal." label="Imposto Venda" />
                            </label>
                            <div className="relative">
                                <NumericInput
                                    step="0.1"
                                    min={0}
                                    value={taxPercent}
                                    onValueChange={onTaxPercentChange}
                                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 pl-3 pr-8 text-sm font-bold tabular-nums"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                    %
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-3 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <Sparkles size={15} className="shrink-0 mt-0.5 text-amber-500" />
                        <span>
                            <strong>Dica de Precificação:</strong> Não venda apenas volume de plástico. O valor real está no seu tempo, conhecimento técnico e exclusividade do design. Use as margens sugeridas para garantir o crescimento do seu negócio.
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
};
