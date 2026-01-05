import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TEXTS } from '../constants/texts';

export const SettingsScreen = () => {
    const { settings, updateSetting } = useSettings();

    // Helper using any because the settings context types need to match string vs number updates properly
    // but input value is string. In a stricter app we would parse.
    const handleChange = (key: keyof typeof settings, value: string) => {
        updateSetting(key, value);
    };

    return (
        <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800 dark:from-zinc-200 dark:to-zinc-500">
                    {TEXTS.APP.SETTINGS}
                </h1>
                <p className="text-zinc-500 text-sm">Configure seus custos base.</p>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Materiais</h2>
                    <Card className="space-y-4">
                        <Input
                            label="Custo do Filamento (R$/kg)"
                            type="number"
                            value={settings.materialCost}
                            onChange={(e) => handleChange('materialCost', e.target.value)}
                        />
                        <p className="text-xs text-zinc-500 italic">
                            Preço médio pago no rolo de 1kg.
                        </p>
                    </Card>
                </section>

                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Operacional</h2>
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
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Segurança</h2>
                    <Card className="space-y-4">
                        <Input
                            label="Margem de Falha (Multiplicador)"
                            type="number"
                            step="0.01"
                            value={settings.failMargin}
                            onChange={(e) => handleChange('failMargin', e.target.value)}
                        />
                        <p className="text-xs text-zinc-500">
                            Padrão 1.10 = +10% de material e tempo para cobrir falhas eventuais.
                        </p>
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
