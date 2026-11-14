import { useState } from 'react';
import { Disc3, Cpu, Paperclip } from 'lucide-react';
import { clsx } from 'clsx';
import { useSettings } from '../context/SettingsContext';
import { FilamentStockTab } from '../components/stock/FilamentStockTab';
import { PrinterFarmTab } from '../components/stock/PrinterFarmTab';
import { AuxiliaryCatalogTab } from '../components/stock/AuxiliaryCatalogTab';

type TabMode = 'stock' | 'farm' | 'aux';

export const StockAndFarmScreen = () => {
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState<TabMode>('stock');

    return (
        <div className="space-y-6 pb-32">
            <header className="mb-4 pt-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-1">
                    Estoque &amp; Farm 3D
                </h1>
                <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Controle de filamentos/resinas, impressoras da farm e catálogo de materiais auxiliares.
                </p>
            </header>

            {/* Tabs */}
            <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl gap-1.5 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('stock')}
                    className={clsx(
                        'flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                        activeTab === 'stock'
                            ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    )}
                >
                    <Disc3 size={15} />
                    Filamentos ({settings.filaments.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('farm')}
                    className={clsx(
                        'flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                        activeTab === 'farm'
                            ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    )}
                >
                    <Cpu size={15} />
                    Farm 3D ({settings.printers.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('aux')}
                    className={clsx(
                        'flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                        activeTab === 'aux'
                            ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    )}
                >
                    <Paperclip size={15} />
                    Auxiliares ({settings.auxiliaryCatalog.length})
                </button>
            </div>

            {activeTab === 'stock' && <FilamentStockTab />}
            {activeTab === 'farm' && <PrinterFarmTab />}
            {activeTab === 'aux' && <AuxiliaryCatalogTab />}
        </div>
    );
};
