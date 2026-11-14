import { useState } from 'react';
import { Cpu, Plus, Trash2, CheckCircle2, Wrench, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useSettings } from '../../context/SettingsContext';
import { useInventory } from '../../context/InventoryContext';
import { PrinterProfile } from '../../types/settings';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const PrinterFarmTab = () => {
    const { settings, updateSetting } = useSettings();
    const { inventory } = useInventory();

    const [showNewPrinter, setShowNewPrinter] = useState(false);
    const [printerName, setPrinterName] = useState('');
    const [printerTech, setPrinterTech] = useState<'FDM' | 'SLA'>('FDM');
    const [printerWatts, setPrinterWatts] = useState('150');
    const [printerPrice, setPrinterPrice] = useState('2500');
    const [printerLife, setPrinterLife] = useState('3500');
    const [printerMaint, setPrinterMaint] = useState('15');

    const handleAddPrinter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!printerName.trim()) {
            toast.error('Informe o nome da impressora.');
            return;
        }
        const newPrinter: PrinterProfile = {
            id: `printer_${Date.now()}`,
            name: printerName.trim(),
            technology: printerTech,
            powerWatts: Math.max(1, parseNumber(printerWatts) || 120),
            purchasePrice: Math.max(0, parseNumber(printerPrice) || 1500),
            lifespanHours: Math.max(100, parseNumber(printerLife) || 3000),
            maintenancePercent: Math.max(0, parseNumber(printerMaint)),
            status: 'idle'
        };
        updateSetting('printers', [...settings.printers, newPrinter]);
        setPrinterName('');
        setShowNewPrinter(false);
        toast.success('Impressora adicionada à Farm!');
    };

    const handlePrinterStatus = (id: string, status: PrinterProfile['status']) => {
        updateSetting(
            'printers',
            settings.printers.map(p => (p.id === id ? { ...p, status } : p))
        );
    };

    const handleDeletePrinter = (id: string) => {
        if (settings.printers.length <= 1) {
            toast.error('Mantenha pelo menos 1 impressora na Farm.');
            return;
        }
        const nextPrinters = settings.printers.filter(p => p.id !== id);
        updateSetting('printers', nextPrinters);
        if (settings.defaultPrinterId === id && nextPrinters[0]) {
            updateSetting('defaultPrinterId', nextPrinters[0].id);
        }
        toast.success('Impressora removida.');
    };

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant={showNewPrinter ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => setShowNewPrinter(prev => !prev)}
            >
                <Plus size={18} className="mr-2" />
                {showNewPrinter ? 'Cancelar Cadastro' : 'Adicionar Impressora na Farm'}
            </Button>

            {showNewPrinter && (
                <Card>
                    <form onSubmit={handleAddPrinter} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Modelo da Impressora
                                </label>
                                <input
                                    type="text"
                                    value={printerName}
                                    onChange={(e) => setPrinterName(e.target.value)}
                                    placeholder="Ex: Bambu Lab P1S"
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Tecnologia
                                </label>
                                <select
                                    value={printerTech}
                                    onChange={(e) => setPrinterTech(e.target.value as 'FDM' | 'SLA')}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-semibold"
                                >
                                    <option value="FDM">FDM (Filamento)</option>
                                    <option value="SLA">SLA (Resina)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Potência (W)
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={printerWatts}
                                    onChange={(e) => setPrinterWatts(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Valor (R$)
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={printerPrice}
                                    onChange={(e) => setPrinterPrice(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Vida Útil (h)
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={printerLife}
                                    onChange={(e) => setPrinterLife(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Manut. (%)
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={printerMaint}
                                    onChange={(e) => setPrinterMaint(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            Adicionar à Farm
                        </Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {settings.printers.map(printer => {
                    const energyH = (printer.powerWatts / 1000) * settings.kwhRate;
                    const depH = printer.lifespanHours > 0 ? printer.purchasePrice / printer.lifespanHours : 0;
                    const maintH = depH * (printer.maintenancePercent / 100);
                    const totalH = energyH + depH + maintH;
                    const queuedCount = inventory.filter(
                        item => item.printerId === printer.id && (item.status === 'approved' || item.status === 'printing')
                    ).length;
                    const isDefault = settings.defaultPrinterId === printer.id;

                    return (
                        <Card key={printer.id} className="flex flex-col justify-between gap-3 h-full">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100">
                                                {printer.name}
                                            </h3>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                                                {printer.technology}
                                            </span>
                                            {isDefault && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                                    Padrão
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {printer.powerWatts}W • Aquisição {formatCurrency(printer.purchasePrice)} • {printer.lifespanHours}h úteis
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {!isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => updateSetting('defaultPrinterId', printer.id)}
                                                title="Definir como padrão"
                                                aria-label={`Definir ${printer.name} como impressora padrão`}
                                                className="p-2 text-zinc-300 hover:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                            >
                                                <Star size={16} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePrinter(printer.id)}
                                            title="Remover impressora"
                                            aria-label={`Remover impressora ${printer.name}`}
                                            className="p-2 text-zinc-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl text-[11px]">
                                    <div>
                                        <span className="text-zinc-400 block text-[10px]">Energia/h</span>
                                        <strong className="tabular-nums">{formatCurrency(energyH)}</strong>
                                    </div>
                                    <div>
                                        <span className="text-zinc-400 block text-[10px]">Deprec./h</span>
                                        <strong className="tabular-nums">{formatCurrency(depH)}</strong>
                                    </div>
                                    <div>
                                        <span className="text-zinc-400 block text-[10px]">Manut./h</span>
                                        <strong className="tabular-nums">{formatCurrency(maintH)}</strong>
                                    </div>
                                    <div className="text-cyan-600 dark:text-cyan-400">
                                        <span className="block text-[10px] font-bold">Total/h</span>
                                        <strong className="tabular-nums">{formatCurrency(totalH)}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {[
                                        { id: 'idle' as const, label: 'Livre', icon: CheckCircle2 },
                                        { id: 'printing' as const, label: 'Imprimindo', icon: Cpu },
                                        { id: 'maintenance' as const, label: 'Manutenção', icon: Wrench }
                                    ].map(st => {
                                        const Icon = st.icon;
                                        const active = printer.status === st.id;
                                        return (
                                            <button
                                                type="button"
                                                key={st.id}
                                                onClick={() => handlePrinterStatus(printer.id, st.id)}
                                                className={clsx(
                                                    'px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all',
                                                    active
                                                        ? st.id === 'maintenance'
                                                            ? 'bg-red-500 text-white border-red-500'
                                                            : st.id === 'printing'
                                                                ? 'bg-cyan-600 text-white border-cyan-600'
                                                                : 'bg-emerald-500 text-white border-emerald-500'
                                                        : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                                                )}
                                            >
                                                <Icon size={11} />
                                                {st.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-[11px] font-bold text-zinc-400">
                                    {queuedCount} {queuedCount === 1 ? 'pedido na fila' : 'pedidos na fila'}
                                </span>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
