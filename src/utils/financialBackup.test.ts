import { describe, expect, it } from 'vitest';
import {
    buildFinancialCsvContent,
    calculateFinancialMetrics,
    isValidInventoryRecord,
    parseAndValidateBackupJson,
    stripUnsafeKeys
} from './financialBackup';
import type { InventoryItem } from '../context/InventoryContext';

function makeOrder(overrides: Partial<InventoryItem> = {}): InventoryItem {
    return {
        id: 1001,
        partName: 'Suporte VESA',
        weightG: 50,
        printTime: '2:00',
        workTime: '0:20',
        costs: {
            material: 6,
            machine: 4,
            labor: 10,
            extras: 2,
            base: 22,
            shipping: 0,
            marketplaceFee: 5,
            taxAmount: 3
        },
        tierRetail: 80,
        selectedTier: 'custom_markup',
        qty: 2,
        paymentStatus: 'paid',
        status: 'approved',
        date: '2026-11-10T10:00:00.000Z',
        ...overrides
    };
}

describe('financialBackup utilities', () => {
    it('calcula métricas financeiras considerando pedidos confirmados, sinal 50%, pendentes e despesas', () => {
        const inventory: InventoryItem[] = [
            makeOrder({ id: 1, tierRetail: 100, paymentStatus: 'paid', status: 'delivered' }), // cost = 22*2 + 5 + 3 = 52
            makeOrder({ id: 2, tierRetail: 60, qty: 1, paymentStatus: 'half', status: 'printing' }), // cost = 22*1 + 5 + 3 = 30, recv 30, rec 30
            makeOrder({ id: 3, tierRetail: 40, qty: 1, paymentStatus: 'unpaid', status: 'pending' }), // orçamento (não entra na receita)
            makeOrder({ id: 4, tierRetail: 200, status: 'rejected' }) // lixeira (ignorado)
        ];

        const metrics = calculateFinancialMetrics(inventory, [
            { id: 'e1', description: 'Bico 0.4', category: 'manutencao', amount: 18, date: '2026-11-10T10:00:00.000Z' }
        ]);

        expect(metrics.confirmedCount).toBe(2);
        expect(metrics.pendingCount).toBe(1);
        expect(metrics.pendingTotal).toBe(40);
        expect(metrics.grossRevenue).toBe(160);
        expect(metrics.productionCosts).toBe(82);
        expect(metrics.totalExpenses).toBe(18);
        expect(metrics.netBalance).toBe(60);
        expect(metrics.receivedAmount).toBe(130);
        expect(metrics.receivables).toBe(30);
        expect(metrics.avgMargin).toBeCloseTo(37.5, 2);
    });

    it('remove chaves perigosas (__proto__, constructor, prototype) recursivamente', () => {
        const maliciousJson = '{"safe": 1, "__proto__": {"polluted": true}, "nested": {"constructor": "bad", "ok": "yes"}}';
        const parsed = JSON.parse(maliciousJson);
        const sanitized = stripUnsafeKeys(parsed) as Record<string, unknown>;

        expect(Object.prototype.hasOwnProperty.call(sanitized, '__proto__')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(sanitized.nested as object, 'constructor')).toBe(false);
        expect(sanitized.safe).toBe(1);
        expect((sanitized.nested as Record<string, unknown>).ok).toBe('yes');
    });

    it('valida registros do inventário e faz parse seguro do backup JSON descartando itens malformados', () => {
        const validOrder = makeOrder();
        const backupRaw = JSON.stringify({
            settings: { theme: 'dark', kwhRate: 1.2 },
            inventory: [
                validOrder,
                { id: 'bad-id', partName: 'Inválido' },
                { id: 99, partName: '', tierRetail: 10, costs: {} }
            ]
        });

        expect(isValidInventoryRecord(validOrder)).toBe(true);
        expect(isValidInventoryRecord(null)).toBe(false);

        const result = parseAndValidateBackupJson(backupRaw);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.settings?.theme).toBe('dark');
            expect(result.settings?.kwhRate).toBe(1.2);
            expect(result.inventory).toHaveLength(1);
            expect(result.discardedCount).toBe(2);
        }
    });

    it('gera CSV com BOM UTF-8, pedidos ativos e despesas sem incluir lixeira', () => {
        const csv = buildFinancialCsvContent(
            [makeOrder({ partName: 'Suporte "Pro"' }), makeOrder({ id: 2, partName: 'Lixo', status: 'rejected' })],
            [{ id: 'exp1', description: 'Cola', category: 'embalagem', amount: 12.5, date: '2026-11-12T10:00:00.000Z' }]
        );

        expect(csv.startsWith('\uFEFF')).toBe(true);
        expect(csv).toContain('Suporte ""Pro""');
        expect(csv).not.toContain('Lixo');
        expect(csv).toContain('Despesa;');
        expect(csv).toContain('-12,50');
    });
});
