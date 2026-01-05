import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItemCard } from '../components/inventory/InventoryItemCard';
import { formatCurrency } from '../utils/formatters';
import { Search, Trash2, Archive } from 'lucide-react';
import { TEXTS } from '../constants/texts';
import { motion, AnimatePresence } from 'framer-motion';

export const InventoryScreen = () => {
    const { inventory, clearInventory } = useInventory();
    const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
    const [searchTerm, setSearchTerm] = useState('');

    // Memoized Filtering (Critique #7)
    const filteredItems = useMemo(() => {
        return inventory
            .filter(item => {
                const matchesSearch = item.partName.toLowerCase().includes(searchTerm.toLowerCase());
                if (viewMode === 'active') {
                    return item.status !== 'rejected' && matchesSearch;
                }
                return item.status === 'rejected' && matchesSearch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [inventory, viewMode, searchTerm]);

    const stats = useMemo(() => {
        return filteredItems.reduce((acc, item) => ({
            totalValue: acc.totalValue + item.tierRetail,
            totalWeight: acc.totalWeight + item.weightG
        }), { totalValue: 0, totalWeight: 0 });
    }, [filteredItems]);

    return (
        <div className="space-y-6 pb-28">
            <header className="mb-6 pt-2">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 tracking-tighter mb-2">
                    {TEXTS.APP.INVENTORY}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Gerencie seus projetos e histórico.</p>
            </header>

            {/* View Mode Toggle / Tabs */}
            <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl relative">
                <button
                    onClick={() => setViewMode('active')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'active'
                        ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 ring-1 ring-black/5 dark:ring-white/5'
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                >
                    <Archive size={18} />
                    {TEXTS.INVENTORY.TAB_ACTIVE}
                </button>
                <button
                    onClick={() => setViewMode('trash')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'trash'
                        ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-500 ring-1 ring-red-500/10'
                        : 'text-zinc-400 hover:text-red-500/70'
                        }`}
                >
                    <Trash2 size={18} />
                    {TEXTS.INVENTORY.TAB_TRASH}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar projeto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-base font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm group-hover:shadow-md"
                />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-[1.25rem] border border-emerald-100 dark:border-emerald-900/20 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-1">Total Estimado</p>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[1.25rem] border border-blue-100 dark:border-blue-900/20 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold mb-1">Peso Total</p>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-100 tracking-tight">{(stats.totalWeight / 1000).toFixed(2)} <span className="text-sm opacity-60 font-bold">kg</span></p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {viewMode === 'trash' && filteredItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-center justify-between text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                    >
                        <span className="font-medium">{TEXTS.INVENTORY.TRASH_WARNING}</span>
                        <button onClick={clearInventory} className="font-bold underline hover:no-underline px-2 py-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors">
                            {TEXTS.INVENTORY.BTN_CLEAR_TRASH}
                        </button>
                    </motion.div>
                )}

                <AnimatePresence mode='popLayout'>
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <InventoryItemCard key={item.id} item={item} />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 text-zinc-400 flex flex-col items-center justify-center gap-4 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm"
                        >
                            <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-sm">
                                <Archive size={32} className="text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <div>
                                <p className="font-medium text-zinc-500 dark:text-zinc-400">{TEXTS.INVENTORY.EMPTY_STATE}</p>
                                <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto opacity-70">
                                    {viewMode === 'active' ? 'Seus orçamentos salvos aparecerão aqui.' : 'A lixeira está vazia.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
