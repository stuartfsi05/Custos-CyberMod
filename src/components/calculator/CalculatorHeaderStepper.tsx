import { useState } from 'react';
import { ChevronRight, FileCode2, HelpCircle, RotateCcw, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

const STEPS = [
    { id: 'step-1', num: 1, label: 'Projeto' },
    { id: 'step-2', num: 2, label: 'Material' },
    { id: 'step-3', num: 3, label: 'Equipamento' },
    { id: 'step-4', num: 4, label: 'Custos' },
    { id: 'step-5', num: 5, label: 'Taxas' }
];

interface CalculatorHeaderStepperProps {
    activeStep: number;
    onSelectStep: (stepNum: number) => void;
    onTriggerGcodeUpload: () => void;
    onResetForm: () => void;
    onSaveDraft: () => void;
}

export const CalculatorHeaderStepper = ({
    activeStep,
    onSelectStep,
    onTriggerGcodeUpload,
    onResetForm,
    onSaveDraft
}: CalculatorHeaderStepperProps) => {
    const [showQuickGuide, setShowQuickGuide] = useState(false);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 md:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Calculadora 3D Inteligente
                    </h1>
                    <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Preencha as 5 etapas na esquerda ou importe seu .gcode • O preço e a memória de cálculo atualizam ao vivo à direita
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={showQuickGuide ? 'primary' : 'ghost'}
                        onClick={() => setShowQuickGuide(prev => !prev)}
                        aria-expanded={showQuickGuide}
                    >
                        <HelpCircle size={14} className="mr-1.5" />
                        Como usar?
                    </Button>
                    <button
                        type="button"
                        onClick={onResetForm}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-xl border border-transparent text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/60 dark:hover:bg-red-950/30 transition-colors"
                    >
                        <RotateCcw size={13} className="mr-1.5" />
                        Limpar
                    </button>
                    <span className="hidden sm:inline-block h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" aria-hidden="true" />
                    <Button type="button" size="sm" variant="secondary" onClick={onTriggerGcodeUpload}>
                        <FileCode2 size={14} className="mr-1.5 text-cyan-600 dark:text-cyan-400" />
                        Importar .gcode
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={onSaveDraft}>
                        <Save size={14} className="mr-1.5" />
                        Salvar projeto
                    </Button>
                </div>
            </div>

            {/* 5-Step Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {STEPS.map((st, index) => (
                    <div key={st.id} className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => onSelectStep(st.num)}
                            className={clsx(
                                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
                                activeStep === st.num
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'
                            )}
                        >
                            <span
                                className={clsx(
                                    'w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black',
                                    activeStep === st.num
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                                )}
                            >
                                {st.num}
                            </span>
                            {st.label}
                        </button>
                        {index < STEPS.length - 1 && (
                            <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600" />
                        )}
                    </div>
                ))}
            </div>

            {showQuickGuide && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                        <p className="font-black text-emerald-700 dark:text-emerald-400">1. Dados do Fatiador</p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Pegue o <strong>Peso Total (g)</strong> e o <strong>Tempo de Impressão</strong> direto do fatiador (ou clique em <strong>Importar .gcode</strong> para preencher sozinho).
                        </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                        <p className="font-black text-emerald-700 dark:text-emerald-400">2. Por Peça vs. Por Lote</p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Use <strong>Por Peça</strong> quando setup, acabamento e embalagem se repetem em cada item, ou <strong>Por Lote</strong> para diluir 1 único setup/caixa entre todas as peças da mesa.
                        </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                        <p className="font-black text-cyan-700 dark:text-cyan-400">3. Gross-Up vs. Direto</p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            O modo <strong>Recompor Preço (Gross-Up)</strong> calcula o preço &ldquo;por dentro&rdquo; para que a comissão do marketplace não reduza o seu lucro líquido em R$.
                        </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                        <p className="font-black text-zinc-800 dark:text-zinc-100">4. Rascunho vs. Venda</p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            <strong>Salvar projeto</strong> guarda apenas como orçamento pendente (sem descontar filamento); <strong>Vender / Registrar Pedido</strong> confirma no CRM/Caixa e baixa o estoque.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
