import { useEffect } from 'react';
import { X, Settings, Moon, Sun, Calculator, List, Disc3, Wallet } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface NavigationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: string) => void;
}

export const NavigationDrawer = ({ isOpen, onClose, onNavigate }: NavigationDrawerProps) => {
    const { settings, updateSetting } = useSettings();
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const logoSrc = isDark ? 'logo_dark.png' : 'logo_light.png';

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleNav = (id: string) => {
        onNavigate(id);
        onClose();
    };

    const toggleTheme = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
        updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');
    };

    const navItems = [
        { id: 'calculator', label: 'Calcular', icon: Calculator },
        { id: 'inventory', label: 'Pedidos & Fila', icon: List },
        { id: 'stock', label: 'Estoque & Farm 3D', icon: Disc3 },
        { id: 'financial', label: 'Financeiro & Caixa', icon: Wallet }
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                        <img src={logoSrc} alt="Custos CyberMod" className="h-8 w-auto" />
                        <button type="button" onClick={onClose} aria-label="Fechar menu" className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                            <X size={24} className="text-zinc-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => handleNav(item.id)}
                                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                                >
                                    <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium text-zinc-700 dark:text-zinc-200">{item.label}</span>
                                </button>
                            );
                        })}

                        <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

                        <button
                            type="button"
                            onClick={() => handleNav('settings')}
                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                        >
                            <Settings size={20} className="text-zinc-500" />
                            <span className="font-medium text-zinc-700 dark:text-zinc-200">Ajustes</span>
                        </button>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-colors"
                        >
                            <Sun size={20} className="text-zinc-500 dark:hidden" />
                            <Moon size={20} className="text-zinc-500 hidden dark:block" />
                            <span className="font-medium text-zinc-700 dark:text-zinc-200">Alternar Tema</span>
                        </button>
                    </div>

                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                            <span>Uso Pessoal</span>
                            <span>•</span>
                            <span>Custos CyberMod</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
