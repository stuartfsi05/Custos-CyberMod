export interface PricingTier {
    id: string;
    name: string;
    multiplier: number;
    badge?: string;
    isWholesale?: boolean;
    defaultExtras?: string[]; // IDs of extras enabled by default
}

export interface ExtraCost {
    id: string;
    name: string;
    price: number;
    active: boolean; // logically deleted or active? Let's use it for "available in list"
}

export interface Settings {
    materialCost: number;
    energyCost: number;
    laborCost: number;
    failMargin: number;
    theme: 'dark' | 'light' | 'system';
    tiers: PricingTier[];
    extras: ExtraCost[];
}

export const defaultTiers: PricingTier[] = [
    { id: 'cost', name: 'Custo (Nível 1)', multiplier: 1.00, defaultExtras: [] },
    { id: 'friends', name: 'Amigos (Nível 2)', multiplier: 1.10, defaultExtras: [] },
    { id: 'wholesale', name: 'Atacado (Nível 3)', multiplier: 1.25, isWholesale: true, defaultExtras: [] },
    { id: 'retail', name: 'Varejo (Nível 4)', multiplier: 1.50, badge: 'Padrão', defaultExtras: [] },
    { id: 'urgent', name: 'Urgente (Nível 5)', multiplier: 1.80, badge: 'Prioridade', defaultExtras: [] }
];

export const defaultExtras: ExtraCost[] = [
    { id: 'sandpaper', name: 'Lixa / Acabamento', price: 2.00, active: true },
    { id: 'glue', name: 'Cola / Adesivo', price: 1.50, active: true },
    { id: 'varnish', name: 'Verniz / Pintura', price: 5.00, active: true }
];

export const defaultSettings: Settings = {
    materialCost: 150.00,
    energyCost: 1.50,
    laborCost: 10.00,
    failMargin: 1.10,
    theme: 'dark',
    tiers: defaultTiers,
    extras: defaultExtras
};
