import { Drawer } from 'vaul';
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BottomSheetProps {
    trigger?: ReactNode;
    children: ReactNode;
    title?: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

export const BottomSheet = ({ trigger, children, title, description, open, onOpenChange, className }: BottomSheetProps) => {
    return (
        <Drawer.Root shouldScaleBackground open={open} onOpenChange={onOpenChange}>
            {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Drawer.Content className={clsx("bg-zinc-100 dark:bg-zinc-900 flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none", className)}>
                    <div className="p-4 bg-white dark:bg-zinc-950 rounded-t-[10px] flex-1">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-800 mb-8" />
                        <div className="max-w-md mx-auto">
                            {title && <Drawer.Title className="font-bold text-2xl mb-2">{title}</Drawer.Title>}
                            {description && <Drawer.Description className="text-zinc-500 mb-6">{description}</Drawer.Description>}
                            {children}
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
