import { useState } from 'react';
import {
    CalculatorPresetFavorite
} from '../../types/settings';
import {
    AdvancedPricingBreakdown,
    DiscountType,
    getMarginHealthStatus
} from '../../hooks/usePricingEngine';
import { CostDonutChart, CostCategorySlice } from './CostDonutChart';
import { QuoteLineItem } from './QuoteDocumentModal';
import { Button } from '../ui/Button';
import { NumericInput } from '../ui/NumericInput';
import { TooltipHelp } from '../ui/TooltipHelp';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import {
    FileText,
    Plus,
    X,
    Trash2,
    ShoppingBag,
    Factory,
    Package,
    Star,
    MessageCircle,
    ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

const MARKUP_PRESETS = [
    { label: 'COMPETITIVO', markup: 25, realMarginHint: '~20% marg.' },
    { label: 'PADRÃO', markup: 40, realMarginHint: '~29% marg.' },
    { label: 'PREMIUM', markup: 60, realMarginHint: '~38% marg.' },
    { label: 'LUXO', markup: 80, realMarginHint: '~44% marg.' }
];

interface CalculatorStickySidebarProps {
    qty: number;
    pricing: AdvancedPricingBreakdown;
    costSlices: CostCategorySlice[];
    markupPercent: number;
    onMarkupChange: (value: number) => void;
    discountType: DiscountType;
    onToggleDiscountType: () => void;
    discountValue: number;
    onDiscountValueChange: (value: number) => void;
    onSellOrder: () => void;
    onOpenQuotePdf: () => void;
    onSendWhatsApp: () => void;
    onNavigate?: (tab: string) => void;
    quoteItems: QuoteLineItem[];
    multiQuoteTotal: number;
    onAddPieceToMultiQuote: () => void;
    onRemoveQuoteItem: (id: string) => void;
    favoriteName: string;
    onFavoriteNameChange: (name: string) => void;
    onSaveFavorite: () => void;
    favorites: CalculatorPresetFavorite[];
    onLoadFavorite: (favId: string) => void;
    onDeleteFavorite: (favId: string) => void;
}

export const CalculatorStickySidebar = ({
    qty,
    pricing,
    costSlices,
    markupPercent,
    onMarkupChange,
    discountType,
    onToggleDiscountType,
    discountValue,
    onDiscountValueChange,
    onSellOrder,
    onOpenQuotePdf,
    onSendWhatsApp,
    onNavigate,
    quoteItems,
    multiQuoteTotal,
    onAddPieceToMultiQuote,
    onRemoveQuoteItem,
    favoriteName,
    onFavoriteNameChange,
    onSaveFavorite,
    favorites,
    onLoadFavorite,
    onDeleteFavorite
}: CalculatorStickySidebarProps) => {
    const [showFavoritesManager, setShowFavoritesManager] = useState(false);
    const [showMathDetails, setShowMathDetails] = useState(false);
    const netReturnOnCostPct =
        pricing.unitProductionCost > 0
            ? (pricing.unitProfit / pricing.unitProductionCost) * 100
            : markupPercent;
    const marginHealth = getMarginHealthStatus(pricing.unitProfit, netReturnOnCostPct);
    const badgeColorMap = {
        loss: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
        tight: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
        competitive: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
        healthy: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
    } as const;

    return (
        <aside
            id="calculator-summary-panel"
            className="lg:col-span-5 min-w-0 w-full max-w-full overflow-x-clip lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto space-y-3 pr-0.5 scroll-mt-24"
        >
            {/* Sticky Top Summary: Sempre visível no topo da coluna direita */}
            <div className="lg:sticky lg:top-0 z-20 bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-lg space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        Preço de venda
                    </h2>
                    <span
                        className={clsx(
                            'px-2.5 py-0.5 rounded-full text-[11px] font-black',
                            badgeColorMap[marginHealth.level]
                        )}
                    >
                        {marginHealth.label}
                    </span>
                </div>

                {/* Price & Discount Row */}
                <div className="flex items-end justify-between gap-3 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
                    <div aria-live="polite" aria-atomic="true">
                        <p className="text-[11px] font-bold text-zinc-400">Preço de venda por peça</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
                                {formatCurrency(pricing.unitSellPrice)}
                            </span>
                            <span className="text-xs font-bold text-zinc-400">/peça</span>
                        </div>
                        <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400 mt-0.5 tabular-nums">
                            Total do lote ({qty} un.): {formatCurrency(pricing.batchSellPrice)}
                        </p>
                    </div>

                    <div className="shrink-0 space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400">
                            Desconto
                            <TooltipHelp
                                text="Simule um desconto em % ou R$ aplicado sobre o preço de venda unitário antes de enviar ao cliente."
                                label="Desconto"
                            />
                        </span>
                        <div className="flex items-center gap-1">
                            <NumericInput
                                min={0}
                                step="0.5"
                                value={discountValue}
                                onValueChange={onDiscountValueChange}
                                placeholder="0"
                                aria-label="Valor do desconto"
                                className="min-w-[72px] w-[72px] h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs font-bold text-center tabular-nums"
                            />
                            <button
                                type="button"
                                onClick={onToggleDiscountType}
                                className="h-8 px-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-[11px] font-bold shrink-0 transition-colors"
                                title="Alternar tipo de desconto (% ou R$)"
                                aria-label="Alternar tipo de desconto (% ou R$)"
                            >
                                {discountType === 'percent' ? '%' : 'R$'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 1B: KPIs, Markup Slider, Payback & Ações */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                {/* 4 Fast KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                        <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400">
                            Custo total
                            <TooltipHelp
                                text="Soma do Custo de Produção + Taxas de Marketplace + Impostos por unidade."
                                label="Custo total"
                            />
                        </span>
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {formatCurrency(pricing.unitTotalCost)}
                        </span>
                    </div>
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                        <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Lucro
                            <TooltipHelp
                                text="Lucro líquido real por peça que sobra no seu bolso após descontar todos os custos e taxas."
                                label="Lucro líquido"
                            />
                        </span>
                        <span
                            className={clsx(
                                'text-xs font-black tabular-nums',
                                pricing.unitProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-500'
                            )}
                        >
                            {formatCurrency(pricing.unitProfit)}
                        </span>
                    </div>
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                        <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Margem real
                            <TooltipHelp
                                text="Fatia percentual que o lucro representa sobre o Preço de Venda final (Lucro ÷ Preço × 100). Ex: Markup de 100% equivale a 50% de Margem Real."
                                label="Margem real"
                            />
                        </span>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                            {pricing.realMarginPercent.toFixed(1)}%
                        </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                        <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-zinc-400">
                            Markup
                            <TooltipHelp
                                text="Percentual adicionado sobre o Custo de Produção para formar o preço base antes das taxas."
                                label="Markup"
                            />
                        </span>
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {markupPercent.toFixed(0)}%
                        </span>
                    </div>
                </div>

                {/* Markup Slider + Manual Input + 4 Presets */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Markup sobre custo</span>
                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-200/70 dark:border-zinc-700">
                            <NumericInput
                                min={0}
                                step="5"
                                value={markupPercent}
                                onValueChange={(val) => onMarkupChange(Math.max(0, val))}
                                aria-label="Markup sobre custo em porcentagem"
                                className="min-w-[72px] w-[72px] bg-transparent text-center text-xs font-black text-emerald-600 dark:text-emerald-400 outline-none tabular-nums"
                            />
                            <span className="text-xs font-bold text-zinc-400">%</span>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="300"
                        step="1"
                        value={Math.min(300, markupPercent)}
                        onChange={(e) => onMarkupChange(parseNumber(e.target.value))}
                        aria-label="Controle deslizante de markup"
                        className="w-full accent-emerald-600 cursor-pointer"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {MARKUP_PRESETS.map(p => (
                            <button
                                type="button"
                                key={p.label}
                                onClick={() => onMarkupChange(p.markup)}
                                className={clsx(
                                    'p-1.5 rounded-xl border text-center transition-all',
                                    Math.round(markupPercent) === p.markup
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/30 shadow-sm'
                                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-emerald-400'
                                )}
                            >
                                <span className="block text-[9px] font-black tracking-tight">{p.label}</span>
                                <span className="block text-[11px] font-bold">{p.markup}%</span>
                                <span
                                    className={clsx(
                                        'block text-[9px] font-semibold',
                                        Math.round(markupPercent) === p.markup ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                                    )}
                                >
                                    {p.realMarginHint}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payback Indicator */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-900/40 text-xs">
                    <span className="flex items-center gap-1 font-bold text-cyan-700 dark:text-cyan-300">
                        Payback da máquina
                        <TooltipHelp
                            text="Quantas peças (ou lotes iguais a este) você precisa vender para que o lucro acumulado pague 100% do valor da impressora."
                            label="Payback da máquina"
                        />
                    </span>
                    <span className="font-black text-cyan-900 dark:text-cyan-100 tabular-nums">
                        {pricing.paybackPieces !== null
                            ? `${pricing.paybackPieces} pç • ${pricing.paybackBatches} lotes`
                            : 'Defina lucro > R$ 0'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <Button
                        type="button"
                        onClick={onSellOrder}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-700 h-11 text-sm"
                    >
                        <ShoppingBag size={17} className="mr-2" />
                        Vender / Registrar Pedido
                    </Button>

                    <div className="grid grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={onOpenQuotePdf}
                            className="py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex flex-col items-center gap-0.5"
                        >
                            <FileText size={14} className="text-cyan-600 dark:text-cyan-400" />
                            PDF
                        </button>
                        <button
                            type="button"
                            onClick={onSendWhatsApp}
                            className="py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex flex-col items-center gap-0.5"
                        >
                            <MessageCircle size={14} className="text-emerald-500" />
                            WhatsApp
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('inventory')}
                            className="py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex flex-col items-center gap-0.5"
                        >
                            <Factory size={14} className="text-zinc-600 dark:text-zinc-300" />
                            Produção
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('stock')}
                            className="py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex flex-col items-center gap-0.5"
                        >
                            <Package size={14} className="text-amber-500" />
                            Estoque
                        </button>
                    </div>
                </div>
            </div>

            {/* Card 2: Composição do Custo (8-Category Donut Chart) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        Composição do custo (por peça)
                    </h2>
                    <span className="text-[11px] font-bold text-zinc-400">
                        Produção: {formatCurrency(pricing.unitProductionCost)}
                    </span>
                </div>
                <CostDonutChart totalCost={pricing.unitTotalCost} categories={costSlices} />

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <button
                        type="button"
                        onClick={() => setShowMathDetails(prev => !prev)}
                        aria-expanded={showMathDetails}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
                    >
                        <span>Como chegamos neste valor? (Ver fórmulas)</span>
                        <ChevronDown size={14} className={clsx('transition-transform', showMathDetails && 'rotate-180')} />
                    </button>

                    {showMathDetails && (
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                            <div>
                                <p className="font-bold text-zinc-800 dark:text-zinc-100">
                                    1. Custo de Produção Base: {formatCurrency(pricing.unitProductionCost)}
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                                    Material ({formatCurrency(pricing.unitMaterial)}) + Aux. ({formatCurrency(pricing.unitAuxiliary)}) + Energia ({formatCurrency(pricing.unitEnergy)}) + Deprec. ({formatCurrency(pricing.unitDepreciation)}) + Mão de Obra ({formatCurrency(pricing.unitLabor)}) + Extras/Falha ({formatCurrency(pricing.unitExtrasAndFail)})
                                </p>
                            </div>
                            <div>
                                <p className="font-bold text-zinc-800 dark:text-zinc-100">
                                    2. Preço Base (Markup {markupPercent.toFixed(0)}%)
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                                    {formatCurrency(pricing.unitProductionCost)} × (1 + {(markupPercent / 100).toFixed(2)}) ={' '}
                                    {formatCurrency(pricing.unitProductionCost * (1 + markupPercent / 100))}
                                </p>
                                {discountValue > 0 && (
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 tabular-nums">
                                        Desconto aplicado: -{discountType === 'percent' ? `${discountValue}%` : formatCurrency(discountValue)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-zinc-800 dark:text-zinc-100">
                                    3. Taxas, Impostos e Resultado Final
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                                    Comissão ({formatCurrency(pricing.unitPlatformFee)}) + Imposto ({formatCurrency(pricing.unitTaxAmount)}) → Preço Final: <strong className="text-zinc-900 dark:text-white">{formatCurrency(pricing.unitSellPrice)}</strong> • Lucro: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(pricing.unitProfit)} ({pricing.realMarginPercent.toFixed(1)}%)</strong>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Card 3: Orçamento Multi-Peças & Favoritos */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                            Orçamento & Favoritos
                        </h2>
                        <TooltipHelp
                            text="Some várias peças diferentes na mesma proposta PDF/WhatsApp ou salve configurações recorrentes para reutilizar em 1 clique."
                            label="Orçamento e Favoritos"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={onAddPieceToMultiQuote}
                        className="px-2.5 py-1.5 rounded-xl border border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={14} />
                        Adicionar ao orçamento
                    </button>
                </div>

                {quoteItems.length > 0 && (
                    <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
                        {quoteItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-bold truncate text-zinc-800 dark:text-zinc-100">
                                    {item.qty}x {item.partName}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveQuoteItem(item.id)}
                                        aria-label={`Remover ${item.partName} do orçamento`}
                                        className="text-zinc-400 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-black">
                            <span>Total com {quoteItems.length} itens</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(multiQuoteTotal)}</span>
                        </div>
                    </div>
                )}

                {/* Favorites quick save / load / delete */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={favoriteName}
                            onChange={(e) => onFavoriteNameChange(e.target.value)}
                            placeholder="Nome do favorito para salvar..."
                            className="flex-1 min-w-0 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-xs"
                        />
                        <button
                            type="button"
                            onClick={onSaveFavorite}
                            className="px-3 h-9 rounded-xl bg-zinc-100 hover:bg-amber-50 dark:bg-zinc-800 dark:hover:bg-amber-950/40 text-zinc-700 hover:text-amber-700 dark:text-zinc-200 dark:hover:text-amber-300 border border-zinc-200/80 dark:border-zinc-700 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                        >
                            <Star size={13} className="text-amber-500" />
                            Salvar
                        </button>
                    </div>

                    {favorites.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <select
                                    defaultValue=""
                                    aria-label="Carregar favorito salvo"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            onLoadFavorite(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    className="flex-1 min-w-0 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-xs font-semibold"
                                >
                                    <option value="">Carregar favorito salvo ({favorites.length})...</option>
                                    {favorites.map(fav => (
                                        <option key={fav.id} value={fav.id}>
                                            {fav.name} ({fav.weightG}g • Markup {fav.markupPercent}%)
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowFavoritesManager(prev => !prev)}
                                    aria-label="Gerenciar favoritos salvos"
                                    className={clsx(
                                        'h-9 px-2.5 rounded-xl border text-[11px] font-bold shrink-0 transition-colors',
                                        showFavoritesManager
                                            ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    )}
                                >
                                    {showFavoritesManager ? 'Ocultar' : 'Gerenciar'}
                                </button>
                            </div>

                            {showFavoritesManager && (
                                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 max-h-40 overflow-y-auto">
                                    {favorites.map(fav => (
                                        <div
                                            key={fav.id}
                                            className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => onLoadFavorite(fav.id)}
                                                className="text-left min-w-0 flex-1 font-semibold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 truncate"
                                                title="Carregar este favorito"
                                            >
                                                {fav.name} • {fav.weightG}g
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteFavorite(fav.id)}
                                                aria-label={`Excluir favorito ${fav.name}`}
                                                className="p-1 text-zinc-400 hover:text-red-500 rounded-lg shrink-0 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
