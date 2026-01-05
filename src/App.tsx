import { useState } from 'react';
import { Toaster } from 'sonner';
import { SettingsProvider } from './context/SettingsContext';
import { InventoryProvider } from './context/InventoryProvider';
import { Layout } from './components/layout/Layout';
import { CalculatorScreen } from './pages/CalculatorScreen';
import { InventoryScreen } from './pages/InventoryScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { TEXTS } from './constants/texts';

function App() {
    const [activeTab, setActiveTab] = useState<string>('calculator');

    const renderScreen = () => {
        switch (activeTab) {
            case 'calculator':
                return <CalculatorScreen />;
            case 'inventory':
                return <InventoryScreen />;
            case 'settings':
                return <SettingsScreen />;
            default:
                return <CalculatorScreen />;
        }
    };

    return (
        <SettingsProvider>
            <InventoryProvider>
                <Layout activeTab={activeTab} onTabChange={setActiveTab}>
                    {renderScreen()}
                </Layout>
                <Toaster position="top-center" richColors />
            </InventoryProvider>
        </SettingsProvider>
    );
}

export default App;
