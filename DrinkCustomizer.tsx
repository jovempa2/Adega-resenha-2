import React, { useState } from 'react';
import { GlassWater, Check, Plus, Minus, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Droplets, Image as ImageIcon, Layers } from 'lucide-react';
import { CustomizerConfig, CustomizerOption } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

import { DrinkCanvasAnimation } from './DrinkCanvasAnimation.tsx';

interface DrinkCustomizerProps {
  config: CustomizerConfig;
}

const DEFAULT_CUP_SIZES: CustomizerOption[] = [
  { id: 'cup-copao-700', name: 'Copão 700ml Acrílico', price: 0, available: true, description: 'O gigante clássico das noites paulistanas.' },
  { id: 'cup-taca-gin-600', name: 'Taça Gin Acrílica 600ml', price: 4.0, available: true, description: 'Taça elegante bojudinha para preservar botânicos e aroma.' },
];

export const DrinkCustomizer: React.FC<DrinkCustomizerProps> = ({ config }) => {
  const { addCustomDrink } = useCart();

  // Active step: 1: Tipo de Copo, 2: Bebida-Base, 3: Gelo, 4: Energético, 5: Complementos, 6: Resumo
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Cup Size selection
  const cupOptions = config.cupSizes && config.cupSizes.length > 0 ? config.cupSizes : DEFAULT_CUP_SIZES;
  const [selectedCup, setSelectedCup] = useState<CustomizerOption>(cupOptions[0]);

  // Selections
  const [selectedBase, setSelectedBase] = useState<CustomizerOption>(
    config.baseDrinks.find((b) => b.id === 'base-gin-10') || config.baseDrinks[0]
  );
  const [selectedIces, setSelectedIces] = useState<CustomizerOption[]>([
    config.iceFlavors.find((i) => i.id === 'ice-melancia') || config.iceFlavors[0]
  ]);
  const [selectedEnergyBrand, setSelectedEnergyBrand] = useState<'baly' | 'redbull' | 'none'>('baly');
  const [selectedEnergy, setSelectedEnergy] = useState<CustomizerOption | null>(
    config.balyFlavors.find((b) => b.id === 'baly-melancia') || config.balyFlavors[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<CustomizerOption[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'animated' | 'photo'>('animated');
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  const handleReplayAssembly = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    setPreviewMode('animated');
    setCurrentStep(1);
    
    [2, 3, 4, 5, 6].forEach((stepNum, idx) => {
      setTimeout(() => {
        setCurrentStep(stepNum);
        if (stepNum === 6) {
          setIsReplaying(false);
        }
      }, (idx + 1) * 950);
    });
  };

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  // Sanitize any Eternity reference
  const sanitizeName = (str: string) => str.replace(/Eternet[i]?/gi, 'Eternity');

  // Toggle Ice Flavor with limit
  const handleToggleIce = (ice: CustomizerOption) => {
    if (!ice.available) return;
    const exists = selectedIces.some((i) => i.id === ice.id);
    if (exists) {
      setSelectedIces((prev) => prev.filter((i) => i.id !== ice.id));
    } else {
      if (selectedIces.length >= config.maxIceFlavors) {
        // Replace oldest
        setSelectedIces([selectedIces[selectedIces.length - 1], ice]);
      } else {
        setSelectedIces((prev) => [...prev, ice]);
      }
    }
  };

  // Select Energy Drink
  const handleSelectEnergy = (energy: CustomizerOption | null, brand: 'baly' | 'redbull' | 'none') => {
    setSelectedEnergyBrand(brand);
    setSelectedEnergy(energy);
  };

  // Toggle AddOn
  const handleToggleAddOn = (addon: CustomizerOption) => {
    if (!addon.available) return;
    const exists = selectedAddOns.some((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddOns((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns((prev) => [...prev, addon]);
    }
  };

  // Calculate Unit Total
  const calculateUnitTotal = () => {
    let total = (selectedBase?.price || 0) + (selectedCup?.price || 0);
    selectedIces.forEach((ice) => {
      total += ice.price || 0;
    });
    if (selectedEnergy) {
      total += selectedEnergy.price || 0;
    }
    selectedAddOns.forEach((addon) => {
      total += addon.price || 0;
    });
    return total;
  };

  const unitTotal = calculateUnitTotal();
  const grandTotal = unitTotal * quantity;

  const handleFinishAndAddToCart = () => {
    addCustomDrink({
      baseDrink: selectedBase,
      ices: selectedIces,
      energy: selectedEnergy,
      addOns: selectedAddOns,
      cupSize: selectedCup,
      totalPrice: unitTotal,
      quantity,
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setCurrentStep(1);
    }, 1800);
  };

  const stepsList = [
    { num: 1, label: 'Tamanho & Copo' },
    { num: 2, label: 'Bebida-Base' },
    { num: 3, label: 'Gelo Sabor' },
    { num: 4, label: 'Energético' },
    { num: 5, label: 'Adicionais' },
    { num: 6, label: 'Revisão' },
  ];

  // Helper color mapping for ice visuals
  const getIceColor = (iceName: string) => {
    const lower = iceName.toLowerCase();
    if (lower.includes('morango')) return '#ef4444';
    if (lower.includes('melancia')) return '#10b981';
    if (lower.includes('maracuj')) return '#f59e0b';
    if (lower.includes('coco')) return '#f8fafc';
    if (lower.includes('maçã')) return '#84cc16';
    return '#38bdf8';
  };

  // Energy drink color extractors for GPU canvas
  const getEnergyPrimaryColor = () => {
    if (!selectedEnergy) return '#7c3aed';
    const lower = selectedEnergy.name.toLowerCase();
    if (lower.includes('tropical')) return '#d97706';
    if (lower.includes('melancia') || lower.includes('red edition')) return '#e11d48';
    if (lower.includes('morango')) return '#ec4899';
    if (lower.includes('maracuj')) return '#eab308';
    return '#2563eb';
  };

  const getEnergySecondaryColor = () => {
    if (!selectedEnergy) return '#c026d3';
    const lower = selectedEnergy.name.toLowerCase();
    if (lower.includes('tropical')) return '#f59e0b';
    if (lower.includes('melancia') || lower.includes('red edition')) return '#f43f5e';
    if (lower.includes('morango')) return '#fb7185';
    if (lower.includes('maracuj')) return '#facc15';
    return '#7c3aed';
  };

  return (
    <section id="monte-seu-copo" className="py-20 bg-zinc-950 border-t border-zinc-900 relative">
      {/* Anchor alias for compatibility */}
      <span id="monte-seu-copao" className="sr-only" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
            <GlassWater className="w-4 h-4" />
            <span>Experiência Exclusiva</span>
            <span aria-hidden="true">·</span>
            <span>Com Gin Eternity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            MONTE SEU COPO PERSONALIZADO
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Selecione o tamanho, a dose de destilado favorita, gelos saborizados que derretem na medida, energético e acompanhamentos.
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-10 overflow-x-auto pb-2 scrollbar-none">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className="flex items-center gap-2 group whitespace-nowrap px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white ring-2 ring-rose-500/40'
                      : isCompleted
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isActive ? 'text-white' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content Card & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Customizer Controls (8 cols on desktop) */}
          <div className="lg:col-span-8 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            
            {/* ETAPA 1: TAMANHO & COPO */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">1. Escolha o Tamanho & Tipo de Copo</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Selecione entre o copão de 700ml ou a taça de gin bojudinha.</p>
                  </div>
                  <span className="text-xs font-medium text-rose-400">1 obrigatório</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cupOptions.map((cup) => {
                    const isSelected = selectedCup?.id === cup.id;
                    return (
                      <div
                        key={cup.id}
                        onClick={() => cup.available && setSelectedCup(cup)}
                        className={`relative p-5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-950/30 border-rose-600 ring-1 ring-rose-600/50'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        } ${!cup.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-white font-['Outfit']">{cup.name}</h4>
                            <p className="text-xs text-zinc-400 mt-1">{cup.description}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                              isSelected
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'border-zinc-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                          <span className="text-xs text-zinc-400">Adicional do copo:</span>
                          <span className="text-sm font-bold text-rose-400 font-mono">
                            {cup.price > 0 ? `+ ${formatPrice(cup.price)}` : 'Incluso'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                  >
                    <span>Avançar para Bebida-Base</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: BEBIDA-BASE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">2. Escolha a Bebida-Base</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Selecione o destilado que será a dose principal do seu copo.</p>
                  </div>
                  <span className="text-xs font-medium text-rose-400">1 obrigatória</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.baseDrinks.map((base) => {
                    const isSelected = selectedBase?.id === base.id;
                    const isEternity = base.name.toLowerCase().includes('eterneti') || base.name.toLowerCase().includes('eternity');

                    return (
                      <div
                        key={base.id}
                        onClick={() => base.available && setSelectedBase(base)}
                        className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-950/30 border-rose-600 ring-1 ring-rose-600/50'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                        } ${!base.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isEternity && (
                          <div className="absolute top-2.5 right-2.5 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 rounded px-2 py-0.5">
                            OFICIAL ETERNITY
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white">{sanitizeName(base.name)}</h4>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{sanitizeName(base.description || '')}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-800/60">
                          <span className="text-sm font-bold text-rose-400 tabular-nums font-mono">
                            {formatPrice(base.price)}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                              isSelected
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'border-zinc-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                  >
                    <span>Avançar para os Gelos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: GELOS SABORIZADOS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">3. Escolha os Gelos Saborizados</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Cocos artesanais congelados com sabor de frutas. Derretem soltando aroma e cor.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-1 rounded">
                    {selectedIces.length} de {config.maxIceFlavors} selecionados
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {config.iceFlavors.map((ice) => {
                    const isSelected = selectedIces.some((i) => i.id === ice.id);

                    return (
                      <div
                        key={ice.id}
                        onClick={() => handleToggleIce(ice)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        } ${!ice.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white truncate">{ice.name}</span>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${
                              isSelected
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'border-zinc-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">{ice.description}</p>
                        <p className="text-xs font-semibold text-rose-400 tabular-nums font-mono">
                          {ice.price > 0 ? `+ ${formatPrice(ice.price)}` : 'Incluso'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                  >
                    <span>Avançar para o Energético</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4: ENERGÉTICOS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">4. Escolha o Energético</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Selecione Baly, Red Bull ou prefira sem energético.</p>
                  </div>
                </div>

                {/* Brand Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <button
                    onClick={() => {
                      setSelectedEnergyBrand('baly');
                      if (!selectedEnergy || selectedEnergyBrand !== 'baly') {
                        setSelectedEnergy(config.balyFlavors[0] || null);
                      }
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedEnergyBrand === 'baly'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Energéticos Baly
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEnergyBrand('redbull');
                      if (!selectedEnergy || selectedEnergyBrand !== 'redbull') {
                        setSelectedEnergy(config.redBullFlavors[0] || null);
                      }
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedEnergyBrand === 'redbull'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Red Bull Edições
                  </button>
                  <button
                    onClick={() => handleSelectEnergy(null, 'none')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedEnergyBrand === 'none'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Sem Energético
                  </button>
                </div>

                {/* Flavors List */}
                {selectedEnergyBrand === 'baly' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.balyFlavors.map((item) => {
                      const isSelected = selectedEnergy?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectEnergy(item, 'baly')}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                          } ${!item.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{item.name}</span>
                            <span className="text-xs font-semibold text-rose-400 tabular-nums font-mono">
                              + {formatPrice(item.price)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedEnergyBrand === 'redbull' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.redBullFlavors.map((item) => {
                      const isSelected = selectedEnergy?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectEnergy(item, 'redbull')}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                          } ${!item.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{item.name}</span>
                            <span className="text-xs font-semibold text-rose-400 tabular-nums font-mono">
                              + {formatPrice(item.price)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedEnergyBrand === 'none' && (
                  <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                    <p className="text-sm text-zinc-300 font-medium">Você escolheu o copo sem adição de energético.</p>
                    <p className="text-xs text-zinc-500 mt-1">Servido com a dose concentrada e gelos artesanais selecionados.</p>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                  >
                    <span>Avançar para Complementos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 5: COMPLEMENTOS */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">5. Complementos Opcionais</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Adicionais para estilizar o copo com balas Fini e rodelas cítricas.</p>
                  </div>
                  <span className="text-xs text-zinc-500">Opcional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {config.addOns.map((addon) => {
                    const isSelected = selectedAddOns.some((a) => a.id === addon.id);

                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddOn(addon)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        } ${!addon.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{addon.name}</span>
                          <span className="text-xs font-semibold text-rose-400 tabular-nums font-mono">
                            + {formatPrice(addon.price)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{addon.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                  >
                    <span>Revisar Copo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 6: RESUMO & REVISÃO */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800">
                  <h3 className="text-xl font-bold text-white font-['Outfit']">6. Resumo da Sua Combinação</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Revise todos os itens escolhidos antes de colocar no carrinho.</p>
                </div>

                <div className="space-y-3 divide-y divide-zinc-800/70">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs text-zinc-400 block">Tipo & Tamanho do Copo:</span>
                      <strong className="text-sm text-white font-medium">{selectedCup.name}</strong>
                    </div>
                    <span className="text-sm font-mono text-zinc-300 tabular-nums">{formatPrice(selectedCup.price)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs text-zinc-400 block">Bebida-Base:</span>
                      <strong className="text-sm text-white font-medium">{sanitizeName(selectedBase.name)}</strong>
                    </div>
                    <span className="text-sm font-mono text-zinc-300 tabular-nums">{formatPrice(selectedBase.price)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs text-zinc-400 block">Gelo(s) Saborizado(s):</span>
                      <strong className="text-sm text-white font-medium">
                        {selectedIces.map((i) => i.name).join(' + ') || 'Sem gelo especial'}
                      </strong>
                    </div>
                    <span className="text-sm font-mono text-zinc-300 tabular-nums">
                      {formatPrice(selectedIces.reduce((acc, i) => acc + i.price, 0))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs text-zinc-400 block">Energético:</span>
                      <strong className="text-sm text-white font-medium">
                        {selectedEnergy ? selectedEnergy.name : 'Sem energético'}
                      </strong>
                    </div>
                    <span className="text-sm font-mono text-zinc-300 tabular-nums">
                      {formatPrice(selectedEnergy?.price || 0)}
                    </span>
                  </div>

                  {selectedAddOns.length > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-xs text-zinc-400 block">Complementos:</span>
                        <strong className="text-sm text-white font-medium">
                          {selectedAddOns.map((a) => a.name).join(', ')}
                        </strong>
                      </div>
                      <span className="text-sm font-mono text-zinc-300 tabular-nums">
                        {formatPrice(selectedAddOns.reduce((acc, a) => acc + a.price, 0))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quantity stepper */}
                <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                  <span className="text-sm font-medium text-zinc-300">Quantidade:</span>
                  <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-mono font-bold text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-zinc-800/80">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Ajustar Ingredientes</span>
                  </button>

                  <button
                    onClick={handleFinishAndAddToCart}
                    disabled={addedSuccess}
                    className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg cursor-pointer ${
                      addedSuccess
                        ? 'bg-emerald-600'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/60 active:scale-95'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Adicionado ao Carrinho!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Adicionar ao Carrinho ({formatPrice(grandTotal)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Visual Preview Card (4 cols on desktop) */}
          <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden sticky top-28 shadow-2xl">
            
            {/* Visualizer header & toggle */}
            <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Visualização
                </span>
                <button
                  type="button"
                  onClick={handleReplayAssembly}
                  disabled={isReplaying}
                  className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 transition-colors cursor-pointer disabled:opacity-50"
                  title="Executar animação de montagem passo a passo"
                >
                  {isReplaying ? 'Montando...' : '▶ Rever Montagem'}
                </button>
              </div>
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setPreviewMode('animated')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    previewMode === 'animated' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Física 2D
                </button>
                <button
                  onClick={() => setPreviewMode('photo')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    previewMode === 'photo' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Foto Real
                </button>
              </div>
            </div>

            {/* Display stage */}
            {previewMode === 'photo' ? (
              <div className="relative aspect-[4/3] bg-zinc-950">
                <img
                  src="/src/assets/images/custom_drink_copao_1792974928549.jpg"
                  alt="Copão artesanal personalizado"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3 bg-rose-600/90 text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow">
                  {selectedCup.name}
                </div>
              </div>
            ) : (
              <div className="relative aspect-[4/3] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-2 overflow-hidden">
                <DrinkCanvasAnimation
                  cupType={selectedCup.id.includes('taca') ? 'taca' : 'copao'}
                  step={currentStep}
                  baseDrinkName={selectedBase.name}
                  primaryColor={getEnergyPrimaryColor()}
                  secondaryColor={getEnergySecondaryColor()}
                  ices={selectedIces.map((ice) => ({ name: ice.name, color: getIceColor(ice.name) }))}
                  garnish={selectedAddOns.length > 0 ? selectedAddOns[0].name : undefined}
                  className="w-full h-full"
                />

                {/* Step indicator tag inside canvas */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-black/70 text-rose-300 backdrop-blur-sm border border-zinc-800">
                    Etapa {currentStep}/6: {stepsList[currentStep - 1]?.label || 'Pronto'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-black/70 text-zinc-400 backdrop-blur-sm border border-zinc-800">
                    {currentStep === 1 && 'Copo Vazio'}
                    {currentStep === 2 && 'Gelo Acomodado'}
                    {currentStep === 3 && 'Dose Destilado'}
                    {currentStep === 4 && 'Mistura & Bolhas'}
                    {currentStep >= 5 && 'Canudo & Adicionais'}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom details card */}
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                  Seu Copo Resenha
                </span>
                <h4 className="text-lg font-bold text-white font-['Outfit'] mt-0.5">
                  {sanitizeName(selectedBase.name)}
                </h4>
                <span className="text-xs text-zinc-400">{selectedCup.name}</span>
              </div>

              <div className="space-y-2 text-xs text-zinc-400 border-y border-zinc-800/80 py-3">
                <div className="flex items-center justify-between">
                  <span>Gelos:</span>
                  <span className="text-zinc-200 font-medium">
                    {selectedIces.map((i) => i.name.replace('Gelo de ', '')).join(', ') || 'Nenhum'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Energético:</span>
                  <span className="text-zinc-200 font-medium">
                    {selectedEnergy ? selectedEnergy.name : 'Sem energético'}
                  </span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Adicionais:</span>
                    <span className="text-zinc-200 font-medium">{selectedAddOns.length} selecionado(s)</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[11px] text-zinc-500 block">Preço unitário</span>
                  <span className="text-2xl font-black text-rose-500 font-['Outfit'] tabular-nums font-mono">
                    {formatPrice(unitTotal)}
                  </span>
                </div>
                {quantity > 1 && (
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 block">Total ({quantity} un)</span>
                    <span className="text-sm font-bold text-zinc-200 tabular-nums font-mono">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
