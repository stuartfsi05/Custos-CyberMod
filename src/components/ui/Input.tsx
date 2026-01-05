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
        <div className="space-y-2 group/field">
            {label && (
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-focus-within/field:text-indigo-500 transition-colors ml-1">
                    {label}
                </label>
            )}
            <div className="relative group transition-all duration-300">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors duration-300 z-10">
                        <Icon size={20} className="transition-transform group-focus-within:scale-110" />
                    </div>
                )}
                <input
                    className={twMerge(
                        "flex h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm px-4 py-2 text-base md:text-lg font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 focus-visible:bg-white dark:focus-visible:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700/50",
                        Icon && "pl-12",
                        error && "border-red-500/50 focus-visible:ring-red-500/30 focus-visible:border-red-500 bg-red-50/10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 font-bold ml-1 animate-in slide-in-from-top-1 fade-in duration-200">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
