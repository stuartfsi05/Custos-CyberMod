import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ExpenseRecord } from '../../types/settings';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../utils/financialBackup';
import { toast } from 'sonner';

interface OperationalExpensesSectionProps {
    expenses: ExpenseRecord[];
    onAddExpense: (record: ExpenseRecord) => void;
    onDeleteExpense: (id: string) => void;
}

export const OperationalExpensesSection = ({
    expenses,
    onAddExpense,
    onDeleteExpense
}: OperationalExpensesSectionProps) => {
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState<ExpenseRecord['category']>('manutencao');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseNumber(amount);
        if (!desc.trim() || val <= 0) {
            toast.error('Informe a descrição e um valor maior que zero.');
            return;
        }
        onAddExpense({
            id: `exp_${Date.now()}`,
            description: desc.trim(),
            category,
            amount: val,
            date: new Date().toISOString()
        });
        setDesc('');
        setAmount('');
        toast.success('Despesa registrada no fluxo de caixa!');
    };

    return (
        <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300 px-1">
                Lançar Despesa Operacional
            </h2>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Ex: Bico 0.4mm endurecido / Conta de luz"
                        className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-medium"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as ExpenseRecord['category'])}
                            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-semibold"
                        >
                            {EXPENSE_CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Valor (R$)"
                            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 text-sm font-bold tabular-nums"
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        <Plus size={16} className="mr-1.5" />
                        Registrar Despesa
                    </Button>
                </form>
            </Card>

            <div className="space-y-2">
                {expenses.map(exp => (
                    <Card key={exp.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {exp.description}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category} •{' '}
                                {new Date(exp.date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-base md:text-lg font-black text-rose-500 tabular-nums">
                                -{formatCurrency(exp.amount)}
                            </span>
                            <button
                                type="button"
                                onClick={() => onDeleteExpense(exp.id)}
                                aria-label={`Remover despesa ${exp.description}`}
                                title={`Remover despesa ${exp.description}`}
                                className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </Card>
                ))}
                {expenses.length === 0 && (
                    <p className="text-center text-xs text-zinc-400 py-4">
                        Nenhuma despesa operacional lançada ainda.
                    </p>
                )}
            </div>
        </section>
    );
};
