import { createContext, useContext } from 'react';

export interface CostBreakdown {
    material: number;
    labor: number;
    machine: number;
    extras: number;
    base: number;
    shipping: number;
}

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
    date: string;
    updatedAt?: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface InventoryContextType {
    inventory: InventoryItem[];
    addToInventory: (item: Omit<InventoryItem, 'id' | 'date' | 'updatedAt' | 'status'>) => void;
    removeFromInventory: (id: number) => void;
    updateStatus: (id: number, newStatus: 'pending' | 'approved' | 'rejected') => void;
    updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => void;
    clearInventory: () => void;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = (): InventoryContextType => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
