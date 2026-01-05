import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../ui/Input';
import { TEXTS } from '../../constants/texts';
import { Box, Clock, Weight, Hammer, Truck } from 'lucide-react';
import { CalculatorSchemaType } from '../../pages/CalculatorScreen';

interface CalculatorFormProps {
    register: UseFormRegister<CalculatorSchemaType>;
    errors: FieldErrors<CalculatorSchemaType>;
}

export const CalculatorForm = ({ register, errors }: CalculatorFormProps) => {
    return (
        <div className="space-y-4">
            <div className="bg-white/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 backdrop-blur-sm">
                <Input
                    label={TEXTS.CALCULATOR.PROJECT_NAME_LABEL}
                    placeholder={TEXTS.CALCULATOR.PROJECT_NAME_PLACEHOLDER}
                    icon={Box}
                    {...register('partName')}
                    error={errors.partName?.message}
                    className="bg-transparent border-zinc-200 dark:border-zinc-700"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label={TEXTS.CALCULATOR.WEIGHT_LABEL}
                    placeholder="0"
                    type="number"
                    step="0.01"
                    icon={Weight}
                    {...register('weightG')}
                    error={errors.weightG?.message}
                />
                <Input
                    label={TEXTS.CALCULATOR.TIME_LABEL}
                    placeholder="00:00"
                    icon={Clock}
                    {...register('printTime')}
                    error={errors.printTime?.message}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label={TEXTS.CALCULATOR.WORK_TIME_LABEL}
                    placeholder="00:00"
                    icon={Hammer}
                    {...register('workTime')}
                    error={errors.workTime?.message}
                />
                <Input
                    label={TEXTS.CALCULATOR.SHIPPING_LABEL}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    icon={Truck}
                    {...register('shippingCost')}
                    error={errors.shippingCost?.message}
                />
            </div>
        </div>
    );
};
