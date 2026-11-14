import type {
    AuxiliaryCatalogItem,
    CompanyBranding,
    ExtraCost,
    FilamentSpool,
    MarketplaceChannel,
    PricingTier,
    PrinterProfile,
    Settings
} from '../types/settings';

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

export const defaultPrinters: PrinterProfile[] = [
    {
        id: 'printer_snapmaker_u1',
        name: 'Snapmaker U1',
        technology: 'FDM',
        powerWatts: 400,
        purchasePrice: 12000,
        lifespanHours: 8000,
        maintenancePercent: 0,
        status: 'idle'
    },
    {
        id: 'printer_bambu_p1s',
        name: 'Bambu Lab P1S / X1C',
        technology: 'FDM',
        powerWatts: 120,
        purchasePrice: 5500,
        lifespanHours: 5000,
        maintenancePercent: 15,
        status: 'idle'
    },
    {
        id: 'printer_bambu_a1',
        name: 'Bambu Lab A1 / Mini',
        technology: 'FDM',
        powerWatts: 150,
        purchasePrice: 3200,
        lifespanHours: 4000,
        maintenancePercent: 15,
        status: 'idle'
    },
    {
        id: 'printer_k1c',
        name: 'Creality K1C / K1 Max',
        technology: 'FDM',
        powerWatts: 350,
        purchasePrice: 4200,
        lifespanHours: 4000,
        maintenancePercent: 15,
        status: 'idle'
    },
    {
        id: 'printer_ender3',
        name: 'Ender 3 / V3 SE / KE',
        technology: 'FDM',
        powerWatts: 120,
        purchasePrice: 1400,
        lifespanHours: 3000,
        maintenancePercent: 20,
        status: 'idle'
    },
    {
        id: 'printer_sla',
        name: 'Impressora Resina SLA/MSLA',
        technology: 'SLA',
        powerWatts: 85,
        purchasePrice: 2200,
        lifespanHours: 2000,
        maintenancePercent: 25,
        status: 'idle'
    }
];

export const defaultFilaments: FilamentSpool[] = [
    {
        id: 'fil_pla_generic',
        name: 'PLA Genérico',
        material: 'PLA',
        brand: 'Padrão',
        colorHex: '#6366f1',
        pricePerKg: 110,
        totalWeightG: 1000,
        remainingWeightG: 1000,
        isConsigned: false
    },
    {
        id: 'fil_pla_black',
        name: 'PLA Preto Fosco',
        material: 'PLA',
        brand: '3D Lab / Voolt3D',
        colorHex: '#18181b',
        pricePerKg: 120,
        totalWeightG: 1000,
        remainingWeightG: 850,
        isConsigned: false
    },
    {
        id: 'fil_petg_white',
        name: 'PETG Branco Neve',
        material: 'PETG',
        brand: '3D Prime',
        colorHex: '#e4e4e7',
        pricePerKg: 135,
        totalWeightG: 1000,
        remainingWeightG: 920,
        isConsigned: false
    },
    {
        id: 'fil_consigned',
        name: 'Material do Cliente (Consignado)',
        material: 'Outro',
        brand: 'Cliente',
        colorHex: '#10b981',
        pricePerKg: 0,
        totalWeightG: 1000,
        remainingWeightG: 1000,
        isConsigned: true
    }
];

export const defaultMarketplaces: MarketplaceChannel[] = [
    { id: 'direct', name: 'Sem taxa / Venda direta (PIX)', commissionPercent: 0, fixedFee: 0 },
    { id: 'card', name: 'Cartão / Link de Pagamento', commissionPercent: 4.99, fixedFee: 0 },
    { id: 'ml_classic', name: 'Mercado Livre Clássico', commissionPercent: 14, fixedFee: 6.00 },
    { id: 'ml_premium', name: 'Mercado Livre Premium', commissionPercent: 19, fixedFee: 6.00 },
    { id: 'shopee_std', name: 'Shopee Padrão', commissionPercent: 14, fixedFee: 4.00 },
    { id: 'shopee_free', name: 'Shopee Frete Grátis', commissionPercent: 20, fixedFee: 4.00 }
];

export const defaultAuxiliaryCatalog: AuxiliaryCatalogItem[] = [
    { id: 'aux_cola', name: 'Cola Instantânea / Cianoacrilato', price: 1.00, category: 'Adesivos' },
    { id: 'aux_argola', name: 'Argola de Chaveiro', price: 0.45, category: 'Chaveiros' },
    { id: 'aux_ima', name: 'Ímã de Neodímio 8x3mm', price: 1.20, category: 'Fixação' },
    { id: 'aux_insert', name: 'Insert Metálico M3', price: 0.35, category: 'Hardware' },
    { id: 'aux_parafuso', name: 'Parafuso M3x12', price: 0.25, category: 'Hardware' },
    { id: 'aux_vhb', name: 'Fita Dupla Face VHB', price: 0.80, category: 'Fixação' }
];

export const defaultBranding: CompanyBranding = {
    companyName: 'CyberMod 3D Studio',
    companyDoc: '',
    companyPhone: '',
    companyEmail: '',
    companyInstagram: '@cybermod3d',
    companyLogoUrl: 'logo_light.png',
    quoteValidityDays: 7,
    quoteTerms: 'Prazo de produção inicia após confirmação do pagamento do sinal (50%). Peças impressas em 3D podem apresentar leves marcas de camadas características do processo.'
};

export const defaultSettings: Settings = {
    materialCost: 110.00,
    energyCost: 1.50,
    laborCost: 33.00,
    failMargin: 1.00,
    kwhRate: 1.50,
    useAdvancedMachineCost: true,
    taxPercent: 0,
    theme: 'light',
    tiers: defaultTiers,
    extras: defaultExtras,
    printers: defaultPrinters,
    defaultPrinterId: 'printer_snapmaker_u1',
    filaments: defaultFilaments,
    marketplaces: defaultMarketplaces,
    auxiliaryCatalog: defaultAuxiliaryCatalog,
    favorites: [],
    branding: defaultBranding,
    expenses: []
};
