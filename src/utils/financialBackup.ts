import type { InventoryItem } from '../context/InventoryContext';
import { ExpenseRecord, Settings } from '../types/settings';
import { defaultSettings } from '../constants/defaultSettings';

export const EXPENSE_CATEGORIES: Array<{ value: ExpenseRecord['category']; label: string }> = [
    { value: 'filamento', label: 'Compra de Filamento/Resina' },
    { value: 'energia', label: 'Conta de Energia' },
    { value: 'manutencao', label: 'Manutenção / Peças' },
    { value: 'embalagem', label: 'Embalagens / Envios' },
    { value: 'marketing', label: 'Anúncios / Marketing' },
    { value: 'outros', label: 'Outros Custos Fixos' }
];

export interface FinancialMetrics {
    confirmedCount: number;
    pendingCount: number;
    pendingTotal: number;
    grossRevenue: number;
    productionCosts: number;
    totalExpenses: number;
    netBalance: number;
    avgMargin: number;
    receivables: number;
    receivedAmount: number;
}

const UNSAFE_JSON_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Remove recursivamente chaves perigosas (__proto__, constructor, prototype) de objetos importados via JSON.
 */
export function stripUnsafeKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(stripUnsafeKeys);
    }
    if (value && typeof value === 'object') {
        const clean: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            if (!UNSAFE_JSON_KEYS.has(key)) {
                clean[key] = stripUnsafeKeys(val);
            }
        }
        return clean;
    }
    return value;
}

/**
 * Valida se um registro importado possui estrutura mínima de pedido/orçamento para o inventário.
 */
export function isValidInventoryRecord(entry: unknown): entry is InventoryItem {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const item = entry as Record<string, unknown>;
    const validId = typeof item.id === 'number' && Number.isFinite(item.id);
    const validName = typeof item.partName === 'string' && item.partName.trim().length > 0;
    const validPrice = typeof item.tierRetail === 'number' && Number.isFinite(item.tierRetail);
    const validCosts = Boolean(item.costs && typeof item.costs === 'object' && !Array.isArray(item.costs));
    return validId && validName && validPrice && validCosts;
}

/**
 * Consolida receita bruta, custos de produção, despesas operacionais, lucro real e contas a receber.
 */
export function calculateFinancialMetrics(
    inventory: InventoryItem[],
    expenses: ExpenseRecord[] = []
): FinancialMetrics {
    const confirmedOrders = inventory.filter(
        item =>
            item.status === 'approved' ||
            item.status === 'printing' ||
            item.status === 'completed' ||
            item.status === 'delivered'
    );

    const pendingQuotes = inventory.filter(item => item.status === 'pending');

    let grossRevenue = 0;
    let productionCosts = 0;
    let receivables = 0;
    let receivedAmount = 0;

    confirmedOrders.forEach(item => {
        const qty = item.qty || 1;
        const orderCost =
            (item.costs.base * qty) +
            (item.costs.shipping || 0) +
            (item.costs.marketplaceFee || 0) +
            (item.costs.taxAmount || 0);

        grossRevenue += item.tierRetail;
        productionCosts += orderCost;

        const payStatus = item.paymentStatus || 'unpaid';
        if (payStatus === 'paid') {
            receivedAmount += item.tierRetail;
        } else if (payStatus === 'half') {
            receivedAmount += item.tierRetail * 0.5;
            receivables += item.tierRetail * 0.5;
        } else {
            receivables += item.tierRetail;
        }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netBalance = grossRevenue - productionCosts - totalExpenses;
    const avgMargin = grossRevenue > 0 ? (netBalance / grossRevenue) * 100 : 0;
    const pendingTotal = pendingQuotes.reduce((sum, item) => sum + item.tierRetail, 0);

    return {
        confirmedCount: confirmedOrders.length,
        pendingCount: pendingQuotes.length,
        pendingTotal,
        grossRevenue,
        productionCosts,
        totalExpenses,
        netBalance,
        avgMargin,
        receivables,
        receivedAmount
    };
}

export type BackupParseResult =
    | { ok: true; settings?: Settings; inventory?: InventoryItem[]; discardedCount: number }
    | { ok: false; errorMessage: string };

/**
 * Faz parsing e sanitização segura de um backup JSON completo (configurações + inventário).
 */
export function parseAndValidateBackupJson(rawText: string): BackupParseResult {
    let parsedRaw: unknown;
    try {
        parsedRaw = JSON.parse(rawText);
    } catch {
        return { ok: false, errorMessage: 'Erro ao ler o arquivo JSON de backup.' };
    }

    if (!parsedRaw || typeof parsedRaw !== 'object' || Array.isArray(parsedRaw)) {
        return { ok: false, errorMessage: 'Arquivo JSON inválido.' };
    }

    const parsed = stripUnsafeKeys(parsedRaw) as Record<string, unknown>;
    const rawSettings = parsed.settings;
    const hasValidSettings = Boolean(
        rawSettings && typeof rawSettings === 'object' && !Array.isArray(rawSettings)
    );
    const rawInventory = parsed.inventory;
    const hasInventoryArray = Array.isArray(rawInventory);

    if (!hasValidSettings && !hasInventoryArray) {
        return { ok: false, errorMessage: 'O JSON selecionado não contém dados válidos do Custos CyberMod.' };
    }

    let mergedSettings: Settings | undefined;
    if (hasValidSettings) {
        const candidate = rawSettings as Partial<Settings>;
        mergedSettings = {
            ...defaultSettings,
            ...candidate,
            tiers: Array.isArray(candidate.tiers) && candidate.tiers.length > 0 ? candidate.tiers : defaultSettings.tiers,
            extras: Array.isArray(candidate.extras) ? candidate.extras : defaultSettings.extras,
            printers: Array.isArray(candidate.printers) && candidate.printers.length > 0 ? candidate.printers : defaultSettings.printers,
            filaments: Array.isArray(candidate.filaments) && candidate.filaments.length > 0 ? candidate.filaments : defaultSettings.filaments,
            marketplaces: Array.isArray(candidate.marketplaces) && candidate.marketplaces.length > 0 ? candidate.marketplaces : defaultSettings.marketplaces,
            auxiliaryCatalog: Array.isArray(candidate.auxiliaryCatalog) ? candidate.auxiliaryCatalog : defaultSettings.auxiliaryCatalog,
            favorites: Array.isArray(candidate.favorites) ? candidate.favorites : defaultSettings.favorites,
            expenses: Array.isArray(candidate.expenses) ? candidate.expenses : defaultSettings.expenses,
            branding: {
                ...defaultSettings.branding,
                ...(candidate.branding && typeof candidate.branding === 'object' ? candidate.branding : {})
            }
        };
    }

    let validInventory: InventoryItem[] | undefined;
    let discardedCount = 0;
    if (hasInventoryArray) {
        const rawList = rawInventory as unknown[];
        const validItems = rawList.filter(isValidInventoryRecord);
        discardedCount = rawList.length - validItems.length;
        if (validItems.length === 0 && rawList.length > 0) {
            if (!hasValidSettings) {
                return { ok: false, errorMessage: 'Nenhum pedido válido foi encontrado na lista de inventário.' };
            }
        } else {
            validInventory = validItems;
        }
    }

    return {
        ok: true,
        settings: mergedSettings,
        inventory: validInventory,
        discardedCount
    };
}

/**
 * Gera conteúdo CSV separado por ponto e vírgula (padrão Excel PT-BR) para pedidos e despesas.
 */
export function buildFinancialCsvContent(
    inventory: InventoryItem[],
    expenses: ExpenseRecord[] = []
): string {
    const header = 'Tipo;Data;Descricao;Cliente;Status;Pagamento;Valor_Bruto;Custo_Producao\n';
    const orderRows = inventory
        .filter(i => i.status !== 'rejected')
        .map(i => {
            const qty = i.qty || 1;
            const cost = (i.costs.base * qty) + (i.costs.shipping || 0) + (i.costs.marketplaceFee || 0) + (i.costs.taxAmount || 0);
            return [
                'Pedido',
                new Date(i.date).toLocaleDateString('pt-BR'),
                `"${i.partName.replace(/"/g, '""')}"`,
                `"${(i.customerName || '-').replace(/"/g, '""')}"`,
                i.status,
                i.paymentStatus || 'unpaid',
                i.tierRetail.toFixed(2).replace('.', ','),
                cost.toFixed(2).replace('.', ',')
            ].join(';');
        });

    const expenseRows = expenses.map(exp =>
        [
            'Despesa',
            new Date(exp.date).toLocaleDateString('pt-BR'),
            `"${exp.description.replace(/"/g, '""')}"`,
            exp.category,
            'pago',
            'paid',
            `-${exp.amount.toFixed(2).replace('.', ',')}`,
            exp.amount.toFixed(2).replace('.', ',')
        ].join(';')
    );

    return '\uFEFF' + header + [...orderRows, ...expenseRows].join('\n');
}

/**
 * Dispara o download de um arquivo gerado localmente no navegador.
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
