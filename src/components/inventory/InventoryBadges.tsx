import { InventoryItemStatus, PaymentStatus } from '../../context/InventoryContext';

export const StatusBadge = ({ status }: { status: InventoryItemStatus }) => {
    switch (status) {
        case 'approved':
            return (
                <span className="text-[10px] bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Na Fila
                </span>
            );
        case 'printing':
            return (
                <span className="text-[10px] bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Imprimindo
                </span>
            );
        case 'completed':
            return (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Pronto
                </span>
            );
        case 'delivered':
            return (
                <span className="text-[10px] bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Entregue
                </span>
            );
        case 'rejected':
            return (
                <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    Lixeira
                </span>
            );
        default:
            return (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Orçamento
                </span>
            );
    }
};

export const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
    switch (status) {
        case 'paid':
            return (
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                    Pago
                </span>
            );
        case 'half':
            return (
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                    Sinal 50%
                </span>
            );
        default:
            return (
                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-2 py-0.5 rounded-full font-bold uppercase">
                    A Receber
                </span>
            );
    }
};
