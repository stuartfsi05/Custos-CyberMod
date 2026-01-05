import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { usePricingEngine } from '../hooks/usePricingEngine';
import { useInventory } from '../context/InventoryContext';
import { TEXTS } from '../constants/texts';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { ProfileSelector } from '../components/calculator/ProfileSelector';
import { PricingResult } from '../components/calculator/PricingResult';
import { Button } from '../components/ui/Button';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';

// Schema Definition
import { parseNumber } from '../utils/formatters';

// ...

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
    const { addToInventory } = useInventory();
    const [selectedProfileId, setSelectedProfileId] = useState<string>('cost');
    const [qty, setQty] = useState(1);

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
        shippingCost: inputs.shippingCost
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
            tierRetail: selectedTier.value
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
