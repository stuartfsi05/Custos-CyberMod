import { createContext, useContext } from 'react';
import { Settings, AuxiliaryCatalogItem } from '../types/settings';

export interface SettingsContextType {
    settings: Settings;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    replaceSettings: (newSettings: Settings) => void;
    deductFilamentWeight: (filamentId: string, gramsUsed: number) => void;
    upsertAuxiliaryItem: (name: string, price: number, category?: string) => AuxiliaryCatalogItem;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
