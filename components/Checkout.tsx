import React, { useState } from 'react';
import { CustomCakeDetails, Order, CatalogItem } from '../types';
import { calculateDeliveryFee, DeliveryEstimate } from '../services/geminiService';
import { Calendar, Clock, Loader2, Truck, QrCode, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

interface CheckoutProps {
  items: CustomCakeDetails | CatalogItem;
  totalItemsPrice: number;
  onReset: () => void;
  onOrderPlaced: (order: Order) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, totalItemsPrice, onReset, onOrderPlaced }) => {
  const [step, setStep] = useState<'delivery' | 'payment' | 'success'>('delivery');
  const [address, setAddress] = useState('');
  const [deliveryData, setDeliveryData] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Mock Pix Data
  const [pixCode] = useState("00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913SweetSaaS Doceria6009SAO PAULO62070503***6304");

  // Helper para identificar se é um bolo personalizado
  const isCustomCake = (item: any): item is CustomCakeDetails => {
    return 'shape' in item && 'batter' in item;
  };

  const handleCalculateDelivery = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const result = await calculateDeliveryFee(address);
      setDeliveryData(result);
    } catch (e) {
      alert("Erro ao calcular entrega");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Código Pix copiado para a área de transferência!");
  };

  const finalTotal = totalItemsPrice + (deliveryData?.deliveryFee || 0);
  const depositAmount = finalTotal * 0.5; // 50% do valor

  const handleConfirmPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Criar o objeto de pedido para enviar para a empresa
      const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        customerId: 'guest-123', // Em um app real, viria do auth
        items: [{
          type: isCustomCake(items) ? 'custom_cake' : (items as CatalogItem).category === 'combo' ? 'combo' : 'product',
          details: items,
          quantity: 1,
          priceAtPurchase: totalItemsPrice
        }],
        status: 'confirmed', // Confirmado após pagamento do sinal
        scheduledFor: new Date(`${scheduleDate}T${scheduleTime}`),
        createdAt: new Date(),
        deliveryAddress: address,
        deliveryFee: deliveryData?.deliveryFee || 0,
        totalAmount: finalTotal,
        notes: 'Sinal de 50% pago via Pix'
      };

      onOrderPlaced(newOrder);
      setStep('success');
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border border-green-100 text-center animate-fade-in mt-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-600 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Recebido!</h2>
        <p className="text-gray-600 mb-6">
          Seu pagamento do sinal de 50% foi confirmado. A produção do seu pedido começará em breve.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left text-sm text-gray-500 mb-6">
          <p><strong>Entrega:</strong> {scheduleDate} às {scheduleTime}</p>
          <p className="text-xs text-gray-400 mt-1">Nossa equipe entrará em contato se necessário.</p>
        </div>
        <button 
          onClick={onReset}
          className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <QrCode className="text-brand-600" /> Pagamento do Sinal
          </h2>
          <p className="text-gray-500 mb-6">
            Para confirmar sua encomenda, é necessário efetuar o pagamento de <strong>50% do valor total</strong>.
          </p>

          <div className="bg-brand-50 p-6 rounded-xl border border-brand-100 mb-8">
             <div className="flex justify-between items-center mb-2 text-gray-600">
               <span>Valor Total do Pedido</span>
               <span className="line-through">R$ {finalTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-xl font-bold text-brand-700 pb-4 border-b border-brand-200">
               <span>A Pagar Agora (50%)</span>
               <span>R$ {depositAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
               <span>Restante na Entrega</span>
               <span>R$ {depositAmount.toFixed(2)}</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="border-4 border-gray-800 p-2 rounded-lg">
               {/* Placeholder para QR Code Real */}
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixCode}`} alt="QR Code Pix" className="w-48 h-48" />
            </div>
            
            <div className="w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Pix Copia e Cola</label>
              <div className="flex gap-2">
                <input 
                  readOnly
                  value={pixCode}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 truncate"
                />
                <button 
                  onClick={handleCopyPix}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <Copy size={16} /> <span className="hidden sm:inline">Copiar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <button 
            onClick={() => setStep('delivery')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Voltar
          </button>
          <button 
            onClick={handleConfirmPayment}
            disabled={loading}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Já fiz o pagamento'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Truck className="text-brand-600" /> Detalhes da Entrega
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Address Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Endereço de Entrega</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número - Bairro, Cidade"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none w-full min-w-0"
              />
              <button 
                onClick={handleCalculateDelivery}
                disabled={loading || !address}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center min-w-[100px] shrink-0"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Calcular'}
              </button>
            </div>

            {deliveryData && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2 text-sm">
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {deliveryData.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Distância Est.:</span>
                  <span>{deliveryData.estimatedDistanceKm} km</span>
                </div>
                <p className="text-blue-600 text-xs italic mt-2 border-t border-blue-100 pt-2">
                  🤖 IA Logística: {deliveryData.reasoning}
                </p>
              </div>
            )}
          </div>

          {/* Schedule Section */}
          <div className="space-y-4">
             <label className="block text-sm font-medium text-gray-700">Agendamento</label>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <div className="relative">
                   <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                   <input 
                      type="date" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                   />
                 </div>
               </div>
               <div>
                 <div className="relative">
                   <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                   <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                   />
                 </div>
               </div>
             </div>
             <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
               ⚠️ Pedidos requerem antecedência mínima de 24h.
             </p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumo do Pedido</h3>
        <div className="space-y-2 border-b border-gray-100 pb-4 mb-4">
          <div className="flex justify-between text-gray-600">
            <span className="font-bold text-brand-700">
              {isCustomCake(items) ? `Bolo Personalizado (${items.shape?.name})` : (items as CatalogItem).name}
            </span>
            <span>R$ {totalItemsPrice.toFixed(2)}</span>
          </div>
          
          {isCustomCake(items) ? (
            <div className="pl-4 text-xs text-gray-400 space-y-1">
               <p>• {items.batter?.name}</p>
               <p>• {items.filling?.name}</p>
               {items.extras?.map((e, i) => <p key={i}>• {e.name}</p>)}
            </div>
          ) : (
             <div className="pl-4 text-xs text-gray-400">
               <p>{(items as CatalogItem).description}</p>
             </div>
          )}

          <div className="flex justify-between text-gray-600 pt-2">
            <span>Entrega</span>
            <span>R$ {deliveryData?.deliveryFee.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-gray-800">Total</span>
          <span className="text-3xl font-bold text-brand-600">R$ {finalTotal.toFixed(2)}</span>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <button 
            onClick={onReset}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            disabled={!deliveryData || !scheduleDate}
            onClick={() => setStep('payment')}
            className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
          >
            Ir para Pagamento <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;