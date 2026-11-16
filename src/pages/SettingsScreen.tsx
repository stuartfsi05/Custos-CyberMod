import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { NumericInput } from '../components/ui/NumericInput';
import { Textarea } from '../components/ui/Textarea';
import { TEXTS } from '../constants/texts';
import {
    Box,
    Zap,
    ShieldAlert,
    Palette,
    Moon,
    Sun,
    Laptop,
    Plus,
    Trash2,
    Store,
    Building2
} from 'lucide-react';
import { clsx } from 'clsx';
import { parseNumber } from '../utils/formatters';
import { CompanyBranding } from '../types/settings';

export const SettingsScreen = () => {
    const { settings, updateSetting } = useSettings();

    const handleNumericOrThemeChange = (
        key: 'materialCost' | 'laborCost' | 'kwhRate' | 'taxPercent' | 'theme',
        value: string
    ) => {
        updateSetting(key, value as never);
    };

    const failPercentValue = Math.max(0, Math.round(((settings.failMargin ?? 1.1) - 1) * 10000) / 100);

    const handleBrandingChange = <K extends keyof CompanyBranding>(field: K, value: CompanyBranding[K]) => {
        updateSetting('branding', {
            ...settings.branding,
            [field]: value
        });
    };

    return (
        <div className="space-y-6 pb-32 animate-in slide-in-from-right duration-300">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-1">
                    {TEXTS.APP.SETTINGS}
                </h1>
                <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Configure custos base, energia, marketplaces e sua marca no PDF.
                </p>
            </header>

            <div className="space-y-8">
                {/* Theme Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Palette size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Aparência</h2>
                    </div>
                    <Card className="flex items-center justify-between p-2">
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {[
                                { id: 'light', icon: Sun, label: 'Claro' },
                                { id: 'dark', icon: Moon, label: 'Escuro' },
                                { id: 'system', icon: Laptop, label: 'Sistema' }
                            ].map(({ id, icon: Icon, label }) => (
                                <button
                                    type="button"
                                    key={id}
                                    onClick={() => handleNumericOrThemeChange('theme', id)}
                                    className={clsx(
                                        'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                                        settings.theme === id
                                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    )}
                                >
                                    <Icon size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </section>

                {/* Materials Fallback Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Box size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Materiais (Padrão)</h2>
                    </div>
                    <Card className="space-y-3">
                        <Input
                            label="Custo Padrão do Filamento (R$/kg)"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={settings.materialCost}
                            onChange={(e) => handleNumericOrThemeChange('materialCost', e.target.value)}
                        />
                        <p className="text-xs text-zinc-400 font-medium ml-1">
                            Usado como fallback quando nenhum rolo do estoque estiver selecionado.
                        </p>
                    </Card>
                </section>

                {/* Energy, Labor & Taxes Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Zap size={16} className="text-amber-500" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Energia, Mão de Obra &amp; Impostos</h2>
                    </div>
                    <Card>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Tarifa de Energia (R$/kWh)"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={settings.kwhRate}
                                onChange={(e) => handleNumericOrThemeChange('kwhRate', e.target.value)}
                            />
                            <Input
                                label="Custo Mão de Obra (R$/h)"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={settings.laborCost}
                                onChange={(e) => handleNumericOrThemeChange('laborCost', e.target.value)}
                            />
                            <Input
                                label="Impostos / NF / MEI (%)"
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                value={settings.taxPercent}
                                onChange={(e) => handleNumericOrThemeChange('taxPercent', e.target.value)}
                            />
                        </div>
                    </Card>
                </section>

                {/* Marketplaces Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <Store size={16} className="text-emerald-500" />
                            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Canais de Venda &amp; Marketplaces</h2>
                        </div>
                        <button
                            type="button"
                            aria-label="Adicionar canal de venda"
                            onClick={() => {
                                const newChannel = {
                                    id: `channel_${Date.now()}`,
                                    name: 'Novo Canal',
                                    commissionPercent: 10,
                                    fixedFee: 0
                                };
                                updateSetting('marketplaces', [...settings.marketplaces, newChannel]);
                            }}
                            className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 p-1 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {settings.marketplaces.map((channel, index) => (
                            <Card key={channel.id} className="p-3.5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={channel.name}
                                        onChange={(e) => {
                                            const next = [...settings.marketplaces];
                                            next[index] = { ...channel, name: e.target.value };
                                            updateSetting('marketplaces', next);
                                        }}
                                        className="flex-1 bg-transparent border-b border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 outline-none text-sm font-bold pb-1"
                                        placeholder="Nome do Canal"
                                    />
                                    {settings.marketplaces.length > 1 && (
                                        <button
                                            type="button"
                                            aria-label={`Remover canal ${channel.name}`}
                                            onClick={() => updateSetting('marketplaces', settings.marketplaces.filter(m => m.id !== channel.id))}
                                            className="text-zinc-300 hover:text-red-500 p-1.5 rounded-lg"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">Comissão (%)</span>
                                        <NumericInput
                                            step="0.01"
                                            min={0}
                                            value={channel.commissionPercent}
                                            onValueChange={(val) => {
                                                const next = [...settings.marketplaces];
                                                next[index] = { ...channel, commissionPercent: val };
                                                updateSetting('marketplaces', next);
                                            }}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">Taxa Fixa (R$)</span>
                                        <NumericInput
                                            step="0.01"
                                            min={0}
                                            value={channel.fixedFee}
                                            onValueChange={(val) => {
                                                const next = [...settings.marketplaces];
                                                next[index] = { ...channel, fixedFee: val };
                                                updateSetting('marketplaces', next);
                                            }}
                                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Branding & PDF Quote Settings */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Building2 size={16} className="text-cyan-600 dark:text-cyan-400" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                            Identidade da Marca &amp; Orçamento PDF
                        </h2>
                    </div>
                    <Card className="space-y-4">
                        <Input
                            label="Nome da Empresa / Estúdio"
                            value={settings.branding.companyName}
                            onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                            placeholder="Ex: CyberMod 3D Studio"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="CNPJ / CPF"
                                inputMode="numeric"
                                value={settings.branding.companyDoc}
                                onChange={(e) => handleBrandingChange('companyDoc', e.target.value)}
                                placeholder="00.000.000/0001-00"
                            />
                            <Input
                                label="WhatsApp / Telefone"
                                inputMode="tel"
                                value={settings.branding.companyPhone}
                                onChange={(e) => handleBrandingChange('companyPhone', e.target.value)}
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Email Comercial"
                                value={settings.branding.companyEmail}
                                onChange={(e) => handleBrandingChange('companyEmail', e.target.value)}
                                placeholder="contato@estudio.com"
                            />
                            <Input
                                label="Instagram / Site"
                                value={settings.branding.companyInstagram}
                                onChange={(e) => handleBrandingChange('companyInstagram', e.target.value)}
                                placeholder="@cybermod3d"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <Input
                                    label="URL ou Caminho da Logo"
                                    value={settings.branding.companyLogoUrl}
                                    onChange={(e) => handleBrandingChange('companyLogoUrl', e.target.value)}
                                    placeholder="logo_dark.png"
                                />
                            </div>
                            <Input
                                label="Validade (dias)"
                                type="number"
                                inputMode="numeric"
                                value={settings.branding.quoteValidityDays}
                                onChange={(e) => handleBrandingChange('quoteValidityDays', Math.max(1, parseInt(e.target.value, 10) || 7))}
                            />
                        </div>
                        <Textarea
                            label="Termos e Condições do Orçamento PDF"
                            value={settings.branding.quoteTerms}
                            onChange={(e) => handleBrandingChange('quoteTerms', e.target.value)}
                        />
                    </Card>
                </section>

                {/* Security Margin */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <ShieldAlert size={16} className="text-emerald-500" />
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Segurança</h2>
                    </div>
                    <Card className="space-y-4">
                        <Input
                            label="Margem de Falha / Risco Padrão (%)"
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            value={failPercentValue}
                            onChange={(e) => {
                                const pct = Math.max(0, parseNumber(e.target.value));
                                updateSetting('failMargin', Number((1 + pct / 100).toFixed(4)));
                            }}
                        />
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-xl">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-bold">Dica:</span> 10% adiciona 10% de segurança sobre o custo de produção na Calculadora para cobrir eventuais falhas de impressão.
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
