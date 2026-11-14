import { useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { parseNumber } from '../utils/formatters';
import { SettingsContext } from './SettingsContext';
import {
    Settings,
    AuxiliaryCatalogItem,
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

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useLocalStorage<Settings>('custos_settings', defaultSettings);

    // One-time migration for Light Mode default, Snapmaker U1 preset and Auxiliary Catalog
    useEffect(() => {
        const alreadyMigratedV5 = typeof window !== 'undefined' && window.localStorage.getItem(V5_MIGRATION_KEY) === '1';
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

        if (!alreadyMigratedV5 || missingFields) {
            setSettings((prev: Settings) => {
                const existingPrinters = Array.isArray(prev?.printers) && prev.printers.length > 0 ? prev.printers : defaultPrinters;
                const hasSnapmaker = existingPrinters.some(p => p.id === 'printer_snapmaker_u1');
                const mergedPrinters = hasSnapmaker
                    ? existingPrinters
                    : [defaultPrinters[0], ...existingPrinters];

                const existingFilaments = Array.isArray(prev?.filaments) && prev.filaments.length > 0 ? prev.filaments : defaultFilaments;
                const hasGenericPla = existingFilaments.some(f => f.id === 'fil_pla_generic');
                const mergedFilaments = hasGenericPla
                    ? existingFilaments
                    : [defaultFilaments[0], ...existingFilaments];

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
                upsertAuxiliaryItem
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
