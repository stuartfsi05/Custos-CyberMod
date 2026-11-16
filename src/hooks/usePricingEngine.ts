import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { CostBreakdown, MarketplaceChannel, PrinterProfile, PricingTier } from '../types/settings';
import { timeToDecimal, parseNumber } from '../utils/formatters';

export interface AdditionalMaterialInput {
    id: string;
    filamentId: string;
    manualName?: string;
    costPerKg?: number;
    weightG: number;
}

export interface SelectedAuxiliaryItem {
    id: string;
    name: string;
    price: number;
    qty: number;
}

export type CostAllocationMode = 'per_piece' | 'per_batch';
export type TaxIncidenceMode = 'per_piece' | 'per_sale';
export type TaxPassThroughMode = 'gross_up' | 'direct';
export type DiscountType = 'percent' | 'fixed';

export interface AdvancedPricingInput {
    qty: number;
    weightG: number;
    materialCostPerKg: number;
    additionalMaterials?: Array<{
        weightG: number;
        costPerKg: number;
    }>;
    printTimeHours: number;
    powerWatts: number;
    kwhRate: number;
    machineValue: number;
    lifespanHours: number;
    maintenancePercent?: number;
    laborRatePerHour: number;
    setupMinutes: number;
    postMinutes: number;
    packagingCost: number;
    hardwareCost: number;
    auxiliaryItems?: Array<{
        price: number;
        qty: number;
    }>;
    extrasCost?: number;
    failPercent: number;
    costMode: CostAllocationMode;
    markupPercent: number;
    discountType?: DiscountType;
    discountValue?: number;
    commissionPercent: number;
    fixedFee: number;
    taxPercent: number;
    taxMode: TaxIncidenceMode;
    taxPassThrough: TaxPassThroughMode;
    shippingCost?: number;
}

export interface AdvancedPricingBreakdown {
    unitMaterial: number;
    unitAuxiliary: number;
    unitEnergy: number;
    unitDepreciation: number;
    unitLabor: number;
    unitExtrasAndFail: number;
    unitExtrasBase: number;
    unitFailCost: number;
    unitPlatformFee: number;
    unitTaxAmount: number;
    unitProductionCost: number;
    unitTotalCost: number;
    unitSellPrice: number;
    unitProfit: number;
    realMarginPercent: number;
    effectiveMarkupPercent: number;
    batchSellPrice: number;
    batchTotalCost: number;
    batchProductionCost: number;
    batchProfit: number;
    shippingCost: number;
    paybackPieces: number | null;
    paybackBatches: number | null;
    totalWeightG: number;
}

export function calculate3DPricing(input: AdvancedPricingInput): AdvancedPricingBreakdown {
    const safeQty = Math.max(1, Math.floor(input.qty || 1));
    const fMode = input.costMode === 'per_piece' ? 1 : safeQty;

    const mainWeight = Math.max(0, input.weightG || 0);
    const additionalList = input.additionalMaterials || [];
    const extraWeight = additionalList.reduce((sum, item) => sum + Math.max(0, item.weightG || 0), 0);
    const totalWeightG = mainWeight + extraWeight;

    // 1. Material (por peça)
    const batchMainMat = (mainWeight / 1000) * Math.max(0, input.materialCostPerKg || 0);
    const batchExtraMat = additionalList.reduce(
        (sum, item) => sum + (Math.max(0, item.weightG || 0) / 1000) * Math.max(0, item.costPerKg || 0),
        0
    );
    const unitMaterial = (batchMainMat + batchExtraMat) / safeQty;

    // 2. Energia (por peça)
    const hours = Math.max(0, input.printTimeHours || 0);
    const batchEnergy = (Math.max(0, input.powerWatts || 0) / 1000) * hours * Math.max(0, input.kwhRate || 0);
    const unitEnergy = batchEnergy / safeQty;

    // 3. Depreciação + Manutenção (por peça)
    const depPerHour = input.lifespanHours > 0 ? Math.max(0, input.machineValue || 0) / input.lifespanHours : 0;
    const maintPerHour = depPerHour * (Math.max(0, input.maintenancePercent || 0) / 100);
    const unitDepreciation = ((depPerHour + maintPerHour) * hours) / safeQty;

    // 4. Mão de Obra (por peça ou diluída pelo lote)
    const laborHours = (Math.max(0, input.setupMinutes || 0) + Math.max(0, input.postMinutes || 0)) / 60;
    const unitLabor = (Math.max(0, input.laborRatePerHour || 0) * laborHours) / fMode;

    // 5. Materiais Auxiliares (por peça ou diluídos pelo lote)
    const auxSum = (input.auxiliaryItems || []).reduce(
        (sum, item) => sum + Math.max(0, item.price || 0) * Math.max(0, item.qty || 0),
        0
    );
    const unitAuxiliary = auxSum / fMode;

    // 6. Extras (Embalagem + Hardware + Extras configurados) e Falha/Risco
    const unitExtrasBase =
        (Math.max(0, input.packagingCost || 0) +
            Math.max(0, input.hardwareCost || 0) +
            Math.max(0, input.extrasCost || 0)) /
        fMode;

    const productionBeforeFail =
        unitMaterial + unitEnergy + unitDepreciation + unitLabor + unitAuxiliary + unitExtrasBase;
    const unitFailCost = productionBeforeFail * (Math.max(0, input.failPercent || 0) / 100);
    const unitExtrasAndFail = unitExtrasBase + unitFailCost;
    const unitProductionCost = productionBeforeFail + unitFailCost;

    // 7. Preço de Venda, Desconto, Taxas de Plataforma, Impostos e Payback
    const markupBasePrice = unitProductionCost * (1 + Math.max(0, input.markupPercent || 0) / 100);
    const discountAmount =
        input.discountType === 'percent'
            ? markupBasePrice * (Math.max(0, Math.min(100, input.discountValue || 0)) / 100)
            : Math.max(0, input.discountValue || 0);
    const priceAfterDiscount = Math.max(0, markupBasePrice - discountAmount);

    const effectiveFixedFee =
        input.taxMode === 'per_piece'
            ? Math.max(0, input.fixedFee || 0)
            : Math.max(0, input.fixedFee || 0) / safeQty;

    const commissionRate = Math.max(0, input.commissionPercent || 0) / 100;
    const taxRate = Math.max(0, input.taxPercent || 0) / 100;
    const combinedRate = Math.min(0.95, commissionRate + taxRate);

    const hasPlatformRetention = combinedRate > 0 || effectiveFixedFee > 0;
    const unitSellPrice =
        input.taxPassThrough === 'gross_up' && priceAfterDiscount > 0 && hasPlatformRetention
            ? (priceAfterDiscount + effectiveFixedFee) / (1 - combinedRate)
            : priceAfterDiscount;

    const unitPlatformFee = unitSellPrice > 0 ? unitSellPrice * commissionRate + effectiveFixedFee : 0;
    const unitTaxAmount = unitSellPrice * taxRate;
    const unitTotalCost = unitProductionCost + unitPlatformFee + unitTaxAmount;
    const unitProfit = unitSellPrice - unitTotalCost;
    const realMarginPercent = unitSellPrice > 0 ? (unitProfit / unitSellPrice) * 100 : 0;
    const effectiveMarkupPercent =
        unitProductionCost > 0
            ? ((unitSellPrice - unitProductionCost) / unitProductionCost) * 100
            : input.markupPercent;

    const shippingCost = Math.max(0, input.shippingCost || 0);
    const batchSellPrice = unitSellPrice * safeQty + shippingCost;
    const batchTotalCost = unitTotalCost * safeQty;
    const batchProductionCost = unitProductionCost * safeQty;
    const batchProfit = unitProfit * safeQty;

    const paybackPieces =
        unitProfit > 0 && input.machineValue > 0 ? Math.ceil(input.machineValue / unitProfit) : null;
    const paybackBatches = paybackPieces !== null ? Math.ceil(paybackPieces / safeQty) : null;

    return {
        unitMaterial,
        unitAuxiliary,
        unitEnergy,
        unitDepreciation,
        unitLabor,
        unitExtrasAndFail,
        unitExtrasBase,
        unitFailCost,
        unitPlatformFee,
        unitTaxAmount,
        unitProductionCost,
        unitTotalCost,
        unitSellPrice,
        unitProfit,
        realMarginPercent,
        effectiveMarkupPercent,
        batchSellPrice,
        batchTotalCost,
        batchProductionCost,
        batchProfit,
        shippingCost,
        paybackPieces,
        paybackBatches,
        totalWeightG
    };
}

export interface MarginHealthInfo {
    level: 'loss' | 'tight' | 'competitive' | 'healthy';
    label: string;
    shortLabel: string;
}

/**
 * Classifies profit margin health based on net return over production cost (%).
 * Standard (40%+), Premium (60%) and Luxury (80%+) are healthy; 25%-39.9% is competitive.
 */
export function getMarginHealthStatus(unitProfit: number, netReturnOnCostPct: number): MarginHealthInfo {
    if (unitProfit <= 0) {
        return { level: 'loss', label: 'Sem lucro / Prejuízo', shortLabel: 'Sem lucro' };
    }
    if (netReturnOnCostPct < 24.99) {
        return { level: 'tight', label: 'Margem apertada', shortLabel: 'Apertada' };
    }
    if (netReturnOnCostPct < 39.99) {
        return { level: 'competitive', label: 'Margem competitiva', shortLabel: 'Competitiva' };
    }
    return { level: 'healthy', label: 'Margem saudável', shortLabel: 'Saudável' };
}

// Legacy hook preserved for EditItemDialog compatibility
interface PricingEngineInputs {
    weightG: number | string;
    printTime: string | number;
    workTime: string | number;
    shippingCost: number | string;
    activeExtras?: string[];
    printerId?: string;
    filamentId?: string;
    additionalMaterials?: AdditionalMaterialInput[];
    marketplaceId?: string;
    packagingCost?: number | string;
    qty?: number;
}

export interface CalculatedTier extends PricingTier {
    value: number;
    marketplaceValue: number;
    marketplaceFee: number;
    taxAmount: number;
    netProfit: number;
    netMarginPercent: number;
    orderTotalValue: number;
    orderUnitValue: number;
    orderMarketplaceFee: number;
    orderTaxAmount: number;
    orderNetProfit: number;
    orderNetMarginPercent: number;
}

interface PricingEngineResult {
    costs: CostBreakdown;
    inputDebug: {
        adjWeight: number;
        adjPrintTime: number;
        printTimeHours: number;
        workTimeHours: number;
        totalWeightG: number;
        printer?: PrinterProfile;
        marketplace: MarketplaceChannel;
    };
    tiers: CalculatedTier[];
}

export const usePricingEngine = ({
    weightG,
    printTime,
    workTime,
    shippingCost = 0,
    activeExtras = [],
    printerId,
    filamentId,
    additionalMaterials = [],
    marketplaceId,
    packagingCost = 0,
    qty = 1
}: PricingEngineInputs): PricingEngineResult => {
    const { settings } = useSettings();

    return useMemo(() => {
        const safeQty = Math.max(1, Math.floor(qty || 1));
        const weight = Math.max(0, parseNumber(weightG));
        const printTimeHours = Math.max(0, typeof printTime === 'string' ? timeToDecimal(printTime) : (printTime || 0));
        const workTimeHours = Math.max(0, typeof workTime === 'string' ? timeToDecimal(workTime) : (workTime || 0));
        const shipping = Math.max(0, parseNumber(shippingCost));
        const packaging = Math.max(0, parseNumber(packagingCost));
        const failPercent = Math.max(0, (settings.failMargin - 1) * 100);

        const mainSpool = filamentId ? settings.filaments.find(f => f.id === filamentId) : undefined;
        const mainPricePerKg = mainSpool
            ? (mainSpool.isConsigned ? 0 : mainSpool.pricePerKg)
            : settings.materialCost;

        const selectedPrinter =
            (printerId ? settings.printers.find(p => p.id === printerId) : undefined) ||
            settings.printers.find(p => p.id === settings.defaultPrinterId) ||
            settings.printers[0];

        const selectedMarketplace: MarketplaceChannel =
            (marketplaceId ? settings.marketplaces.find(m => m.id === marketplaceId) : undefined) ||
            settings.marketplaces[0] ||
            { id: 'direct', name: 'Sem taxa / Venda direta', commissionPercent: 0, fixedFee: 0 };

        const costExtras = settings.extras
            ? settings.extras.filter(e => activeExtras.includes(e.id)).reduce((total, item) => total + item.price, 0)
            : 0;

        const mappedAdditional = additionalMaterials.map(item => {
            const spool = settings.filaments.find(f => f.id === item.filamentId);
            const pricePerKg = item.costPerKg ?? (spool ? (spool.isConsigned ? 0 : spool.pricePerKg) : settings.materialCost);
            return { weightG: parseNumber(item.weightG), costPerKg: pricePerKg };
        });

        const baseCalc = calculate3DPricing({
            qty: safeQty,
            weightG: weight * safeQty,
            materialCostPerKg: mainPricePerKg,
            additionalMaterials: mappedAdditional,
            printTimeHours,
            powerWatts: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.powerWatts : 0,
            kwhRate: settings.kwhRate,
            machineValue: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.purchasePrice : 0,
            lifespanHours: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.lifespanHours : 1,
            maintenancePercent: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.maintenancePercent : 0,
            laborRatePerHour: settings.laborCost,
            setupMinutes: workTimeHours * 60,
            postMinutes: 0,
            packagingCost: packaging,
            hardwareCost: 0,
            extrasCost: costExtras,
            failPercent,
            costMode: 'per_piece',
            markupPercent: 0,
            commissionPercent: selectedMarketplace.commissionPercent,
            fixedFee: selectedMarketplace.fixedFee,
            taxPercent: settings.taxPercent,
            taxMode: 'per_sale',
            taxPassThrough: 'gross_up',
            shippingCost: shipping
        });

        const machineFallbackCost = !settings.useAdvancedMachineCost
            ? printTimeHours * settings.failMargin * settings.energyCost
            : 0;

        const unitBaseCost = baseCalc.unitProductionCost + machineFallbackCost;

        const calculatedTiers: CalculatedTier[] = settings.tiers.map(tier => {
            const markupPct = Math.max(0, (tier.multiplier - 1) * 100);
            const single = calculate3DPricing({
                qty: safeQty,
                weightG: weight * safeQty,
                materialCostPerKg: mainPricePerKg,
                additionalMaterials: mappedAdditional,
                printTimeHours,
                powerWatts: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.powerWatts : 0,
                kwhRate: settings.kwhRate,
                machineValue: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.purchasePrice : 0,
                lifespanHours: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.lifespanHours : 1,
                maintenancePercent: settings.useAdvancedMachineCost && selectedPrinter ? selectedPrinter.maintenancePercent : 0,
                laborRatePerHour: settings.laborCost,
                setupMinutes: workTimeHours * 60,
                postMinutes: 0,
                packagingCost: packaging,
                hardwareCost: 0,
                extrasCost: costExtras + machineFallbackCost,
                failPercent,
                costMode: 'per_piece',
                markupPercent: markupPct,
                commissionPercent: selectedMarketplace.commissionPercent,
                fixedFee: selectedMarketplace.fixedFee,
                taxPercent: settings.taxPercent,
                taxMode: 'per_sale',
                taxPassThrough: 'gross_up',
                shippingCost: shipping
            });

            const directValue = unitBaseCost * tier.multiplier + shipping / safeQty;

            const orderTotalValue = single.batchSellPrice;
            const orderMarketplaceFee = single.unitPlatformFee * safeQty;
            const orderTaxAmount = single.unitTaxAmount * safeQty;
            const orderNetProfit = single.batchProfit;

            return {
                ...tier,
                value: directValue,
                marketplaceValue: single.batchSellPrice,
                marketplaceFee: single.unitPlatformFee,
                taxAmount: single.unitTaxAmount,
                netProfit: single.unitProfit,
                netMarginPercent: single.realMarginPercent,
                orderTotalValue,
                orderUnitValue: single.unitSellPrice,
                orderMarketplaceFee,
                orderTaxAmount,
                orderNetProfit,
                orderNetMarginPercent: single.realMarginPercent
            };
        });

        return {
            costs: {
                material: baseCalc.unitMaterial,
                machine: baseCalc.unitEnergy + baseCalc.unitDepreciation + machineFallbackCost,
                labor: baseCalc.unitLabor,
                extras: costExtras,
                base: unitBaseCost,
                shipping,
                energyKwhCost: baseCalc.unitEnergy + machineFallbackCost,
                depreciationCost: baseCalc.unitDepreciation,
                maintenanceCost: 0,
                packaging
            },
            inputDebug: {
                adjWeight: weight * settings.failMargin,
                adjPrintTime: printTimeHours * settings.failMargin,
                printTimeHours,
                workTimeHours,
                totalWeightG: baseCalc.totalWeightG,
                printer: selectedPrinter,
                marketplace: selectedMarketplace
            },
            tiers: calculatedTiers
        };
    }, [
        weightG,
        printTime,
        workTime,
        shippingCost,
        activeExtras,
        printerId,
        filamentId,
        additionalMaterials,
        marketplaceId,
        packagingCost,
        qty,
        settings
    ]);
};
