import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Search, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { CostAllocationMode, SelectedAuxiliaryItem } from '../../../hooks/usePricingEngine';
import { AuxiliaryCatalogItem } from '../../../types/settings';
import { formatCurrency, parseNumber } from '../../../utils/formatters';
import { TooltipHelp } from '../../ui/TooltipHelp';

interface Step4OperationalCostsProps {
    onFocusStep: () => void;
    qty: number;
    costMode: CostAllocationMode;
    onCostModeChange: (mode: CostAllocationMode) => void;
    laborRatePerHour: number;
    onLaborRateChange: (val: number) => void;
    setupMinutes: number;
    onSetupMinutesChange: (val: number) => void;
    postMinutes: number;
    onPostMinutesChange: (val: number) => void;
    packagingCost: number;
    onPackagingCostChange: (val: number) => void;
    hardwareCost: number;
    onHardwareCostChange: (val: number) => void;
    failPercent: number;
    onFailPercentChange: (val: number) => void;
    auxiliaryCatalog: AuxiliaryCatalogItem[];
    selectedAuxItems: SelectedAuxiliaryItem[];
    onAddCatalogAuxItem: (item: AuxiliaryCatalogItem) => void;
    onCreateInlineAux: (name: string, price: number) => boolean;
    onUpdateAuxItemQty: (id: string, qty: number) => void;
    onRemoveAuxItem: (id: string) => void;
}

export const Step4OperationalCosts = ({
    onFocusStep,
    qty,
    costMode,
    onCostModeChange,
    laborRatePerHour,
    onLaborRateChange,
    setupMinutes,
    onSetupMinutesChange,
    postMinutes,
    onPostMinutesChange,
    packagingCost,
    onPackagingCostChange,
    hardwareCost,
    onHardwareCostChange,
    failPercent,
    onFailPercentChange,
    auxiliaryCatalog,
    selectedAuxItems,
    onAddCatalogAuxItem,
    onCreateInlineAux,
    onUpdateAuxItemQty,
    onRemoveAuxItem
}: Step4OperationalCostsProps) => {
    const [auxSearch, setAuxSearch] = useState('');
    const [inlineAuxName, setInlineAuxName] = useState('');
    const [inlineAuxPrice, setInlineAuxPrice] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const modeSuffix = costMode === 'per_piece' ? 'POR PEÇA' : 'POR LOTE';
    const summaryText = `Setup ${setupMinutes}m • Pós ${postMinutes}m • Falha ${failPercent}%`;

    const filteredAuxCatalog = useMemo(() => {
        const q = auxSearch.trim().toLowerCase();
        if (!q) return auxiliaryCatalog;
        return auxiliaryCatalog.filter(
            item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
        );
    }, [auxiliaryCatalog, auxSearch]);

    const totalAuxCostRaw = useMemo(
        () => selectedAuxItems.reduce((sum, item) => sum + item.price * item.qty, 0),
        [selectedAuxItems]
    );

    const handleInlineSubmit = () => {
        const nameToUse = inlineAuxName.trim() || auxSearch.trim();
        const priceVal = parseNumber(inlineAuxPrice);
        if (onCreateInlineAux(nameToUse, priceVal)) {
            setInlineAuxName('');
            setInlineAuxPrice('');
            setAuxSearch('');
        }
    };

    return (
        <section
            id="step-4"
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
                        4
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            Custos Operacionais
                        </h2>
                        <p className="text-xs text-zinc-400 truncate">Mão de obra, embalagem, hardware, risco e materiais auxiliares</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className={clsx(
                            'items-center px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 tabular-nums',
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
                    {/* Segmented Control: CUSTOS POR PEÇA vs CUSTOS POR LOTE */}
                    <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => onCostModeChange('per_piece')}
                            className={clsx(
                                'p-2.5 rounded-xl text-left transition-all',
                                costMode === 'per_piece'
                                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            )}
                        >
                            <span className="block text-xs font-black">CUSTOS POR PEÇA</span>
                            <span className={clsx('block text-[10px]', costMode === 'per_piece' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-zinc-400')}>
                                Calcula integralmente para cada item.
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onCostModeChange('per_batch')}
                            className={clsx(
                                'p-2.5 rounded-xl text-left transition-all',
                                costMode === 'per_batch'
                                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            )}
                        >
                            <span className="block text-xs font-black">CUSTOS POR LOTE</span>
                            <span className={clsx('block text-[10px]', costMode === 'per_batch' ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-zinc-400')}>
                                Dilui entre as {qty} peças da mesa.
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        {/* Labor */}
                        <div className="bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between gap-3 h-full">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">Valor da mão de obra</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                    {modeSuffix}
                                </span>
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 whitespace-nowrap">
                                    Sua Hora de Trabalho
                                    <TooltipHelp text="Quanto vale 1 hora do seu tempo (setup, acabamento, atendimento). Não deixe zero." label="Hora de trabalho" />
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        min="0"
                                        value={laborRatePerHour}
                                        onChange={(e) => onLaborRateChange(parseNumber(e.target.value))}
                                        className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-12 text-sm font-bold tabular-nums"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                        R$/h
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 whitespace-nowrap">
                                        Setup
                                        <TooltipHelp text="Tempo de preparação do arquivo, fatiamento, troca de rolo e início." label="Setup" />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min="0"
                                            value={setupMinutes}
                                            onChange={(e) => onSetupMinutesChange(parseNumber(e.target.value))}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-10 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            min
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 whitespace-nowrap">
                                        Pós-proc.
                                        <TooltipHelp text="Tempo manual removendo suportes, lixando, colando e embalando." label="Pós-processamento" />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min="0"
                                            value={postMinutes}
                                            onChange={(e) => onPostMinutesChange(parseNumber(e.target.value))}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-10 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            min
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Costs */}
                        <div className="bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between gap-3 h-full">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">Custos extras</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                    {modeSuffix}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 whitespace-nowrap">
                                        Embalagem
                                        <TooltipHelp text="Caixa, plástico, etiqueta etc. por peça ou por lote (conforme o modo escolhido)." label="Embalagem" />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            value={packagingCost}
                                            onChange={(e) => onPackagingCostChange(parseNumber(e.target.value))}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-9 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            R$
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 whitespace-nowrap">
                                        Hardware
                                        <TooltipHelp text="Parafusos, ímãs, inserts e outros itens que não são filamento." label="Hardware" />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            value={hardwareCost}
                                            onChange={(e) => onHardwareCostChange(parseNumber(e.target.value))}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-9 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            R$
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 whitespace-nowrap">
                                    Margem de Falha / Risco (por peça)
                                    <TooltipHelp text="Percentual adicionado sobre o custo de produção para cobrir eventuais falhas de impressão." label="Falha" />
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.5"
                                        min="0"
                                        value={failPercent}
                                        onChange={(e) => onFailPercentChange(parseNumber(e.target.value))}
                                        className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm font-bold tabular-nums"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Materiais Auxiliares */}
                    <div className="bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                                    Materiais Auxiliares
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Adicione argolas, embalagens, parafusos, cola ou crie na hora sem sair desta tela
                                </p>
                            </div>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                                Subtotal {formatCurrency(totalAuxCostRaw)}
                            </span>
                        </div>

                        {/* Search + Quick Chips from local catalog */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={auxSearch}
                                onChange={(e) => setAuxSearch(e.target.value)}
                                placeholder="Buscar por nome ou categoria (ex: cola, argola, ímã)..."
                                className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3 text-xs font-medium"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {filteredAuxCatalog.map(item => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => onAddCatalogAuxItem(item)}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus size={13} className="text-emerald-600 dark:text-emerald-400" />
                                    {item.name} ({formatCurrency(item.price)})
                                </button>
                            ))}
                        </div>

                        {/* Inline Free Add */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_115px_auto] gap-2 pt-1">
                            <input
                                type="text"
                                value={inlineAuxName}
                                onChange={(e) => setInlineAuxName(e.target.value)}
                                placeholder={auxSearch ? `Novo item: "${auxSearch}"` : 'Adicionar item avulso (ex: Cola)'}
                                className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs font-medium"
                            />
                            <div className="grid grid-cols-[1fr_auto] sm:contents gap-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        min="0"
                                        value={inlineAuxPrice}
                                        onChange={(e) => setInlineAuxPrice(e.target.value)}
                                        placeholder="1,00"
                                        className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-9 text-xs font-bold tabular-nums"
                                    />
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                        R$
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleInlineSubmit}
                                    className="h-10 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/70 text-xs font-bold flex items-center justify-center gap-1 shrink-0 transition-colors"
                                >
                                    <Plus size={13} />
                                    Incluir
                                </button>
                            </div>
                        </div>

                        {/* Selected Auxiliary Items */}
                        {selectedAuxItems.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
                                {selectedAuxItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 text-xs">
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.name}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => onUpdateAuxItemQty(item.id, Math.max(1, parseInt(e.target.value, 10) || 1))}
                                                className="w-12 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-center font-bold tabular-nums"
                                            />
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums w-16 text-right">
                                                {formatCurrency(item.price * item.qty)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveAuxItem(item.id)}
                                                aria-label={`Remover material auxiliar ${item.name}`}
                                                className="text-zinc-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                            O custo dos materiais auxiliares entra apenas pela quantidade usada. A compra de estoque no Financeiro não é somada novamente.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};
