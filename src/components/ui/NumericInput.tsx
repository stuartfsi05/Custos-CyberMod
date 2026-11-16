import { ChangeEvent, FocusEvent, InputHTMLAttributes, forwardRef, useState } from 'react';
import { parseNumber, sanitizeNumericInputString } from '../../utils/formatters';

export interface NumericInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'min' | 'max'> {
    value: number;
    onValueChange?: (val: number) => void;
    min?: number;
    max?: number;
    integer?: boolean;
    emptyFallback?: number;
}

/**
 * Controlled numeric input that renders `0` via placeholder, strips leading zeros
 * while typing (e.g. "030" -> "30"), and lets the user backspace freely without forcing "0".
 */
export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
    (
        {
            value,
            onValueChange,
            onChange,
            onFocus,
            onBlur,
            min,
            max,
            integer = false,
            emptyFallback = 0,
            placeholder = '0',
            inputMode,
            ...props
        },
        ref
    ) => {
        const [draft, setDraft] = useState<string | null>(null);
        const [prevValue, setPrevValue] = useState<number>(value);

        if (value !== prevValue) {
            setPrevValue(value);
            if (draft !== null) {
                const currentParsed =
                    draft.trim() === ''
                        ? emptyFallback
                        : integer
                            ? parseInt(draft, 10) || 0
                            : parseNumber(draft);
                if (Math.abs(currentParsed - value) > 1e-9) {
                    setDraft(value === 0 ? '' : String(value));
                }
            }
        }

        const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
            setDraft(value === 0 ? '' : String(value));
            onFocus?.(e);
        };

        const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
            setDraft(null);
            onBlur?.(e);
        };

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (raw === '' && e.currentTarget.validity?.badInput) {
                return;
            }

            const cleaned = sanitizeNumericInputString(raw);
            if (cleaned !== raw) {
                e.currentTarget.value = cleaned;
                e.target.value = cleaned;
            }

            setDraft(cleaned);

            if (cleaned.trim() === '') {
                onValueChange?.(emptyFallback);
            } else {
                let parsed = integer ? parseInt(cleaned, 10) || 0 : parseNumber(cleaned);
                if (typeof min === 'number') parsed = Math.max(min, parsed);
                if (typeof max === 'number') parsed = Math.min(max, parsed);
                onValueChange?.(parsed);
            }

            onChange?.(e);
        };

        const displayValue = draft !== null ? draft : value === 0 ? '' : String(value);

        return (
            <input
                ref={ref}
                type="number"
                inputMode={inputMode ?? (integer ? 'numeric' : 'decimal')}
                min={min}
                max={max}
                placeholder={placeholder}
                value={displayValue}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

NumericInput.displayName = 'NumericInput';
