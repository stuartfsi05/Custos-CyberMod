import { lazy, Suspense, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { SettingsProvider } from './context/SettingsProvider';
import { InventoryProvider } from './context/InventoryProvider';
import { InventoryItem } from './context/InventoryContext';
import { Layout } from './components/layout/Layout';
import { CalculatorScreen } from './pages/CalculatorScreen';

const InventoryScreen = lazy(() =>
    import('./pages/InventoryScreen').then(m => ({ default: m.InventoryScreen }))
);
const StockAndFarmScreen = lazy(() =>
    import('./pages/StockAndFarmScreen').then(m => ({ default: m.StockAndFarmScreen }))
);
const FinancialScreen = lazy(() =>
    import('./pages/FinancialScreen').then(m => ({ default: m.FinancialScreen }))
);
const SettingsScreen = lazy(() =>
    import('./pages/SettingsScreen').then(m => ({ default: m.SettingsScreen }))
);

function ScreenFallback() {
    return (
        <div className="flex items-center justify-center py-20 text-xs font-bold text-zinc-400">
            Carregando módulo...
        </div>
    );
}

function App() {
    const [activeTab, setActiveTab] = useState<string>('calculator');
    const [loadedOrder, setLoadedOrder] = useState<InventoryItem | null>(null);
    const [calculatorSeedKey, setCalculatorSeedKey] = useState(0);

    const handleReopenInCalculator = (item: InventoryItem) => {
        setLoadedOrder(item);
        setCalculatorSeedKey(prev => prev + 1);
        setActiveTab('calculator');
        toast.success(`"${item.partName}" reaberto na Calculadora!`);
    };

    return (
        <SettingsProvider>
            <InventoryProvider>
                <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                    <div className={activeTab === 'calculator' ? 'block' : 'hidden'}>
                        <CalculatorScreen
                            key={calculatorSeedKey}
                            initialItem={loadedOrder}
                            onClearInitialItem={() => setLoadedOrder(null)}
                            onNavigate={setActiveTab}
                        />
                    </div>

                    {activeTab !== 'calculator' && (
                        <Suspense fallback={<ScreenFallback />}>
                            {activeTab === 'inventory' && (
                                <InventoryScreen onReopenInCalculator={handleReopenInCalculator} />
                            )}
                            {activeTab === 'stock' && <StockAndFarmScreen />}
                            {activeTab === 'financial' && <FinancialScreen />}
                            {activeTab === 'settings' && <SettingsScreen />}
                        </Suspense>
                    )}
                </Layout>
                <Toaster position="top-center" richColors />
            </InventoryProvider>
        </SettingsProvider>
    );
}

export default App;
