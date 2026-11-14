import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    calculate3DPricing,
    AdditionalMaterialInput,
    SelectedAuxiliaryItem,
    CostAllocationMode,
    TaxIncidenceMode,
    TaxPassThroughMode,
    DiscountType
} from '../hooks/usePricingEngine';
import { useInventory, InventoryItem } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { CalculatorPresetFavorite } from '../types/settings';
import { CostCategorySlice } from '../components/calculator/CostDonutChart';
import { CalculatorStickySidebar } from '../components/calculator/CalculatorStickySidebar';
import { CalculatorHeaderStepper } from '../components/calculator/CalculatorHeaderStepper';
import { CalculatorMobileBar } from '../components/calculator/CalculatorMobileBar';
import { Step1ProjectInfo } from '../components/calculator/steps/Step1ProjectInfo';
import { Step2Materials } from '../components/calculator/steps/Step2Materials';
import { Step3Equipment } from '../components/calculator/steps/Step3Equipment';
import { Step4OperationalCosts } from '../components/calculator/steps/Step4OperationalCosts';
import { Step5TaxesAndMarketplace } from '../components/calculator/steps/Step5TaxesAndMarketplace';
import { QuoteDocumentModal, QuoteLineItem } from '../components/calculator/QuoteDocumentModal';
import { compressImageFile } from '../utils/imageCompressor';
import { readAndParseGcodeFile } from '../utils/gcodeParser';
import { minutesToHHMM, parseNumber } from '../utils/formatters';
import { buildQuickQuoteWhatsAppUrl } from '../utils/whatsappFormatter';
import { calculatorSchema, CalculatorSchemaType, CalculatorFormValues } from '../schemas/calculatorSchema';
import { resolveInitialCalculatorState } from '../utils/calculatorSnapshot';

interface CalculatorScreenProps {
    onNavigate?: (tab: string) => void;
    initialItem?: InventoryItem | null;
    onClearInitialItem?: () => void;
}

export const CalculatorScreen = ({ onNavigate, initialItem, onClearInitialItem }: CalculatorScreenProps) => {
    const { settings, updateSetting, deductFilamentWeight, upsertAuxiliaryItem } = useSettings();
    const { addToInventory } = useInventory();

    const hydrated = resolveInitialCalculatorState(initialItem, settings);

    const [activeStep, setActiveStep] = useState(1);

    // Step 1: Project Info
    const [projectName, setProjectName] = useState(hydrated.projectName);
    const [projectDescription, setProjectDescription] = useState(hydrated.projectDescription);
    const [photoUrl, setPhotoUrl] = useState<string>(hydrated.photoUrl);
    const [showExtendedCustomer, setShowExtendedCustomer] = useState(hydrated.showExtendedCustomer);
    const gcodeInputRef = useRef<HTMLInputElement>(null);

    // Step 2: Materials
    const [selectedFilamentId, setSelectedFilamentId] = useState<string>(hydrated.selectedFilamentId);
    const [manualMaterialName, setManualMaterialName] = useState<string>(hydrated.manualMaterialName);
    const [materialCostPerKg, setMaterialCostPerKg] = useState<number>(hydrated.materialCostPerKg);
    const [weightG, setWeightG] = useState<number>(hydrated.weightG);
    const [qty, setQty] = useState<number>(hydrated.qty);
    const [additionalMaterials, setAdditionalMaterials] = useState<AdditionalMaterialInput[]>(hydrated.additionalMaterials);
    const [deductStockOnSave, setDeductStockOnSave] = useState<boolean>(true);

    // Step 3: Equipment
    const [selectedPrinterId, setSelectedPrinterId] = useState<string>(hydrated.selectedPrinterId);
    const [manualPrinterName, setManualPrinterName] = useState<string>(hydrated.manualPrinterName);
    const [printHours, setPrintHours] = useState<number>(hydrated.printHours);
    const [printMinutes, setPrintMinutes] = useState<number>(hydrated.printMinutes);
    const [powerWatts, setPowerWatts] = useState<number>(hydrated.powerWatts);
    const [machineValue, setMachineValue] = useState<number>(hydrated.machineValue);
    const [kwhRateOverride, setKwhRateOverride] = useState<number | null>(initialItem?.kwhRate ?? null);
    const kwhRate = kwhRateOverride ?? settings.kwhRate ?? 1.5;
    const [lifespanHours, setLifespanHours] = useState<number>(hydrated.lifespanHours);
    const [maintenancePercent, setMaintenancePercent] = useState<number>(hydrated.maintenancePercent);

    // Step 4: Operational Costs & Auxiliaries
    const [costMode, setCostMode] = useState<CostAllocationMode>(hydrated.costMode);
    const [laborRateOverride, setLaborRateOverride] = useState<number | null>(initialItem?.laborRatePerHour ?? null);
    const laborRatePerHour = laborRateOverride ?? settings.laborCost ?? 33;
    const [setupMinutes, setSetupMinutes] = useState<number>(hydrated.setupMinutes);
    const [postMinutes, setPostMinutes] = useState<number>(hydrated.postMinutes);
    const [packagingCost, setPackagingCost] = useState<number>(hydrated.packagingCost);
    const [hardwareCost, setHardwareCost] = useState<number>(hydrated.hardwareCost);
    const [failPercent, setFailPercent] = useState<number>(hydrated.failPercent);
    const [selectedAuxItems, setSelectedAuxItems] = useState<SelectedAuxiliaryItem[]>(hydrated.selectedAuxItems);

    // Step 5: Taxes & Marketplace
    const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<string>(hydrated.selectedMarketplaceId);
    const [taxMode, setTaxMode] = useState<TaxIncidenceMode>(hydrated.taxMode);
    const [taxPassThrough, setTaxPassThrough] = useState<TaxPassThroughMode>(hydrated.taxPassThrough);
    const [commissionPercent, setCommissionPercent] = useState<number>(hydrated.commissionPercent);
    const [fixedFee, setFixedFee] = useState<number>(hydrated.fixedFee);
    const [taxPercentOverride, setTaxPercentOverride] = useState<number | null>(initialItem?.taxPercent ?? null);
    const taxPercent = taxPercentOverride ?? settings.taxPercent ?? 0;

    // Right Panel: Markup, Discount, Multi-item Quote, Favorites
    const [markupPercent, setMarkupPercent] = useState<number>(hydrated.markupPercent);
    const [discountType, setDiscountType] = useState<DiscountType>(hydrated.discountType);
    const [discountValue, setDiscountValue] = useState<number>(hydrated.discountValue);
    const [quoteItems, setQuoteItems] = useState<QuoteLineItem[]>(hydrated.quoteItems);
    const [favoriteName, setFavoriteName] = useState('');
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    // Extended Customer & Shipping Form (for CRM / ViaCEP)
    const {
        register,
        control,
        setValue,
        reset,
        formState: { errors }
    } = useForm<CalculatorFormValues, unknown, CalculatorSchemaType>({
        resolver: zodResolver(calculatorSchema),
        defaultValues: {
            partName: initialItem?.partName || 'Projeto',
            weightG: initialItem ? initialItem.weightG * hydrated.qty : 16,
            printTime: String(initialItem?.printTime || '1:17'),
            workTime: String(initialItem?.workTime || '0:40'),
            shippingCost: initialItem?.costs.shipping || 0,
            customerName: initialItem?.customerName || '',
            customerDoc: initialItem?.customerDoc || '',
            customerPhone: initialItem?.customerPhone || '',
            customerEmail: initialItem?.customerEmail || '',
            addressCep: initialItem?.addressCep || '',
            addressStreet: initialItem?.addressStreet || '',
            addressNumber: initialItem?.addressNumber || '',
            addressComplement: initialItem?.addressComplement || '',
            addressNeighborhood: initialItem?.addressNeighborhood || '',
            addressCity: initialItem?.addressCity || '',
            addressState: initialItem?.addressState || '',
            notes: initialItem?.notes || ''
        }
    });

    const customerInputs = useWatch({ control });

    const totalPrintTimeHours = Math.max(0, printHours) + Math.max(0, printMinutes) / 60;

    const pricing = useMemo(() => {
        return calculate3DPricing({
            qty,
            weightG,
            materialCostPerKg,
            additionalMaterials: additionalMaterials.map(m => {
                const spool = settings.filaments.find(f => f.id === m.filamentId);
                return {
                    weightG: parseNumber(m.weightG),
                    costPerKg: m.costPerKg ?? (spool ? (spool.isConsigned ? 0 : spool.pricePerKg) : materialCostPerKg)
                };
            }),
            printTimeHours: totalPrintTimeHours,
            powerWatts,
            kwhRate,
            machineValue,
            lifespanHours,
            maintenancePercent,
            laborRatePerHour,
            setupMinutes,
            postMinutes,
            packagingCost,
            hardwareCost,
            auxiliaryItems: selectedAuxItems.map(i => ({ price: i.price, qty: i.qty })),
            failPercent,
            costMode,
            markupPercent,
            discountType,
            discountValue,
            commissionPercent,
            fixedFee,
            taxPercent,
            taxMode,
            taxPassThrough,
            shippingCost: parseNumber(customerInputs.shippingCost || 0)
        });
    }, [
        qty,
        weightG,
        materialCostPerKg,
        additionalMaterials,
        settings.filaments,
        totalPrintTimeHours,
        powerWatts,
        kwhRate,
        machineValue,
        lifespanHours,
        maintenancePercent,
        laborRatePerHour,
        setupMinutes,
        postMinutes,
        packagingCost,
        hardwareCost,
        selectedAuxItems,
        failPercent,
        costMode,
        markupPercent,
        discountType,
        discountValue,
        commissionPercent,
        fixedFee,
        taxPercent,
        taxMode,
        taxPassThrough,
        customerInputs.shippingCost
    ]);

    const costSlices: CostCategorySlice[] = [
        { id: 'material', label: 'Material', value: pricing.unitMaterial, color: '#10b981' },
        { id: 'aux', label: 'Materiais Aux.', value: pricing.unitAuxiliary, color: '#f59e0b' },
        { id: 'energy', label: 'Energia', value: pricing.unitEnergy, color: '#06b6d4' },
        { id: 'dep', label: 'Depreciação', value: pricing.unitDepreciation, color: '#8b5cf6' },
        { id: 'labor', label: 'Mão de Obra', value: pricing.unitLabor, color: '#3b82f6' },
        { id: 'extras', label: 'Extras/Falha', value: pricing.unitExtrasAndFail, color: '#f97316' },
        { id: 'fees', label: 'Taxas Plataf.', value: pricing.unitPlatformFee, color: '#ec4899' },
        { id: 'taxes', label: 'Impostos', value: pricing.unitTaxAmount, color: '#ef4444' }
    ];

    const scrollToStep = (stepNum: number) => {
        setActiveStep(stepNum);
        const el = document.getElementById(`step-${stepNum}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSelectFilament = (id: string) => {
        setSelectedFilamentId(id);
        const spool = settings.filaments.find(f => f.id === id);
        if (spool) {
            setManualMaterialName(spool.name);
            setMaterialCostPerKg(spool.isConsigned ? 0 : spool.pricePerKg);
        }
    };

    const handleSelectPrinter = (id: string) => {
        setSelectedPrinterId(id);
        const printer = settings.printers.find(p => p.id === id);
        if (printer) {
            setManualPrinterName(printer.name);
            setPowerWatts(printer.powerWatts);
            setMachineValue(printer.purchasePrice);
            setLifespanHours(printer.lifespanHours);
            setMaintenancePercent(printer.maintenancePercent);
        }
    };

    const handleSelectMarketplace = (id: string) => {
        setSelectedMarketplaceId(id);
        const ch = settings.marketplaces.find(m => m.id === id);
        if (ch) {
            setCommissionPercent(ch.commissionPercent);
            setFixedFee(ch.fixedFee);
        }
    };

    const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
            const compressed = await compressImageFile(file, 400, 0.72);
            setPhotoUrl(compressed);
        } catch (err) {
            console.warn('Erro ao comprimir imagem:', err);
            toast.error('Não foi possível processar esta imagem.');
        }
    };

    const handleGcodeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        try {
            const parsed = await readAndParseGcodeFile(file);
            if (parsed.weightG === null && parsed.totalMinutes === 0) {
                toast.error('Não encontramos metadados de peso ou tempo neste .gcode.');
                return;
            }

            if (parsed.weightG !== null) {
                setWeightG(parsed.weightG);
            }
            if (parsed.totalMinutes > 0) {
                setPrintHours(parsed.printHours);
                setPrintMinutes(parsed.printMinutes);
            }
            if (!projectName.trim() && parsed.suggestedProjectName) {
                setProjectName(parsed.suggestedProjectName);
                setValue('partName', parsed.suggestedProjectName);
            }

            const summaryParts = [
                parsed.weightG !== null ? `${parsed.weightG}g` : null,
                parsed.totalMinutes > 0 ? `${parsed.printHours}h${String(parsed.printMinutes).padStart(2, '0')}m` : null
            ].filter(Boolean);

            toast.success(
                `G-code${parsed.slicerName ? ` (${parsed.slicerName})` : ''} importado: ${summaryParts.join(' • ')}`
            );
        } catch (err) {
            console.warn('Erro ao ler .gcode:', err);
            toast.error('Falha ao analisar o arquivo .gcode.');
        }
    };

    const handleAddCatalogAuxItem = (item: { id: string; name: string; price: number }) => {
        setSelectedAuxItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
        });
    };

    const handleCreateInlineAux = (nameToUse: string, priceVal: number): boolean => {
        if (!nameToUse.trim()) {
            toast.error('Digite o nome do material auxiliar (ex.: Cola).');
            return false;
        }
        const savedItem = upsertAuxiliaryItem(nameToUse.trim(), Math.max(0, priceVal));
        handleAddCatalogAuxItem(savedItem);
        toast.success(`"${savedItem.name}" adicionado ao cálculo e salvo no catálogo!`);
        return true;
    };

    const handleCreateQuickChannel = (name: string, comm: number, fixed: number): boolean => {
        if (!name.trim()) {
            toast.error('Informe o nome do canal.');
            return false;
        }
        const created = {
            id: `ch_${Date.now()}`,
            name: name.trim(),
            commissionPercent: Math.max(0, comm),
            fixedFee: Math.max(0, fixed)
        };
        updateSetting('marketplaces', [...settings.marketplaces, created]);
        handleSelectMarketplace(created.id);
        toast.success(`Canal "${created.name}" criado e selecionado!`);
        return true;
    };

    const handleAddAdditionalMaterial = () => {
        const fallback = settings.filaments[0];
        setAdditionalMaterials(prev => [
            ...prev,
            {
                id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                filamentId: fallback?.id || '',
                manualName: fallback?.name || 'Material Extra',
                costPerKg: fallback?.isConsigned ? 0 : (fallback?.pricePerKg ?? materialCostPerKg),
                weightG: 0
            }
        ]);
    };

    const handleAddPieceToMultiQuote = () => {
        const safeQty = Math.max(1, qty);
        const itemLabel = projectName.trim() || `Peça 3D #${quoteItems.length + 1}`;
        const newLine: QuoteLineItem = {
            id: `line_${Date.now()}`,
            partName: itemLabel,
            description: projectDescription.trim() || manualMaterialName,
            qty: safeQty,
            unitPrice: pricing.unitSellPrice,
            subtotal: pricing.unitSellPrice * safeQty,
            weightG: pricing.totalWeightG,
            unitMaterial: pricing.unitMaterial,
            unitEnergy: pricing.unitEnergy,
            unitDepreciation: pricing.unitDepreciation,
            unitLabor: pricing.unitLabor,
            unitExtras: pricing.unitExtrasAndFail + pricing.unitAuxiliary,
            unitProductionCost: pricing.unitProductionCost,
            unitPlatformFee: pricing.unitPlatformFee,
            unitTaxAmount: pricing.unitTaxAmount,
            batchProfit: pricing.batchProfit
        };
        setQuoteItems(prev => [...prev, newLine]);
        toast.success(`"${itemLabel}" adicionado ao orçamento multi-peças!`);
    };

    const handleSaveFavorite = () => {
        const name = favoriteName.trim() || projectName.trim() || manualPrinterName;
        const fav: CalculatorPresetFavorite = {
            id: `fav_${Date.now()}`,
            name,
            partName: projectName,
            description: projectDescription,
            printerId: selectedPrinterId,
            manualPrinterName,
            filamentId: selectedFilamentId,
            manualMaterialName,
            materialCostPerKg,
            weightG,
            qty,
            printHours,
            printMinutes,
            powerWatts,
            machineValue,
            kwhRate,
            lifespanHours,
            laborRatePerHour,
            setupMinutes,
            postMinutes,
            packagingCost,
            hardwareCost,
            failPercent,
            costMode,
            markupPercent
        };
        updateSetting('favorites', [fav, ...settings.favorites]);
        setFavoriteName('');
        toast.success(`Favorito "${name}" salvo!`);
    };

    const handleLoadFavorite = (favId: string) => {
        const fav = settings.favorites.find(f => f.id === favId);
        if (!fav) return;
        setProjectName(fav.partName);
        setProjectDescription(fav.description || '');
        setSelectedPrinterId(fav.printerId);
        setManualPrinterName(fav.manualPrinterName);
        setSelectedFilamentId(fav.filamentId);
        setManualMaterialName(fav.manualMaterialName);
        setMaterialCostPerKg(fav.materialCostPerKg);
        setWeightG(fav.weightG);
        setQty(fav.qty);
        setPrintHours(fav.printHours);
        setPrintMinutes(fav.printMinutes);
        setPowerWatts(fav.powerWatts);
        setMachineValue(fav.machineValue);
        setKwhRateOverride(fav.kwhRate);
        setLifespanHours(fav.lifespanHours);
        setLaborRateOverride(fav.laborRatePerHour);
        setSetupMinutes(fav.setupMinutes);
        setPostMinutes(fav.postMinutes);
        setPackagingCost(fav.packagingCost);
        setHardwareCost(fav.hardwareCost);
        setFailPercent(fav.failPercent);
        setCostMode(fav.costMode);
        setMarkupPercent(fav.markupPercent);
        toast.success(`Favorito "${fav.name}" carregado!`);
    };

    const handleDeleteFavorite = (favId: string) => {
        updateSetting(
            'favorites',
            settings.favorites.filter(f => f.id !== favId)
        );
        toast.info('Favorito removido.');
    };

    const handleResetForm = () => {
        setProjectName('');
        setProjectDescription('');
        setPhotoUrl('');
        setWeightG(0);
        setQty(1);
        setPrintHours(0);
        setPrintMinutes(0);
        setKwhRateOverride(null);
        setLaborRateOverride(null);
        setTaxPercentOverride(null);
        setAdditionalMaterials([]);
        setSelectedAuxItems([]);
        setDiscountValue(0);
        setQuoteItems([]);
        reset();
        onClearInitialItem?.();
        toast.info('Campos da calculadora limpos.');
    };

    const saveOrder = (markAsSold: boolean) => {
        const safeName = projectName.trim() || 'Projeto 3D Sem Nome';
        const safeQty = Math.max(1, Math.floor(qty || 1));

        let stockWasDeducted = false;
        // Deduz estoque automaticamente apenas ao registrar venda confirmada (evita drenar rolo ao salvar rascunhos).
        if (markAsSold && deductStockOnSave) {
            if (selectedFilamentId && weightG > 0) {
                deductFilamentWeight(selectedFilamentId, weightG);
                stockWasDeducted = true;
            }
            additionalMaterials.forEach(mat => {
                if (mat.filamentId && mat.weightG > 0) {
                    deductFilamentWeight(mat.filamentId, parseNumber(mat.weightG));
                    stockWasDeducted = true;
                }
            });
        }

        const fullAddress = customerInputs.addressStreet
            ? `${customerInputs.addressStreet}, ${customerInputs.addressNumber || ''}${customerInputs.addressComplement ? ` - ${customerInputs.addressComplement}` : ''}, ${customerInputs.addressNeighborhood || ''}, ${customerInputs.addressCity || ''} - ${customerInputs.addressState || ''}, CEP: ${customerInputs.addressCep || ''}`
            : undefined;

        const multiTotal = quoteItems.length > 0
            ? quoteItems.reduce((s, item) => s + item.subtotal, 0) + pricing.shippingCost
            : pricing.batchSellPrice;

        const hasConsolidatedMultiQuote =
            quoteItems.length > 0 && quoteItems.every(q => q.unitProductionCost !== undefined);

        const consolidatedWeightG = hasConsolidatedMultiQuote
            ? quoteItems.reduce((s, q) => s + (q.weightG ?? 0), 0) / safeQty
            : pricing.totalWeightG / safeQty;

        const consolidatedCosts = hasConsolidatedMultiQuote
            ? {
                material: quoteItems.reduce((s, q) => s + (q.unitMaterial ?? 0) * q.qty, 0) / safeQty,
                machine:
                    quoteItems.reduce((s, q) => s + ((q.unitEnergy ?? 0) + (q.unitDepreciation ?? 0)) * q.qty, 0) /
                    safeQty,
                labor: quoteItems.reduce((s, q) => s + (q.unitLabor ?? 0) * q.qty, 0) / safeQty,
                extras: quoteItems.reduce((s, q) => s + (q.unitExtras ?? 0) * q.qty, 0) / safeQty,
                base: quoteItems.reduce((s, q) => s + (q.unitProductionCost ?? 0) * q.qty, 0) / safeQty,
                shipping: pricing.shippingCost,
                energyKwhCost: quoteItems.reduce((s, q) => s + (q.unitEnergy ?? 0) * q.qty, 0) / safeQty,
                depreciationCost: quoteItems.reduce((s, q) => s + (q.unitDepreciation ?? 0) * q.qty, 0) / safeQty,
                packaging: packagingCost,
                marketplaceFee: quoteItems.reduce((s, q) => s + (q.unitPlatformFee ?? 0) * q.qty, 0),
                taxAmount: quoteItems.reduce((s, q) => s + (q.unitTaxAmount ?? 0) * q.qty, 0)
            }
            : {
                material: pricing.unitMaterial,
                machine: pricing.unitEnergy + pricing.unitDepreciation,
                labor: pricing.unitLabor,
                extras: pricing.unitExtrasAndFail + pricing.unitAuxiliary,
                base: pricing.unitProductionCost,
                shipping: pricing.shippingCost,
                energyKwhCost: pricing.unitEnergy,
                depreciationCost: pricing.unitDepreciation,
                packaging: packagingCost,
                marketplaceFee: pricing.unitPlatformFee * safeQty,
                taxAmount: pricing.unitTaxAmount * safeQty
            };

        const consolidatedNetProfit = hasConsolidatedMultiQuote
            ? quoteItems.reduce((s, q) => s + (q.batchProfit ?? 0), 0)
            : pricing.batchProfit;

        addToInventory({
            partName: quoteItems.length > 0 ? `${safeName} (+${quoteItems.length} itens)` : safeName,
            description: projectDescription.trim() || undefined,
            photoUrl: photoUrl || undefined,
            weightG: consolidatedWeightG,
            printTime: `${printHours}:${String(printMinutes).padStart(2, '0')}`,
            workTime: minutesToHHMM(setupMinutes + postMinutes),
            costs: consolidatedCosts,
            selectedTier: 'custom_markup',
            tierRetail: multiTotal,
            markupPercent,
            costMode,
            packagingCost,
            hardwareCost,
            setupMinutes,
            postMinutes,
            failPercent,
            manualMaterialName,
            materialCostPerKg,
            additionalMaterials: additionalMaterials.length > 0 ? additionalMaterials : undefined,
            manualPrinterName,
            powerWatts,
            machineValue,
            kwhRate,
            lifespanHours,
            maintenancePercent,
            laborRatePerHour,
            auxiliaryItems: selectedAuxItems.length > 0 ? selectedAuxItems : undefined,
            commissionPercent,
            fixedFee,
            taxPercent,
            taxMode,
            taxPassThrough,
            discountType,
            discountValue,
            quoteItems: quoteItems.length > 0 ? quoteItems : undefined,
            activeExtras: selectedAuxItems.map(a => a.name),
            qty: safeQty,
            printerId: selectedPrinterId,
            filamentId: selectedFilamentId,
            marketplaceId: selectedMarketplaceId,
            status: markAsSold ? 'approved' : 'pending',
            paymentStatus: markAsSold ? 'paid' : 'unpaid',
            netProfit: consolidatedNetProfit,
            stockDeducted: stockWasDeducted,
            customerName: customerInputs.customerName,
            customerDoc: customerInputs.customerDoc,
            customerPhone: customerInputs.customerPhone,
            customerEmail: customerInputs.customerEmail,
            customerAddress: fullAddress,
            addressCep: customerInputs.addressCep,
            addressStreet: customerInputs.addressStreet,
            addressNumber: customerInputs.addressNumber,
            addressComplement: customerInputs.addressComplement,
            addressNeighborhood: customerInputs.addressNeighborhood,
            addressCity: customerInputs.addressCity,
            addressState: customerInputs.addressState,
            notes: customerInputs.notes || projectDescription
        });

        toast.success(
            markAsSold
                ? `Venda "${safeName}" registrada no CRM e Financeiro!`
                : `Orçamento "${safeName}" salvo em Pedidos & Fila!`
        );
    };

    const handleSendWhatsAppQuick = () => {
        const url = buildQuickQuoteWhatsAppUrl({
            companyName: settings.branding.companyName,
            customerName: customerInputs.customerName,
            customerPhone: customerInputs.customerPhone,
            projectName,
            qty,
            unitSellPrice: pricing.unitSellPrice,
            batchSellPrice: pricing.batchSellPrice,
            shippingCost: pricing.shippingCost,
            quoteItems
        });
        window.open(url, '_blank');
    };

    const selectedChannel = settings.marketplaces.find(m => m.id === selectedMarketplaceId);
    const fullAddressPreview = customerInputs.addressStreet
        ? `${customerInputs.addressStreet}, ${customerInputs.addressNumber || ''}${customerInputs.addressComplement ? ` - ${customerInputs.addressComplement}` : ''}, ${customerInputs.addressNeighborhood || ''}, ${customerInputs.addressCity || ''} - ${customerInputs.addressState || ''}`
        : undefined;

    const multiQuoteTotal =
        quoteItems.length > 0
            ? quoteItems.reduce((s, i) => s + i.subtotal, 0) + pricing.shippingCost
            : pricing.batchSellPrice;

    return (
        <div className="space-y-5 pb-40 lg:pb-16">
            <input
                ref={gcodeInputRef}
                type="file"
                accept=".gcode,.gco,.g,text/plain"
                onChange={handleGcodeUpload}
                className="hidden"
            />

            <CalculatorHeaderStepper
                activeStep={activeStep}
                onSelectStep={scrollToStep}
                onTriggerGcodeUpload={() => gcodeInputRef.current?.click()}
                onResetForm={handleResetForm}
                onSaveDraft={() => saveOrder(false)}
            />

            {/* Split-View Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: 5 Continuous Form Sections */}
                <div className="lg:col-span-7 space-y-6">
                    <Step1ProjectInfo
                        onFocusStep={() => setActiveStep(1)}
                        photoUrl={photoUrl}
                        onPhotoUpload={handlePhotoUpload}
                        onClearPhoto={() => setPhotoUrl('')}
                        customerName={customerInputs.customerName || ''}
                        onCustomerNameChange={(val) => setValue('customerName', val)}
                        projectName={projectName}
                        onProjectNameChange={(val) => {
                            setProjectName(val);
                            setValue('partName', val);
                        }}
                        projectDescription={projectDescription}
                        onProjectDescriptionChange={setProjectDescription}
                        showExtendedCustomer={showExtendedCustomer}
                        onToggleExtendedCustomer={() => setShowExtendedCustomer(prev => !prev)}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                    />

                    <Step2Materials
                        onFocusStep={() => setActiveStep(2)}
                        filaments={settings.filaments}
                        selectedFilamentId={selectedFilamentId}
                        onSelectFilament={handleSelectFilament}
                        manualMaterialName={manualMaterialName}
                        onManualMaterialNameChange={setManualMaterialName}
                        materialCostPerKg={materialCostPerKg}
                        onMaterialCostPerKgChange={setMaterialCostPerKg}
                        weightG={weightG}
                        onWeightGChange={setWeightG}
                        qty={qty}
                        onQtyChange={setQty}
                        additionalMaterials={additionalMaterials}
                        onAddAdditionalMaterial={handleAddAdditionalMaterial}
                        onUpdateAdditionalMaterial={(idx, next) =>
                            setAdditionalMaterials(prev => prev.map((item, i) => (i === idx ? next : item)))
                        }
                        onRemoveAdditionalMaterial={(id) =>
                            setAdditionalMaterials(prev => prev.filter(item => item.id !== id))
                        }
                        deductStockOnSave={deductStockOnSave}
                        onDeductStockOnSaveChange={setDeductStockOnSave}
                    />

                    <Step3Equipment
                        onFocusStep={() => setActiveStep(3)}
                        printers={settings.printers}
                        selectedPrinterId={selectedPrinterId}
                        onSelectPrinter={handleSelectPrinter}
                        manualPrinterName={manualPrinterName}
                        onManualPrinterNameChange={setManualPrinterName}
                        printHours={printHours}
                        onPrintHoursChange={setPrintHours}
                        printMinutes={printMinutes}
                        onPrintMinutesChange={setPrintMinutes}
                        powerWatts={powerWatts}
                        onPowerWattsChange={setPowerWatts}
                        machineValue={machineValue}
                        onMachineValueChange={setMachineValue}
                        kwhRate={kwhRate}
                        onKwhRateChange={setKwhRateOverride}
                        lifespanHours={lifespanHours}
                        onLifespanHoursChange={setLifespanHours}
                        maintenancePercent={maintenancePercent}
                    />

                    <Step4OperationalCosts
                        onFocusStep={() => setActiveStep(4)}
                        qty={qty}
                        costMode={costMode}
                        onCostModeChange={setCostMode}
                        laborRatePerHour={laborRatePerHour}
                        onLaborRateChange={setLaborRateOverride}
                        setupMinutes={setupMinutes}
                        onSetupMinutesChange={setSetupMinutes}
                        postMinutes={postMinutes}
                        onPostMinutesChange={setPostMinutes}
                        packagingCost={packagingCost}
                        onPackagingCostChange={setPackagingCost}
                        hardwareCost={hardwareCost}
                        onHardwareCostChange={setHardwareCost}
                        failPercent={failPercent}
                        onFailPercentChange={setFailPercent}
                        auxiliaryCatalog={settings.auxiliaryCatalog}
                        selectedAuxItems={selectedAuxItems}
                        onAddCatalogAuxItem={handleAddCatalogAuxItem}
                        onCreateInlineAux={handleCreateInlineAux}
                        onUpdateAuxItemQty={(id, nextQty) =>
                            setSelectedAuxItems(prev => prev.map(p => (p.id === id ? { ...p, qty: nextQty } : p)))
                        }
                        onRemoveAuxItem={(id) =>
                            setSelectedAuxItems(prev => prev.filter(p => p.id !== id))
                        }
                    />

                    <Step5TaxesAndMarketplace
                        onFocusStep={() => setActiveStep(5)}
                        marketplaces={settings.marketplaces}
                        selectedMarketplaceId={selectedMarketplaceId}
                        onSelectMarketplace={handleSelectMarketplace}
                        onCreateChannel={handleCreateQuickChannel}
                        taxMode={taxMode}
                        onTaxModeChange={setTaxMode}
                        taxPassThrough={taxPassThrough}
                        onTaxPassThroughChange={setTaxPassThrough}
                        commissionPercent={commissionPercent}
                        onCommissionPercentChange={setCommissionPercent}
                        fixedFee={fixedFee}
                        onFixedFeeChange={setFixedFee}
                        taxPercent={taxPercent}
                        onTaxPercentChange={setTaxPercentOverride}
                    />
                </div>

                {/* RIGHT COLUMN STICKY: REAL-TIME PRICING & COST BREAKDOWN */}
                <CalculatorStickySidebar
                    qty={qty}
                    pricing={pricing}
                    costSlices={costSlices}
                    markupPercent={markupPercent}
                    onMarkupChange={setMarkupPercent}
                    discountType={discountType}
                    onToggleDiscountType={() => setDiscountType(prev => (prev === 'percent' ? 'fixed' : 'percent'))}
                    discountValue={discountValue}
                    onDiscountValueChange={setDiscountValue}
                    onSellOrder={() => saveOrder(true)}
                    onOpenQuotePdf={() => setIsQuoteModalOpen(true)}
                    onSendWhatsApp={handleSendWhatsAppQuick}
                    onNavigate={onNavigate}
                    quoteItems={quoteItems}
                    multiQuoteTotal={multiQuoteTotal}
                    onAddPieceToMultiQuote={handleAddPieceToMultiQuote}
                    onRemoveQuoteItem={(id) => setQuoteItems(prev => prev.filter(q => q.id !== id))}
                    favoriteName={favoriteName}
                    onFavoriteNameChange={setFavoriteName}
                    onSaveFavorite={handleSaveFavorite}
                    favorites={settings.favorites}
                    onLoadFavorite={handleLoadFavorite}
                    onDeleteFavorite={handleDeleteFavorite}
                />
            </div>

            <CalculatorMobileBar
                unitSellPrice={pricing.unitSellPrice}
                batchSellPrice={pricing.batchSellPrice}
                unitProfit={pricing.unitProfit}
                unitProductionCost={pricing.unitProductionCost}
                qty={qty}
                markupPercent={markupPercent}
                onScrollToSummary={() => document.getElementById('calculator-summary-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                onSellOrder={() => saveOrder(true)}
            />

            <QuoteDocumentModal
                open={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                data={{
                    partName: projectName.trim() || 'Projeto Personalizado 3D',
                    description: projectDescription.trim() || manualMaterialName,
                    photoUrl: photoUrl || undefined,
                    qty: Math.max(1, qty),
                    unitPrice: pricing.unitSellPrice,
                    shippingCost: pricing.shippingCost,
                    totalPrice: multiQuoteTotal,
                    channelName: selectedChannel?.name,
                    tierName: `Markup ${markupPercent.toFixed(0)}%`,
                    customerName: customerInputs.customerName,
                    customerDoc: customerInputs.customerDoc,
                    customerPhone: customerInputs.customerPhone,
                    customerEmail: customerInputs.customerEmail,
                    customerAddress: fullAddressPreview,
                    notes: customerInputs.notes || projectDescription,
                    items: quoteItems.length > 0 ? quoteItems : undefined
                }}
            />
        </div>
    );
};
