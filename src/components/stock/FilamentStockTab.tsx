import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { useSettings } from '../../context/SettingsContext';
import { FilamentSpool } from '../../types/settings';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const MATERIALS: FilamentSpool['material'][] = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Resina', 'Outro'];

export const FilamentStockTab = () => {
    const { settings, updateSetting } = useSettings();

    const [showNewSpool, setShowNewSpool] = useState(false);
    const [spoolName, setSpoolName] = useState('');
    const [spoolMaterial, setSpoolMaterial] = useState<FilamentSpool['material']>('PLA');
    const [spoolBrand, setSpoolBrand] = useState('');
    const [spoolColor, setSpoolColor] = useState('#10b981');
    const [spoolPrice, setSpoolPrice] = useState('120');
    const [spoolTotalG, setSpoolTotalG] = useState('1000');
    const [spoolConsigned, setSpoolConsigned] = useState(false);

    const totalRemainingKg =
        settings.filaments.filter(f => !f.isConsigned).reduce((acc, f) => acc + f.remainingWeightG, 0) / 1000;

    const lowStockCount = settings.filaments.filter(f => !f.isConsigned && f.remainingWeightG < 200).length;

    const handleAddSpool = (e: React.FormEvent) => {
        e.preventDefault();
        if (!spoolName.trim()) {
            toast.error('Informe o nome do material.');
            return;
        }
        const totalG = Math.max(1, parseNumber(spoolTotalG) || 1000);
        const newSpool: FilamentSpool = {
            id: `fil_${Date.now()}`,
            name: spoolName.trim(),
            material: spoolMaterial,
            brand: spoolBrand.trim() || 'Genérica',
            colorHex: spoolColor,
            pricePerKg: spoolConsigned ? 0 : Math.max(0, parseNumber(spoolPrice)),
            totalWeightG: totalG,
            remainingWeightG: totalG,
            isConsigned: spoolConsigned
        };
        updateSetting('filaments', [newSpool, ...settings.filaments]);
        setSpoolName('');
        setSpoolBrand('');
        setSpoolConsigned(false);
        setShowNewSpool(false);
        toast.success('Material adicionado ao estoque!');
    };

    const handleAdjustSpoolWeight = (id: string, deltaG: number) => {
        const updated = settings.filaments.map(spool => {
            if (spool.id !== id) return spool;
            const nextWeight = Math.max(0, Math.round((spool.remainingWeightG + deltaG) * 100) / 100);
            return {
                ...spool,
                remainingWeightG: nextWeight,
                totalWeightG: Math.max(spool.totalWeightG, nextWeight)
            };
        });
        updateSetting('filaments', updated);
    };

    const handleDeleteSpool = (id: string) => {
        if (settings.filaments.length <= 1) {
            toast.error('Mantenha pelo menos 1 material cadastrado.');
            return;
        }
        updateSetting('filaments', settings.filaments.filter(s => s.id !== id));
        toast.success('Material removido.');
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-cyan-50/60 dark:bg-cyan-900/15 p-4 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Estoque Próprio</p>
                    <p className="text-xl md:text-2xl font-black text-cyan-900 dark:text-cyan-100 tabular-nums tracking-tight mt-0.5">
                        {totalRemainingKg.toFixed(2)} kg
                    </p>
                </div>
                <div
                    className={clsx(
                        'p-4 rounded-2xl border',
                        lowStockCount > 0
                            ? 'bg-amber-50/70 dark:bg-amber-900/15 border-amber-200 dark:border-amber-900/30'
                            : 'bg-emerald-50/60 dark:bg-emerald-900/15 border-emerald-100 dark:border-emerald-900/30'
                    )}
                >
                    <p
                        className={clsx(
                            'text-[11px] font-bold uppercase tracking-wider',
                            lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        )}
                    >
                        Alertas (&lt;200g)
                    </p>
                    <p
                        className={clsx(
                            'text-xl md:text-2xl font-black tabular-nums tracking-tight mt-0.5',
                            lowStockCount > 0 ? 'text-amber-900 dark:text-amber-100' : 'text-emerald-900 dark:text-emerald-100'
                        )}
                    >
                        {lowStockCount} {lowStockCount === 1 ? 'rolo' : 'rolos'}
                    </p>
                </div>
            </div>

            <Button
                type="button"
                variant={showNewSpool ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => setShowNewSpool(prev => !prev)}
            >
                <Plus size={18} className="mr-2" />
                {showNewSpool ? 'Cancelar Cadastro' : 'Cadastrar Filamento / Resina'}
            </Button>

            {showNewSpool && (
                <Card>
                    <form onSubmit={handleAddSpool} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Nome / Cor
                                </label>
                                <input
                                    type="text"
                                    value={spoolName}
                                    onChange={(e) => setSpoolName(e.target.value)}
                                    placeholder="Ex: PLA Silk Dourado"
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Marca
                                </label>
                                <input
                                    type="text"
                                    value={spoolBrand}
                                    onChange={(e) => setSpoolBrand(e.target.value)}
                                    placeholder="Ex: Voolt3D / Esun"
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={spoolMaterial}
                                    onChange={(e) => setSpoolMaterial(e.target.value as FilamentSpool['material'])}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2.5 text-sm font-semibold"
                                >
                                    {MATERIALS.map(m => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    R$/kg
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    disabled={spoolConsigned}
                                    value={spoolConsigned ? '0' : spoolPrice}
                                    onChange={(e) => setSpoolPrice(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                                    Peso (g)
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={spoolTotalG}
                                    onChange={(e) => setSpoolTotalG(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <label className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                <span>Cor:</span>
                                <input
                                    type="color"
                                    value={spoolColor}
                                    onChange={(e) => setSpoolColor(e.target.value)}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                                />
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={spoolConsigned}
                                    onChange={(e) => setSpoolConsigned(e.target.checked)}
                                    className="w-4 h-4 accent-emerald-500"
                                />
                                Material Consignado (R$ 0/kg)
                            </label>
                        </div>

                        <Button type="submit" className="w-full">
                            Salvar no Estoque
                        </Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {settings.filaments.map(spool => {
                    const pct = spool.totalWeightG > 0
                        ? Math.min(100, Math.max(0, (spool.remainingWeightG / spool.totalWeightG) * 100))
                        : 0;
                    const isLow = !spool.isConsigned && spool.remainingWeightG < 200;

                    return (
                        <Card key={spool.id} className="flex flex-col justify-between gap-3 h-full">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="w-10 h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 shrink-0 shadow-inner"
                                        style={{ backgroundColor: spool.colorHex }}
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                                {spool.name}
                                            </h3>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                {spool.material}
                                            </span>
                                            {spool.isConsigned && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                                    Consignado
                                                </span>
                                            )}
                                            {isLow && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                                    <AlertTriangle size={10} />
                                                    Baixo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {spool.brand} • {spool.isConsigned ? 'Custo zero (cliente)' : `${formatCurrency(spool.pricePerKg)}/kg`}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteSpool(spool.id)}
                                    aria-label={`Remover material ${spool.name}`}
                                    className="p-2 text-zinc-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                                    title="Remover material"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-zinc-500">Restante</span>
                                        <span className="text-zinc-900 dark:text-zinc-100 tabular-nums">
                                            {spool.remainingWeightG.toFixed(0)}g / {spool.totalWeightG.toFixed(0)}g ({pct.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={clsx(
                                                'h-full rounded-full transition-all duration-300',
                                                isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>

                                {!spool.isConsigned && (
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleAdjustSpoolWeight(spool.id, -50)}
                                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                        >
                                            -50g
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAdjustSpoolWeight(spool.id, 100)}
                                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                        >
                                            +100g
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAdjustSpoolWeight(spool.id, 1000)}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                        >
                                            +1 Rolo (1kg)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
