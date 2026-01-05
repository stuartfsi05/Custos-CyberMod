export interface PricingTier {
    id: string;
    name: string;
    multiplier: number;
    badge?: string;
    isWholesale?: boolean;
}

export interface Settings {
    materialCost: number;
    energyCost: number;
    laborCost: number;
    failMargin: number;
    theme: 'dark' | 'light' | 'system';
    tiers: PricingTier[];
}

export const defaultTiers: PricingTier[] = [
    { id: 'cost', name: 'Custo (Nível 1)', multiplier: 1.00 },
    { id: 'friends', name: 'Amigos (Nível 2)', multiplier: 1.10 },
    { id: 'wholesale', name: 'Atacado (Nível 3)', multiplier: 1.25, isWholesale: true },
    { id: 'retail', name: 'Varejo (Nível 4)', multiplier: 1.50, badge: 'Padrão' },
    { id: 'urgent', name: 'Urgente (Nível 5)', multiplier: 1.80, badge: 'Prioridade' }
];

export const defaultSettings: Settings = {
    materialCost: 150.00,
    energyCost: 1.50,
    laborCost: 10.00,
    failMargin: 1.10,
    theme: 'dark',
    tiers: defaultTiers
};
