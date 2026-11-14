import { useState, useMemo } from 'react';
import { useInventory, InventoryItem } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { InventoryItemCard } from '../components/inventory/InventoryItemCard';
import { EditItemDialog } from '../components/inventory/EditItemDialog';
import { QuoteDocumentModal, QuoteDocumentData } from '../components/calculator/QuoteDocumentModal';
import { formatCurrency } from '../utils/formatters';
import { Search, Archive, X } from 'lucide-react';
import { TEXTS } from '../constants/texts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';

type PipelineFilter = 'all' | 'pending' | 'production' | 'done' | 'trash';

const FILTER_TABS: Array<{ id: PipelineFilter; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Orçamentos' },
    { id: 'production', label: 'Produção' },
    { id: 'done', label: 'Concluídos' },
    { id: 'trash', label: 'Lixeira' }
];

interface InventoryScreenProps {
    onReopenInCalculator?: (item: InventoryItem) => void;
}

export const InventoryScreen = ({ onReopenInCalculator }: InventoryScreenProps) => {
    const { inventory, clearTrash } = useInventory();
    const { settings } = useSettings();
    const [filterMode, setFilterMode] = useState<PipelineFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [pdfQuoteItem, setPdfQuoteItem] = useState<InventoryItem | null>(null);
    const [confirmClearTrash, setConfirmClearTrash] = useState(false);

    const counts = useMemo<Record<PipelineFilter, number>>(() => {
        const res: Record<PipelineFilter, number> = {
            all: 0,
            pending: 0,
            production: 0,
            done: 0,
            trash: 0
        };
        inventory.forEach(item => {
            if (item.status === 'rejected') {
                res.trash += 1;
                return;
            }
            res.all += 1;
            if (item.status === 'pending') res.pending += 1;
            else if (item.status === 'approved' || item.status === 'printing') res.production += 1;
            else if (item.status === 'completed' || item.status === 'delivered') res.done += 1;
        });
        return res;
    }, [inventory]);

    const filteredItems = useMemo(() => {
        const query = searchTerm.toLowerCase();
        return inventory
            .filter(item => {
                const matchesSearch =
                    item.partName.toLowerCase().includes(query) ||
                    (item.customerName || '').toLowerCase().includes(query);
                if (!matchesSearch) return false;

                switch (filterMode) {
                    case 'pending':
                        return item.status === 'pending';
                    case 'production':
                        return item.status === 'approved' || item.status === 'printing';
                    case 'done':
                        return item.status === 'completed' || item.status === 'delivered';
                    case 'trash':
                        return item.status === 'rejected';
                    case 'all':
                    default:
                        return item.status !== 'rejected';
                }
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [inventory, filterMode, searchTerm]);

    const stats = useMemo(() => {
        return filteredItems.reduce((acc, item) => {
            const itemQty = item.qty || 1;
            const fallbackProfit =
                item.tierRetail -
                (item.costs.base * itemQty) -
                (item.costs.shipping || 0) -
                (item.costs.marketplaceFee || 0) -
                (item.costs.taxAmount || 0);
            return {
                totalValue: acc.totalValue + item.tierRetail,
                totalWeight: acc.totalWeight + (item.weightG * itemQty),
                totalProfit: acc.totalProfit + (item.netProfit ?? fallbackProfit)
            };
        }, { totalValue: 0, totalWeight: 0, totalProfit: 0 });
    }, [filteredItems]);

    const quoteModalData: QuoteDocumentData | null = pdfQuoteItem
        ? {
            quoteNumber: `PED-${pdfQuoteItem.id.toString().slice(-6)}`,
            partName: pdfQuoteItem.partName,
            description: pdfQuoteItem.description,
            photoUrl: pdfQuoteItem.photoUrl,
            qty: pdfQuoteItem.qty || 1,
            unitPrice:
                Math.max(0, pdfQuoteItem.tierRetail - (pdfQuoteItem.costs.shipping || 0)) /
                Math.max(1, pdfQuoteItem.qty || 1),
            shippingCost: pdfQuoteItem.costs.shipping || 0,
            totalPrice: pdfQuoteItem.tierRetail,
            channelName: settings.marketplaces.find(m => m.id === pdfQuoteItem.marketplaceId)?.name,
            tierName: settings.tiers.find(t => t.id === pdfQuoteItem.selectedTier)?.name,
            date: pdfQuoteItem.date,
            customerName: pdfQuoteItem.customerName,
            customerDoc: pdfQuoteItem.customerDoc,
            customerPhone: pdfQuoteItem.customerPhone,
            customerEmail: pdfQuoteItem.customerEmail,
            customerAddress: pdfQuoteItem.customerAddress,
            notes: pdfQuoteItem.notes,
            items: pdfQuoteItem.quoteItems
        }
        : null;

    return (
        <div className="space-y-6 pb-32">
            <header className="mb-6 pt-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-1">
                    {TEXTS.APP.INVENTORY}
                </h1>
                <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    CRM de pedidos, fila de produção e propostas comerciais.
                </p>
            </header>

            {/* Pipeline Tabs */}
            <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl gap-1 overflow-x-auto">
                {FILTER_TABS.map(tab => (
                    <button
                        type="button"
                        key={tab.id}
                        onClick={() => {
                            setFilterMode(tab.id);
                            setConfirmClearTrash(false);
                        }}
                        className={clsx(
                            'flex-1 min-w-[90px] py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                            filterMode === tab.id
                                ? tab.id === 'trash'
                                    ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-600 dark:text-red-400 ring-1 ring-red-500/30'
                                    : 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                        )}
                    >
                        <span className="inline-flex items-center justify-center gap-1.5">
                            <span>{tab.label}</span>
                            <span
                                className={clsx(
                                    'px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums',
                                    filterMode === tab.id
                                        ? tab.id === 'trash'
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                )}
                            >
                                {counts[tab.id]}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por projeto ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] py-3.5 pl-12 pr-11 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm placeholder:text-zinc-400/80"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        aria-label="Limpar busca"
                        title="Limpar busca"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 px-1">
                <strong className="text-zinc-600 dark:text-zinc-300">Dica:</strong> Clique no selo de pagamento (<span className="font-semibold">A Receber / Sinal 50% / Pago</span>) para atualizar o caixa, ou no ícone da calculadora para reabrir todos os dados técnicos do pedido.
            </p>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">Faturamento</p>
                    <p className="text-xl md:text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight tabular-nums">
                        {formatCurrency(stats.totalValue)}
                    </p>
                </div>
                <div className="bg-cyan-50/50 dark:bg-cyan-900/10 p-4 rounded-2xl border border-cyan-100 dark:border-cyan-900/20 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold mb-1">Lucro Est.</p>
                    <p className="text-xl md:text-2xl font-black text-cyan-900 dark:text-cyan-100 tracking-tight tabular-nums">
                        {formatCurrency(stats.totalProfit)}
                    </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-1">Material</p>
                    <p className="text-xl md:text-2xl font-black text-blue-900 dark:text-blue-100 tracking-tight tabular-nums">
                        {(stats.totalWeight / 1000).toFixed(2)} <span className="text-xs opacity-60 font-bold">kg</span>
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filterMode === 'trash' && filteredItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                    >
                        <span className="font-medium">{TEXTS.INVENTORY.TRASH_WARNING}</span>
                        {confirmClearTrash ? (
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setConfirmClearTrash(false)}
                                    className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 font-bold hover:bg-red-100 dark:hover:bg-red-900/40"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearTrash();
                                        setConfirmClearTrash(false);
                                        toast.success('Lixeira esvaziada.');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                                >
                                    Confirmar exclusão
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setConfirmClearTrash(true)}
                                className="font-bold underline hover:no-underline px-2 py-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors shrink-0"
                            >
                                {TEXTS.INVENTORY.BTN_CLEAR_TRASH}
                            </button>
                        )}
                    </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <InventoryItemCard
                                key={item.id}
                                item={item}
                                onEdit={filterMode !== 'trash' ? setEditingItem : undefined}
                                onOpenPdf={filterMode !== 'trash' ? setPdfQuoteItem : undefined}
                                onReopenInCalculator={filterMode !== 'trash' ? onReopenInCalculator : undefined}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16 text-zinc-400 flex flex-col items-center justify-center gap-4 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm"
                        >
                            <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-sm">
                                <Archive size={32} className="text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <div>
                                <p className="font-medium text-zinc-500 dark:text-zinc-400">{TEXTS.INVENTORY.EMPTY_STATE}</p>
                                <p className="text-xs text-zinc-400 mt-1 max-w-[220px] mx-auto opacity-70">
                                    {filterMode === 'trash' ? 'A lixeira está vazia.' : 'Seus orçamentos e pedidos aparecerão aqui.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <EditItemDialog
                item={editingItem}
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
            />

            <QuoteDocumentModal
                open={!!pdfQuoteItem}
                onClose={() => setPdfQuoteItem(null)}
                data={quoteModalData}
            />
        </div>
    );
};
