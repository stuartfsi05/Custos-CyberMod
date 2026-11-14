import type { InventoryItem, InventoryItemStatus } from '../context/InventoryContext';
import type { QuoteLineItem } from '../components/calculator/QuoteDocumentModal';
import { formatCurrency } from './formatters';

/**
 * Normaliza um número de telefone brasileiro adicionando DDI 55 quando necessário.
 */
export function formatWhatsAppTarget(phoneNumber?: string, includePlus = false): string {
    const digits = (phoneNumber || '').replace(/\D/g, '');
    if (!digits) return '';

    const normalized = digits.length >= 10 && digits.length <= 11 ? `55${digits}` : digits;
    return includePlus ? `+${normalized}` : normalized;
}

export interface QuickQuoteWhatsAppParams {
    companyName?: string;
    customerName?: string;
    customerPhone?: string;
    projectName: string;
    qty: number;
    unitSellPrice: number;
    batchSellPrice: number;
    shippingCost: number;
    quoteItems: QuoteLineItem[];
}

/**
 * Monta a URL `wa.me` com resumo comercial para orçamento rápido da Calculadora.
 */
export function buildQuickQuoteWhatsAppUrl(params: QuickQuoteWhatsAppParams): string {
    const itemsText =
        params.quoteItems.length > 0
            ? params.quoteItems
                  .map(
                      (i, idx) =>
                          `${idx + 1}. *${i.partName}* (${i.qty}x ${formatCurrency(i.unitPrice)}) = *${formatCurrency(i.subtotal)}*`
                  )
                  .join('\n')
            : `*${params.projectName.trim() || 'Projeto 3D'}* — ${params.qty} un. × ${formatCurrency(params.unitSellPrice)}`;

    const totalQuote =
        params.quoteItems.length > 0
            ? params.quoteItems.reduce((sum, item) => sum + item.subtotal, 0) + params.shippingCost
            : params.batchSellPrice;

    const text = [
        `*ORÇAMENTO ${params.companyName || '3D'}*`,
        params.customerName ? `Cliente: ${params.customerName}` : '',
        itemsText,
        params.shippingCost > 0 ? `Frete: ${formatCurrency(params.shippingCost)}` : '',
        `*TOTAL:* ${formatCurrency(totalQuote)}`
    ]
        .filter(Boolean)
        .join('\n');

    const target = formatWhatsAppTarget(params.customerPhone);
    return target
        ? `https://wa.me/${target}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Monta a URL `wa.me` com mensagem contextualizada pela etapa de produção do pedido.
 */
export function buildOrderStatusWhatsAppUrl(item: InventoryItem, companyName?: string): string {
    const statusMsgMap: Record<InventoryItemStatus, string> = {
        pending: `Olá${item.customerName ? ` ${item.customerName}` : ''}! Segue seu orçamento da peça *${item.partName}* (${item.qty || 1} un.) no valor de *${formatCurrency(item.tierRetail)}*. Qualquer dúvida estou à disposição!`,
        approved: `Olá${item.customerName ? ` ${item.customerName}` : ''}! Seu pedido *${item.partName}* foi confirmado e já entrou na fila de produção da ${companyName || 'nossa oficina 3D'}!`,
        printing: `Atualização de Produção: Sua peça *${item.partName}* está sendo impressa neste momento! Avisaremos assim que finalizar.`,
        completed: `Boas notícias${item.customerName ? `, ${item.customerName}` : ''}! Sua peça *${item.partName}* ficou pronta e passou na revisão final. Podemos combinar a entrega/retirada?`,
        delivered: `Obrigado pela preferência${item.customerName ? `, ${item.customerName}` : ''}! Pedido *${item.partName}* entregue. Conte sempre conosco para novos projetos 3D!`,
        rejected: `Olá! Referente ao orçamento *${item.partName}*, podemos retomar quando desejar.`
    };

    const msg = statusMsgMap[item.status] || statusMsgMap.pending;
    const target = formatWhatsAppTarget(item.customerPhone);
    return target
        ? `https://wa.me/${target}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
