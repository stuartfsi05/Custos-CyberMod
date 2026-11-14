import { describe, it, expect } from 'vitest';
import { defaultSettings } from '../types/settings';
import type { InventoryItem } from '../context/InventoryContext';
import { parseHoursMinutes, resolveInitialCalculatorState } from './calculatorSnapshot';

describe('parseHoursMinutes', () => {
    it('converte strings HH:MM, números decimais e valores ausentes com segurança', () => {
        expect(parseHoursMinutes('01:17')).toEqual({ hours: 1, minutes: 17 });
        expect(parseHoursMinutes('2:75')).toEqual({ hours: 2, minutes: 59 });
        expect(parseHoursMinutes(1.5)).toEqual({ hours: 1, minutes: 30 });
        expect(parseHoursMinutes(undefined)).toEqual({ hours: 0, minutes: 0 });
    });
});

describe('resolveInitialCalculatorState', () => {
    it('retorna os valores iniciais de exemplo e padrões globais quando não há item para reabrir', () => {
        const state = resolveInitialCalculatorState(null, defaultSettings);

        expect(state.weightG).toBe(16);
        expect(state.printHours).toBe(1);
        expect(state.printMinutes).toBe(17);
        expect(state.qty).toBe(1);
        expect(state.kwhRate).toBe(defaultSettings.kwhRate);
        expect(state.laborRatePerHour).toBe(defaultSettings.laborCost);
        expect(state.taxPercent).toBe(defaultSettings.taxPercent);
        expect(state.taxMode).toBe('per_piece');
        expect(state.taxPassThrough).toBe('gross_up');
        expect(state.selectedPrinterId).toBe(defaultSettings.defaultPrinterId);
        expect(state.failPercent).toBe(0);
        expect(state.additionalMaterials).toEqual([]);
        expect(state.selectedAuxItems).toEqual([]);
        expect(state.quoteItems).toEqual([]);

        const zeroFailState = resolveInitialCalculatorState(null, {
            ...defaultSettings,
            failMargin: 1.0
        });
        expect(zeroFailState.failPercent).toBe(0);

        const customFailState = resolveInitialCalculatorState(null, {
            ...defaultSettings,
            failMargin: 1.1
        });
        expect(customFailState.failPercent).toBe(10);

        const fractionalFailState = resolveInitialCalculatorState(null, {
            ...defaultSettings,
            failMargin: 1.125
        });
        expect(fractionalFailState.failPercent).toBe(12.5);

        const belowZeroFailState = resolveInitialCalculatorState(null, {
            ...defaultSettings,
            failMargin: 0.95
        });
        expect(belowZeroFailState.failPercent).toBe(0);
    });

    it('preserva todo o snapshot técnico, custos adicionais AMS, taxas e carrinho ao reabrir pedido salvo', () => {
        const savedOrder: InventoryItem = {
            id: 42,
            partName: 'Capacete Customizado',
            description: 'Acabamento fosco com ímãs embutidos',
            photoUrl: 'data:image/png;base64,abc',
            weightG: 25, // por peça -> em qty=2 o lote total tem 50g
            qty: 2,
            printTime: '03:20',
            workTime: '00:50',
            printerId: 'printer_custom_test',
            filamentId: 'fil_custom_test',
            marketplaceId: 'ml_premium',
            manualMaterialName: 'PETG Fibra de Carbono',
            materialCostPerKg: 185,
            additionalMaterials: [
                {
                    id: 'ams_2',
                    filamentId: 'pla_branco',
                    manualName: 'PLA Suporte',
                    costPerKg: 95,
                    weightG: 10
                }
            ],
            manualPrinterName: 'Bambu Lab X1E Custom',
            powerWatts: 520,
            machineValue: 14500,
            kwhRate: 1.42,
            lifespanHours: 9000,
            maintenancePercent: 12,
            laborRatePerHour: 48,
            costMode: 'per_batch',
            setupMinutes: 15,
            postMinutes: 35,
            packagingCost: 4.5,
            hardwareCost: 3.25,
            failPercent: 8,
            auxiliaryItems: [
                { id: 'aux_ima', name: 'Ímã de Neodímio 8x3mm', price: 1.2, qty: 4 }
            ],
            commissionPercent: 19,
            fixedFee: 6,
            taxPercent: 6.5,
            taxMode: 'per_sale',
            taxPassThrough: 'direct',
            markupPercent: 110,
            discountType: 'fixed',
            discountValue: 12,
            customerName: 'Vinícius',
            customerPhone: '(11) 99999-9999',
            costs: {
                material: 4.63,
                machine: 5.5,
                labor: 20,
                extras: 8.5,
                base: 38.63,
                shipping: 18,
                packaging: 4.5
            },
            tierRetail: 99.9,
            selectedTier: 'Markup 110%',
            quoteItems: [
                {
                    id: 'q1',
                    partName: 'Base Expositora',
                    description: 'Preto fosco',
                    qty: 2,
                    unitPrice: 35,
                    subtotal: 70
                }
            ],
            date: '2026-11-14T10:00:00.000Z',
            status: 'approved'
        };

        const hydrated = resolveInitialCalculatorState(savedOrder, defaultSettings);

        expect(hydrated.projectName).toBe('Capacete Customizado');
        expect(hydrated.projectDescription).toBe('Acabamento fosco com ímãs embutidos');
        expect(hydrated.showExtendedCustomer).toBe(true);
        // 25g/peça * 2 peças = 50g total menos 10g do spool adicional = 40g no spool principal (sem dupla contagem)
        expect(hydrated.weightG).toBe(40);
        expect(hydrated.qty).toBe(2);
        expect(hydrated.printHours).toBe(3);
        expect(hydrated.printMinutes).toBe(20);
        expect(hydrated.manualMaterialName).toBe('PETG Fibra de Carbono');
        expect(hydrated.materialCostPerKg).toBe(185);
        expect(hydrated.additionalMaterials).toEqual(savedOrder.additionalMaterials);
        expect(hydrated.manualPrinterName).toBe('Bambu Lab X1E Custom');
        expect(hydrated.powerWatts).toBe(520);
        expect(hydrated.machineValue).toBe(14500);
        expect(hydrated.kwhRate).toBe(1.42);
        expect(hydrated.lifespanHours).toBe(9000);
        expect(hydrated.maintenancePercent).toBe(12);
        expect(hydrated.laborRatePerHour).toBe(48);
        expect(hydrated.costMode).toBe('per_batch');
        expect(hydrated.setupMinutes).toBe(15);
        expect(hydrated.postMinutes).toBe(35);
        expect(hydrated.packagingCost).toBe(4.5);
        expect(hydrated.hardwareCost).toBe(3.25);
        expect(hydrated.failPercent).toBe(8);
        expect(hydrated.selectedAuxItems).toEqual(savedOrder.auxiliaryItems);
        expect(hydrated.selectedMarketplaceId).toBe('ml_premium');
        expect(hydrated.commissionPercent).toBe(19);
        expect(hydrated.fixedFee).toBe(6);
        expect(hydrated.taxPercent).toBe(6.5);
        expect(hydrated.taxMode).toBe('per_sale');
        expect(hydrated.taxPassThrough).toBe('direct');
        expect(hydrated.markupPercent).toBe(110);
        expect(hydrated.discountType).toBe('fixed');
        expect(hydrated.discountValue).toBe(12);
        expect(hydrated.quoteItems).toEqual(savedOrder.quoteItems);

        // Arrays hidratados devem ser clones independentes
        expect(hydrated.additionalMaterials).not.toBe(savedOrder.additionalMaterials);
        expect(hydrated.selectedAuxItems).not.toBe(savedOrder.auxiliaryItems);
        expect(hydrated.quoteItems).not.toBe(savedOrder.quoteItems);
    });
});
