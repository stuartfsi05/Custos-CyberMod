import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { User, FileText, Phone, Mail, MapPin, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerEditFormProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
}

export const CustomerEditForm = ({ register, errors, setValue }: CustomerEditFormProps) => {

    const handleBlurCEP = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                toast.error('CEP não encontrado!');
                return;
            }

            setValue('addressStreet', data.logradouro);
            setValue('addressNeighborhood', data.bairro);
            setValue('addressCity', data.localidade);
            setValue('addressState', data.uf);
            toast.success('Endereço encontrado!');
        } catch (error) {
            toast.error('Erro ao buscar CEP');
        }
    };

    return (
        <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dados do Cliente</h3>
            </div>

            <div className="space-y-3">
                <Input
                    label="Nome"
                    icon={User}
                    {...register('customerName')}
                    error={errors.customerName?.message as string}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="CPF/CNPJ"
                        icon={FileText}
                        {...register('customerDoc')}
                    />
                    <Input
                        label="Telefone"
                        icon={Phone}
                        {...register('customerPhone')}
                    />
                </div>
                <Input
                    label="Email"
                    icon={Mail}
                    {...register('customerEmail')}
                    error={errors.customerEmail?.message as string}
                />

                {/* Structured Address */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Endereço</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="CEP"
                            maxLength={9}
                            placeholder="00000-000"
                            {...register('addressCep')}
                            onBlur={handleBlurCEP}
                        />
                        <div className="flex items-end pb-3">
                            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-500 font-bold underline">
                                Buscar CEP
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_70px] gap-3">
                        <Input
                            label="Rua"
                            {...register('addressStreet')}
                        />
                        <Input
                            label="Nº"
                            {...register('addressNumber')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Bairro"
                            {...register('addressNeighborhood')}
                        />
                        <Input
                            label="Compl."
                            {...register('addressComplement')}
                        />
                    </div>

                    <div className="grid grid-cols-[1fr_60px] gap-3">
                        <Input
                            label="Cidade"
                            {...register('addressCity')}
                        />
                        <Input
                            label="UF"
                            maxLength={2}
                            {...register('addressState')}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Notas</h3>
                </div>
                <Textarea
                    placeholder="Observações..."
                    {...register('notes')}
                />
            </div>
        </div>
    );
};
