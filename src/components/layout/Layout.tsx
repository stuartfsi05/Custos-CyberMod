import { useState, ReactNode } from 'react';
import { Calculator, List, Menu, Disc3, Wallet, Settings, Sun, Moon } from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';
import { useSettings } from '../../context/SettingsContext';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { settings, updateSetting } = useSettings();
    const isDark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? 'logo_dark.png' : 'logo_light.png';

    const toggleTheme = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
        updateSetting('theme', isDark ? 'light' : 'dark');
    };

    const tabs = [
        { id: 'calculator', shortLabel: 'Calc', label: 'Calcular', icon: Calculator },
        { id: 'inventory', shortLabel: 'Pedidos', label: 'Pedidos & Produção', icon: List },
        { id: 'stock', shortLabel: 'Estoque', label: 'Estoque & Farm 3D', icon: Disc3 },
        { id: 'financial', shortLabel: 'Caixa', label: 'Financeiro & Caixa', icon: Wallet },
        { id: 'settings', shortLabel: 'Ajustes', label: 'Minha Marca & Ajustes', icon: Settings }
    ];

    return (
        <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
            {/* Desktop Left Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-40 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800">
                <div className="h-16 px-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src={logoSrc} alt="Custos CyberMod" className="h-8 w-auto object-contain" />
                        <div>
                            <span className="font-black text-sm tracking-tight block leading-none">
                                CYBERMOD
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                3D PRICING SUITE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                            Operação & Gestão
                        </p>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    type="button"
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={clsx(
                                        'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    )}
                                >
                                    <Icon size={18} />
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-200/70 dark:border-white/10 flex items-center justify-between lg:justify-end px-4 transition-all pt-[env(safe-area-inset-top)] h-[calc(60px+env(safe-area-inset-top))]">
                <div className="flex items-center gap-3 lg:hidden">
                    <img src={logoSrc} alt="Custos CyberMod" className="h-8 w-auto object-contain" />
                    <span className="font-black text-sm tracking-wide text-zinc-900 dark:text-white">
                        CYBERMOD <span className="text-emerald-600">3D</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors"
                        title="Alternar tema Claro / Escuro"
                    >
                        {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-cyan-600" />}
                        <span className="hidden sm:inline">{isDark ? 'Modo claro' : 'Modo escuro'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsDrawerOpen(true)}
                        className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-zinc-600 dark:text-zinc-300"
                        aria-label="Abrir menu"
                    >
                        <Menu size={22} strokeWidth={2} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 min-w-0 max-w-full overflow-x-clip lg:pl-64 pt-[calc(76px+env(safe-area-inset-top))] pb-[calc(110px+env(safe-area-inset-bottom))] lg:pb-10 px-4 md:px-6 w-full relative z-10">
                <div className="max-w-7xl mx-auto min-w-0 w-full">
                    {children}
                </div>
            </main>

            {/* Floating Glass Bottom Nav (Mobile / Tablet) */}
            <nav className="lg:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 z-30">
                <div className="mx-auto w-full max-w-md h-16 rounded-full flex justify-between items-center px-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/80 dark:border-white/10 shadow-2xl shadow-black/15 gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(5);
                                    onTabChange(tab.id);
                                }}
                                className={clsx(
                                    'relative flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all duration-300',
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                                )}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-bold leading-none mt-0.5">{tab.shortLabel}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <NavigationDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={onTabChange}
            />
        </div>
    );
};
