import { useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { parseNumber } from '../utils/formatters';
import { SettingsContext, UpsertFilamentPresetInput, UpsertPrinterPresetInput } from './SettingsContext';
import {
    Settings,
    AuxiliaryCatalogItem,
    FilamentSpool,
    PrinterProfile,
    defaultSettings,
    defaultTiers,
    defaultExtras,
    defaultPrinters,
    defaultFilaments,
    defaultMarketplaces,
    defaultAuxiliaryCatalog,
    defaultBranding
} from '../types/settings';

const NUMERIC_SETTING_KEYS: ReadonlyArray<keyof Settings> = [
    'materialCost',
    'energyCost',
    'laborCost',
    'failMargin',
    'kwhRate',
    'taxPercent'
];

const V5_MIGRATION_KEY = 'custos_pro_v5_light_default';
const V6_MIGRATION_KEY = 'custos_v6_extended_presets';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useLocalStorage<Settings>('custos_settings', defaultSettings);

    // One-time migration for Light Mode default, extended presets and Auxiliary Catalog
    useEffect(() => {
        const alreadyMigratedV5 = typeof window !== 'undefined' && window.localStorage.getItem(V5_MIGRATION_KEY) === '1';
        const alreadyMigratedV6 = typeof window !== 'undefined' && window.localStorage.getItem(V6_MIGRATION_KEY) === '1';
        const missingFields =
            !settings ||
            !Array.isArray(settings.tiers) ||
            !Array.isArray(settings.extras) ||
            !Array.isArray(settings.printers) ||
            !Array.isArray(settings.filaments) ||
            !Array.isArray(settings.marketplaces) ||
            !Array.isArray(settings.auxiliaryCatalog) ||
            !Array.isArray(settings.favorites) ||
            !Array.isArray(settings.expenses) ||
            !settings.branding ||
            settings.kwhRate === undefined ||
            settings.useAdvancedMachineCost === undefined ||
            settings.taxPercent === undefined ||
            settings.defaultPrinterId === undefined;

        if (!alreadyMigratedV5 || !alreadyMigratedV6 || missingFields) {
            setSettings((prev: Settings) => {
                const existingPrinters = Array.isArray(prev?.printers) && prev.printers.length > 0 ? prev.printers : defaultPrinters;
                const existingPrinterIds = new Set(existingPrinters.map(p => p.id));
                const missingPrinters = !alreadyMigratedV6
                    ? defaultPrinters.filter(dp => !existingPrinterIds.has(dp.id))
                    : [];
                const mergedPrinters = missingPrinters.length > 0
                    ? [...existingPrinters, ...missingPrinters]
                    : existingPrinters;

                const existingFilaments = Array.isArray(prev?.filaments) && prev.filaments.length > 0 ? prev.filaments : defaultFilaments;
                const existingFilamentIds = new Set(existingFilaments.map(f => f.id));
                const missingFilaments = !alreadyMigratedV6
                    ? defaultFilaments.filter(df => !existingFilamentIds.has(df.id))
                    : [];
                const mergedFilaments = missingFilaments.length > 0
                    ? [...existingFilaments, ...missingFilaments]
                    : existingFilaments;

                return {
                    ...defaultSettings,
                    ...(prev || {}),
                    theme: !alreadyMigratedV5 ? 'light' : (prev?.theme || 'light'),
                    failMargin: !alreadyMigratedV5 ? defaultSettings.failMargin : (prev?.failMargin ?? defaultSettings.failMargin),
                    tiers: Array.isArray(prev?.tiers) && prev.tiers.length > 0 ? prev.tiers : defaultTiers,
                    extras: Array.isArray(prev?.extras) ? prev.extras : defaultExtras,
                    printers: mergedPrinters,
                    filaments: mergedFilaments,
                    marketplaces: Array.isArray(prev?.marketplaces) && prev.marketplaces.length > 0 ? prev.marketplaces : defaultMarketplaces,
                    auxiliaryCatalog: Array.isArray(prev?.auxiliaryCatalog) && prev.auxiliaryCatalog.length > 0 ? prev.auxiliaryCatalog : defaultAuxiliaryCatalog,
                    favorites: Array.isArray(prev?.favorites) ? prev.favorites : [],
                    expenses: Array.isArray(prev?.expenses) ? prev.expenses : [],
                    branding: {
                        ...defaultBranding,
                        ...(prev?.branding || {})
                    },
                    kwhRate: prev?.kwhRate ?? defaultSettings.kwhRate,
                    useAdvancedMachineCost: prev?.useAdvancedMachineCost ?? defaultSettings.useAdvancedMachineCost,
                    taxPercent: prev?.taxPercent ?? defaultSettings.taxPercent,
                    defaultPrinterId: !alreadyMigratedV5 ? defaultSettings.defaultPrinterId : (prev?.defaultPrinterId ?? defaultSettings.defaultPrinterId)
                };
            });

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(V5_MIGRATION_KEY, '1');
                window.localStorage.setItem(V6_MIGRATION_KEY, '1');
            }
        }
    }, [settings, setSettings]);

    const safeSettings: Settings = {
        ...defaultSettings,
        ...(settings || {}),
        tiers: Array.isArray(settings?.tiers) && settings.tiers.length > 0 ? settings.tiers : defaultTiers,
        extras: Array.isArray(settings?.extras) ? settings.extras : defaultExtras,
        printers: Array.isArray(settings?.printers) && settings.printers.length > 0 ? settings.printers : defaultPrinters,
        filaments: Array.isArray(settings?.filaments) && settings.filaments.length > 0 ? settings.filaments : defaultFilaments,
        marketplaces: Array.isArray(settings?.marketplaces) && settings.marketplaces.length > 0 ? settings.marketplaces : defaultMarketplaces,
        auxiliaryCatalog: Array.isArray(settings?.auxiliaryCatalog) ? settings.auxiliaryCatalog : defaultAuxiliaryCatalog,
        favorites: Array.isArray(settings?.favorites) ? settings.favorites : [],
        expenses: Array.isArray(settings?.expenses) ? settings.expenses : [],
        branding: {
            ...defaultBranding,
            ...(settings?.branding || {})
        }
    };

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev: Settings) => {
            const base = { ...defaultSettings, ...(prev || {}) };
            const parsedValue = NUMERIC_SETTING_KEYS.includes(key)
                ? (parseNumber(value as string | number) as Settings[K])
                : value;
            return {
                ...base,
                [key]: parsedValue
            };
        });
    };

    const replaceSettings = (newSettings: Settings) => {
        setSettings({
            ...defaultSettings,
            ...newSettings,
            branding: {
                ...defaultBranding,
                ...(newSettings?.branding || {})
            }
        });
    };

    const deductFilamentWeight = (filamentId: string, gramsUsed: number) => {
        if (!filamentId || gramsUsed <= 0) return;
        setSettings((prev: Settings) => {
            const base = { ...defaultSettings, ...(prev || {}) };
            const currentFilaments = Array.isArray(base.filaments) ? base.filaments : defaultFilaments;
            return {
                ...base,
                filaments: currentFilaments.map((spool) => {
                    if (spool.id !== filamentId || spool.isConsigned) return spool;
                    const nextRemaining = Math.max(0, Math.round((spool.remainingWeightG - gramsUsed) * 100) / 100);
                    return { ...spool, remainingWeightG: nextRemaining };
                })
            };
        });
    };

    const upsertAuxiliaryItem = (name: string, price: number, category = 'Geral'): AuxiliaryCatalogItem => {
        const trimmedName = name.trim();
        const existing = safeSettings.auxiliaryCatalog.find(
            item => item.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existing) {
            const updatedItem = { ...existing, price };
            updateSetting(
                'auxiliaryCatalog',
                safeSettings.auxiliaryCatalog.map(item => (item.id === existing.id ? updatedItem : item))
            );
            return updatedItem;
        }
        const created: AuxiliaryCatalogItem = {
            id: `aux_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            name: trimmedName,
            price: Math.max(0, price),
            category
        };
        updateSetting('auxiliaryCatalog', [created, ...safeSettings.auxiliaryCatalog]);
        return created;
    };

    const upsertFilamentPreset = (input: UpsertFilamentPresetInput): FilamentSpool => {
        const trimmedName = input.name.trim();
        const totalG = Math.max(1, input.totalWeightG ?? 1000);
        const pricePerKg = input.isConsigned ? 0 : Math.max(0, input.pricePerKg);
        const existing = safeSettings.filaments.find(
            spool => spool.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existing) {
            const updatedSpool: FilamentSpool = {
                ...existing,
                material: input.material ?? existing.material,
                pricePerKg,
                isConsigned: input.isConsigned ?? existing.isConsigned
            };
            updateSetting(
                'filaments',
                safeSettings.filaments.map(s => (s.id === existing.id ? updatedSpool : s))
            );
            return updatedSpool;
        }
        const created: FilamentSpool = {
            id: `fil_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            name: trimmedName,
            material: input.material ?? 'PLA',
            brand: 'Personalizado',
            colorHex: '#10b981',
            pricePerKg,
            totalWeightG: totalG,
            remainingWeightG: totalG,
            isConsigned: input.isConsigned ?? false
        };
        updateSetting('filaments', [created, ...safeSettings.filaments]);
        return created;
    };

    const upsertPrinterPreset = (input: UpsertPrinterPresetInput): PrinterProfile => {
        const trimmedName = input.name.trim();
        const existing = safeSettings.printers.find(
            printer => printer.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existing) {
            const updatedPrinter: PrinterProfile = {
                ...existing,
                technology: input.technology ?? existing.technology,
                powerWatts: Math.max(1, input.powerWatts),
                purchasePrice: Math.max(0, input.purchasePrice),
                lifespanHours: Math.max(1, input.lifespanHours),
                maintenancePercent: Math.max(0, input.maintenancePercent ?? existing.maintenancePercent)
            };
            updateSetting(
                'printers',
                safeSettings.printers.map(p => (p.id === existing.id ? updatedPrinter : p))
            );
            return updatedPrinter;
        }
        const created: PrinterProfile = {
            id: `printer_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            name: trimmedName,
            technology: input.technology ?? 'FDM',
            powerWatts: Math.max(1, input.powerWatts),
            purchasePrice: Math.max(0, input.purchasePrice),
            lifespanHours: Math.max(1, input.lifespanHours),
            maintenancePercent: Math.max(0, input.maintenancePercent ?? 10),
            status: 'idle'
        };
        updateSetting('printers', [created, ...safeSettings.printers]);
        return created;
    };

    useEffect(() => {
        const root = window.document.documentElement;
        const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = safeSettings.theme === 'dark' || (safeSettings.theme === 'system' && prefersDark);

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [safeSettings.theme]);

    return (
        <SettingsContext.Provider
            value={{
                settings: safeSettings,
                updateSetting,
                replaceSettings,
                deductFilamentWeight,
                upsertAuxiliaryItem,
                upsertFilamentPreset,
                upsertPrinterPreset
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
