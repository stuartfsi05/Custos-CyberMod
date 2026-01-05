export const parseNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // Replace comma with dot for decimal separation
    const cleanStr = String(value).trim().replace(',', '.');
    // Remove any other non-numeric characters except dot and minus
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
};

export const timeToDecimal = (timeStr: string | number): number => {
    if (!timeStr) return 0;

    const str = String(timeStr).trim();

    // Handle decimal input (e.g., "1.5" or "1,5")
    if (!str.includes(':')) {
        return parseNumber(str);
    }

    const [hours, minutes] = str.split(':').map(val => parseNumber(val));

    // Safe handling for missing minutes
    const mins = minutes || 0;

    return hours + (mins / 60);
};

export const decimalToTime = (decimal: number): string => {
    if (isNaN(decimal) || decimal === 0) return "0:00";

    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const parseCurrency = (str: string): number => {
    if (!str) return 0;
    // Remove "R$" and any non-numeric chars except comma and dot
    // Then assume format is 1.234,56 (common in BR) -> remove dots, replace comma with dot
    const cleanStr = str.replace('R$', '').trim();

    // Check if it has comma as decimal separator
    if (cleanStr.includes(',')) {
        // Remove thousands separators (dots) and replace decimal comma with dot
        return parseFloat(cleanStr.replace(/\./g, '').replace(',', '.')) || 0;
    }

    // If no comma, assume it's already using dot or is an integer
    return parseFloat(cleanStr) || 0;
};
