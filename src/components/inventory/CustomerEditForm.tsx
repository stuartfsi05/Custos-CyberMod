import {
    UseFormRegister,
    FieldErrors,
    UseFormSetValue,
    FieldValues,
    Path,
    PathValue
} from 'react-hook-form';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { User, FileText, Phone, Mail, MapPin, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

export interface CustomerFormFields extends FieldValues {
    customerName?: string;
    customerDoc?: string;
    customerPhone?: string;
    customerEmail?: string;
    addressCep?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    notes?: string;
}

interface CustomerEditFormProps<TFieldValues extends CustomerFormFields> {
    register: UseFormRegister<TFieldValues>;
    errors: FieldErrors<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
}

/**
 * Formulário reutilizável de edição de dados de cliente e endereço com autocompletar de CEP.
 */
export const CustomerEditForm = <TFieldValues extends CustomerFormFields>({
    register,
    errors,
    setValue
}: CustomerEditFormProps<TFieldValues>) => {
    const fieldName = (name: keyof CustomerFormFields) => name as Path<TFieldValues>;
    const setField = (name: keyof CustomerFormFields, value: string) => {
        setValue(fieldName(name), value as PathValue<TFieldValues, Path<TFieldValues>>);
    };

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

            setField('addressStreet', String(data.logradouro || ''));
            setField('addressNeighborhood', String(data.bairro || ''));
            setField('addressCity', String(data.localidade || ''));
            setField('addressState', String(data.uf || ''));
            toast.success('Endereço encontrado!');
        } catch {
            toast.error('Erro ao buscar CEP');
        }
    };

    return (
        <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Dados do Cliente</h3>
            </div>

            <div className="space-y-3">
                <Input
                    label="Nome"
                    icon={User}
                    {...register(fieldName('customerName'))}
                    error={errors.customerName?.message as string}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="CPF/CNPJ"
                        inputMode="numeric"
                        icon={FileText}
                        {...register(fieldName('customerDoc'))}
                    />
                    <Input
                        label="Telefone"
                        inputMode="tel"
                        icon={Phone}
                        {...register(fieldName('customerPhone'))}
                    />
                </div>
                <Input
                    label="Email"
                    icon={Mail}
                    {...register(fieldName('customerEmail'))}
                    error={errors.customerEmail?.message as string}
                />

                {/* Structured Address */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Endereço</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="CEP"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="00000-000"
                            {...register(fieldName('addressCep'))}
                            onBlur={handleBlurCEP}
                        />
                        <div className="flex items-end pb-3">
                            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:text-emerald-600 font-bold underline">
                                Buscar CEP
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr_70px] gap-3">
                        <Input
                            label="Rua"
                            {...register(fieldName('addressStreet'))}
                        />
                        <Input
                            label="Nº"
                            {...register(fieldName('addressNumber'))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Bairro"
                            {...register(fieldName('addressNeighborhood'))}
                        />
                        <Input
                            label="Compl."
                            {...register(fieldName('addressComplement'))}
                        />
                    </div>

                    <div className="grid grid-cols-[1fr_60px] gap-3">
                        <Input
                            label="Cidade"
                            {...register(fieldName('addressCity'))}
                        />
                        <Input
                            label="UF"
                            maxLength={2}
                            {...register(fieldName('addressState'))}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Notas</h3>
                </div>
                <Textarea
                    placeholder="Observações..."
                    {...register(fieldName('notes'))}
                />
            </div>
        </div>
    );
};
