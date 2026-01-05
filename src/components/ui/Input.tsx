import React, { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, icon: Icon, ...props }, ref) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={twMerge(
                        "flex h-12 w-full rounded-xl border border-input bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
                        Icon && "pl-10",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
