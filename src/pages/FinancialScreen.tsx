import { useMemo, useRef } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { ExpenseRecord } from '../types/settings';
import { Button } from '../components/ui/Button';
import { FinancialKpiGrid } from '../components/financial/FinancialKpiGrid';
import { OperationalExpensesSection } from '../components/financial/OperationalExpensesSection';
import {
    buildFinancialCsvContent,
    calculateFinancialMetrics,
    parseAndValidateBackupJson,
    triggerFileDownload
} from '../utils/financialBackup';

export const FinancialScreen = () => {
    const { inventory, replaceInventory } = useInventory();
    const { settings, updateSetting, replaceSettings } = useSettings();
    const backupInputRef = useRef<HTMLInputElement>(null);

    const metrics = useMemo(
        () => calculateFinancialMetrics(inventory, settings.expenses || []),
        [inventory, settings.expenses]
    );

    const handleAddExpense = (record: ExpenseRecord) => {
        updateSetting('expenses', [record, ...(settings.expenses || [])]);
    };

    const handleDeleteExpense = (id: string) => {
        updateSetting('expenses', (settings.expenses || []).filter(e => e.id !== id));
        toast.success('Despesa removida.');
    };

    const handleExportCSV = () => {
        const csv = buildFinancialCsvContent(inventory, settings.expenses || []);
        triggerFileDownload(`cybermod-financeiro-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
        toast.success('Relatório CSV exportado!');
    };

    const handleExportBackupJSON = () => {
        const backup = {
            exportedAt: new Date().toISOString(),
            app: 'Custos CyberMod',
            settings,
            inventory
        };
        triggerFileDownload(
            `cybermod-backup-${new Date().toISOString().slice(0, 10)}.json`,
            JSON.stringify(backup, null, 2),
            'application/json'
        );
        toast.success('Backup JSON completo exportado!');
    };

    const handleImportBackupJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        try {
            const rawText = await file.text();
            const result = parseAndValidateBackupJson(rawText);
            if (!result.ok) {
                toast.error(result.errorMessage);
                return;
            }
            if (result.settings) {
                replaceSettings(result.settings);
            }
            if (result.inventory) {
                replaceInventory(result.inventory);
                if (result.discardedCount > 0) {
                    toast.warning(`${result.discardedCount} registro(s) malformado(s) foram ignorados na importação.`);
                }
            }
            toast.success('Backup restaurado com sucesso!');
        } catch (error) {
            console.warn('Falha ao importar backup JSON:', error);
            toast.error('Erro ao ler o arquivo JSON de backup.');
        }
    };

    return (
        <div className="space-y-6 pb-32">
            <header className="mb-4 pt-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-1">
                    Financeiro
                </h1>
                <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Fluxo de caixa, lucro líquido real, contas a receber e despesas.
                </p>
            </header>

            <FinancialKpiGrid metrics={metrics} />

            {/* Export / Import Actions */}
            <input
                ref={backupInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackupJSON}
                className="hidden"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button type="button" variant="secondary" onClick={handleExportCSV}>
                    <FileSpreadsheet size={16} className="mr-2 text-emerald-500" />
                    Exportar CSV
                </Button>
                <Button type="button" variant="secondary" onClick={handleExportBackupJSON}>
                    <Download size={16} className="mr-2 text-cyan-600 dark:text-cyan-400" />
                    Backup JSON
                </Button>
                <Button type="button" variant="secondary" onClick={() => backupInputRef.current?.click()}>
                    <Upload size={16} className="mr-2 text-amber-500" />
                    Importar JSON
                </Button>
            </div>

            <OperationalExpensesSection
                expenses={settings.expenses || []}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
            />
        </div>
    );
};
