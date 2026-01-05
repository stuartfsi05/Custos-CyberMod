import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TEXTS } from '../constants/texts';
import { Box, Zap, ShieldAlert, Palette, Moon, Sun, Laptop } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsScreen = () => {
    const { settings, updateSetting } = useSettings();

    // Helper using any because the settings context types need to match string vs number updates properly
    // but input value is string. In a stricter app we would parse.
    const handleChange = (key: keyof typeof settings, value: string) => {
        updateSetting(key, value as any);
    };

    return (
        <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
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
                        <Zap size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Operacional</h2>
                    </div>
                    <Card className="space-y-4">
                        <Input
                            label="Custo Energia/Máquina (R$/h)"
                            type="number"
                            value={settings.energyCost}
                            onChange={(e) => handleChange('energyCost', e.target.value)}
                        />
                        <Input
                            label="Custo Mão de Obra (R$/h)"
                            type="number"
                            value={settings.laborCost}
                            onChange={(e) => handleChange('laborCost', e.target.value)}
                        />
                    </Card>
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
