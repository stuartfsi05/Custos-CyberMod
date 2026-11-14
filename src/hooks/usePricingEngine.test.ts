import { describe, it, expect } from 'vitest';
import { calculate3DPricing } from './usePricingEngine';
import { decimalToTime, minutesToHHMM } from '../utils/formatters';

describe('calculate3DPricing', () => {
    it('reproduz exatamente a matemática do vídeo (Snapmaker U1) nos modos Por Peça e Por Lote', () => {
        const baseInput = {
            qty: 2,
            weightG: 16,
            materialCostPerKg: 110,
            printTimeHours: 1 + 17 / 60, // 1h17m = 1.283333...h
            powerWatts: 400,
            kwhRate: 1.5,
            machineValue: 12000,
            lifespanHours: 8000,
            maintenancePercent: 0,
            laborRatePerHour: 33,
            setupMinutes: 10,
            postMinutes: 30,
            packagingCost: 2,
            hardwareCost: 1,
            failPercent: 0,
            markupPercent: 300,
            commissionPercent: 0,
            fixedFee: 0,
            taxPercent: 0,
            taxMode: 'per_piece' as const,
            taxPassThrough: 'gross_up' as const
        };

        const perPiece = calculate3DPricing({ ...baseInput, costMode: 'per_piece' });

        expect(perPiece.unitMaterial).toBeCloseTo(0.88, 4);
        expect(perPiece.unitEnergy).toBeCloseTo(0.385, 4);
        expect(perPiece.unitDepreciation).toBeCloseTo(0.9625, 4);
        expect(perPiece.unitLabor).toBeCloseTo(22.0, 4);
        expect(perPiece.unitExtrasAndFail).toBeCloseTo(3.0, 4);
        expect(perPiece.unitProductionCost).toBeCloseTo(27.2275, 4);
        expect(perPiece.unitSellPrice).toBeCloseTo(108.91, 2);
        expect(perPiece.unitProfit).toBeCloseTo(81.6825, 4);
        expect(perPiece.realMarginPercent).toBeCloseTo(75, 4);

        const perBatch = calculate3DPricing({ ...baseInput, costMode: 'per_batch' });

        expect(perBatch.unitMaterial).toBeCloseTo(0.88, 4);
        expect(perBatch.unitEnergy).toBeCloseTo(0.385, 4);
        expect(perBatch.unitDepreciation).toBeCloseTo(0.9625, 4);
        expect(perBatch.unitLabor).toBeCloseTo(11.0, 4);
        expect(perBatch.unitExtrasAndFail).toBeCloseTo(1.5, 4);
        expect(perBatch.unitProductionCost).toBeCloseTo(14.7275, 4);
        expect(perBatch.unitSellPrice).toBeCloseTo(58.91, 2);
    });

    it('calcula o payback da máquina em peças e lotes corretamente (caso 12000 / 12.68 = 947 pç / 474 lotes)', () => {
        const res = calculate3DPricing({
            qty: 2,
            weightG: 200,
            materialCostPerKg: 126.8, // (200g * 126.8/1000) / 2 = R$ 12,68 de custo por peça
            printTimeHours: 0,
            powerWatts: 0,
            kwhRate: 0,
            machineValue: 12000,
            lifespanHours: 8000,
            laborRatePerHour: 0,
            setupMinutes: 0,
            postMinutes: 0,
            packagingCost: 0,
            hardwareCost: 0,
            failPercent: 0,
            costMode: 'per_piece',
            markupPercent: 100, // Lucro líquido exato = R$ 12,68 / peça
            commissionPercent: 0,
            fixedFee: 0,
            taxPercent: 0,
            taxMode: 'per_piece',
            taxPassThrough: 'gross_up'
        });

        expect(res.unitProfit).toBeCloseTo(12.68, 4);
        expect(res.paybackPieces).toBe(947);
        expect(res.paybackBatches).toBe(474);
    });

    it('recompõe taxas de marketplace via gross_up preservando o lucro alvo e compara com modo direct', () => {
        const base = {
            qty: 2,
            weightG: 100,
            materialCostPerKg: 100, // R$ 5,00 / peça
            printTimeHours: 0,
            powerWatts: 0,
            kwhRate: 0,
            machineValue: 0,
            lifespanHours: 1000,
            laborRatePerHour: 0,
            setupMinutes: 0,
            postMinutes: 0,
            packagingCost: 0,
            hardwareCost: 0,
            failPercent: 0,
            costMode: 'per_piece' as const,
            markupPercent: 100, // Preço base desejado = R$ 10,00 (lucro alvo = R$ 5,00)
            commissionPercent: 14,
            fixedFee: 6,
            taxPercent: 6,
            taxMode: 'per_sale' as const // Taxa fixa R$ 6 dividida em 2 peças = R$ 3,00/peça
        };

        const grossUp = calculate3DPricing({ ...base, taxPassThrough: 'gross_up' });
        // (10 + 3) / (1 - 0.20) = 13 / 0.8 = 16.25
        expect(grossUp.unitSellPrice).toBeCloseTo(16.25, 4);
        expect(grossUp.unitPlatformFee).toBeCloseTo(16.25 * 0.14 + 3, 4);
        expect(grossUp.unitTaxAmount).toBeCloseTo(16.25 * 0.06, 4);
        expect(grossUp.unitProfit).toBeCloseTo(5.0, 4);

        const direct = calculate3DPricing({ ...base, taxPassThrough: 'direct' });
        expect(direct.unitSellPrice).toBeCloseTo(10.0, 4);
        // Lucro cai ao absorver R$ 3 fixo + 20% sobre R$ 10 (R$ 2) = lucro R$ 0
        expect(direct.unitProfit).toBeCloseTo(0, 4);
    });

    it('aplica descontos em % e R$, dilui materiais auxiliares no lote e evita divisão por zero', () => {
        const withAuxAndDiscount = calculate3DPricing({
            qty: 4,
            weightG: 40,
            materialCostPerKg: 100, // R$ 4,00 total -> R$ 1,00 / peça
            printTimeHours: 0,
            powerWatts: 0,
            kwhRate: 0,
            machineValue: 0,
            lifespanHours: 0, // borda: 0h não gera NaN
            laborRatePerHour: 0,
            setupMinutes: 0,
            postMinutes: 0,
            packagingCost: 0,
            hardwareCost: 0,
            auxiliaryItems: [{ price: 2, qty: 2 }], // R$ 4,00 total -> R$ 1,00 / peça em per_batch
            failPercent: 0,
            costMode: 'per_batch',
            markupPercent: 100, // Preço antes desconto = R$ 4,00 / peça
            discountType: 'percent',
            discountValue: 25, // -25% -> R$ 3,00 / peça
            commissionPercent: 0,
            fixedFee: 0,
            taxPercent: 0,
            taxMode: 'per_piece',
            taxPassThrough: 'gross_up',
            shippingCost: 15
        });

        expect(withAuxAndDiscount.unitDepreciation).toBe(0);
        expect(withAuxAndDiscount.unitAuxiliary).toBeCloseTo(1.0, 4);
        expect(withAuxAndDiscount.unitProductionCost).toBeCloseTo(2.0, 4);
        expect(withAuxAndDiscount.unitSellPrice).toBeCloseTo(3.0, 4);
        expect(withAuxAndDiscount.batchSellPrice).toBeCloseTo(3.0 * 4 + 15, 4);

        const fixedDiscountAndZeroQty = calculate3DPricing({
            qty: 0,
            weightG: 100,
            materialCostPerKg: 100, // R$ 10,00
            printTimeHours: 0,
            powerWatts: 0,
            kwhRate: 0,
            machineValue: 1000,
            lifespanHours: 0,
            laborRatePerHour: 0,
            setupMinutes: 0,
            postMinutes: 0,
            packagingCost: 0,
            hardwareCost: 0,
            failPercent: 10, // +10% -> R$ 11,00
            costMode: 'per_piece',
            markupPercent: 100, // R$ 22,00
            discountType: 'fixed',
            discountValue: 2, // R$ 20,00
            commissionPercent: 0,
            fixedFee: 0,
            taxPercent: 0,
            taxMode: 'per_piece',
            taxPassThrough: 'gross_up'
        });

        expect(Number.isFinite(fixedDiscountAndZeroQty.unitSellPrice)).toBe(true);
        expect(fixedDiscountAndZeroQty.unitProductionCost).toBeCloseTo(11.0, 4);
        expect(fixedDiscountAndZeroQty.unitSellPrice).toBeCloseTo(20.0, 4);
    });

    it('regressão: considera múltiplos filamentos, margem de falha e taxa fixa per_piece vs per_sale em lotes', () => {
        const shared = {
            qty: 4,
            weightG: 100, // 100g @ R$100/kg = R$ 10 -> R$ 2,50/peça
            materialCostPerKg: 100,
            additionalMaterials: [
                { weightG: 50, costPerKg: 200 } // 50g @ R$200/kg = R$ 10 -> R$ 2,50/peça
            ],
            printTimeHours: 0,
            powerWatts: 0,
            kwhRate: 0,
            machineValue: 0,
            lifespanHours: 1000,
            laborRatePerHour: 0,
            setupMinutes: 0,
            postMinutes: 0,
            packagingCost: 2,
            hardwareCost: 2,
            auxiliaryItems: [{ price: 4, qty: 1 }],
            failPercent: 10,
            markupPercent: 50,
            commissionPercent: 10,
            fixedFee: 8,
            taxPercent: 5,
            taxPassThrough: 'gross_up' as const
        };

        const perPieceCostAndFee = calculate3DPricing({
            ...shared,
            costMode: 'per_piece',
            taxMode: 'per_piece'
        });

        // Produção base/peça: material (5.00) + aux (4.00) + extras (4.00) = 13.00; +10% falha = 14.30
        expect(perPieceCostAndFee.unitMaterial).toBeCloseTo(5.0, 4);
        expect(perPieceCostAndFee.unitAuxiliary).toBeCloseTo(4.0, 4);
        expect(perPieceCostAndFee.unitFailCost).toBeCloseTo(1.3, 4);
        expect(perPieceCostAndFee.unitProductionCost).toBeCloseTo(14.3, 4);
        // Markup 50% -> 21.45; fixedFee = 8/peça; combinedRate = 0.15 => (21.45 + 8) / 0.85 = 34.6470588
        expect(perPieceCostAndFee.unitSellPrice).toBeCloseTo((21.45 + 8) / 0.85, 4);
        expect(perPieceCostAndFee.unitProfit).toBeCloseTo(21.45 - 14.3, 4);

        const perBatchAndSale = calculate3DPricing({
            ...shared,
            costMode: 'per_batch',
            taxMode: 'per_sale'
        });

        // Em per_batch: aux = 4/4 = 1.00; extras = 4/4 = 1.00; prod base = 5+1+1 = 7.00; +10% falha = 7.70
        expect(perBatchAndSale.unitAuxiliary).toBeCloseTo(1.0, 4);
        expect(perBatchAndSale.unitProductionCost).toBeCloseTo(7.7, 4);
        // Markup 50% -> 11.55; fixedFee por venda = 8/4 = 2.00/peça => (11.55 + 2) / 0.85
        expect(perBatchAndSale.unitSellPrice).toBeCloseTo((11.55 + 2) / 0.85, 4);
    });

    it('regressão: protege contra singularidade quando comissão + imposto >= 99.9% e valores negativos/zero', () => {
        const extremeRates = calculate3DPricing({
            qty: -2,
            weightG: 100,
            materialCostPerKg: 100,
            printTimeHours: 1,
            powerWatts: 100,
            kwhRate: 1,
            machineValue: 5000,
            lifespanHours: 0,
            laborRatePerHour: 0,
            setupMinutes: 0,
            postMinutes: 0,
            packagingCost: 0,
            hardwareCost: 0,
            failPercent: 0,
            costMode: 'per_piece',
            markupPercent: 100,
            commissionPercent: 80,
            fixedFee: 5,
            taxPercent: 25, // soma 105%, limitada internamente a 95% (0.95) no divisor gross_up
            taxMode: 'per_piece',
            taxPassThrough: 'gross_up'
        });

        expect(Number.isFinite(extremeRates.unitSellPrice)).toBe(true);
        expect(extremeRates.unitSellPrice).toBeGreaterThan(0);
        expect(extremeRates.unitDepreciation).toBe(0);
    });

    it('formata horas e minutos sem overflow para 60 minutos em decimalToTime e minutesToHHMM', () => {
        expect(decimalToTime(1.999)).toBe('2:00');
        expect(decimalToTime(1.5)).toBe('1:30');
        expect(decimalToTime(-0.5)).toBe('0:00');
        expect(minutesToHHMM(75)).toBe('1:15');
        expect(minutesToHHMM(40)).toBe('0:40');
        expect(minutesToHHMM(120)).toBe('2:00');
    });
});
