import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BottomSheet } from '../ui/BottomSheet';
import { useInventory, InventoryItem } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { usePricingEngine } from '../../hooks/usePricingEngine';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';
import { formatCurrency, parseNumber } from '../../utils/formatters';

// Replicating schema from Calculator
const editSchema = z.object({
    partName: z.string().min(1, 'Nome obrigatório'),
    weightG: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0)),
    printTime: z.string(),
    workTime: z.string(),
    shippingCost: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0))
});

// Output type (after transform: numbers)
type EditFormOutput = z.infer<typeof editSchema>;
// Input type (before transform: strings or numbers)
type EditFormInput = z.input<typeof editSchema>;

interface EditItemDialogProps {
    item: InventoryItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditItemDialog = ({ item, open, onOpenChange }: EditItemDialogProps) => {
    const { updateInventoryItem } = useInventory();
    const { settings } = useSettings();
    const [selectedProfileId, setSelectedProfileId] = useState('cost');
    const [activeExtras, setActiveExtras] = useState<string[]>([]);

    const { register, watch, handleSubmit, setValue } = useForm<EditFormInput, undefined, EditFormOutput>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            partName: '',
            weightG: 0,
            printTime: '',
            workTime: '',
            shippingCost: 0
        }
    });

    // Load item data when opening
    useEffect(() => {
        if (item && open) {
            setValue('partName', item.partName);
            setValue('weightG', item.weightG);
            setValue('printTime', String(item.printTime));
            setValue('workTime', String(item.workTime));
            // We assume item.costs.shipping is available or we default to 0. 
            // NOTE: InventoryItem definition currently has shipping in 'costs.shipping'.
            setValue('shippingCost', item.costs.shipping || 0);

            setSelectedProfileId(item.selectedTier);
            setActiveExtras(item.activeExtras || []);
        }
    }, [item, open, setValue]);

    const inputs = watch();

    // Recalculate Logic
    const { tiers, costs } = usePricingEngine({
        weightG: inputs.weightG || 0,
        printTime: inputs.printTime || 0,
        workTime: inputs.workTime || 0,
        shippingCost: inputs.shippingCost || 0,
        activeExtras
    });

    const selectedTier = tiers.find(t => t.id === selectedProfileId) || tiers[0];

    const onSave = (data: EditFormOutput) => {
        if (!item || !selectedTier) return;

        updateInventoryItem(item.id, {
            partName: data.partName,
            weightG: data.weightG, // Already number
            printTime: data.printTime,
            workTime: data.workTime,
            costs: costs,
            selectedTier: selectedProfileId,
            tierRetail: selectedTier.value,
            activeExtras
        });

        onOpenChange(false);
    };

    if (!item) return null;

    return (
        <BottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Editar Projeto"
            description="Modifique os parâmetros para recalcular o preço."
            className="h-[90%]"
        >
            <div className="space-y-6 pb-8 overflow-y-auto max-h-[70vh] px-1">
                <form id="edit-form" onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <Input label="Nome do Projeto" {...register('partName')} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Peso (g)" type="number" {...register('weightG')} />
                        <Input label="Tempo Impressão (h:m)" {...register('printTime')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Tempo Pós (h:m)" {...register('workTime')} />
                        <Input label="Frete (R$)" type="number" {...register('shippingCost')} />
                    </div>
                </form>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-zinc-500">Perfil de Venda</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {settings.tiers.map(tier => (
                            <button
                                key={tier.id}
                                onClick={() => setSelectedProfileId(tier.id)}
                                className={clsx(
                                    "px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all",
                                    selectedProfileId === tier.id
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                                )}
                            >
                                {tier.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-zinc-500">Custos Variáveis</p>
                    <div className="flex flex-wrap gap-2">
                        {settings.extras?.map(extra => {
                            const isActive = activeExtras.includes(extra.id);
                            return (
                                <button
                                    key={extra.id}
                                    onClick={() => setActiveExtras(prev => isActive ? prev.filter(id => id !== extra.id) : [...prev, extra.id])}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                                        isActive
                                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                            : "text-zinc-400 border-zinc-200 dark:border-zinc-800"
                                    )}
                                >
                                    {extra.name} (+{formatCurrency(extra.price)})
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-500">Novo Preço Final</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(selectedTier.value)}
                    </span>
                </div>

                <Button onClick={handleSubmit(onSave)} className="w-full">
                    Salvar Alterações
                </Button>
            </div>
        </BottomSheet>
    );
};
