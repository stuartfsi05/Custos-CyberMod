import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { User, FileText, Phone, Mail, MapPin, StickyNote, Search } from 'lucide-react';
import { CalculatorFormValues } from '../../schemas/calculatorSchema';
import { toast } from 'sonner';

interface CustomerFormProps {
    register: UseFormRegister<CalculatorFormValues>;
    errors: FieldErrors<CalculatorFormValues>;
    setValue: UseFormSetValue<CalculatorFormValues>;
}

export const CustomerForm = ({ register, errors, setValue }: CustomerFormProps) => {

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
        <div className="space-y-8">
            <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <User className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dados do Cliente</h2>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-4 md:p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                    <Input
                        label="Nome do Cliente"
                        placeholder="Ex: João Silva"
                        icon={User}
                        {...register('customerName')}
                        error={errors.customerName?.message as string}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="CPF / CNPJ"
                            placeholder="000.000.000-00"
                            icon={FileText}
                            {...register('customerDoc')}
                            error={errors.customerDoc?.message as string}
                        />
                        <Input
                            label="Telefone"
                            placeholder="(00) 00000-0000"
                            icon={Phone}
                            {...register('customerPhone')}
                            error={errors.customerPhone?.message as string}
                        />
                    </div>

                    <Input
                        label="Email"
                        placeholder="cliente@email.com"
                        icon={Mail}
                        {...register('customerEmail')}
                        error={errors.customerEmail?.message as string}
                    />

                    {/* Address Section */}
                    <div className="pt-2 space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Endereço de Entrega</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="CEP"
                                placeholder="00000-000"
                                maxLength={9}
                                {...register('addressCep')}
                                onBlur={handleBlurCEP}
                                error={errors.addressCep?.message as string}
                            />
                            <div className="flex items-end pb-3">
                                <a
                                    href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-500 hover:text-emerald-600 font-bold underline"
                                >
                                    Não sei meu CEP
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_80px] gap-4">
                            <Input
                                label="Rua / Logradouro"
                                placeholder="Av. Paulista"
                                {...register('addressStreet')}
                                error={errors.addressStreet?.message as string}
                            />
                            <Input
                                label="Número"
                                placeholder="123"
                                {...register('addressNumber')}
                                error={errors.addressNumber?.message as string}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Bairro"
                                placeholder="Bela Vista"
                                {...register('addressNeighborhood')}
                                error={errors.addressNeighborhood?.message as string}
                            />
                            <Input
                                label="Complemento"
                                placeholder="Apto 101"
                                {...register('addressComplement')}
                                error={errors.addressComplement?.message as string}
                            />
                        </div>

                        <div className="grid grid-cols-[1fr_60px] gap-4">
                            <Input
                                label="Cidade"
                                placeholder="São Paulo"
                                {...register('addressCity')}
                                error={errors.addressCity?.message as string}
                            />
                            <Input
                                label="UF"
                                placeholder="SP"
                                maxLength={2}
                                {...register('addressState')}
                                error={errors.addressState?.message as string}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <StickyNote className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Notas do Pedido</h2>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-4 md:p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <Textarea
                        label="Observações Gerais"
                        placeholder="Digite aqui observações sobre o pedido..."
                        {...register('notes')}
                        error={errors.notes?.message as string}
                    />
                </div>
            </section>
        </div>
    );
};
