import React, { useState, useEffect } from 'react';
import { Flame, Check, Plus, Minus, ArrowRight, ArrowLeft, Sparkles, Wind, Info, RefreshCw, ShoppingBag } from 'lucide-react';
import { RoshCustomizerConfig, RoshModel, ShishaFlavor, RoshAccessory } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';
import { RoshCanvasAnimation } from './RoshCanvasAnimation.tsx';

interface RoshCustomizerProps {
  initialConfig?: RoshCustomizerConfig;
}

const DEFAULT_CONFIG: RoshCustomizerConfig = {
  models: [
    {
      id: 'rosh-belli-gold',
      name: 'Rosh Belli Hookah Gold Ceramic',
      brand: 'Belli Hookah',
      price: 28.0,
      available: true,
      image: '/src/assets/images/hookah_lounge_setup_1792974929241.jpg',
      description: 'Cerâmica branca refratária com filete dourado. Queima limpa e longa duração.',
      capacityGrams: 18,
    },
    {
      id: 'rosh-seven-black',
      name: 'Rosh Seven Hookah Phunnel Black',
      brand: 'Seven Hookah',
      price: 25.0,
      available: true,
      image: '/src/assets/images/hookah_lounge_setup_1792974929241.jpg',
      description: 'Phunnel térmico com cuba funda, ideal para reter o melaço de essências premium.',
      capacityGrams: 20,
    },
    {
      id: 'rosh-pro-titanium',
      name: 'Rosh Pro Hookah Titanium Pro',
      brand: 'Pro Hookah',
      price: 32.0,
      available: true,
      image: '/src/assets/images/hookah_lounge_setup_1792974929241.jpg',
      description: 'Linha profissional com paredes grossas que retêm o calor e evitam queimar a essência.',
      capacityGrams: 22,
    },
  ],
  flavors: [
    {
      id: 'flv-love66',
      name: 'Adalya Love 66',
      brand: 'Adalya',
      price: 0,
      available: true,
      colorHex: '#ef4444',
      profile: 'tropical',
      description: 'Melão doce, melancia e menta refrescante. O sabor mais pedido do Brasil.',
    },
    {
      id: 'flv-strong-mint',
      name: 'Zomo Strong Mint',
      brand: 'Zomo',
      price: 0,
      available: true,
      colorHex: '#10b981',
      profile: 'mentolado',
      description: 'Menta congelante de alta intensidade para dar pressão e frescor.',
    },
    {
      id: 'flv-swiss-alp',
      name: 'Adalya Swiss Alps',
      brand: 'Adalya',
      price: 0,
      available: true,
      colorHex: '#38bdf8',
      profile: 'mentolado',
      description: 'Menta alpina com toque adocicado e refrescância duradoura.',
    },
    {
      id: 'flv-nay-tanger',
      name: 'Nay Tanger Blend',
      brand: 'Nay',
      price: 0,
      available: true,
      colorHex: '#f97316',
      profile: 'citrico',
      description: 'Tangerina suculenta com toque cítrico equilibrado.',
    },
    {
      id: 'flv-nay-fresh-peach',
      name: 'Nay Fresh Peach',
      brand: 'Nay',
      price: 0,
      available: true,
      colorHex: '#fb923c',
      profile: 'doce',
      description: 'Pêssego maduro e aveludado com notas refrescantes.',
    },
    {
      id: 'flv-ziggy-cherry',
      name: 'Ziggy Cherry Starburst',
      brand: 'Ziggy',
      price: 0,
      available: true,
      colorHex: '#e11d48',
      profile: 'frutado',
      description: 'Cereja intensa e doce com fumaça densa e aromática.',
    },
  ],
  accessories: [
    {
      id: 'acc-carvao-extra',
      name: '3 Carvões de Coco Hexagonais Acesos',
      price: 5.0,
      available: true,
      description: 'Carvões 100% fibra de coco, acesos em maçarico no ponto ideal.',
    },
    {
      id: 'acc-aluminio-predator',
      name: 'Alumínio Predator Esticado & Furado',
      price: 3.0,
      available: true,
      description: 'Folha reforçada 40 micras com furação concêntrica para fluxo de ar perfeito.',
    },
    {
      id: 'acc-piteira-gelo',
      name: 'Piteira de Gelo Refrescante',
      price: 6.0,
      available: true,
      description: 'Piteira congelada que reduz a temperatura da fumaça a cada puxada.',
    },
  ],
  maxFlavors: 3,
  proportions: ['50/50', '70/30', '80/20', '33/33/34', '100% Único'],
};

export const RoshCustomizer: React.FC<RoshCustomizerProps> = ({ initialConfig }) => {
  const { addCustomRosh } = useCart();
  const [config, setConfig] = useState<RoshCustomizerConfig>(initialConfig || DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
  const [selectedModel, setSelectedModel] = useState<RoshModel>(
    config.models[0] || DEFAULT_CONFIG.models[0]
  );
  const [selectedFlavors, setSelectedFlavors] = useState<
    { flavor: ShishaFlavor; proportion: string }[]
  >([
    { flavor: config.flavors[0] || DEFAULT_CONFIG.flavors[0], proportion: '50%' },
    { flavor: config.flavors[1] || DEFAULT_CONFIG.flavors[1], proportion: '50%' },
  ]);
  const [selectedAccessories, setSelectedAccessories] = useState<RoshAccessory[]>([]);
  const [showSmokeEffect, setShowSmokeEffect] = useState(true);
  const [coalsGlowing, setCoalsGlowing] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplayRosh = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    setCurrentStep(1);

    [2, 3, 4].forEach((stepNum, idx) => {
      setTimeout(() => {
        setCurrentStep(stepNum);
        if (stepNum === 4) {
          setIsReplaying(false);
        }
      }, (idx + 1) * 1000);
    });
  };

  // Fetch updated config if not provided
  useEffect(() => {
    if (!initialConfig) {
      api.getRoshCustomizer()
        .then((data) => {
          if (data && data.models && data.models.length > 0) {
            setConfig(data);
            setSelectedModel(data.models[0]);
            if (data.flavors.length >= 2) {
              setSelectedFlavors([
                { flavor: data.flavors[0], proportion: '50%' },
                { flavor: data.flavors[1], proportion: '50%' },
              ]);
            }
          }
        })
        .catch(() => {
          // Use default
        });
    }
  }, [initialConfig]);

  const formatPrice = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  // Toggle flavor selection
  const handleToggleFlavor = (flavor: ShishaFlavor) => {
    if (!flavor.available) return;
    const exists = selectedFlavors.some((f) => f.flavor.id === flavor.id);

    if (exists) {
      // Don't allow empty list (keep at least 1)
      if (selectedFlavors.length === 1) return;
      const filtered = selectedFlavors.filter((f) => f.flavor.id !== flavor.id);
      recalculateProportions(filtered);
    } else {
      if (selectedFlavors.length >= (config.maxFlavors || 3)) {
        // Replace last flavor
        const updated = [...selectedFlavors.slice(0, -1), { flavor, proportion: '' }];
        recalculateProportions(updated);
      } else {
        const updated = [...selectedFlavors, { flavor, proportion: '' }];
        recalculateProportions(updated);
      }
    }
  };

  const recalculateProportions = (list: { flavor: ShishaFlavor; proportion: string }[]) => {
    if (list.length === 1) {
      setSelectedFlavors([{ ...list[0], proportion: '100%' }]);
    } else if (list.length === 2) {
      setSelectedFlavors([
        { ...list[0], proportion: '50%' },
        { ...list[1], proportion: '50%' },
      ]);
    } else if (list.length === 3) {
      setSelectedFlavors([
        { ...list[0], proportion: '33%' },
        { ...list[1], proportion: '33%' },
        { ...list[2], proportion: '34%' },
      ]);
    } else {
      setSelectedFlavors(list);
    }
  };

  const handleSetRatioTwo = (ratio: '50/50' | '70/30' | '80/20') => {
    if (selectedFlavors.length !== 2) return;
    if (ratio === '50/50') {
      setSelectedFlavors([
        { ...selectedFlavors[0], proportion: '50%' },
        { ...selectedFlavors[1], proportion: '50%' },
      ]);
    } else if (ratio === '70/30') {
      setSelectedFlavors([
        { ...selectedFlavors[0], proportion: '70%' },
        { ...selectedFlavors[1], proportion: '30%' },
      ]);
    } else if (ratio === '80/20') {
      setSelectedFlavors([
        { ...selectedFlavors[0], proportion: '80%' },
        { ...selectedFlavors[1], proportion: '20%' },
      ]);
    }
  };

  // Toggle Accessory
  const handleToggleAccessory = (acc: RoshAccessory) => {
    if (!acc.available) return;
    const exists = selectedAccessories.some((a) => a.id === acc.id);
    if (exists) {
      setSelectedAccessories((prev) => prev.filter((a) => a.id !== acc.id));
    } else {
      setSelectedAccessories((prev) => [...prev, acc]);
    }
  };

  // Price calculations
  const calculateUnitTotal = () => {
    let total = selectedModel?.price || 0;
    selectedFlavors.forEach((f) => {
      total += f.flavor.price || 0;
    });
    selectedAccessories.forEach((acc) => {
      total += acc.price || 0;
    });
    return total;
  };

  const unitTotal = calculateUnitTotal();
  const grandTotal = unitTotal * quantity;

  const handleAddToCart = () => {
    addCustomRosh({
      model: selectedModel,
      flavors: selectedFlavors,
      accessories: selectedAccessories,
      totalPrice: unitTotal,
      quantity,
    });
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setCurrentStep(1);
    }, 2000);
  };

  const stepsList = [
    { num: 1, label: '1. Modelo do Rosh' },
    { num: 2, label: '2. Mix de Essências' },
    { num: 3, label: '3. Acessórios' },
    { num: 4, label: '4. Montagem & Pedido' },
  ];

  return (
    <section id="monte-seu-rosh" className="py-20 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/50 mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Sessão Perfeita</span>
            <span aria-hidden="true">·</span>
            <span>Tabacaria +18</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            MONTE SEU ROSH INTERATIVO
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Selecione o modelo do rosh, combine essências na proporção que você curte e visualize a montagem artesanal com carvão em brasa.
          </p>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 overflow-x-auto pb-2 scrollbar-none">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className="flex items-center gap-2 px-3 py-1.5 focus:outline-none whitespace-nowrap cursor-pointer transition-colors"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black font-extrabold ring-2 ring-amber-400/50'
                      : isCompleted
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
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

        {/* Main Grid: Controls (Left) + Interactive Visual Assembly (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
            
            {/* ETAPA 1: MODELO DO ROSH */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">1. Selecione o Modelo do Rosh</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Modelos de cerâmica térmica e phunnel originais da tabacaria.</p>
                  </div>
                  <span className="text-xs font-medium text-amber-400">1 obrigatório</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.models.map((model) => {
                    const isSelected = selectedModel?.id === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => model.available && setSelectedModel(model)}
                        className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/50'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                        } ${!model.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                              {model.brand}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{model.name}</h4>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{model.description}</p>
                            <span className="text-[11px] text-zinc-500 font-mono mt-2 block">
                              Capacidade: ~{model.capacityGrams}g de essência
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                          <span className="text-xs text-zinc-400">Valor do modelo:</span>
                          <span className="text-sm font-bold text-white font-mono">{formatPrice(model.price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-amber-950/40"
                  >
                    <span>Avançar para Essências</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: MIX DE ESSÊNCIAS & PROPORÇÕES */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">2. Escolha os Sabores de Essência</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Misture até {config.maxFlavors || 3} sabores favoritos no mesmo rosh.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 font-mono">
                    {selectedFlavors.length} / {config.maxFlavors || 3} selecionados
                  </span>
                </div>

                {/* Proportion shortcuts if 2 flavors */}
                {selectedFlavors.length === 2 && (
                  <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Proporção da mistura:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSetRatioTwo('50/50')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                      >
                        50% / 50% Meio a Meio
                      </button>
                      <button
                        onClick={() => handleSetRatioTwo('70/30')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                      >
                        70% / 30% Toque Menta
                      </button>
                      <button
                        onClick={() => handleSetRatioTwo('80/20')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                      >
                        80% / 20%
                      </button>
                    </div>
                  </div>
                )}

                {/* Flavors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {config.flavors.map((flv) => {
                    const selObj = selectedFlavors.find((f) => f.flavor.id === flv.id);
                    const isSelected = Boolean(selObj);

                    return (
                      <div
                        key={flv.id}
                        onClick={() => handleToggleFlavor(flv)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/40'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        } ${!flv.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border border-white/20 shadow-sm"
                            style={{ backgroundColor: flv.colorHex }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase text-zinc-400">{flv.brand}</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                                {flv.profile}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-0.5">{flv.name}</h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{flv.description}</p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {isSelected ? (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold text-amber-300 bg-amber-900/60 rounded">
                              {selObj?.proportion || 'Ativo'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {flv.price > 0 ? formatPrice(flv.price) : 'Incluso'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={selectedFlavors.length === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span>Avançar para Acessórios</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: ACESSÓRIOS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">3. Adicionais de Preparação</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Carvão de coco já aceso, folha de alumínio esticada e piteira de gelo.</p>
                  </div>
                  <span className="text-xs text-zinc-400">Opcionais</span>
                </div>

                <div className="space-y-3">
                  {config.accessories.map((acc) => {
                    const isSelected = selectedAccessories.some((a) => a.id === acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleToggleAccessory(acc)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/40'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        } ${!acc.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected ? 'bg-amber-500 border-amber-400 text-black' : 'border-zinc-700 bg-zinc-800'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">{acc.description}</p>
                          </div>
                        </div>

                        <span className="text-sm font-bold text-amber-400 font-mono">
                          +{formatPrice(acc.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Revisar e Montar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4: REVISÃO & ADIÇÃO */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-800">
                  <h3 className="text-xl font-bold text-white font-['Outfit']">4. Resumo da Sua Combinação</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Revise todos os itens e adicione seu rosh montado ao carrinho.</p>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="text-xs text-zinc-400">Modelo:</span>
                    <span className="text-sm font-bold text-white font-['Outfit']">{selectedModel.name}</span>
                  </div>

                  <div className="pb-3 border-b border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-2">Mix de Essências:</span>
                    <div className="space-y-1.5">
                      {selectedFlavors.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: f.flavor.colorHex }}
                            />
                            {f.flavor.name}
                          </span>
                          <span className="font-mono text-amber-400 font-semibold">{f.proportion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedAccessories.length > 0 && (
                    <div className="pb-3 border-b border-zinc-800">
                      <span className="text-xs text-zinc-400 block mb-2">Acessórios Inclusos:</span>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {selectedAccessories.map((acc) => (
                          <li key={acc.id} className="flex items-center justify-between">
                            <span>· {acc.name}</span>
                            <span className="font-mono text-zinc-400">{formatPrice(acc.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-white">Preço Unitário:</span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      {formatPrice(unitTotal)}
                    </span>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <span className="text-xs font-semibold text-zinc-300">Quantidade de Roshs:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold font-mono text-white w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-950/60 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar ao Carrinho ({formatPrice(grandTotal)})</span>
                  </button>
                </div>

                {successToast && (
                  <div className="p-3 bg-emerald-950/90 border border-emerald-800 rounded-xl text-emerald-300 text-xs text-center font-bold animate-fade-in">
                    ✓ Rosh personalizado adicionado ao seu carrinho com sucesso!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Visual Assembly (Right Column - 5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col items-center">
            
            {/* Header controls for visualizer */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" />
                  Narguilé Completo
                </span>
                <button
                  type="button"
                  onClick={handleReplayRosh}
                  disabled={isReplaying}
                  className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
                  title="Executar animação de montagem passo a passo"
                >
                  {isReplaying ? 'Montando...' : '▶ Rever Montagem'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSmokeEffect((s) => !s)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                    showSmokeEffect ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  Fumaça: {showSmokeEffect ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setCoalsGlowing((c) => !c)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                    coalsGlowing ? 'bg-orange-950 text-orange-300 border border-orange-800' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  Brasa: {coalsGlowing ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Step indicator badge */}
            <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400 mb-2 px-1">
              <span className="text-amber-400">Etapa {currentStep}/4: {stepsList[currentStep - 1]?.label}</span>
              <span>
                {currentStep === 1 && 'Vaso + Stem + Prato + Rosh'}
                {currentStep === 2 && 'Mix de Essências Proporcionais'}
                {currentStep === 3 && 'Alumínio + Carvões em Brasa'}
                {currentStep === 4 && 'Sessão Pronta com Mangueira e Piteira'}
              </span>
            </div>

            {/* Rosh Visual Stage (Hardware-accelerated requestAnimationFrame canvas with complete shisha assembly) */}
            <div className="relative w-full max-w-[320px] h-[340px] flex flex-col items-center justify-center my-1">
              <RoshCanvasAnimation
                showSmoke={showSmokeEffect}
                coalsGlowing={coalsGlowing}
                modelBrand={selectedModel.brand}
                modelName={selectedModel.name}
                step={currentStep === 1 ? 2 : currentStep === 2 ? 3 : currentStep === 3 ? 4 : 5}
                flavors={selectedFlavors.map((f) => ({
                  name: f.flavor.name,
                  color: f.flavor.colorHex,
                  proportion: f.proportion,
                }))}
                className="w-full h-full"
              />
            </div>

            {/* Flavor Legend / Mixture Breakdown */}
            <div className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Composição do Rosh
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedFlavors.map((flv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: flv.flavor.colorHex }}
                    />
                    <span className="text-white font-medium">{flv.flavor.name}</span>
                    <span className="text-amber-400 font-mono font-bold">({flv.proportion})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Note */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400 text-center">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Preparado com técnica profissional para fumaça densa e sem queimar.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
