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

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev: Settings) => ({
            ...prev,
            [key]: key === 'theme' || key === 'tiers' ? value : parseNumber(value as string | number),
        }));
    };

    // Apply Theme Side-Effect
    useEffect(() => {
        const root = window.document.documentElement;
        // Logic to handle system theme if needed, but for now strictly dark/light based on settings
        // If system, we'd need a media query listener. keeping it simple as per original logic + types.
        const isDark = settings.theme === 'dark';

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings.theme]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
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
