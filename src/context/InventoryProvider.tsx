import { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
    InventoryContext,
    InventoryItem,
    InventoryItemStatus,
    NewInventoryItemInput,
    PaymentStatus
} from './InventoryContext';
import { useInventoryCleanup } from '../hooks/useInventoryCleanup';

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('custos_inventory', []);

    useInventoryCleanup(inventory, setInventory);

    const vibrate = (pattern: number | number[] = 50) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    const addToInventory = (item: NewInventoryItemInput) => {
        vibrate([50, 50, 50]);
        setInventory((prev) => [
            {
                ...item,
                qty: item.qty && item.qty > 0 ? item.qty : 1,
                paymentStatus: item.paymentStatus ?? 'unpaid',
                id: Date.now(),
                date: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: item.status ?? 'pending'
            },
            ...prev
        ]);
    };

    const replaceInventory = (items: InventoryItem[]) => {
        vibrate(50);
        setInventory(Array.isArray(items) ? items : []);
    };

    const removeFromInventory = (id: number) => {
        vibrate(50);
        setInventory((prev) => prev.filter(item => item.id !== id));
    };

    const updateStatus = (id: number, newStatus: InventoryItemStatus) => {
        if (newStatus === 'approved' || newStatus === 'completed' || newStatus === 'delivered') {
            vibrate([50, 80]);
        } else {
            vibrate(50);
        }

        setInventory((prev) => prev.map(item =>
            item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
        ));
    };

    const updatePaymentStatus = (id: number, paymentStatus: PaymentStatus) => {
        vibrate(30);
        setInventory((prev) => prev.map(item =>
            item.id === id ? { ...item, paymentStatus, updatedAt: new Date().toISOString() } : item
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

    const clearTrash = () => {
        vibrate(100);
        setInventory((prev) => prev.filter(item => item.status !== 'rejected'));
    };

    return (
        <InventoryContext.Provider
            value={{
                inventory,
                addToInventory,
                replaceInventory,
                removeFromInventory,
                updateStatus,
                updatePaymentStatus,
                updateInventoryItem,
                clearInventory,
                clearTrash
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
};
