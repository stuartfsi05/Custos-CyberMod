export interface CostBreakdown {
    material: number;
    machine: number;
    labor: number;
    extras: number;
    base: number;
    shipping: number;
    energyKwhCost?: number;
    depreciationCost?: number;
    maintenanceCost?: number;
    packaging?: number;
    marketplaceFee?: number;
    taxAmount?: number;
}

export interface PricingTier {
    id: string;
    name: string;
    multiplier: number;
    badge?: string;
    isWholesale?: boolean;
    defaultExtras?: string[];
}

export interface ExtraCost {
    id: string;
    name: string;
    price: number;
    active: boolean;
}

export interface PrinterProfile {
    id: string;
    name: string;
    technology: 'FDM' | 'SLA';
    powerWatts: number;
    purchasePrice: number;
    lifespanHours: number;
    maintenancePercent: number;
    status: 'idle' | 'printing' | 'maintenance';
}

export interface FilamentSpool {
    id: string;
    name: string;
    material: 'PLA' | 'PETG' | 'ABS' | 'ASA' | 'TPU' | 'Resina' | 'Outro';
    brand: string;
    colorHex: string;
    pricePerKg: number;
    totalWeightG: number;
    remainingWeightG: number;
    isConsigned: boolean;
}

export interface MarketplaceChannel {
    id: string;
    name: string;
    commissionPercent: number;
    fixedFee: number;
}

export interface AuxiliaryCatalogItem {
    id: string;
    name: string;
    price: number;
    category: string;
}

export interface CalculatorPresetFavorite {
    id: string;
    name: string;
    partName: string;
    description?: string;
    printerId: string;
    manualPrinterName: string;
    filamentId: string;
    manualMaterialName: string;
    materialCostPerKg: number;
    weightG: number;
    qty: number;
    printHours: number;
    printMinutes: number;
    powerWatts: number;
    machineValue: number;
    kwhRate: number;
    lifespanHours: number;
    laborRatePerHour: number;
    setupMinutes: number;
    postMinutes: number;
    packagingCost: number;
    hardwareCost: number;
    failPercent: number;
    costMode: 'per_piece' | 'per_batch';
    markupPercent: number;
}

export interface CompanyBranding {
    companyName: string;
    companyDoc: string;
    companyPhone: string;
    companyEmail: string;
    companyInstagram: string;
    companyLogoUrl: string;
    quoteValidityDays: number;
    quoteTerms: string;
}

export interface ExpenseRecord {
    id: string;
    description: string;
    category: 'filamento' | 'energia' | 'manutencao' | 'embalagem' | 'marketing' | 'outros';
    amount: number;
    date: string;
}

export interface Settings {
    materialCost: number;
    energyCost: number;
    laborCost: number;
    failMargin: number;
    kwhRate: number;
    useAdvancedMachineCost: boolean;
    taxPercent: number;
    theme: 'dark' | 'light' | 'system';
    tiers: PricingTier[];
    extras: ExtraCost[];
    printers: PrinterProfile[];
    defaultPrinterId: string;
    filaments: FilamentSpool[];
    marketplaces: MarketplaceChannel[];
    auxiliaryCatalog: AuxiliaryCatalogItem[];
    favorites: CalculatorPresetFavorite[];
    branding: CompanyBranding;
    expenses: ExpenseRecord[];
}

export {
    defaultTiers,
    defaultExtras,
    defaultPrinters,
    defaultFilaments,
    defaultMarketplaces,
    defaultAuxiliaryCatalog,
    defaultBranding,
    defaultSettings
} from '../constants/defaultSettings';
