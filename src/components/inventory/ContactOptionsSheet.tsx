import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { MessageCircle, Send } from 'lucide-react';

interface ContactOptionsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phoneNumber: string;
}

export const ContactOptionsSheet = ({ open, onOpenChange, phoneNumber }: ContactOptionsSheetProps) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    const handleWhatsApp = () => {
        // WhatsApp API: https://wa.me/55...
        // Assuming the number might include country code or not. 
        // If it's 10 or 11 digits (BR standard), we usually prepend 55 if missing.
        let target = cleanNumber;
        if (target.length >= 10 && target.length <= 11) {
            target = `55${target}`;
        }
        window.open(`https://wa.me/${target}`, '_blank');
        onOpenChange(false);
    };

    const handleTelegram = () => {
        // Telegram: https://t.me/+55... or just number
        // Telegram usually requires +CountryCode
        let target = cleanNumber;
        if (target.length >= 10 && target.length <= 11) {
            target = `+55${target}`;
        }
        // t.me expects username or phone. For phone it's often tricky without adding to contacts, 
        // but standard link is t.me/+<number>
        window.open(`https://t.me/${target}`, '_blank');
        onOpenChange(false);
    };

    return (
        <BottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Entrar em contato"
            description="Escolha o aplicativo para iniciar uma conversa."
            className="h-auto" // Auto height for small content
        >
            <div className="grid gap-4 pb-8">
                <Button
                    onClick={handleWhatsApp}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 text-lg"
                >
                    <MessageCircle className="mr-2" />
                    WhatsApp
                </Button>

                <Button
                    onClick={handleTelegram}
                    className="bg-sky-500 hover:bg-sky-600 text-white h-14 text-lg"
                >
                    <Send className="mr-2" />
                    Telegram
                </Button>
            </div>
        </BottomSheet>
    );
};
