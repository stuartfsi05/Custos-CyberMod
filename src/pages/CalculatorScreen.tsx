import { useState, useEffect } from 'react';
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
const calculatorSchema = z.object({
    partName: z.string().min(1, 'Nome do projeto é obrigatório'),
    weightG: z.coerce.number().min(0, 'Peso inválido'),
    printTime: z.string(), // We allow string for "HH:MM" format
    workTime: z.string(),
    shippingCost: z.coerce.number().min(0)
});

export type CalculatorSchemaType = z.infer<typeof calculatorSchema>;

export const CalculatorScreen = () => {
    const { addToInventory } = useInventory();
    const [selectedProfileId, setSelectedProfileId] = useState<string>('cost');
    const [qty, setQty] = useState(1);

    // Form Setup
    const { register, control, watch, formState: { errors }, handleSubmit, reset } = useForm<CalculatorSchemaType>({
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
    const inputs = watch();

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
            className="p-4 space-y-6 pb-24" // pb-24 for bottom nav and floating action space
        >
            <header className="mb-4">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    {TEXTS.APP.CALCULATOR}
                </h1>
                <p className="text-zinc-500 text-sm">Crie orçamentos precisos em segundos.</p>
            </header>

            {/* Profile Selection */}
            <ProfileSelector
                selectedProfileId={selectedProfileId}
                onSelect={setSelectedProfileId}
            />

            {/* Inputs Form */}
            <CalculatorForm register={register} errors={errors} />

            {/* Live Result Card */}
            <PricingResult
                tier={selectedTier}
                qty={qty}
                onQtyChange={setQty}
            />

            {/* Floating Action Button for Save (Mobile Style) or fixed at bottom */}
            <div className="fixed bottom-24 left-4 right-4 z-40 md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto">
                <Button
                    size="lg"
                    className="w-full shadow-xl shadow-indigo-500/20 text-lg font-bold"
                    onClick={handleSubmit(onSubmit)}
                >
                    <Save className="mr-2" size={20} />
                    {TEXTS.CALCULATOR.ACTION_BUTTON}
                </Button>
            </div>

        </motion.div>
    );
};
