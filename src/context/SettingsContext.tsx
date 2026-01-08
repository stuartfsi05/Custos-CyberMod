import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { parseNumber } from '../utils/formatters';
import { Settings, defaultSettings } from '../types/settings';

interface SettingsContextType {
    settings: Settings;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    // We utilize the existing useLocalStorage hook. 
    // Ideally, we'd migrate useLocalStorage to TS as well, but for now we expect it to return [any, func]
    const [settings, setSettings] = useLocalStorage('custos_settings', defaultSettings);

    // Migration Effect: Ensure new fields (tiers, extras) exist
    useEffect(() => {
        let shouldUpdate = false;
        const newSettings = { ...settings };

        if (!newSettings.tiers || !Array.isArray(newSettings.tiers)) {
            newSettings.tiers = defaultSettings.tiers;
            shouldUpdate = true;
        }

        if (!newSettings.extras || !Array.isArray(newSettings.extras)) {
            newSettings.extras = defaultSettings.extras;
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            setSettings((prev: Settings) => ({
                ...defaultSettings,
                ...prev,
                tiers: newSettings.tiers,
                extras: newSettings.extras
            }));
        }
    }, [settings, setSettings]);

    // Derived state for safety during render
    const safeSettings: Settings = {
        ...defaultSettings,
        ...settings,
        tiers: (settings?.tiers && Array.isArray(settings.tiers)) ? settings.tiers : defaultSettings.tiers,
        extras: (settings?.extras && Array.isArray(settings.extras)) ? settings.extras : defaultSettings.extras
    };

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev: Settings) => ({
            ...prev,
            [key]: (key === 'theme' || key === 'tiers' || key === 'extras') ? value : parseNumber(value as string | number),
        }));
    };

    // ... theme effect ...
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = safeSettings.theme === 'dark'; // Use safeSettings

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [safeSettings.theme]);

    return (
        <SettingsContext.Provider value={{ settings: safeSettings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
