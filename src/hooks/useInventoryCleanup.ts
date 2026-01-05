import { useEffect } from 'react';
import { InventoryItem } from '../context/InventoryContext';

export const useInventoryCleanup = (
    inventory: InventoryItem[],
    setInventory: (items: InventoryItem[]) => void
) => {
    useEffect(() => {
        const now = new Date();
        const cleanInventory = inventory.filter(item => {
            if (item.status === 'rejected') {
                const date = new Date(item.updatedAt || item.date);
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return diffDays <= 7; // Keep only if less than 7 days
            }
            return true;
        });

        if (cleanInventory.length !== inventory.length) {
            setInventory(cleanInventory);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount
};
