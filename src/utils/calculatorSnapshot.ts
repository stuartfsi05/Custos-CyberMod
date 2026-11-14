import type { InventoryItem } from '../context/InventoryContext';
import type { Settings } from '../types/settings';
import type {
    AdditionalMaterialInput,
    CostAllocationMode,
    DiscountType,
    SelectedAuxiliaryItem,
    TaxIncidenceMode,
    TaxPassThroughMode
} from '../hooks/usePricingEngine';
import type { QuoteLineItem } from '../components/calculator/QuoteDocumentModal';

export interface CalculatorHydratedState {
    projectName: string;
    projectDescription: string;
    photoUrl: string;
    showExtendedCustomer: boolean;
    selectedFilamentId: string;
    manualMaterialName: string;
    materialCostPerKg: number;
    weightG: number;
    qty: number;
    additionalMaterials: AdditionalMaterialInput[];
    selectedPrinterId: string;
    manualPrinterName: string;
    printHours: number;
    printMinutes: number;
    powerWatts: number;
    machineValue: number;
    kwhRate: number;
    lifespanHours: number;
    maintenancePercent: number;
    costMode: CostAllocationMode;
    laborRatePerHour: number;
    setupMinutes: number;
    postMinutes: number;
    packagingCost: number;
    hardwareCost: number;
    failPercent: number;
    selectedAuxItems: SelectedAuxiliaryItem[];
    selectedMarketplaceId: string;
    taxMode: TaxIncidenceMode;
    taxPassThrough: TaxPassThroughMode;
    commissionPercent: number;
    fixedFee: number;
    taxPercent: number;
    markupPercent: number;
    discountType: DiscountType;
    discountValue: number;
    quoteItems: QuoteLineItem[];
}

export function parseHoursMinutes(raw?: string | number): { hours: number; minutes: number } {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        const totalMins = Math.round(raw * 60);
        return { hours: Math.floor(totalMins / 60), minutes: totalMins % 60 };
    }
    if (typeof raw === 'string' && raw.includes(':')) {
        const [hStr, mStr] = raw.split(':');
        return {
            hours: Math.max(0, parseInt(hStr, 10) || 0),
            minutes: Math.max(0, Math.min(59, parseInt(mStr, 10) || 0))
        };
    }
    return { hours: 0, minutes: 0 };
}

/**
 * Hidrata o estado completo da calculadora a partir de um pedido salvo (ou aplica os padrões de exemplo).
 * Preserva todos os parâmetros técnicos, adicionais AMS, auxiliares, taxas e orçamento multi-peças.
 */
export function resolveInitialCalculatorState(
    initialItem: InventoryItem | null | undefined,
    settings: Settings
): CalculatorHydratedState {
    const defaultPrinter =
        (initialItem?.printerId && settings.printers.find(p => p.id === initialItem.printerId)) ||
        settings.printers.find(p => p.id === settings.defaultPrinterId) ||
        settings.printers[0];
    const defaultFilament =
        (initialItem?.filamentId && settings.filaments.find(f => f.id === initialItem.filamentId)) ||
        settings.filaments[0];
    const defaultChannel =
        (initialItem?.marketplaceId && settings.marketplaces.find(m => m.id === initialItem.marketplaceId)) ||
        settings.marketplaces[0];

    const initialPrintHM = parseHoursMinutes(initialItem?.printTime);
    const initialQty = initialItem?.qty && initialItem.qty > 0 ? initialItem.qty : 1;

    const additionalList = initialItem?.additionalMaterials
        ? initialItem.additionalMaterials.map(m => ({ ...m }))
        : [];
    const additionalBatchWeight = additionalList.reduce(
        (sum, m) => sum + (Number.isFinite(m.weightG) ? m.weightG : 0),
        0
    );

    const savedTotalBatchWeight = initialItem
        ? Math.max(0, Math.round((initialItem.weightG * initialQty - additionalBatchWeight) * 100) / 100)
        : 16;

    return {
        projectName: initialItem?.partName || '',
        projectDescription: initialItem?.description || '',
        photoUrl: initialItem?.photoUrl || '',
        showExtendedCustomer: Boolean(
            initialItem?.customerPhone ||
                initialItem?.customerEmail ||
                initialItem?.addressCep ||
                initialItem?.costs.shipping
        ),
        selectedFilamentId: defaultFilament?.id || '',
        manualMaterialName: initialItem?.manualMaterialName ?? defaultFilament?.name ?? 'PLA Genérico',
        materialCostPerKg:
            initialItem?.materialCostPerKg ??
            (defaultFilament ? (defaultFilament.isConsigned ? 0 : defaultFilament.pricePerKg) : settings.materialCost),
        weightG: savedTotalBatchWeight,
        qty: initialQty,
        additionalMaterials: additionalList,
        selectedPrinterId: defaultPrinter?.id || '',
        manualPrinterName: initialItem?.manualPrinterName ?? defaultPrinter?.name ?? 'Snapmaker U1',
        printHours: initialItem ? initialPrintHM.hours : 1,
        printMinutes: initialItem ? initialPrintHM.minutes : 17,
        powerWatts: initialItem?.powerWatts ?? defaultPrinter?.powerWatts ?? 400,
        machineValue: initialItem?.machineValue ?? defaultPrinter?.purchasePrice ?? 12000,
        kwhRate: initialItem?.kwhRate ?? settings.kwhRate ?? 1.5,
        lifespanHours: initialItem?.lifespanHours ?? defaultPrinter?.lifespanHours ?? 8000,
        maintenancePercent: initialItem?.maintenancePercent ?? defaultPrinter?.maintenancePercent ?? 0,
        costMode: initialItem?.costMode ?? 'per_piece',
        laborRatePerHour: initialItem?.laborRatePerHour ?? settings.laborCost ?? 33,
        setupMinutes: initialItem?.setupMinutes ?? 10,
        postMinutes: initialItem?.postMinutes ?? 30,
        packagingCost: initialItem?.packagingCost ?? initialItem?.costs.packaging ?? 1,
        hardwareCost: initialItem?.hardwareCost ?? 0,
        failPercent: initialItem?.failPercent ?? Math.max(0, Math.round((settings.failMargin - 1) * 10000) / 100),
        selectedAuxItems: initialItem?.auxiliaryItems ? initialItem.auxiliaryItems.map(a => ({ ...a })) : [],
        selectedMarketplaceId: defaultChannel?.id || 'direct',
        taxMode: initialItem?.taxMode ?? 'per_piece',
        taxPassThrough: initialItem?.taxPassThrough ?? 'gross_up',
        commissionPercent: initialItem?.commissionPercent ?? defaultChannel?.commissionPercent ?? 0,
        fixedFee: initialItem?.fixedFee ?? defaultChannel?.fixedFee ?? 0,
        taxPercent: initialItem?.taxPercent ?? settings.taxPercent ?? 0,
        markupPercent: initialItem?.markupPercent ?? 80,
        discountType: initialItem?.discountType ?? 'percent',
        discountValue: initialItem?.discountValue ?? 0,
        quoteItems: initialItem?.quoteItems ? initialItem.quoteItems.map(q => ({ ...q })) : []
    };
}
