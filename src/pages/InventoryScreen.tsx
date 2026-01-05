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
        <div className="space-y-6 pb-24">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                        {TEXTS.APP.INVENTORY}
                    </h1>
                    <p className="text-zinc-500 text-sm">Gerencie seus projetos salvos e histórico.</p>
                </div>
            </header>

            {/* View Mode Toggle / Tabs */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl relative">
                <button
                    onClick={() => setViewMode('active')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'active'
                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                >
                    <Archive size={16} />
                    {TEXTS.INVENTORY.TAB_ACTIVE}
                </button>
                <button
                    onClick={() => setViewMode('trash')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'trash'
                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-500'
                            : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                >
                    <Trash2 size={16} />
                    {TEXTS.INVENTORY.TAB_TRASH}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar projeto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-xs uppercase text-emerald-600 dark:text-emerald-400 font-bold mb-1">Total Estimado</p>
                    <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs uppercase text-blue-600 dark:text-blue-400 font-bold mb-1">Peso Total</p>
                    <p className="text-xl font-black text-blue-900 dark:text-blue-100">{(stats.totalWeight / 1000).toFixed(2)} kg</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {viewMode === 'trash' && filteredItems.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                        <span>{TEXTS.INVENTORY.TRASH_WARNING}</span>
                        <button onClick={clearInventory} className="font-bold underline hover:no-underline">
                            {TEXTS.INVENTORY.BTN_CLEAR_TRASH}
                        </button>
                    </div>
                )}

                <AnimatePresence mode='popLayout'>
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <InventoryItemCard key={item.id} item={item} />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-12 text-zinc-400"
                        >
                            <p>{TEXTS.INVENTORY.EMPTY_STATE}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
