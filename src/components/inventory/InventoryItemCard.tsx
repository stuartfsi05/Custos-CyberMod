import { useState } from 'react';
import { formatCurrency, formatCPFCNPJ, formatPhone } from '../../utils/formatters';
import { buildOrderStatusWhatsAppUrl } from '../../utils/whatsappFormatter';
import {
    InventoryItem,
    PaymentStatus,
    useInventory
} from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import {
    Trash2,
    ArchiveRestore,
    CheckCircle2,
    Pencil,
    ChevronDown,
    FileText,
    Phone,
    Mail,
    MapPin,
    StickyNote,
    Printer,
    MessageCircle,
    PackageMinus,
    Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { ContactOptionsSheet } from './ContactOptionsSheet';
import { NEXT_PAYMENT, PIPELINE_STEPS } from '../../constants/inventoryPipeline';
import { PaymentBadge, StatusBadge } from './InventoryBadges';

interface InventoryItemCardProps {
    item: InventoryItem;
    onEdit?: (item: InventoryItem) => void;
    onOpenPdf?: (item: InventoryItem) => void;
    onReopenInCalculator?: (item: InventoryItem) => void;
}

export const InventoryItemCard = ({ item, onEdit, onOpenPdf, onReopenInCalculator }: InventoryItemCardProps) => {
    const { removeFromInventory, updateStatus, updatePaymentStatus, updateInventoryItem } = useInventory();
    const { settings, deductFilamentWeight } = useSettings();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showContactSheet, setShowContactSheet] = useState(false);

    const handleToggleApprove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.status === 'rejected') {
            updateStatus(item.id, 'pending');
        } else if (item.status === 'pending') {
            updateStatus(item.id, 'approved');
        } else {
            updateStatus(item.id, 'pending');
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.status === 'rejected') {
            removeFromInventory(item.id);
        } else {
            updateStatus(item.id, 'rejected');
        }
    };

    const handleDeductStock = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!item.filamentId || item.stockDeducted) return;
        const totalGrams = item.weightG * (item.qty || 1);
        const additionalList = item.additionalMaterials || [];
        const extraGrams = additionalList.reduce(
            (sum, mat) => sum + (Number.isFinite(mat.weightG) ? Math.max(0, mat.weightG) : 0),
            0
        );
        const mainGrams = Math.max(0, totalGrams - extraGrams);

        if (mainGrams > 0) {
            deductFilamentWeight(item.filamentId, mainGrams);
        }
        additionalList.forEach(mat => {
            if (mat.filamentId && mat.weightG > 0) {
                deductFilamentWeight(mat.filamentId, mat.weightG);
            }
        });

        updateInventoryItem(item.id, { stockDeducted: true });
        toast.success(`Baixado ${totalGrams.toFixed(0)}g do estoque!`);
    };

    const handleNotifyWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(buildOrderStatusWhatsAppUrl(item, settings.branding.companyName), '_blank');
    };

    const hasCustomerData = Boolean(
        item.customerDoc || item.customerPhone || item.customerEmail || item.customerAddress || item.notes
    );

    const printer = settings.printers.find(p => p.id === item.printerId);
    const filament = settings.filaments.find(f => f.id === item.filamentId);
    const marketplace = settings.marketplaces.find(m => m.id === item.marketplaceId);
    const currentPayment: PaymentStatus = item.paymentStatus || 'unpaid';
    const isRejected = item.status === 'rejected';
    const isProductionActive = item.status !== 'pending' && !isRejected;

    return (
        <div className="relative mb-3 group">
            <motion.div
                layout
                className="relative z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                                {item.partName}
                            </h3>
                            {(item.qty || 1) > 1 && (
                                <span className="text-[10px] font-black bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full">
                                    {item.qty}x
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-zinc-400">
                            {new Date(item.date).toLocaleDateString('pt-BR')} • {item.printTime || '0:00'}h
                            {item.customerName && (
                                <span className="block text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{item.customerName}</span>
                            )}
                        </p>
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={item.status} />
                            {!isRejected && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updatePaymentStatus(item.id, NEXT_PAYMENT[currentPayment]);
                                    }}
                                    title="Clique para alternar status do pagamento"
                                >
                                    <PaymentBadge status={currentPayment} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <span className="block font-black text-base md:text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatCurrency(item.tierRetail)}
                        </span>
                        {item.netProfit !== undefined && (
                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                                Lucro: {formatCurrency(item.netProfit)}
                            </span>
                        )}

                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={handleToggleApprove}
                                aria-label={isRejected ? `Restaurar ${item.partName}` : isProductionActive ? `Voltar ${item.partName} para Orçamento` : `Aprovar ${item.partName} para Fila`}
                                title={isRejected ? 'Restaurar' : isProductionActive ? 'Voltar para Orçamento' : 'Aprovar para Fila'}
                                className={clsx(
                                    'p-1.5 rounded-md transition-all',
                                    isProductionActive
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                )}
                            >
                                {isRejected ? <ArchiveRestore size={15} /> : <CheckCircle2 size={15} />}
                            </button>

                            {onOpenPdf && !isRejected && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onOpenPdf(item); }}
                                    aria-label={`Gerar orçamento PDF de ${item.partName}`}
                                    title="Gerar Orçamento / PDF"
                                    className="p-1.5 text-zinc-400 hover:text-cyan-600 rounded-md hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                                >
                                    <Printer size={15} />
                                </button>
                            )}

                            {!isRejected && (
                                <button
                                    type="button"
                                    onClick={handleNotifyWhatsApp}
                                    aria-label={`Notificar cliente sobre ${item.partName} no WhatsApp`}
                                    title="Notificar cliente no WhatsApp"
                                    className="p-1.5 text-zinc-400 hover:text-emerald-500 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                >
                                    <MessageCircle size={15} />
                                </button>
                            )}

                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    aria-label={`Editar pedido ${item.partName}`}
                                    className="p-1.5 text-zinc-400 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    title="Editar"
                                >
                                    <Pencil size={15} />
                                </button>
                            )}

                            {onReopenInCalculator && !isRejected && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onReopenInCalculator(item); }}
                                    aria-label={`Reabrir ${item.partName} na Calculadora`}
                                    className="p-1.5 text-zinc-400 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    title="Reabrir na Calculadora"
                                >
                                    <Calculator size={15} />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleDelete}
                                aria-label={isRejected ? `Excluir permanentemente ${item.partName}` : `Mover ${item.partName} para Lixeira`}
                                title={isRejected ? 'Excluir Permanentemente' : 'Mover para Lixeira'}
                                className={clsx(
                                    'p-1.5 rounded-md transition-all',
                                    isRejected
                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                )}
                            >
                                <Trash2 size={15} />
                            </button>

                            {hasCustomerData && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                    aria-label={isExpanded ? `Recolher dados do cliente de ${item.partName}` : `Expandir dados do cliente de ${item.partName}`}
                                    className={clsx(
                                        'p-1.5 text-zinc-400 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                                        isExpanded && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    )}
                                    title="Expandir dados do cliente"
                                >
                                    <ChevronDown size={15} className={clsx('transition-transform', isExpanded && 'rotate-180')} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Production Pipeline Quick Switcher */}
                {!isRejected && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {PIPELINE_STEPS.map(step => (
                            <button
                                type="button"
                                key={step.id}
                                onClick={(e) => { e.stopPropagation(); updateStatus(item.id, step.id); }}
                                className={clsx(
                                    'px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border',
                                    item.status === step.id
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-zinc-200/70 dark:border-zinc-700/70 hover:text-zinc-800 dark:hover:text-zinc-200'
                                )}
                            >
                                {step.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Machine / Material / Stock Action Chips */}
                {(printer || filament || marketplace) && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {printer && (
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                                {printer.name}
                            </span>
                        )}
                        {filament && (
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: filament.colorHex }} />
                                {filament.name}
                            </span>
                        )}
                        {marketplace && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold">
                                {marketplace.name}
                            </span>
                        )}
                        {item.filamentId && !item.stockDeducted && !isRejected && (
                            <button
                                type="button"
                                onClick={handleDeductStock}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                                <PackageMinus size={11} />
                                Baixar Estoque
                            </button>
                        )}
                        {item.stockDeducted && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50/70 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                                Estoque baixado
                            </span>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800/50 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                                {item.customerDoc && (
                                    <div className="flex items-center gap-2">
                                        <FileText size={12} className="text-zinc-400" />
                                        <span>{formatCPFCNPJ(item.customerDoc)}</span>
                                    </div>
                                )}
                                {item.customerPhone && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setShowContactSheet(true); }}
                                            className="flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer group/link w-full text-left"
                                        >
                                            <Phone size={12} className="text-zinc-400 group-hover/link:text-emerald-600 transition-colors" />
                                            <span className="underline decoration-dashed decoration-zinc-300 group-hover/link:decoration-emerald-500 underline-offset-2">
                                                {formatPhone(item.customerPhone)}
                                            </span>
                                        </button>
                                        <ContactOptionsSheet
                                            open={showContactSheet}
                                            onOpenChange={setShowContactSheet}
                                            phoneNumber={item.customerPhone}
                                        />
                                    </>
                                )}
                                {item.customerEmail && (
                                    <a
                                        href={`mailto:${item.customerEmail}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer group/link"
                                    >
                                        <Mail size={12} className="text-zinc-400 group-hover/link:text-emerald-600 transition-colors" />
                                        <span className="break-all underline decoration-dashed decoration-zinc-300 group-hover/link:decoration-emerald-500 underline-offset-2">
                                            {item.customerEmail}
                                        </span>
                                    </a>
                                )}
                                {item.customerAddress && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.customerAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-2 hover:text-emerald-600 transition-colors cursor-pointer group/link"
                                    >
                                        <MapPin size={12} className="text-zinc-400 group-hover/link:text-emerald-600 transition-colors" />
                                        <span className="underline decoration-dashed decoration-zinc-300 group-hover/link:decoration-emerald-500 underline-offset-2">
                                            {item.customerAddress}
                                        </span>
                                    </a>
                                )}
                                {item.notes && (
                                    <div className="mt-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <StickyNote size={12} className="text-zinc-400" />
                                            <span className="font-bold text-[10px] uppercase tracking-wider">Notas</span>
                                        </div>
                                        <p className="italic">{item.notes}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md font-bold">
                            {(item.weightG * (item.qty || 1)).toFixed(0)}g
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
                            Custo Base: {formatCurrency(item.costs.base * (item.qty || 1))}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                            Mat.: {formatCurrency(item.costs.material * (item.qty || 1))}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
