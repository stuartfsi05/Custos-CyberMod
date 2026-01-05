import React, { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> { }

export const Card = ({ children, className, ...props }: CardProps) => {
    return (
        <div
            className={twMerge(
                "glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:bg-white/60 dark:hover:bg-zinc-900/60",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
