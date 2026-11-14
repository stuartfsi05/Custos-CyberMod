import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BottomSheet } from '../ui/BottomSheet';
import {
    useInventory,
    InventoryItem,
    InventoryItemStatus,
    PaymentStatus
} from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { calculate3DPricing, usePricingEngine } from '../../hooks/usePricingEngine';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { CustomerEditForm } from './CustomerEditForm';
import { toast } from 'sonner';

const editSchema = z.object({
    partName: z.string().min(1, 'Nome obrigatório'),
    weightG: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0)),
    printTime: z.string(),
    workTime: z.string(),
    shippingCost: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0)),
    customerName: z.string().optional(),
    customerDoc: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    addressCep: z.string().optional(),
    addressStreet: z.string().optional(),
    addressNumber: z.string().optional(),
    addressComplement: z.string().optional(),
    addressNeighborhood: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),
    notes: z.string().optional()
});

type EditFormOutput = z.infer<typeof editSchema>;
type EditFormInput = z.input<typeof editSchema>;

interface EditItemDialogProps {
    item: InventoryItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PIPELINE_OPTIONS: Array<{ value: InventoryItemStatus; label: string }> = [
    { value: 'pending', label: 'Orçamento' },
    { value: 'approved', label: 'Na Fila' },
    { value: 'printing', label: 'Imprimindo' },
    { value: 'completed', label: 'Pronto' },
    { value: 'delivered', label: 'Entregue' }
];

const PAYMENT_OPTIONS: Array<{ value: PaymentStatus; label: string }> = [
    { value: 'unpaid', label: 'Pendente' },
    { value: 'half', label: 'Sinal 50%' },
    { value: 'paid', label: 'Pago' }
];

function resolveInitialCustomMarkup(item: InventoryItem): number {
    if (typeof item.markupPercent === 'number') {
        return item.markupPercent;
    }
    if (item.costs.base > 0) {
        const itemQty = Math.max(1, item.qty || 1);
        const inferred = Math.round(((item.tierRetail / itemQty - item.costs.base) / item.costs.base) * 100);
        return Math.max(0, inferred);
    }
    return 80;
}

export const EditItemDialog = ({ item, open, onOpenChange }: EditItemDialogProps) => {
    if (!item) return null;

    return (
        <BottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Editar Pedido"
            description="Atualize métricas, etapas de produção, pagamento e dados do cliente."
            className="h-[92%]"
        >
            {open && (
                <EditItemDialogBody
                    key={item.id}
                    item={item}
                    onOpenChange={onOpenChange}
                />
            )}
        </BottomSheet>
    );
};

interface EditItemDialogBodyProps {
    item: InventoryItem;
    onOpenChange: (open: boolean) => void;
}

const EditItemDialogBody = ({ item, onOpenChange }: EditItemDialogBodyProps) => {
    const { updateInventoryItem } = useInventory();
    const { settings } = useSettings();
    const [selectedProfileId, setSelectedProfileId] = useState(item.selectedTier);
    const [customMarkup, setCustomMarkup] = useState<number>(() => resolveInitialCustomMarkup(item));
    const [activeExtras, setActiveExtras] = useState<string[]>(() => item.activeExtras || []);
    const [qty, setQty] = useState<number>(item.qty || 1);
    const [pipelineStatus, setPipelineStatus] = useState<InventoryItemStatus>(item.status);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(item.paymentStatus || 'unpaid');

    const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<EditFormInput, unknown, EditFormOutput>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            partName: item.partName,
            weightG: item.weightG,
            printTime: String(item.printTime),
            workTime: String(item.workTime),
            shippingCost: item.costs.shipping || 0,
            customerName: item.customerName || '',
            customerDoc: item.customerDoc || '',
            customerPhone: item.customerPhone || '',
            customerEmail: item.customerEmail || '',
            addressCep: item.addressCep || '',
            addressStreet: item.addressStreet || '',
            addressNumber: item.addressNumber || '',
            addressComplement: item.addressComplement || '',
            addressNeighborhood: item.addressNeighborhood || '',
            addressCity: item.addressCity || '',
            addressState: item.addressState || '',
            notes: item.notes || ''
        }
    });

    const inputs = useWatch({ control });

    const { tiers, costs, inputDebug } = usePricingEngine({
        weightG: inputs.weightG || 0,
        printTime: inputs.printTime || 0,
        workTime: inputs.workTime || 0,
        shippingCost: inputs.shippingCost || 0,
        activeExtras,
        printerId: item?.printerId,
        filamentId: item?.filamentId,
        marketplaceId: item?.marketplaceId,
        packagingCost: item?.packagingCost ?? item?.costs.packaging ?? 0,
        qty
    });

    const safeQty = Math.max(1, qty || 1);
    const additionalBatchWeight = (item?.additionalMaterials || []).reduce(
        (sum, m) => sum + Math.max(0, m.weightG || 0),
        0
    );
    const mainBatchWeightG = Math.max(0, parseNumber(String(inputs.weightG || 0)) * safeQty - additionalBatchWeight);

    const workTimeChanged = item ? String(inputs.workTime || '') !== String(item.workTime || '') : false;
    const effectiveSetupMinutes = workTimeChanged
        ? inputDebug.workTimeHours * 60
        : (item?.setupMinutes ?? inputDebug.workTimeHours * 60);
    const effectivePostMinutes = workTimeChanged ? 0 : (item?.postMinutes ?? 0);

    const isCustomMarkup = selectedProfileId === 'custom_markup';
    const customPricing = isCustomMarkup
        ? calculate3DPricing({
            qty: safeQty,
            weightG: mainBatchWeightG,
            materialCostPerKg:
                item?.materialCostPerKg ??
                settings.filaments.find(f => f.id === item?.filamentId)?.pricePerKg ??
                settings.materialCost,
            additionalMaterials: item?.additionalMaterials?.map(m => ({
                weightG: m.weightG,
                costPerKg: m.costPerKg ?? settings.materialCost
            })),
            printTimeHours: inputDebug.printTimeHours,
            powerWatts: item?.powerWatts ?? inputDebug.printer?.powerWatts ?? 0,
            kwhRate: item?.kwhRate ?? settings.kwhRate,
            machineValue: item?.machineValue ?? inputDebug.printer?.purchasePrice ?? 0,
            lifespanHours: item?.lifespanHours ?? inputDebug.printer?.lifespanHours ?? 1,
            maintenancePercent: item?.maintenancePercent ?? inputDebug.printer?.maintenancePercent ?? 0,
            laborRatePerHour: item?.laborRatePerHour ?? settings.laborCost,
            setupMinutes: effectiveSetupMinutes,
            postMinutes: effectivePostMinutes,
            packagingCost: item?.packagingCost ?? item?.costs.packaging ?? 0,
            hardwareCost: item?.hardwareCost ?? 0,
            auxiliaryItems: item?.auxiliaryItems,
            extrasCost: costs.extras,
            failPercent: item?.failPercent ?? Math.max(0, (settings.failMargin - 1) * 100),
            costMode: item?.costMode ?? 'per_piece',
            markupPercent: Math.max(0, customMarkup),
            discountType: item?.discountType,
            discountValue: item?.discountValue,
            commissionPercent: item?.commissionPercent ?? inputDebug.marketplace.commissionPercent,
            fixedFee: item?.fixedFee ?? inputDebug.marketplace.fixedFee,
            taxPercent: item?.taxPercent ?? settings.taxPercent,
            taxMode: item?.taxMode ?? 'per_piece',
            taxPassThrough: item?.taxPassThrough ?? 'gross_up',
            shippingCost: parseNumber(String(inputs.shippingCost || 0))
        })
        : null;

    const selectedTier = tiers.find(t => t.id === selectedProfileId) || tiers[0];
    const finalOrderTotal = customPricing ? customPricing.batchSellPrice : selectedTier.orderTotalValue;
    const finalOrderProfit = customPricing ? customPricing.batchProfit : selectedTier.orderNetProfit;
    const finalOrderFee = customPricing ? customPricing.unitPlatformFee * Math.max(1, qty || 1) : selectedTier.orderMarketplaceFee;
    const finalOrderTax = customPricing ? customPricing.unitTaxAmount * Math.max(1, qty || 1) : selectedTier.orderTaxAmount;
    const finalUnitBase = customPricing ? customPricing.unitProductionCost : costs.base;

    const onSave = (data: EditFormOutput) => {
        if (!item) return;

        const fullAddress = data.addressStreet
            ? `${data.addressStreet}, ${data.addressNumber}${data.addressComplement ? ` - ${data.addressComplement}` : ''}, ${data.addressNeighborhood}, ${data.addressCity} - ${data.addressState}, CEP: ${data.addressCep}`
            : item.customerAddress;

        updateInventoryItem(item.id, {
            partName: data.partName,
            weightG: data.weightG,
            printTime: data.printTime,
            workTime: data.workTime,
            qty: Math.max(1, qty || 1),
            status: pipelineStatus,
            paymentStatus,
            setupMinutes: effectiveSetupMinutes,
            postMinutes: effectivePostMinutes,
            markupPercent: isCustomMarkup ? Math.max(0, customMarkup) : undefined,
            costs: customPricing
                ? {
                    material: customPricing.unitMaterial,
                    machine: customPricing.unitEnergy + customPricing.unitDepreciation,
                    labor: customPricing.unitLabor,
                    extras: customPricing.unitExtrasAndFail + customPricing.unitAuxiliary,
                    base: customPricing.unitProductionCost,
                    shipping: customPricing.shippingCost,
                    energyKwhCost: customPricing.unitEnergy,
                    depreciationCost: customPricing.unitDepreciation,
                    packaging: item?.packagingCost ?? item?.costs.packaging ?? 0,
                    marketplaceFee: finalOrderFee,
                    taxAmount: finalOrderTax
                }
                : {
                    ...costs,
                    base: finalUnitBase,
                    marketplaceFee: finalOrderFee,
                    taxAmount: finalOrderTax
                },
            selectedTier: selectedProfileId,
            tierRetail: finalOrderTotal,
            netProfit: finalOrderProfit,
            activeExtras,
            customerName: data.customerName,
            customerDoc: data.customerDoc,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail,
            customerAddress: fullAddress,
            addressCep: data.addressCep,
            addressStreet: data.addressStreet,
            addressNumber: data.addressNumber,
            addressComplement: data.addressComplement,
            addressNeighborhood: data.addressNeighborhood,
            addressCity: data.addressCity,
            addressState: data.addressState,
            notes: data.notes
        });

        toast.success('Pedido atualizado!');
        onOpenChange(false);
    };

    return (
        <div className="space-y-6 pb-8 overflow-y-auto max-h-[75vh] px-1">
                <form id="edit-form" onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <Input label="Nome do Projeto" {...register('partName')} error={errors.partName?.message as string} />
                    <div className="grid grid-cols-3 gap-3">
                        <Input label="Peso (g)" type="number" inputMode="decimal" step="0.01" {...register('weightG')} error={errors.weightG?.message as string} />
                        <Input label="Impressão (h:m)" {...register('printTime')} />
                        <Input
                            label="Qtd"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Tempo Pós (h:m)" {...register('workTime')} />
                        <Input label="Frete (R$)" type="number" inputMode="decimal" step="0.01" {...register('shippingCost')} />
                    </div>

                    {/* Pipeline & Payment Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1 block mb-1.5">
                                Etapa de Produção
                            </label>
                            <select
                                value={pipelineStatus}
                                onChange={(e) => setPipelineStatus(e.target.value as InventoryItemStatus)}
                                className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 text-sm font-semibold"
                            >
                                {PIPELINE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1 block mb-1.5">
                                Pagamento
                            </label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                                className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 text-sm font-semibold"
                            >
                                {PAYMENT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <CustomerEditForm register={register} errors={errors} setValue={setValue} />
                </form>

                <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Perfil de Venda</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            type="button"
                            onClick={() => setSelectedProfileId('custom_markup')}
                            className={clsx(
                                'px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all',
                                selectedProfileId === 'custom_markup'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/25'
                                    : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                            )}
                        >
                            Markup Personalizado ({customMarkup}%)
                        </button>
                        {settings.tiers.map(tier => (
                            <button
                                type="button"
                                key={tier.id}
                                onClick={() => setSelectedProfileId(tier.id)}
                                className={clsx(
                                    'px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all',
                                    selectedProfileId === tier.id
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/25'
                                        : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                                )}
                            >
                                {tier.name}
                            </button>
                        ))}
                    </div>

                    {isCustomMarkup && (
                        <div className="flex items-center gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                Markup (%)
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="300"
                                value={Math.min(300, customMarkup)}
                                onChange={(e) => setCustomMarkup(parseNumber(e.target.value))}
                                className="flex-1 accent-emerald-600"
                            />
                            <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="5"
                                value={customMarkup}
                                onChange={(e) => setCustomMarkup(Math.max(0, parseNumber(e.target.value)))}
                                className="w-20 h-8 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 px-2 text-xs font-black text-right tabular-nums"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Custos Variáveis</p>
                    <div className="flex flex-wrap gap-2">
                        {settings.extras?.map(extra => {
                            const isActive = activeExtras.includes(extra.id);
                            return (
                                <button
                                    type="button"
                                    key={extra.id}
                                    onClick={() => setActiveExtras(prev => isActive ? prev.filter(id => id !== extra.id) : [...prev, extra.id])}
                                    className={clsx(
                                        'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                                        isActive
                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                            : 'text-zinc-400 border-zinc-200 dark:border-zinc-800'
                                    )}
                                >
                                    {extra.name} (+{formatCurrency(extra.price)})
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-zinc-500 block">Novo Preço Final ({qty} un.)</span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Lucro Líq.: {formatCurrency(finalOrderProfit)}
                        </span>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                        {formatCurrency(finalOrderTotal)}
                    </span>
                </div>

                <Button type="button" onClick={handleSubmit(onSave)} className="w-full">
                    Salvar Alterações
                </Button>
            </div>
    );
};
