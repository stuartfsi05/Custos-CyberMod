import { useMemo, useState } from 'react';
import { BookmarkPlus, ChevronDown, Plus, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { PrinterProfile } from '../../../types/settings';
import { formatCurrency } from '../../../utils/formatters';
import { NumericInput } from '../../ui/NumericInput';
import { TooltipHelp } from '../../ui/TooltipHelp';

interface Step3EquipmentProps {
    onFocusStep: () => void;
    printers: PrinterProfile[];
    selectedPrinterId: string;
    onSelectPrinter: (id: string) => void;
    manualPrinterName: string;
    onManualPrinterNameChange: (val: string) => void;
    printHours: number;
    onPrintHoursChange: (val: number) => void;
    printMinutes: number;
    onPrintMinutesChange: (val: number) => void;
    powerWatts: number;
    onPowerWattsChange: (val: number) => void;
    machineValue: number;
    onMachineValueChange: (val: number) => void;
    kwhRate: number;
    onKwhRateChange: (val: number) => void;
    lifespanHours: number;
    onLifespanHoursChange: (val: number) => void;
    maintenancePercent: number;
    onSavePrinterPreset: (input: {
        name: string;
        technology: 'FDM' | 'SLA';
        powerWatts: number;
        purchasePrice: number;
        lifespanHours: number;
        maintenancePercent: number;
    }) => boolean;
}

export const Step3Equipment = ({
    onFocusStep,
    printers,
    selectedPrinterId,
    onSelectPrinter,
    manualPrinterName,
    onManualPrinterNameChange,
    printHours,
    onPrintHoursChange,
    printMinutes,
    onPrintMinutesChange,
    powerWatts,
    onPowerWattsChange,
    machineValue,
    onMachineValueChange,
    kwhRate,
    onKwhRateChange,
    lifespanHours,
    onLifespanHoursChange,
    maintenancePercent,
    onSavePrinterPreset
}: Step3EquipmentProps) => {
    const [printerSearch, setPrinterSearch] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showNewPrinter, setShowNewPrinter] = useState(false);
    const [newPrinterName, setNewPrinterName] = useState('');
    const [newPrinterTech, setNewPrinterTech] = useState<'FDM' | 'SLA'>('FDM');
    const [newPrinterWatts, setNewPrinterWatts] = useState<number>(150);
    const [newPrinterPrice, setNewPrinterPrice] = useState<number>(2500);
    const [newPrinterLife, setNewPrinterLife] = useState<number>(4000);

    const handleQuickPrinterSubmit = () => {
        if (
            onSavePrinterPreset({
                name: newPrinterName,
                technology: newPrinterTech,
                powerWatts: newPrinterWatts,
                purchasePrice: newPrinterPrice,
                lifespanHours: newPrinterLife,
                maintenancePercent: 15
            })
        ) {
            setNewPrinterName('');
            setShowNewPrinter(false);
        }
    };

    const currentPrinterTech = printers.find(p => p.id === selectedPrinterId)?.technology || 'FDM';

    const filteredPrinters = useMemo(() => {
        const q = printerSearch.trim().toLowerCase();
        if (!q) return printers;
        return printers.filter(p => p.name.toLowerCase().includes(q));
    }, [printers, printerSearch]);

    const hourlyMachineCost =
        (Math.max(0, powerWatts) / 1000) * Math.max(0, kwhRate) +
        (lifespanHours > 0 ? (Math.max(0, machineValue) / lifespanHours) * (1 + Math.max(0, maintenancePercent) / 100) : 0);

    const summaryText = `${printHours}h ${printMinutes}m • ${powerWatts}W`;

    return (
        <section
            id="step-3"
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
                        3
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            Equipamento
                        </h2>
                        <p className="text-xs text-zinc-400 truncate">Máquina, tempo total do fatiador e desgaste/energia</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch min-w-0">
                    {/* Identification Sub-card */}
                    <div className="min-w-0 bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between gap-3 h-full">
                        <div className="space-y-3 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                                    Identificação da máquina
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowNewPrinter(prev => !prev)}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                                >
                                    <Plus size={14} />
                                    {showNewPrinter ? 'Fechar' : 'Pré-cadastrar máquina'}
                                </button>
                            </div>

                            {showNewPrinter && (
                                <div className="space-y-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            value={newPrinterName}
                                            onChange={(e) => setNewPrinterName(e.target.value)}
                                            placeholder="Modelo (ex: Voron 2.4)"
                                            aria-label="Nome da nova máquina"
                                            className="col-span-2 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2.5 text-xs font-medium"
                                        />
                                        <select
                                            value={newPrinterTech}
                                            onChange={(e) => setNewPrinterTech(e.target.value as 'FDM' | 'SLA')}
                                            aria-label="Tecnologia da nova máquina"
                                            className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2 text-xs font-semibold"
                                        >
                                            <option value="FDM">FDM</option>
                                            <option value="SLA">SLA</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="relative">
                                            <NumericInput
                                                min={1}
                                                emptyFallback={150}
                                                value={newPrinterWatts}
                                                onValueChange={setNewPrinterWatts}
                                                placeholder="150"
                                                aria-label="Consumo em Watts da nova máquina"
                                                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-2 pr-6 text-xs font-bold tabular-nums"
                                            />
                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                                W
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <NumericInput
                                                min={0}
                                                value={newPrinterPrice}
                                                onValueChange={setNewPrinterPrice}
                                                placeholder="2500"
                                                aria-label="Valor da nova máquina em reais"
                                                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-2 pr-7 text-xs font-bold tabular-nums"
                                            />
                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                                R$
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <NumericInput
                                                integer
                                                min={1}
                                                emptyFallback={4000}
                                                value={newPrinterLife}
                                                onValueChange={setNewPrinterLife}
                                                placeholder="4000"
                                                aria-label="Vida útil da nova máquina em horas"
                                                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-2 pr-6 text-xs font-bold tabular-nums"
                                            />
                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                                h
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleQuickPrinterSubmit}
                                        className="w-full h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/70 text-xs font-bold transition-colors"
                                    >
                                        Salvar máquina nos presets
                                    </button>
                                </div>
                            )}

                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={printerSearch}
                                    onChange={(e) => setPrinterSearch(e.target.value)}
                                    placeholder="Buscar impressora (ex: Snapmaker, Bambu)..."
                                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3 text-sm"
                                />
                            </div>
                            <select
                                value={selectedPrinterId}
                                aria-label="Selecionar impressora"
                                onChange={(e) => onSelectPrinter(e.target.value)}
                                className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm font-semibold"
                            >
                                {filteredPrinters.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.powerWatts}W • {formatCurrency(p.purchasePrice)})
                                    </option>
                                ))}
                            </select>
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Nome da Máquina (Livre)
                                        <TooltipHelp text="Digite manualmente o modelo da sua impressora caso não esteja nos presets." label="Nome da máquina" />
                                    </label>
                                    {manualPrinterName.trim().length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSavePrinterPreset({
                                                    name: manualPrinterName,
                                                    technology: currentPrinterTech,
                                                    powerWatts,
                                                    purchasePrice: machineValue,
                                                    lifespanHours,
                                                    maintenancePercent
                                                })
                                            }
                                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                            title="Salvar máquina e parâmetros atuais nos presets"
                                        >
                                            <BookmarkPlus size={12} />
                                            Salvar nos Presets
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={manualPrinterName}
                                    onChange={(e) => onManualPrinterNameChange(e.target.value)}
                                    placeholder="Ex: Snapmaker U1"
                                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-xs">
                            <span className="font-semibold text-zinc-500">Custo hora máquina:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatCurrency(hourlyMachineCost)}/h
                            </span>
                        </div>
                    </div>

                    {/* Time & Energy/Depreciation Sub-cards */}
                    <div className="flex flex-col justify-between gap-3 h-full min-w-0">
                        <div className="min-w-0 bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-2.5">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">Tempo total de impressão</p>
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="min-w-0">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                        Horas Totais
                                        <TooltipHelp text="Parte inteira das horas informadas pelo fatiador para toda a mesa." label="Horas" />
                                    </label>
                                    <div className="relative">
                                        <NumericInput
                                            integer
                                            min={0}
                                            value={printHours}
                                            onValueChange={onPrintHoursChange}
                                            placeholder="0"
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            h
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                        Minutos Totais
                                        <TooltipHelp text="Minutos adicionais mostrados no fatiador (ex.: 1h17m -> 1h e 17min)." label="Minutos" />
                                    </label>
                                    <div className="relative">
                                        <NumericInput
                                            integer
                                            min={0}
                                            max={59}
                                            value={printMinutes}
                                            onValueChange={onPrintMinutesChange}
                                            placeholder="0"
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-10 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            min
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-2.5">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">Custo operacional e energético</p>
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="min-w-0">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                        Consumo Médio
                                        <TooltipHelp text="Potência média real da impressora em Watts durante a impressão." label="Consumo W" />
                                    </label>
                                    <div className="relative">
                                        <NumericInput
                                            min={0}
                                            value={powerWatts}
                                            onValueChange={onPowerWattsChange}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            W
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                        Valor Máquina
                                        <TooltipHelp text="Valor de compra da máquina usado para calcular depreciação e payback." label="Valor Máquina" />
                                    </label>
                                    <div className="relative">
                                        <NumericInput
                                            min={0}
                                            value={machineValue}
                                            onValueChange={onMachineValueChange}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-9 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            R$
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                        Tarifa Energia
                                        <TooltipHelp text="Valor da tarifa do kWh cobrada na sua conta de energia elétrica." label="Tarifa kWh" />
                                    </label>
                                    <div className="relative">
                                        <NumericInput
                                            step="0.01"
                                            min={0}
                                            value={kwhRate}
                                            onValueChange={onKwhRateChange}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-16 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">
                                            R$/kWh
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                        Vida Útil
                                        <TooltipHelp text="Estimativa de horas úteis da impressora para diluir o valor de reposição." label="Vida útil" />
                                    </label>
                                    <div className="relative">
                                        <NumericInput
                                            integer
                                            min={1}
                                            emptyFallback={1}
                                            value={lifespanHours}
                                            onValueChange={onLifespanHoursChange}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-8 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            h
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
