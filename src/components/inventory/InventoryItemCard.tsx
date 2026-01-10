import { useState } from 'react';
import { formatCurrency, formatCPFCNPJ, formatPhone } from '../../utils/formatters';
import { InventoryItem, useInventory } from '../../context/InventoryContext';
import { Trash2, ArchiveRestore, CheckCircle2, XCircle, Pencil, ChevronDown, FileText, Phone, Mail, MapPin, StickyNote } from 'lucide-react';
import { motion, PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

import { ContactOptionsSheet } from './ContactOptionsSheet';

interface InventoryItemCardProps {
    item: InventoryItem;
    onEdit?: (item: InventoryItem) => void;
}

export const InventoryItemCard = ({ item, onEdit }: InventoryItemCardProps) => {
    const { removeFromInventory, updateStatus } = useInventory();
    const controls = useAnimation();
    const handleToggleStatus = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.status === 'rejected') {
            updateStatus(item.id, 'pending'); // Restore
        } else if (item.status === 'approved') {
            updateStatus(item.id, 'pending'); // Back to pending
        } else {
            updateStatus(item.id, 'approved'); // Approve
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.status === 'rejected') {
            removeFromInventory(item.id); // Permanently delete
        } else {
            updateStatus(item.id, 'rejected'); // Soft delete (bin)
        }
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [showContactSheet, setShowContactSheet] = useState(false);

    const hasCustomerData = item.customerDoc || item.customerPhone || item.customerEmail || item.customerAddress || item.notes;

    const isApproveActive = item.status === 'approved';
    const isRejectActive = item.status === 'rejected';

    return (
        <div className="relative mb-3 group">
            <motion.div
                animate={controls}
                className="relative z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                        <div className="flex items-start gap-2">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">{item.partName}</h3>
                        </div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                            {new Date(item.date).toLocaleDateString()} • {item.printTime}h
                            {item.customerName && (
                                <span className="block text-indigo-500 font-bold mt-0.5">{item.customerName}</span>
                            )}
                        </p>
                        <div className="pt-1">
                            <StatusBadge status={item.status} />
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <span className="block font-black text-xl text-indigo-600 dark:text-indigo-400 tabular-nums">
                            {formatCurrency(item.tierRetail * (item.selectedTier === 'wholesale' ? 1 : 1))}
                        </span>

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            {/* Approve / Restore Button */}
                            <button
                                onClick={handleToggleStatus}
                                title={item.status === 'rejected' ? "Restaurar" : isApproveActive ? "Desaprovar" : "Aprovar"}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all",
                                    isApproveActive
                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                )}
                            >
                                {item.status === 'rejected' ? <ArchiveRestore size={16} /> : <CheckCircle2 size={16} />}
                            </button>

                            {/* Delete / Reject Button */}
                            <button
                                onClick={handleDelete}
                                title={item.status === 'rejected' ? "Excluir Permanentemente" : "Mover para Lixeira"}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all",
                                    isRejectActive
                                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                        : "text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                )}
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

                            {/* Existing Actions */}
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    className="p-1.5 text-zinc-400 hover:text-indigo-500 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}

                            {hasCustomerData && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                    className={clsx(
                                        "p-1.5 text-zinc-400 hover:text-indigo-500 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                                        isExpanded && "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20"
                                    )}
                                    title="Expandir"
                                >
                                    <ChevronDown size={16} className={clsx("transition-transform", isExpanded && "rotate-180")} />
                                </button>
                            )}
                        </div>
                        {/* Status Badge moved below or removed? User wanted clearer control. I will keep it for text clarity below the buttons or hidden? 
                            The user said "alternar o status... Assim fica visualmente mais claro". 
                            The buttons themselves indicate status now (filled/colored). 
                            I'll remove the separate StatusBadge to cleaner look since the buttons carry the state color. 
                            Actually, explicit text is often better. I will put the StatusBadge below the action row if needed, 
                            but the request implies the buttons REPLACE the abstract control.
                            I will try removing the distinct StatusBadge component call here to reduce clutter, 
                            as the buttons now glow green/red. 
                            Wait, user might want to see "PENDING". 
                            I'll keep StatusBadge but maybe smaller or integrated? 
                            Let's keep it simple: Action Row replaces the old random icon row. 
                        */}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 pb-3 mb-3 border-t border-zinc-100 dark:border-zinc-800/50 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                                {item.customerDoc && (
                                    <div className="flex items-center gap-2">
                                        <FileText size={12} className="text-zinc-400" />
                                        <span>{formatCPFCNPJ(item.customerDoc)}</span>
                                    </div>
                                )}
                                {item.customerPhone && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowContactSheet(true); }}
                                            className="flex items-center gap-2 hover:text-indigo-500 transition-colors cursor-pointer group/link w-full text-left"
                                        >
                                            <Phone size={12} className="text-zinc-400 group-hover/link:text-indigo-500 transition-colors" />
                                            <span className="underline decoration-dashed decoration-zinc-300 group-hover/link:decoration-indigo-500 underline-offset-2">{formatPhone(item.customerPhone)}</span>
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
                                        className="flex items-center gap-2 hover:text-indigo-500 transition-colors cursor-pointer group/link"
                                    >
                                        <Mail size={12} className="text-zinc-400 group-hover/link:text-indigo-500 transition-colors" />
                                        <span className="break-all underline decoration-dashed decoration-zinc-300 group-hover/link:decoration-indigo-500 underline-offset-2">{item.customerEmail}</span>
                                    </a>
                                )}
                                {item.customerAddress && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.customerAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-2 hover:text-indigo-500 transition-colors cursor-pointer group/link"
                                    >
                                        <MapPin size={12} className="text-zinc-400 group-hover/link:text-indigo-500 transition-colors" />
                                        <span className="underline decoration-dashed decoration-zinc-300 group-hover/link:decoration-indigo-500 underline-offset-2">{item.customerAddress}</span>
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

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{item.weightG}g</span>
                    </div>
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50"></span>
                            Mão de Obra: {formatCurrency(item.costs.labor)}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50"></span>
                            Material: {formatCurrency(item.costs.material)}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: InventoryItem['status'] }) => {
    switch (status) {
        case 'approved': return <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">Aprovado</span>;
        case 'rejected': return <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">Lixeira</span>;
        default: return <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase">Pendente</span>;
    }
};
