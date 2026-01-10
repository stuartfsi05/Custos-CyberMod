import { z } from 'zod';
import { parseNumber } from '../utils/formatters';

export const calculatorSchema = z.object({
    partName: z.string().min(1, 'Nome do projeto é obrigatório'),
    weightG: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0, 'Peso inválido')),
    printTime: z.string(),
    workTime: z.string(),
    shippingCost: z.union([z.string(), z.number()])
        .transform((val) => parseNumber(String(val)))
        .pipe(z.number().min(0)),

    // Customer Contact Fields
    customerName: z.string().optional(),
    customerDoc: z.string().optional(),
    customerPhone: z.string().optional(),
    // Allow empty string or valid email
    customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    // Address Fields (Structured)
    addressCep: z.string().optional(),
    addressStreet: z.string().optional(),
    addressNumber: z.string().optional(),
    addressComplement: z.string().optional(),
    addressNeighborhood: z.string().optional(),
    addressCity: z.string().optional(),
    addressState: z.string().optional(),

    // Notes
    notes: z.string().optional()
});

export type CalculatorSchemaType = z.infer<typeof calculatorSchema>;
export type CalculatorFormValues = z.input<typeof calculatorSchema>;
