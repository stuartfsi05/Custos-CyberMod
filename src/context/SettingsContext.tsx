import { createContext, useContext } from 'react';
import { Settings, AuxiliaryCatalogItem, FilamentSpool, PrinterProfile } from '../types/settings';

export interface UpsertFilamentPresetInput {
    name: string;
    material?: FilamentSpool['material'];
    pricePerKg: number;
    totalWeightG?: number;
    isConsigned?: boolean;
}

export interface UpsertPrinterPresetInput {
    name: string;
    technology?: 'FDM' | 'SLA';
    powerWatts: number;
    purchasePrice: number;
    lifespanHours: number;
    maintenancePercent?: number;
}

export interface SettingsContextType {
    settings: Settings;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    replaceSettings: (newSettings: Settings) => void;
    deductFilamentWeight: (filamentId: string, gramsUsed: number) => void;
    upsertAuxiliaryItem: (name: string, price: number, category?: string) => AuxiliaryCatalogItem;
    upsertFilamentPreset: (input: UpsertFilamentPresetInput) => FilamentSpool;
    upsertPrinterPreset: (input: UpsertPrinterPresetInput) => PrinterProfile;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
