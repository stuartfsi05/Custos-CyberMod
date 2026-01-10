import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TEXTS } from '../constants/texts';
import { Box, Zap, ShieldAlert, Palette, Moon, Sun, Laptop, Layers, Plus, Trash2, Users } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsScreen = () => {
    const { settings, updateSetting } = useSettings();

    // Helper using any because the settings context types need to match string vs number updates properly
    // but input value is string. In a stricter app we would parse.
    const handleChange = (key: keyof typeof settings, value: string) => {
        updateSetting(key, value as any);
    };

    return (
        <div className="space-y-6 pb-32 animate-in slide-in-from-right duration-300">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800 dark:from-zinc-200 dark:to-zinc-500">
                    {TEXTS.APP.SETTINGS}
                </h1>
                <p className="text-zinc-500 text-sm">Configure seus custos base.</p>
            </header>

            <div className="space-y-8">
                {/* Theme Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Palette size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Aparência</h2>
                    </div>
                    <Card className="flex items-center justify-between p-2">
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {[
                                { id: 'light', icon: Sun, label: 'Claro' },
                                { id: 'dark', icon: Moon, label: 'Escuro' },
                                { id: 'system', icon: Laptop, label: 'Sistema' }
                            ].map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => handleChange('theme', id)}
                                    className={clsx(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                                        settings.theme === id
                                            ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-500 ring-1 ring-black/5 dark:ring-white/10"
                                            : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                >
                                    <Icon size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </section>
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Box size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Materiais</h2>
                    </div>
                    <Card className="space-y-4">
                        <Input
                            label="Custo do Filamento (R$/kg)"
                            type="number"
                            value={settings.materialCost}
                            onChange={(e) => handleChange('materialCost', e.target.value)}
                        />
                        <p className="text-xs text-zinc-400 font-medium ml-1">
                            Preço médio pago no rolo de 1kg.
                        </p>
                    </Card>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Box size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Materiais</h2>
                    </div>
                    <Card className="space-y-4">
                        <Input
                            label="Custo do Filamento (R$/kg)"
                            type="number"
                            value={settings.materialCost}
                            onChange={(e) => handleChange('materialCost', e.target.value)}
                        />
                        <p className="text-xs text-zinc-400 font-medium ml-1">
                            Preço médio pago no rolo de 1kg.
                        </p>
                    </Card>
                </section>

                {/* Consumables (Extras) Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <Layers size={16} className="text-emerald-500" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Consumíveis Extras</h2>
                        </div>
                        <button
                            onClick={() => {
                                const newExtra = {
                                    id: `extra_${Date.now()}`,
                                    name: 'Novo Item',
                                    price: 0,
                                    active: true
                                };
                                updateSetting('extras', [...(settings.extras || []), newExtra]);
                            }}
                            className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-1 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {settings.extras?.map((extra, index) => (
                            <Card key={extra.id} className="p-3 flex items-center gap-3">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={extra.name}
                                        onChange={(e) => {
                                            const newExtras = [...settings.extras];
                                            newExtras[index] = { ...extra, name: e.target.value };
                                            updateSetting('extras', newExtras);
                                        }}
                                        className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 outline-none text-sm font-medium pb-1"
                                        placeholder="Nome do Item"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400">R$</span>
                                        <input
                                            type="number"
                                            value={extra.price}
                                            onChange={(e) => {
                                                const newExtras = [...settings.extras];
                                                newExtras[index] = { ...extra, price: parseFloat(e.target.value) || 0 };
                                                updateSetting('extras', newExtras);
                                            }}
                                            className="w-24 bg-transparent text-sm font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const newExtras = settings.extras.filter(e => e.id !== extra.id);
                                        updateSetting('extras', newExtras);
                                    }}
                                    className="text-zinc-300 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </Card>
                        ))}
                        {(!settings.extras || settings.extras.length === 0) && (
                            <div className="text-center p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                                Nenhum custo extra cadastrado.
                            </div>
                        )}
                    </div>
                </section>

                {/* Profiles (Tiers) Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Users size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Perfis de Venda</h2>
                    </div>
                    <div className="space-y-3">
                        {settings.tiers.map((tier, index) => (
                            <Card key={tier.id} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={tier.name}
                                            onChange={(e) => {
                                                const newTiers = [...settings.tiers];
                                                newTiers[index] = { ...tier, name: e.target.value };
                                                updateSetting('tiers', newTiers);
                                            }}
                                            className="font-bold text-sm bg-transparent outline-none border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 w-full"
                                        />
                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{tier.id === 'cost' ? 'Base (Sem Lucro)' : 'Margem de Lucro'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                        <span className="text-xs font-bold text-zinc-500">x</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={tier.multiplier}
                                            onChange={(e) => {
                                                const newTiers = [...settings.tiers];
                                                newTiers[index] = { ...tier, multiplier: parseFloat(e.target.value) || 1 };
                                                updateSetting('tiers', newTiers);
                                            }}
                                            className="w-12 bg-transparent text-right text-sm font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Custos Extras Padrão (Inclusos)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {settings.extras?.map(extra => {
                                            const isSelected = tier.defaultExtras?.includes(extra.id);
                                            return (
                                                <button
                                                    key={extra.id}
                                                    onClick={() => {
                                                        const currentExtras = tier.defaultExtras || [];
                                                        const newExtras = isSelected
                                                            ? currentExtras.filter(id => id !== extra.id)
                                                            : [...currentExtras, extra.id];

                                                        const newTiers = [...settings.tiers];
                                                        newTiers[index] = { ...tier, defaultExtras: newExtras };
                                                        updateSetting('tiers', newTiers);
                                                    }}
                                                    className={clsx(
                                                        "text-[10px] px-2 py-1 rounded-md border transition-all",
                                                        isSelected
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold"
                                                            : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300"
                                                    )}
                                                >
                                                    {extra.name}
                                                </button>
                                            );
                                        })}
                                        {(!settings.extras || settings.extras.length === 0) && (
                                            <span className="text-[10px] text-zinc-300 italic">Cadastre consumíveis acima para adicioná-los.</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <ShieldAlert size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Segurança</h2>
                    </div>
                    <Card className="space-y-4">
                        <Input
                            label="Margem de Falha (Multiplicador)"
                            type="number"
                            step="0.01"
                            value={settings.failMargin}
                            onChange={(e) => handleChange('failMargin', e.target.value)}
                        />
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-xl">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-bold">Dica:</span> 1.10 adiciona 10% de margem no cálculo final para cobrir perdas.
                            </p>
                        </div>
                    </Card>
                </section>

                <div className="text-center pt-8 pb-12">
                    <p className="text-xs text-zinc-400">
                        Alterações são salvas automaticamente.
                    </p>
                </div>
            </div>
        </div>
    );
};
