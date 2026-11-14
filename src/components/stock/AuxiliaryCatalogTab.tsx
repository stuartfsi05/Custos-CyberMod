import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AuxiliaryCatalogTab = () => {
    const { settings, updateSetting, upsertAuxiliaryItem } = useSettings();

    const [auxName, setAuxName] = useState('');
    const [auxPrice, setAuxPrice] = useState('');
    const [auxCategory, setAuxCategory] = useState('Geral');

    const handleAddAux = (e: React.FormEvent) => {
        e.preventDefault();
        if (!auxName.trim()) {
            toast.error('Informe o nome do material auxiliar.');
            return;
        }
        upsertAuxiliaryItem(auxName, parseNumber(auxPrice), auxCategory || 'Geral');
        setAuxName('');
        setAuxPrice('');
        toast.success('Material auxiliar salvo!');
    };

    const handleDeleteAux = (id: string) => {
        updateSetting('auxiliaryCatalog', settings.auxiliaryCatalog.filter(a => a.id !== id));
        toast.success('Item auxiliar removido.');
    };

    return (
        <div className="space-y-4">
            <Card>
                <form onSubmit={handleAddAux} className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        Cadastrar Material Auxiliar (Cola, Argola, Ímã, Parafusos...)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={auxName}
                            onChange={(e) => setAuxName(e.target.value)}
                            placeholder="Nome (ex: Cola Instantânea)"
                            className="sm:col-span-2 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-medium"
                        />
                        <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={auxPrice}
                            onChange={(e) => setAuxPrice(e.target.value)}
                            placeholder="Valor unit. (R$)"
                            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={auxCategory}
                            onChange={(e) => setAuxCategory(e.target.value)}
                            placeholder="Categoria (ex: Hardware, Adesivos)"
                            className="sm:col-span-2 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-medium"
                        />
                        <Button type="submit" className="h-11">
                            <Plus size={16} className="mr-1.5" />
                            Salvar Item
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                {settings.auxiliaryCatalog.map(item => (
                    <Card key={item.id} className="p-3.5 flex items-center justify-between gap-3 h-full">
                        <div className="min-w-0">
                            <p className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {item.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Categoria: {item.category}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-base md:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatCurrency(item.price)}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDeleteAux(item.id)}
                                aria-label={`Remover item auxiliar ${item.name}`}
                                title={`Remover item auxiliar ${item.name}`}
                                className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
