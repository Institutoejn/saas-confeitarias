import React, { useState } from 'react';
import { MOCK_VIP_CLIENTS, MOCK_REWARDS, User, Reward } from '../types';
import { Gift, Star, Award, TrendingUp, CheckCircle, Lock } from 'lucide-react';

const LoyaltyProgram: React.FC = () => {
  // Simulando o usuário logado (primeiro da lista mock)
  const [currentUser, setCurrentUser] = useState<User>(MOCK_VIP_CLIENTS[0]);
  const [history, setHistory] = useState<{reward: string, date: string}[]>([]);

  const handleRedeem = (reward: Reward) => {
    if (currentUser.loyaltyPoints < reward.costInPoints) return;

    if (confirm(`Deseja trocar ${reward.costInPoints} pontos por "${reward.title}"?`)) {
      // Atualiza estado local simulando o DB
      setCurrentUser(prev => ({
        ...prev,
        loyaltyPoints: prev.loyaltyPoints - reward.costInPoints
      }));
      
      setHistory(prev => [
        { reward: reward.title, date: new Date().toLocaleDateString('pt-BR') },
        ...prev
      ]);

      alert('Resgate realizado com sucesso! O cupom foi enviado para seu email.');
    }
  };

  const calculateProgress = () => {
    // Lógica simples de gamificação
    const maxPoints = 500; // Meta para o próximo nível "Diamante" (fictício)
    return Math.min((currentUser.loyaltyPoints / maxPoints) * 100, 100);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header com Resumo Gamificado */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Star size={200} fill="white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <Award size={40} className="text-yellow-300" />
            </div>
            <div>
              <p className="text-brand-100 font-medium">Bem-vindo(a) de volta,</p>
              <h2 className="text-3xl font-bold">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400/30 uppercase tracking-wide">
                  Cliente {currentUser.loyaltyTier}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-brand-100 text-sm mb-1">Seu saldo atual</p>
            <div className="text-5xl font-black tracking-tight flex items-center justify-center md:justify-end gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={32} />
              {currentUser.loyaltyPoints}
            </div>
            <p className="text-xs text-brand-200 mt-2">Expira em 30 dias se não houver movimentação</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-xs font-medium text-brand-100 mb-2">
            <span>Progresso para Nível Diamante</span>
            <span>{currentUser.loyaltyPoints} / 500</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Catálogo de Recompensas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="text-brand-600" />
            <h3 className="text-xl font-bold text-gray-800">Recompensas Disponíveis</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_REWARDS.map(reward => {
              const canRedeem = currentUser.loyaltyPoints >= reward.costInPoints;
              const isLocked = reward.minTier === 'Ouro' && currentUser.loyaltyTier !== 'Ouro'; // Exemplo simples de lock

              return (
                <div 
                  key={reward.id} 
                  className={`bg-white rounded-xl p-5 border-2 transition-all relative overflow-hidden group
                    ${canRedeem && !isLocked
                      ? 'border-gray-100 hover:border-brand-300 hover:shadow-md' 
                      : 'border-gray-100 opacity-70 grayscale-[0.5]'}`}
                >
                  {isLocked && (
                    <div className="absolute top-3 right-3 text-gray-400 bg-gray-100 p-1 rounded-full" title="Nível insuficiente">
                      <Lock size={16} />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-lg ${reward.type === 'free_product' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                      {reward.type === 'free_product' ? <Gift size={24} /> : <TrendingUp size={24} />}
                    </div>
                    <span className="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-sm">
                      {reward.costInPoints} pts
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-800 text-lg mb-1">{reward.title}</h4>
                  <p className="text-sm text-gray-500 mb-4 min-h-[40px]">{reward.description}</p>
                  
                  <button 
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem || isLocked}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2
                      ${canRedeem && !isLocked
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    {isLocked ? `Exclusivo ${reward.minTier}` : canRedeem ? 'Resgatar Agora' : `Faltam ${reward.costInPoints - currentUser.loyaltyPoints} pts`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico e Regras */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Histórico de Resgates</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Você ainda não realizou trocas.</p>
            ) : (
              <ul className="space-y-4">
                {history.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.reward}</p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Como ganhar pontos?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold">•</span> Cada R$ 1,00 gasto = 1 ponto
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span> Indique um amigo = 50 pontos
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span> Avalie seu pedido = 10 pontos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;