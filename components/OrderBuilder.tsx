import React, { useState } from 'react';
import { CAKE_COMPONENTS, ProductComponent, CustomCakeDetails, CatalogItem } from '../types';
import { Check, ChevronRight, Cake, Plus } from 'lucide-react';

interface OrderBuilderProps {
  onComplete: (details: CustomCakeDetails | CatalogItem, total: number) => void;
  catalog: CatalogItem[];
}

const OrderBuilder: React.FC<OrderBuilderProps> = ({ onComplete, catalog }) => {
  // Modo inicial: 'menu' (catálogo) ou 'builder' (montagem de bolo)
  const [viewMode, setViewMode] = useState<'menu' | 'builder'>('menu');
  
  // State do Builder (existente)
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<Partial<CustomCakeDetails>>({
    toppings: [],
    extras: []
  });

  const steps = [
    { id: 1, title: 'Formato & Tamanho', type: 'shape' },
    { id: 2, title: 'Massa', type: 'batter' },
    { id: 3, title: 'Recheio', type: 'filling' },
    { id: 4, title: 'Extras', type: 'extra' },
  ];

  const currentOptions = CAKE_COMPONENTS.filter(c => c.type === steps[step - 1].type);

  const calculateTotal = () => {
    let total = 0;
    if (selection.shape) total += selection.shape.price;
    if (selection.batter) total += selection.batter.price;
    if (selection.filling) total += selection.filling.price;
    selection.extras?.forEach(e => total += e.price);
    return total;
  };

  const handleSelect = (item: ProductComponent) => {
    if (item.type === 'extra') {
      const currentExtras = selection.extras || [];
      const exists = currentExtras.find(e => e.id === item.id);
      if (exists) {
        setSelection({ ...selection, extras: currentExtras.filter(e => e.id !== item.id) });
      } else {
        setSelection({ ...selection, extras: [...currentExtras, item] });
      }
    } else {
      // @ts-ignore - dynamic key assignment safe here
      setSelection({ ...selection, [item.type]: item });
    }
  };

  const isStepValid = () => {
    if (step === 1) return !!selection.shape;
    if (step === 2) return !!selection.batter;
    if (step === 3) return !!selection.filling;
    return true;
  };

  // --- RENDERIZAÇÃO DO MENU (CATÁLOGO) ---
  if (viewMode === 'menu') {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-gray-500">Escolha um item do cardápio ou monte seu bolo exclusivo.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Especial: Montar Bolo */}
          <button 
            onClick={() => setViewMode('builder')}
            className="bg-brand-50 border-2 border-brand-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-brand-100 hover:border-brand-300 transition-all group h-full min-h-[250px]"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Cake size={40} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-800">Montar Bolo Personalizado</h3>
              <p className="text-sm text-brand-600 mt-2">Escolha massa, recheio e decoração do seu jeito.</p>
            </div>
            <span className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              Começar <ChevronRight size={16} />
            </span>
          </button>

          {/* Itens do Catálogo Dinâmico */}
          {catalog.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-48 bg-gray-100 relative">
                <img 
                  src={item.imageUrl || "https://placehold.co/400x300?text=Sem+Foto"} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                  item.category === 'combo' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  item.category === 'cake' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                  'bg-white text-gray-700 border-gray-200'
                }`}>
                  {item.category === 'combo' ? 'Combo' : item.category === 'cake' ? 'Bolo Pronto' : 'Produto'}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex-1">{item.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-brand-600">R$ {item.price.toFixed(2)}</span>
                  <button 
                    onClick={() => onComplete(item, item.price)}
                    className="bg-gray-900 text-white p-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO BUILDER (MONTE SEU BOLO) ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row h-full min-h-[500px]">
      
      {/* Left Panel: Preview & Progress */}
      <div className="w-full md:w-1/3 bg-brand-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-100">
        <div>
          <button 
             onClick={() => setViewMode('menu')}
             className="text-sm text-brand-600 hover:text-brand-800 mb-4 flex items-center gap-1 font-medium"
          >
            ← Voltar ao Cardápio
          </button>
          <h3 className="text-xl font-bold text-brand-900 mb-6">Monte seu Bolo</h3>
          
          <div className="space-y-6">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
                    ${step === s.id ? 'bg-brand-500 border-brand-500 text-white' : 
                      step > s.id ? 'bg-green-500 border-green-500 text-white' : 
                      'bg-white border-brand-200 text-brand-300'}`}>
                    {step > s.id ? <Check size={16} /> : s.id}
                  </div>
                  {idx < steps.length - 1 && <div className="w-0.5 h-full bg-brand-200 my-1"></div>}
                </div>
                <div className="pb-4">
                  <p className={`font-medium ${step === s.id ? 'text-brand-800' : 'text-gray-500'}`}>{s.title}</p>
                  <p className="text-xs text-gray-500">
                    {s.type === 'shape' && selection.shape?.name}
                    {s.type === 'batter' && selection.batter?.name}
                    {s.type === 'filling' && selection.filling?.name}
                    {s.type === 'extra' && selection.extras?.length ? `${selection.extras.length} selecionados` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Estimado</span>
            <span className="text-2xl font-bold text-brand-700">
              R$ {calculateTotal().toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">*Valor final pode variar com entrega.</p>
        </div>
      </div>

      {/* Right Panel: Options */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{steps[step-1].title}</h2>
          <p className="text-gray-500 mb-6">Selecione uma opção para continuar.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentOptions.map(option => {
              const isSelected = 
                selection[option.type as keyof CustomCakeDetails] === option || // Single select check
                (selection.extras?.some(e => e.id === option.id) && option.type === 'extra'); // Multi select check

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md flex justify-between items-start
                    ${isSelected 
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                      : 'border-gray-200 hover:border-brand-300'}`}
                >
                  <div>
                    <p className={`font-bold ${isSelected ? 'text-brand-900' : 'text-gray-700'}`}>{option.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.price === 0 ? 'Incluso' : `+ R$ ${option.price.toFixed(2)}`}
                    </p>
                  </div>
                  {isSelected && <div className="bg-brand-500 text-white p-1 rounded-full"><Check size={14} /></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Voltar
            </button>
          )}
          
          {step < 4 ? (
            <button 
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2
                ${isStepValid() 
                  ? 'bg-brand-600 text-white hover:bg-brand-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Próximo <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onComplete(selection as CustomCakeDetails, calculateTotal())}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 flex items-center gap-2"
            >
              Finalizar Pedido <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBuilder;