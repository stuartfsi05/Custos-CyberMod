import React, { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { InventoryContext, InventoryItem } from './InventoryContext';
import { useInventoryCleanup } from '../hooks/useInventoryCleanup';

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('custos_inventory', []);

    // Encapsulated cleanup logic
    useInventoryCleanup(inventory, setInventory);

    const vibrate = (pattern: number | number[] = 50) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    const addToInventory = (item: Omit<InventoryItem, 'id' | 'date' | 'updatedAt' | 'status'>) => {
        vibrate([50, 50, 50]); // Success pattern
        setInventory((prev) => [
            {
                ...item,
                id: Date.now(),
                date: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'pending' // pending, approved, rejected
            },
            ...prev
        ]);
    };

    const removeFromInventory = (id: number) => {
        vibrate(50);
        setInventory((prev) => prev.filter(item => item.id !== id));
    };

    const updateStatus = (id: number, newStatus: 'pending' | 'approved' | 'rejected') => {
        if (newStatus === 'approved') vibrate([50, 80]); // Double tap for approve
        else vibrate(50); // Single for others

        setInventory((prev) => prev.map(item =>
            item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
        ));
    };

    const updateInventoryItem = (id: number, updates: Partial<InventoryItem>) => {
        vibrate(50);
        setInventory((prev) => prev.map(item =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        ));
    };

    const clearInventory = () => {
        vibrate(100);
        setInventory([]);
    };

    return (
        <InventoryContext.Provider value={{ inventory, addToInventory, removeFromInventory, updateStatus, updateInventoryItem, clearInventory }}>
            {children}
        </InventoryContext.Provider>
    );
};
