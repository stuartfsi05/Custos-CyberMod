export const timeToDecimal = (timeStr: string | number): number => {
    if (!timeStr) return 0;

    const str = String(timeStr);
    // Handle decimal input (e.g., "1.5")
    if (!str.includes(':')) {
        const floatVal = parseFloat(str);
        return isNaN(floatVal) ? 0 : floatVal;
    }

    const [hours, minutes] = str.split(':').map(Number);
    if (isNaN(hours)) return 0;

    // Safe handling for missing minutes
    const mins = isNaN(minutes) ? 0 : minutes;

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
    // Remove "R$" and replace comma with dot if necessary
    // Simple parsing logic
    return parseFloat(str.replace('R$', '').trim().replace(/\./g, '').replace(',', '.')) || 0;
};
