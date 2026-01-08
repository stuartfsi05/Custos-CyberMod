import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { usePricingEngine } from '../hooks/usePricingEngine';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { TEXTS } from '../constants/texts';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { ProfileSelector } from '../components/calculator/ProfileSelector';
import { PricingResult } from '../components/calculator/PricingResult';
import { Button } from '../components/ui/Button';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { parseNumber, formatCurrency } from '../utils/formatters';

// ... (Schema parts - keeping as is if not in range, but range is large)

// Schema Definition
const calculatorSchema = z.object({
    partName: z.string().min(1, 'Nome do projeto é obrigatório'),
    weightG: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0, 'Peso inválido')),
    printTime: z.string(),
    workTime: z.string(),
    shippingCost: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0))
});

export type CalculatorSchemaType = z.infer<typeof calculatorSchema>;

// Form Input Values (can be strings or numbers)
export type CalculatorFormValues = z.input<typeof calculatorSchema>;

export const CalculatorScreen = () => {
    const { settings } = useSettings();
    const { addToInventory } = useInventory();
    const [selectedProfileId, setSelectedProfileId] = useState<string>(settings.tiers[0]?.id || 'cost');
    const [activeExtras, setActiveExtras] = useState<string[]>([]);
    const [qty, setQty] = useState(1);

    // Sync activeExtras when profile changes
    useEffect(() => {
        const profile = settings.tiers.find(t => t.id === selectedProfileId);
        if (profile?.defaultExtras) {
            setActiveExtras(profile.defaultExtras);
        } else {
            setActiveExtras([]);
        }
    }, [selectedProfileId, settings.tiers]);

    // Form Setup
    // useForm<InputType, Context, OutputType>
    const { register, watch, formState: { errors }, handleSubmit } = useForm<CalculatorFormValues, any, CalculatorSchemaType>({
        resolver: zodResolver(calculatorSchema),
        defaultValues: {
            partName: '',
            weightG: 0,
            printTime: '',
            workTime: '',
            shippingCost: 0
        }
    });

    // Watch values for real-time calculation
    const inputs = watch(); // This returns CalculatorFormValues

    // Pricing Engine
    const { tiers, costs } = usePricingEngine({
        weightG: inputs.weightG,
        printTime: inputs.printTime,
        workTime: inputs.workTime,
        shippingCost: inputs.shippingCost,
        activeExtras // Pass selected extras
    });

    const selectedTier = tiers.find(t => t.id === selectedProfileId) || tiers[0];

    // Handlers
    const handleSave = (data: CalculatorSchemaType) => {
        if (!selectedTier) return;

        addToInventory({
            partName: data.partName,
            weightG: data.weightG,
            printTime: data.printTime,
            workTime: data.workTime,
            costs: costs,
            selectedTier: selectedProfileId,
            tierRetail: selectedTier.value,
            activeExtras
        });

        toast.success(`"${data.partName}" salvo no inventário!`);

        // Optional: Reset form or just the name? 
        // Typically users calc multiple similar items, so maybe keep values.
        // reset(); 
    };

    const onSubmit = (data: CalculatorSchemaType) => {
        handleSave(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 pb-32 max-w-lg mx-auto md:max-w-4xl" // Added max-w for desktop constraints
        >
            <header className="mb-8 pt-2">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 tracking-tighter mb-2">
                    {TEXTS.APP.CALCULATOR}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Crie orçamentos precisos em segundos.</p>
            </header>

            <div className="space-y-8">
                {/* Profile Selection */}
                <section>
                    <ProfileSelector
                        selectedProfileId={selectedProfileId}
                        onSelect={setSelectedProfileId}
                    />
                </section>

                {/* Inputs Form */}
                <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <div className="p-4 md:p-6 space-y-6">
                        <CalculatorForm register={register} errors={errors} />
                    </div>
                </section>

                {/* Extras Selection */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Custos Variáveis</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {settings.extras?.map(extra => {
                            const isActive = activeExtras.includes(extra.id);
                            return (
                                <button
                                    key={extra.id}
                                    onClick={() => {
                                        setActiveExtras(prev =>
                                            isActive ? prev.filter(id => id !== extra.id) : [...prev, extra.id]
                                        );
                                    }}
                                    className={clsx(
                                        "p-3 rounded-xl border text-left transition-all relative overflow-hidden",
                                        isActive
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                    )}
                                >
                                    <div className="relative z-10">
                                        <p className="text-xs font-bold mb-1">{extra.name}</p>
                                        <p className="text-[10px] opacity-70">
                                            +{formatCurrency(extra.price)}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-emerald-500"></div>
                                    )}
                                </button>
                            );
                        })}
                        {(!settings.extras || settings.extras.length === 0) && (
                            <div className="col-span-full text-center p-4 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                                Configure consumíveis em Ajustes para vê-los aqui.
                            </div>
                        )}
                    </div>
                </section>

                {/* Live Result Card */}
                <section>
                    <PricingResult
                        tier={selectedTier}
                        qty={qty}
                        onQtyChange={setQty}
                    />
                </section>
            </div>

            {/* Static Action Button (Scrolls with content) */}
            <div className="mt-8">
                <Button
                    size="lg"
                    className="w-full shadow-lg shadow-indigo-500/20 text-lg font-bold rounded-2xl h-14 md:h-16 active:scale-95 transition-transform"
                    onClick={handleSubmit(onSubmit)}
                >
                    <Save className="mr-2.5" size={22} strokeWidth={2.5} />
                    {TEXTS.CALCULATOR.ACTION_BUTTON}
                </Button>
            </div>

        </motion.div>
    );
};
