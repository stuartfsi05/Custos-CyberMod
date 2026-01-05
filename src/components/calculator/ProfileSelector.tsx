import { useSettings } from '../../context/SettingsContext';
import { Button } from '../ui/Button';
import { Check, ChevronRight, Crown, Users, Truck, ShoppingBag, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface ProfileSelectorProps {
    selectedProfileId: string | null;
    onSelect: (id: string) => void;
}

export const ProfileSelector = ({ selectedProfileId, onSelect }: ProfileSelectorProps) => {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    // Close dropdown when clicking outside would be ideal, but for now a simple toggle is enough.
    // In a production app, we would use a hook like useOnClickOutside.

    const selectedTier = settings.tiers.find(t => t.id === selectedProfileId);

    const getIcon = (id: string) => {
        switch (id) {
            case 'cost': return <Crown size={18} className="text-zinc-500" />;
            case 'friends': return <Users size={18} className="text-emerald-500" />;
            case 'wholesale': return <Truck size={18} className="text-purple-500" />;
            case 'retail': return <ShoppingBag size={18} className="text-blue-500" />;
            case 'urgent': return <Zap size={18} className="text-red-500" />;
            default: return <Crown size={18} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all active:scale-[0.98] hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                        {selectedTier ? getIcon(selectedTier.id) : <Crown size={18} />}
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Perfil Atual</p>
                        <p className="font-bold text-zinc-900 dark:text-white">
                            {selectedTier ? selectedTier.name : "Selecione..."}
                        </p>
                    </div>
                </div>
                <ChevronRight
                    className={clsx("text-zinc-400 transition-transform duration-300", isOpen && "rotate-90")}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 dark:ring-white/5">
                    <div className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                        {settings.tiers.map((tier) => (
                            <button
                                key={tier.id}
                                onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(10);
                                    onSelect(tier.id);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "group flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98]",
                                    selectedProfileId === tier.id
                                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {getIcon(tier.id)}
                                    <div className="text-left">
                                        <span className="font-bold block text-sm">
                                            {tier.name}
                                        </span>
                                    </div>
                                </div>
                                {selectedProfileId === tier.id && (
                                    <Check size={16} className="text-indigo-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Backdrop to close when clicking outside (simple solution) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
