import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { MessageCircle, Send } from 'lucide-react';
import { formatWhatsAppTarget } from '../../utils/whatsappFormatter';

interface ContactOptionsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phoneNumber: string;
}

export const ContactOptionsSheet = ({ open, onOpenChange, phoneNumber }: ContactOptionsSheetProps) => {
    const handleWhatsApp = () => {
        const target = formatWhatsAppTarget(phoneNumber);
        window.open(`https://wa.me/${target}`, '_blank');
        onOpenChange(false);
    };

    const handleTelegram = () => {
        const target = formatWhatsAppTarget(phoneNumber, true);
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
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
                >
                    <MessageCircle className="mr-2" size={18} />
                    WhatsApp
                </Button>

                <Button
                    onClick={handleTelegram}
                    size="lg"
                    className="bg-sky-500 hover:bg-sky-600 text-white border-sky-600"
                >
                    <Send className="mr-2" size={18} />
                    Telegram
                </Button>
            </div>
        </BottomSheet>
    );
};
