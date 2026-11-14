import { ChangeEvent, useRef, useState } from 'react';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ChevronDown, Upload, X } from 'lucide-react';
import { clsx } from 'clsx';
import { CalculatorFormValues } from '../../../schemas/calculatorSchema';
import { CustomerForm } from '../CustomerForm';
import { TooltipHelp } from '../../ui/TooltipHelp';

interface Step1ProjectInfoProps {
    onFocusStep: () => void;
    photoUrl: string;
    onPhotoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onClearPhoto: () => void;
    customerName: string;
    onCustomerNameChange: (val: string) => void;
    projectName: string;
    onProjectNameChange: (val: string) => void;
    projectDescription: string;
    onProjectDescriptionChange: (val: string) => void;
    showExtendedCustomer: boolean;
    onToggleExtendedCustomer: () => void;
    register: UseFormRegister<CalculatorFormValues>;
    errors: FieldErrors<CalculatorFormValues>;
    setValue: UseFormSetValue<CalculatorFormValues>;
}

export const Step1ProjectInfo = ({
    onFocusStep,
    photoUrl,
    onPhotoUpload,
    onClearPhoto,
    customerName,
    onCustomerNameChange,
    projectName,
    onProjectNameChange,
    projectDescription,
    onProjectDescriptionChange,
    showExtendedCustomer,
    onToggleExtendedCustomer,
    register,
    errors,
    setValue
}: Step1ProjectInfoProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const summaryText = [projectName.trim(), customerName.trim()].filter(Boolean).join(' • ') || 'Opcional';

    return (
        <section
            id="step-1"
            onFocus={onFocusStep}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 scroll-mt-24"
        >
            <button
                type="button"
                onClick={() => setIsCollapsed(prev => !prev)}
                aria-expanded={!isCollapsed}
                className="w-full flex items-center justify-between gap-3 text-left"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                        1
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            Informações do projeto
                        </h2>
                        <p className="text-xs text-zinc-400 truncate">Cliente, nome, foto e descrição do pedido</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span
                        className={clsx(
                            'items-center px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 max-w-[180px] truncate',
                            isCollapsed ? 'inline-flex' : 'hidden sm:inline-flex'
                        )}
                    >
                        {summaryText}
                    </span>
                    <ChevronDown
                        size={18}
                        className={clsx('text-zinc-400 transition-transform shrink-0', !isCollapsed && 'rotate-180')}
                    />
                </div>
            </button>

            {!isCollapsed && (
                <div className="space-y-4">
                    {/* Photo Upload + Main Fields */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="shrink-0">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onPhotoUpload}
                                className="hidden"
                            />
                            {photoUrl ? (
                                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                    <img src={photoUrl} alt="Preview do projeto" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={onClearPhoto}
                                        className="absolute top-1.5 right-1.5 bg-black/70 text-white p-1 rounded-full hover:bg-red-600"
                                        title="Remover foto"
                                        aria-label="Remover foto do projeto"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-28 h-28 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-emerald-600 transition-colors bg-zinc-50/70 dark:bg-zinc-950/50"
                                >
                                    <Upload size={20} />
                                    <span className="text-[11px] font-bold">Adicionar foto</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                                    Nome do Cliente
                                    <TooltipHelp text="Nome do cliente ou empresa para constar no orçamento PDF e CRM." label="Nome do Cliente" />
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => onCustomerNameChange(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                                    Nome do Projeto
                                    <TooltipHelp text="Título da peça ou conjunto 3D (aparece na proposta comercial)." label="Nome do Projeto" />
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => onProjectNameChange(e.target.value)}
                                    placeholder="Ex: Mão do Zelda / Suporte articulado"
                                    className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                                    Descrição / Link do Modelo
                                    <TooltipHelp text="Detalhes de acabamento, cor, escala, link do STL ou observações." label="Descrição" />
                                </label>
                                <textarea
                                    rows={2}
                                    value={projectDescription}
                                    onChange={(e) => onProjectDescriptionChange(e.target.value)}
                                    placeholder="Ex: Impressão com altura de camada 0.16mm, link do modelo ou detalhes do pedido..."
                                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collapsible Extended CRM / Shipping */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onToggleExtendedCustomer}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            <ChevronDown size={14} className={clsx('transition-transform', showExtendedCustomer && 'rotate-180')} />
                            {showExtendedCustomer ? 'Ocultar frete, WhatsApp e endereço (ViaCEP)' : 'Adicionar frete, WhatsApp, CPF/CNPJ e endereço (ViaCEP)'}
                        </button>

                        {showExtendedCustomer && (
                            <div className="mt-4 space-y-4">
                                <div className="max-w-xs">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                                        Frete / Envio
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            {...register('shippingCost')}
                                            className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-3 pr-10 text-sm font-bold tabular-nums"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400 select-none">
                                            R$
                                        </span>
                                    </div>
                                </div>
                                <CustomerForm register={register} errors={errors} setValue={setValue} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};
