import { createContext, useContext } from 'react';
import type { CostBreakdown } from '../types/settings';
import type {
    AdditionalMaterialInput,
    SelectedAuxiliaryItem,
    TaxIncidenceMode,
    TaxPassThroughMode,
    DiscountType
} from '../hooks/usePricingEngine';
import type { QuoteLineItem } from '../components/calculator/QuoteDocumentModal';

export type { CostBreakdown };

export type InventoryItemStatus =
    | 'pending'
    | 'approved'
    | 'printing'
    | 'completed'
    | 'delivered'
    | 'rejected';

export type PaymentStatus = 'unpaid' | 'half' | 'paid';

export interface InventoryItem {
    id: number;
    partName: string;
    weightG: number;
    printTime: string | number;
    workTime: string | number;
    costs: CostBreakdown;
    tierRetail: number;
    selectedTier: string;
    activeExtras?: string[];
    qty?: number;
    printerId?: string;
    filamentId?: string;
    marketplaceId?: string;
    paymentStatus?: PaymentStatus;
    netProfit?: number;
    markupPercent?: number;
    costMode?: 'per_piece' | 'per_batch';
    packagingCost?: number;
    hardwareCost?: number;
    setupMinutes?: number;
    postMinutes?: number;
    failPercent?: number;
    manualMaterialName?: string;
    materialCostPerKg?: number;
    additionalMaterials?: AdditionalMaterialInput[];
    manualPrinterName?: string;
    powerWatts?: number;
    machineValue?: number;
    kwhRate?: number;
    lifespanHours?: number;
    maintenancePercent?: number;
    laborRatePerHour?: number;
    auxiliaryItems?: SelectedAuxiliaryItem[];
    commissionPercent?: number;
    fixedFee?: number;
    taxPercent?: number;
    taxMode?: TaxIncidenceMode;
    taxPassThrough?: TaxPassThroughMode;
    discountType?: DiscountType;
    discountValue?: number;
    quoteItems?: QuoteLineItem[];
    stockDeducted?: boolean;
    photoUrl?: string;
    description?: string;
    customerName?: string;
    customerDoc?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string; // Legacy / Full String

    // Structured Address
    addressCep?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;

    notes?: string;
    date: string;
    updatedAt?: string;
    status: InventoryItemStatus;
}

export type NewInventoryItemInput = Omit<InventoryItem, 'id' | 'date' | 'updatedAt' | 'status'> & {
    status?: InventoryItemStatus;
};

export interface InventoryContextType {
    inventory: InventoryItem[];
    addToInventory: (item: NewInventoryItemInput) => void;
    replaceInventory: (items: InventoryItem[]) => void;
    removeFromInventory: (id: number) => void;
    updateStatus: (id: number, newStatus: InventoryItemStatus) => void;
    updatePaymentStatus: (id: number, paymentStatus: PaymentStatus) => void;
    updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => void;
    clearInventory: () => void;
    clearTrash: () => void;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = (): InventoryContextType => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
