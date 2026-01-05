import { useMemo } from 'react';
import { useSettings, PricingTier } from '../context/SettingsContext';
import { timeToDecimal, parseNumber } from '../utils/formatters';

interface PricingEngineInputs {
    weightG: number | string;
    printTime: string | number;
    workTime: string | number;
    shippingCost: number | string;
}

interface CostBreakdown {
    material: number;
    machine: number;
    labor: number;
    base: number;
    shipping: number;
}

export interface CalculatedTier extends PricingTier {
    value: number;
}

interface PricingEngineResult {
    costs: CostBreakdown;
    inputDebug: {
        adjWeight: number;
        adjPrintTime: number;
        printTimeHours: number;
        workTimeHours: number;
    };
    tiers: CalculatedTier[];
}

export const usePricingEngine = ({ weightG, printTime, workTime, shippingCost = 0 }: PricingEngineInputs): PricingEngineResult => {
    const { settings } = useSettings();

    const results = useMemo(() => {
        // 1. Parsing Inputs
        const weight = parseNumber(weightG);
        const printTimeHours = typeof printTime === 'string' ? timeToDecimal(printTime) : (printTime || 0);
        const workTimeHours = typeof workTime === 'string' ? timeToDecimal(workTime) : (workTime || 0);
        const shipping = parseNumber(shippingCost);

        // 2. Safety Adjustments (Fail Margin)
        const adjWeight = weight * settings.failMargin;
        const adjPrintTime = printTimeHours * settings.failMargin;

        // 3. Cost Components
        // Material: (grams / 1000) * cost_per_kg
        const costMaterial = (adjWeight / 1000) * settings.materialCost;

        // Machine: adjusted_hours * energy_cost_per_hour
        const costMachine = adjPrintTime * settings.energyCost;

        // Labor: real_hours * labor_cost_per_hour
        const costLabor = workTimeHours * settings.laborCost;

        // Base Cost
        const baseCost = costMaterial + costMachine + costLabor;

        // 4. Tiers Calculation
        const calculatedTiers: CalculatedTier[] = settings.tiers.map(tier => ({
            ...tier,
            value: (baseCost * tier.multiplier) + shipping
        }));

        return {
            costs: {
                material: costMaterial,
                machine: costMachine,
                labor: costLabor,
                base: baseCost,
                shipping: shipping
            },
            inputDebug: {
                adjWeight,
                adjPrintTime,
                printTimeHours,
                workTimeHours
            },
            tiers: calculatedTiers
        };
    }, [weightG, printTime, workTime, shippingCost, settings]);

    return results;
};
