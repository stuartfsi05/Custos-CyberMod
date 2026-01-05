import { useState, ReactNode } from 'react';
import { Calculator, List, Menu } from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer'; // We will assume this exists or needs refactor next, but keeping import for now.
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
    const { settings } = useSettings();
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? '/logo_dark.png' : '/logo_light.png';

    const tabs = [
        { id: 'calculator', label: 'Calculadora', icon: Calculator },
        { id: 'inventory', label: 'Inventário', icon: List },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
            {/* Premium Glass Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/10 flex items-center justify-between px-4 transition-all pt-[env(safe-area-inset-top)] h-[calc(60px+env(safe-area-inset-top))]">
                <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="Custos CyberMod" className="h-8 w-auto object-contain drop-shadow-sm opacity-90" />
                    {/* Title hidden on mobile to save space, visible on larger */}
                    <span className="hidden sm:block font-bold text-sm tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        CYBERMOD
                    </span>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-zinc-600 dark:text-zinc-300"
                >
                    <Menu size={22} strokeWidth={2} />
                </button>
            </header>

            {/* Main Content with Top Padding for Header */}
            <main className="flex-1 pt-[calc(80px+env(safe-area-inset-top))] pb-[calc(100px+env(safe-area-inset-bottom))] px-4 max-w-lg mx-auto w-full relative z-10">
                {children}
            </main>

            {/* Floating Glass Bottom Nav (Android 15 Style) */}
            <nav className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-6 right-6 z-30">
                <div className="glass-panel mx-auto max-w-xs h-16 rounded-full flex justify-around items-center px-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/20">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(5);
                                    onTabChange(tab.id);
                                }}
                                className={clsx(
                                    "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                    isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 rounded-full border-2 border-indigo-400/50"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Note: NavigationDrawer needs to be updated to be a Drawer as well or kept as is. 
                For now we keep the prop API same. */}
            <NavigationDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={onTabChange}
            />
        </div>
    );
};
