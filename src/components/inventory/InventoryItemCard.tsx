import { formatCurrency } from '../../utils/formatters';
import { InventoryItem, useInventory } from '../../context/InventoryContext';
import { Trash2, ArchiveRestore, CheckCircle2, XCircle } from 'lucide-react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface InventoryItemCardProps {
    item: InventoryItem;
}

export const InventoryItemCard = ({ item }: InventoryItemCardProps) => {
    const { removeFromInventory, updateStatus } = useInventory();
    const controls = useAnimation();
    const isTrashed = item.status === 'rejected'; // We treat rejected as trash for this view context usually or separate logic

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const threshold = 100;

        if (offset < -threshold) {
            // Swipe Left -> Delete/Reject
            if (item.status === 'rejected') {
                removeFromInventory(item.id);
            } else {
                updateStatus(item.id, 'rejected');
            }
        } else if (offset > threshold) {
            // Swipe Right -> Approve/Restore
            if (item.status === 'rejected') {
                updateStatus(item.id, 'pending'); // Restore to pending
            } else {
                updateStatus(item.id, 'approved');
            }
        } else {
            controls.start({ x: 0 });
        }
    };

    const StatusBadge = () => {
        switch (item.status) {
            case 'approved': return <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">Aprovado</span>;
            case 'rejected': return <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">Lixeira</span>;
            default: return <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase">Pendente</span>;
        }
    };

    return (
        <div className="relative mb-3 group">
            {/* Background Actions Layer */}
            <div className="absolute inset-0 rounded-2xl flex items-center justify-between px-6 z-0">
                <div className="flex items-center gap-2 text-emerald-500 font-bold opacity-0 group-active:opacity-100 transition-opacity">
                    <CheckCircle2 /> <span>{item.status === 'rejected' ? 'Restaurar' : 'Aprovar'}</span>
                </div>
                <div className="flex items-center gap-2 text-red-500 font-bold opacity-0 group-active:opacity-100 transition-opacity">
                    <span>{item.status === 'rejected' ? 'Excluir' : 'Rejeitar'}</span> <Trash2 />
                </div>
            </div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="relative z-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm touch-pan-y"
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{item.partName}</h3>
                        <p className="text-xs text-zinc-500">{new Date(item.date).toLocaleDateString()} • {item.printTime}h</p>
                    </div>
                    <div className="text-right">
                        <span className="block font-black text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(item.tierRetail * (item.selectedTier === 'wholesale' ? 1 : 1))}
                        </span>
                        <StatusBadge />
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex gap-4 text-xs text-zinc-500">
                    <span>{item.weightG}g</span>
                    <span>M.O: {formatCurrency(item.costs.labor)}</span>
                    <span>Mat: {formatCurrency(item.costs.material)}</span>
                </div>
            </motion.div>
        </div>
    );
};
