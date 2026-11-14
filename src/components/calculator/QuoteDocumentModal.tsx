import { useEffect } from 'react';
import { X, Printer, MessageCircle, FileCheck2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, formatCPFCNPJ, formatPhone } from '../../utils/formatters';
import { Button } from '../ui/Button';

export interface QuoteLineItem {
    id: string;
    partName: string;
    description?: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    weightG?: number;
    unitMaterial?: number;
    unitEnergy?: number;
    unitDepreciation?: number;
    unitLabor?: number;
    unitExtras?: number;
    unitProductionCost?: number;
    unitPlatformFee?: number;
    unitTaxAmount?: number;
    batchProfit?: number;
}

export interface QuoteDocumentData {
    quoteNumber?: string;
    partName: string;
    description?: string;
    photoUrl?: string;
    qty: number;
    unitPrice: number;
    shippingCost: number;
    totalPrice: number;
    channelName?: string;
    tierName?: string;
    date?: string;
    customerName?: string;
    customerDoc?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    notes?: string;
    items?: QuoteLineItem[];
}

interface QuoteDocumentModalProps {
    open: boolean;
    onClose: () => void;
    data: QuoteDocumentData | null;
}

export const QuoteDocumentModal = ({ open, onClose, data }: QuoteDocumentModalProps) => {
    const { settings } = useSettings();

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open || !data) return null;

    const { branding } = settings;
    const issueDate = data.date ? new Date(data.date) : new Date();
    const validUntil = new Date(issueDate);
    validUntil.setDate(validUntil.getDate() + (branding.quoteValidityDays || 7));

    const quoteCode =
        data.quoteNumber ||
        `ORC-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}${String(issueDate.getDate()).padStart(2, '0')}-${String(issueDate.getTime()).slice(-4)}`;

    const lineItems: QuoteLineItem[] =
        data.items && data.items.length > 0
            ? data.items
            : [
                {
                    id: 'main_item',
                    partName: data.partName || 'Projeto Personalizado 3D',
                    description: data.description || [data.tierName, data.channelName].filter(Boolean).join(' • '),
                    qty: data.qty,
                    unitPrice: data.unitPrice,
                    subtotal: Math.max(0, data.totalPrice - data.shippingCost)
                }
            ];

    const subtotalItems = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalQuote = subtotalItems + Math.max(0, data.shippingCost);

    const handlePrint = () => {
        window.print();
    };

    const handleSendWhatsApp = () => {
        const itemsText = lineItems
            .map(
                (item, idx) =>
                    `${lineItems.length > 1 ? `${idx + 1}. ` : ''}*${item.partName}* — ${item.qty} un. × ${formatCurrency(item.unitPrice)} = *${formatCurrency(item.subtotal)}*`
            )
            .join('\n');

        const lines = [
            `*ORÇAMENTO COMERCIAL - ${branding.companyName || 'Impressão 3D'}*`,
            `Código: ${quoteCode}`,
            data.customerName ? `Cliente: ${data.customerName}` : '',
            '',
            itemsText,
            data.shippingCost > 0 ? `*Frete / Envio:* ${formatCurrency(data.shippingCost)}` : '',
            `*TOTAL DO ORÇAMENTO:* ${formatCurrency(totalQuote)}`,
            data.channelName ? `Canal/Condição: ${data.channelName}` : '',
            `Validade da proposta: ${validUntil.toLocaleDateString('pt-BR')}`,
            data.notes ? `\nObs.: ${data.notes}` : ''
        ]
            .filter(Boolean)
            .join('\n');

        const digits = (data.customerPhone || '').replace(/\D/g, '');
        let waUrl = `https://wa.me/?text=${encodeURIComponent(lines)}`;
        if (digits.length >= 10) {
            const target = digits.length <= 11 ? `55${digits}` : digits;
            waUrl = `https://wa.me/${target}?text=${encodeURIComponent(lines)}`;
        }
        window.open(waUrl, '_blank');
    };

    return (
        <div
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Proposta Comercial (PDF)"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-zinc-100 dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto"
            >
                {/* Action Bar (hidden on print) */}
                <div className="no-print flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Proposta Comercial (PDF)</h3>
                            <p className="text-[11px] text-zinc-400">Custos internos e margens ocultos para o cliente</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={handleSendWhatsApp}>
                            <MessageCircle size={15} className="mr-1.5 text-emerald-500" />
                            WhatsApp
                        </Button>
                        <Button size="sm" onClick={handlePrint}>
                            <Printer size={15} className="mr-1.5" />
                            Salvar PDF / Imprimir
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label="Fechar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Printable Sheet */}
                <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
                    <div
                        id="printable-quote-document"
                        className="bg-white text-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-zinc-200 space-y-6"
                    >
                        {/* Header / Company Branding */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-zinc-200">
                            <div className="flex items-center gap-4">
                                {branding.companyLogoUrl && (
                                    <img
                                        src={branding.companyLogoUrl}
                                        alt={branding.companyName}
                                        className="h-12 w-12 object-contain rounded-xl bg-zinc-100 p-1.5 border border-zinc-200"
                                    />
                                )}
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-zinc-900">
                                        {branding.companyName || 'Impressão 3D Profissional'}
                                    </h2>
                                    <div className="text-xs text-zinc-500 space-y-0.5 mt-1">
                                        {branding.companyDoc && <p>CNPJ/CPF: {branding.companyDoc}</p>}
                                        {(branding.companyPhone || branding.companyEmail) && (
                                            <p>{[branding.companyPhone, branding.companyEmail].filter(Boolean).join(' • ')}</p>
                                        )}
                                        {branding.companyInstagram && <p>{branding.companyInstagram}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="sm:text-right">
                                <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                    Orçamento Oficial
                                </span>
                                <p className="text-sm font-bold text-zinc-900 mt-1.5">{quoteCode}</p>
                                <p className="text-xs text-zinc-500">Emissão: {issueDate.toLocaleDateString('pt-BR')}</p>
                                <p className="text-xs text-zinc-500">Válido até: {validUntil.toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        {/* Optional Project Photo + Customer Info */}
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                            {data.photoUrl && (
                                <div className="sm:w-32 shrink-0">
                                    <img
                                        src={data.photoUrl}
                                        alt={data.partName}
                                        className="w-full h-28 object-cover rounded-xl border border-zinc-200"
                                    />
                                </div>
                            )}

                            {(data.customerName || data.customerDoc || data.customerPhone || data.customerEmail || data.customerAddress) && (
                                <div className="flex-1 bg-zinc-50 rounded-xl p-4 border border-zinc-200/80 space-y-1 text-xs">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Dados do Cliente</p>
                                    {data.customerName && <p className="font-bold text-sm text-zinc-900">{data.customerName}</p>}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-600">
                                        {data.customerDoc && <span>Doc: {formatCPFCNPJ(data.customerDoc)}</span>}
                                        {data.customerPhone && <span>Tel: {formatPhone(data.customerPhone)}</span>}
                                        {data.customerEmail && <span>Email: {data.customerEmail}</span>}
                                    </div>
                                    {data.customerAddress && <p className="text-zinc-600 pt-0.5">{data.customerAddress}</p>}
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="overflow-hidden rounded-xl border border-zinc-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-900 text-white text-[11px] uppercase tracking-wider">
                                        <th className="py-3 px-4 font-bold">Descrição do Projeto / Peça</th>
                                        <th className="py-3 px-3 font-bold text-center">Qtd</th>
                                        <th className="py-3 px-4 font-bold text-right">Unitário</th>
                                        <th className="py-3 px-4 font-bold text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 text-sm">
                                    {lineItems.map(item => (
                                        <tr key={item.id}>
                                            <td className="py-3.5 px-4">
                                                <p className="font-bold text-zinc-900">{item.partName}</p>
                                                {item.description && (
                                                    <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-semibold text-zinc-700 tabular-nums">
                                                {item.qty}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-zinc-700 tabular-nums">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-zinc-900 tabular-nums">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full sm:w-64 space-y-2 text-sm">
                                <div className="flex justify-between text-zinc-600">
                                    <span>Subtotal dos itens</span>
                                    <span className="tabular-nums font-medium">{formatCurrency(subtotalItems)}</span>
                                </div>
                                {data.shippingCost > 0 && (
                                    <div className="flex justify-between text-zinc-600">
                                        <span>Frete / Envio</span>
                                        <span className="tabular-nums font-medium">{formatCurrency(data.shippingCost)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t-2 border-zinc-900 text-base font-black text-zinc-900">
                                    <span>Total do Orçamento</span>
                                    <span className="text-xl text-emerald-700 tabular-nums">{formatCurrency(totalQuote)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Terms */}
                        {(data.notes || branding.quoteTerms) && (
                            <div className="pt-4 border-t border-zinc-200 space-y-3 text-xs text-zinc-600">
                                {data.notes && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Observações do Projeto</p>
                                        <p className="whitespace-pre-line">{data.notes}</p>
                                    </div>
                                )}
                                {branding.quoteTerms && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Condições Comerciais</p>
                                        <p className="leading-relaxed">{branding.quoteTerms}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
