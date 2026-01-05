import { useSettings } from '../../context/SettingsContext';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button'; // Assuming we have or will update Button
import { Check, ChevronRight, Crown, Users, Truck, ShoppingBag, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface ProfileSelectorProps {
    selectedProfileId: string | null;
    onSelect: (id: string) => void;
}

export const ProfileSelector = ({ selectedProfileId, onSelect }: ProfileSelectorProps) => {
    const { settings } = useSettings();
    const [open, setOpen] = useState(false);

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
        <BottomSheet
            open={open}
            onOpenChange={setOpen}
            title="Selecione o Perfil"
            description="Escolha a tabela de preços para este projeto."
            trigger={
                <button className="w-full flex items-center justify-between p-4 bg-zinc-100 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all active:scale-[0.98]">
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
                    <ChevronRight className="text-zinc-400" />
                </button>
            }
        >
            <div className="flex flex-col gap-2">
                {settings.tiers.map((tier) => (
                    <button
                        key={tier.id}
                        onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(10);
                            onSelect(tier.id);
                            setOpen(false);
                        }}
                        className={clsx(
                            "group flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98]",
                            selectedProfileId === tier.id
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                : "border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            {getIcon(tier.id)}
                            <div className="text-left">
                                <span className={clsx("font-bold block", selectedProfileId === tier.id ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300")}>
                                    {tier.name}
                                </span>
                                {tier.badge && (
                                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                        {tier.badge}
                                    </span>
                                )}
                            </div>
                        </div>
                        {selectedProfileId === tier.id && (
                            <div className="p-1 bg-indigo-500 rounded-full text-white">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </BottomSheet>
    );
};
