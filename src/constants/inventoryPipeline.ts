import type { InventoryItemStatus, PaymentStatus } from '../context/InventoryContext';

export const PIPELINE_STEPS: Array<{ id: InventoryItemStatus; label: string }> = [
    { id: 'pending', label: 'Orçamento' },
    { id: 'approved', label: 'Na Fila' },
    { id: 'printing', label: 'Imprimindo' },
    { id: 'completed', label: 'Pronto' },
    { id: 'delivered', label: 'Entregue' }
];

export const NEXT_PAYMENT: Record<PaymentStatus, PaymentStatus> = {
    unpaid: 'half',
    half: 'paid',
    paid: 'unpaid'
};
