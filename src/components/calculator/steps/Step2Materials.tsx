import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { AdditionalMaterialInput } from '../../../hooks/usePricingEngine';
import { FilamentSpool } from '../../../types/settings';
import { formatCurrency, parseNumber } from '../../../utils/formatters';
import { TooltipHelp } from '../../ui/TooltipHelp';

interface Step2MaterialsProps {
    onFocusStep: () => void;
    filaments: FilamentSpool[];
    selectedFilamentId: string;
    onSelectFilament: (id: string) => void;
    manualMaterialName: string;
    onManualMaterialNameChange: (val: string) => void;
    materialCostPerKg: number;
    onMaterialCostPerKgChange: (val: number) => void;
    weightG: number;
    onWeightGChange: (val: number) => void;
    qty: number;
    onQtyChange: (val: number) => void;
    additionalMaterials: AdditionalMaterialInput[];
    onAddAdditionalMaterial: () => void;
    onUpdateAdditionalMaterial: (index: number, next: AdditionalMaterialInput) => void;
    onRemoveAdditionalMaterial: (id: string) => void;
    deductStockOnSave: boolean;
    onDeductStockOnSaveChange: (checked: boolean) => void;
}

export const Step2Materials = ({
    onFocusStep,
    filaments,
    selectedFilamentId,
    onSelectFilament,
    manualMaterialName,
    onManualMaterialNameChange,
    materialCostPerKg,
    onMaterialCostPerKgChange,
    weightG,
    onWeightGChange,
    qty,
    onQtyChange,
    additionalMaterials,
    onAddAdditionalMaterial,
    onUpdateAdditionalMaterial,
    onRemoveAdditionalMaterial,
    deductStockOnSave,
    onDeductStockOnSaveChange
}: Step2MaterialsProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const summaryText = `${weightG || 0}g • ${qty} un.`;

    return (
        <section
            id="step-2"
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
                        2
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            Materiais utilizados
                        </h2>
                        <p className="text-xs text-zinc-400 truncate">Filamento/resina, peso do fatiador e quantidade do lote</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {!isCollapsed && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Estoque Ativo
                        </span>
                    )}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                                Material (Preset / Estoque)
                            </label>
                            <select
                                value={selectedFilamentId}
                                onChange={(e) => onSelectFilament(e.target.value)}
                                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            >
                                {filaments.map(spool => (
                                    <option key={spool.id} value={spool.id}>
                                        {spool.name} ({spool.material}) — {spool.isConsigned ? 'Consignado R$ 0/kg' : `${formatCurrency(spool.pricePerKg)}/kg • ${spool.remainingWeightG}g`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                                Nome Manual do Material
                            </label>
                            <input
                                type="text"
                                value={manualMaterialName}
                                onChange={(e) => onManualMaterialNameChange(e.target.value)}
                                placeholder="Ex: PLA Genérico / PETG Preto"
                                className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1 whitespace-nowrap">
                                Custo (1kg)
                                <TooltipHelp text="Preço pago pelo rolo de 1kg (1000g) ou 1L de resina. Coloque 0 se for consignado do cliente." label="Custo por kg" />
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min="0"
                                    value={materialCostPerKg}
                                    onChange={(e) => onMaterialCostPerKgChange(parseNumber(e.target.value))}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 pl-3 pr-14 text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                    R$/kg
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1 whitespace-nowrap">
                                Peso Total (Mesa)
                                <TooltipHelp text="Informe o peso total mostrado no fatiador (incluindo suportes, brim e purge) para todas as peças na mesa." label="Peso total" />
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min="0"
                                    value={weightG || ''}
                                    onChange={(e) => onWeightGChange(parseNumber(e.target.value))}
                                    placeholder="Ex: 16"
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 pl-3 pr-8 text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                    g
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 whitespace-nowrap">
                                Qtd de Peças
                                <TooltipHelp text="Quantas unidades iguais serão impressas nessa mesa/lote. O custo de material/máquina será dividido por essa quantidade." label="Quantidade" />
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => onQtyChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    className="w-full h-11 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 pl-3 pr-10 text-sm font-black text-emerald-800 dark:text-emerald-200 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600/70 dark:text-emerald-400/70 select-none">
                                    un.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Multicolor / AMS Materials */}
                    <div className="space-y-2 pt-1">
                        <button
                            type="button"
                            onClick={onAddAdditionalMaterial}
                            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Plus size={15} />
                            Adicionar Outro Material (Multicolor / AMS)
                        </button>

                        {additionalMaterials.map((mat, idx) => (
                            <div key={mat.id} className="grid grid-cols-1 sm:grid-cols-[1fr_115px_95px_40px] gap-2 items-center bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                                <select
                                    value={mat.filamentId}
                                    aria-label={`Selecionar filamento adicional ${idx + 1}`}
                                    onChange={(e) => {
                                        const spool = filaments.find(f => f.id === e.target.value);
                                        onUpdateAdditionalMaterial(idx, {
                                            ...mat,
                                            filamentId: e.target.value,
                                            costPerKg: spool ? (spool.isConsigned ? 0 : spool.pricePerKg) : mat.costPerKg
                                        });
                                    }}
                                    className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 text-xs font-semibold"
                                >
                                    {filaments.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.pricePerKg)}/kg)</option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-[1fr_1fr_40px] sm:contents gap-2 items-center">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            placeholder="0"
                                            aria-label={`Custo por kg do filamento adicional ${idx + 1}`}
                                            value={mat.costPerKg ?? ''}
                                            onChange={(e) => onUpdateAdditionalMaterial(idx, { ...mat, costPerKg: parseNumber(e.target.value) })}
                                            className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-2.5 pr-12 text-xs font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                            R$/kg
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.1"
                                            placeholder="0"
                                            aria-label={`Peso em gramas do filamento adicional ${idx + 1}`}
                                            value={mat.weightG || ''}
                                            onChange={(e) => onUpdateAdditionalMaterial(idx, { ...mat, weightG: parseNumber(e.target.value) })}
                                            className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-2.5 pr-7 text-xs font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                            g
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveAdditionalMaterial(mat.id)}
                                        aria-label={`Remover filamento adicional ${idx + 1}`}
                                        className="h-9 w-10 flex items-center justify-center text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={deductStockOnSave}
                                onChange={(e) => onDeductStockOnSaveChange(e.target.checked)}
                                className="w-4 h-4 accent-emerald-600"
                            />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                Descontar gramas da mesa do estoque automaticamente ao registrar venda
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </section>
    );
};
