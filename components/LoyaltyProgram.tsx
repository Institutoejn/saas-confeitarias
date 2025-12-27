import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { MOCK_VIP_CLIENTS, User, Reward, Order } from '../types';
import { Gift, Star, Award, TrendingUp, CheckCircle, Lock, Users, Plus, Settings, Edit2, Trash2, X, Save, Loader2, Inbox } from 'lucide-react';

interface LoyaltyProgramProps {
  isCustomerView?: boolean;
  orders?: Order[]; // Recebe os pedidos para cálculo real
}

const LoyaltyProgram: React.FC<LoyaltyProgramProps> = ({ isCustomerView = false, orders = [] }) => {
  // --- ESTADOS GLOBAIS ---
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_VIP_CLIENTS[0]);
  
  // Estado para gerenciar as recompensas (Agora vindo do DB)
  const [rewards, setRewards] = useState<Reward[]>([]);
  
  // Estados do Modal de Gestão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState<Partial<Reward>>({
    title: '',
    description: '',
    costInPoints: 100,
    minTier: 'Bronze',
    type: 'free_product'
  });

  // Histórico local (apenas visualização)
  const [history, setHistory] = useState<{reward: string, date: string}[]>([]);

  // 1. Buscar Recompensas do Supabase ao carregar
  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let query = supabase.from('rewards').select('*');
      
      // Se for ADMIN (tem sessão e não está no modo visualização de cliente)
      if (session?.user && !isCustomerView) {
        query = query.eq('user_id', session.user.id);
      } else {
        // Se for CLIENTE (ou simulando), pega o ID da loja da URL
        const params = new URLSearchParams(window.location.search);
        const storeId = params.get('storeId');
        
        if (storeId) {
          query = query.eq('user_id', storeId);
        } else if (!session?.user) {
          setRewards([]);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const mappedRewards: Reward[] = data.map((r: any) => ({
           id: r.id,
           title: r.title,
           description: r.description,
           costInPoints: r.cost_in_points,
           type: r.type,
           minTier: r.min_tier,
           imageUrl: ''
        }));
        setRewards(mappedRewards);
      }
    } catch (error) {
      console.error("Erro ao buscar recompensas:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS ESTATÍSTICOS (ADMIN) ---
  const { clientsInClub, pointsInCirculation, calculatedClients } = useMemo(() => {
    if (isCustomerView) return { clientsInClub: 0, pointsInCirculation: 0, calculatedClients: [] };

    const clientMap = new Map<string, { name: string, points: number, tier: 'Bronze' | 'Prata' | 'Ouro' }>();
    let totalPoints = 0;

    orders.forEach(order => {
      // 1 Ponto = 1 Real gasto (Lógica simples)
      const pointsEarned = Math.floor(order.totalAmount);
      totalPoints += pointsEarned;

      const current = clientMap.get(order.customerId) || { name: 'Visitante', points: 0, tier: 'Bronze' };
      const newPoints = current.points + pointsEarned;
      
      // Lógica de Tier simples
      let newTier: 'Bronze' | 'Prata' | 'Ouro' = 'Bronze';
      if (newPoints >= 500) newTier = 'Ouro';
      else if (newPoints >= 200) newTier = 'Prata';

      clientMap.set(order.customerId, {
        name: order.customerId === 'guest-123' ? 'Cliente Visitante' : order.customerId, // Em produção usaria o nome real do user
        points: newPoints,
        tier: newTier
      });
    });

    const clientsArray = Array.from(clientMap.entries()).map(([id, data]) => ({
      id,
      ...data
    })).sort((a, b) => b.points - a.points); // Ordenar por maior pontuação

    return {
      clientsInClub: clientMap.size,
      pointsInCirculation: totalPoints,
      calculatedClients: clientsArray
    };
  }, [orders, isCustomerView]);


  // --- LÓGICA DO CLIENTE ---
  const handleRedeem = (reward: Reward) => {
    if (currentUser.loyaltyPoints < reward.costInPoints) return;

    if (confirm(`Deseja trocar ${reward.costInPoints} pontos por "${reward.title}"?`)) {
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
    const maxPoints = 500;
    return Math.min((currentUser.loyaltyPoints / maxPoints) * 100, 100);
  };

  // --- LÓGICA DO ADMIN (CRUD) ---

  const handleOpenModal = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward);
      setFormData(reward);
    } else {
      setEditingReward(null);
      setFormData({
        title: '',
        description: '',
        costInPoints: 100,
        minTier: 'Bronze',
        type: 'free_product'
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta recompensa?')) {
      try {
        const { error } = await supabase.from('rewards').delete().eq('id', id);
        if (error) throw error;
        setRewards(prev => prev.filter(r => r.id !== id));
      } catch (error: any) {
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: session.user.id,
        title: formData.title,
        description: formData.description,
        cost_in_points: formData.costInPoints,
        type: formData.type,
        min_tier: formData.minTier
      };

      if (editingReward) {
        // Update
        const { error } = await supabase
          .from('rewards')
          .update(payload)
          .eq('id', editingReward.id);

        if (error) throw error;
        
        setRewards(prev => prev.map(r => r.id === editingReward.id ? { ...r, ...formData } as Reward : r));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('rewards')
          .insert([payload])
          .select();

        if (error) throw error;

        if (data) {
           const newReward: Reward = {
             id: data[0].id,
             title: data[0].title,
             description: data[0].description,
             costInPoints: data[0].cost_in_points,
             type: data[0].type,
             minTier: data[0].min_tier
           };
           setRewards(prev => [newReward, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZAÇÃO: VISÃO DO CLIENTE ---
  if (isCustomerView) {
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
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-brand-600" />
              <h3 className="text-xl font-bold text-gray-800">Recompensas Disponíveis</h3>
            </div>
            
            {loading ? (
               <div className="text-center py-10"><Loader2 className="animate-spin inline text-brand-600" /> Carregando prêmios...</div>
            ) : rewards.length === 0 ? (
               <div className="bg-white p-6 rounded-xl text-center text-gray-500 border border-gray-100">
                 Nenhuma recompensa disponível nesta loja no momento.
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rewards.map(reward => {
                  const canRedeem = currentUser.loyaltyPoints >= reward.costInPoints;
                  const isLocked = reward.minTier === 'Ouro' && currentUser.loyaltyTier !== 'Ouro';

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
            )}
          </div>

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
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: VISÃO DO GESTOR (ADMIN) ---
  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Fidelidade</h2>
          <p className="text-gray-500">Gerencie pontos, configure prêmios e acompanhe seus clientes VIP.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => alert("Configurações gerais de pontuação em breve!")}
             className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
            >
             <Settings size={18} /> Configurar
           </button>
           <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700"
           >
             <Plus size={18} /> Criar Recompensa
           </button>
        </div>
      </div>

      {/* Admin Stats Reais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-3 mb-2">
             <div className="bg-blue-100 p-2 rounded-lg"><Users className="text-blue-600" size={20} /></div>
             <span className="text-sm font-bold text-gray-500">Clientes no Clube</span>
           </div>
           <p className="text-3xl font-bold text-gray-800">{clientsInClub}</p>
           <p className="text-xs text-gray-400 mt-1">Baseado nos pedidos recebidos</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-3 mb-2">
             <div className="bg-yellow-100 p-2 rounded-lg"><Star className="text-yellow-600" size={20} /></div>
             <span className="text-sm font-bold text-gray-500">Pontos em Circulação</span>
           </div>
           <p className="text-3xl font-bold text-gray-800">{pointsInCirculation}</p>
           <p className="text-xs text-gray-500 mt-1">Acumulado total de pontos</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-3 mb-2">
             <div className="bg-green-100 p-2 rounded-lg"><Gift className="text-green-600" size={20} /></div>
             <span className="text-sm font-bold text-gray-500">Resgates (30 dias)</span>
           </div>
           {/* Como não temos tabela de resgates ainda, mostramos 0 para ser realista */}
           <p className="text-3xl font-bold text-gray-800">0</p>
           <p className="text-xs text-gray-400 mt-1">Nenhum resgate registrado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Clientes Table - Dinâmica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
             <h3 className="font-bold text-lg text-gray-800">Ranking de Clientes VIP</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Nível</th>
                  <th className="px-6 py-3 text-right">Saldo de Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calculatedClients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Inbox size={30} className="mb-2 opacity-50" />
                        <span className="text-sm">Nenhum cliente qualificado ainda.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  calculatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                            {client.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                          client.tier === 'Ouro' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          client.tier === 'Prata' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {client.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-600">
                        {client.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recompensas Ativas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
           <h3 className="font-bold text-lg text-gray-800 mb-4">Recompensas Ativas</h3>
           
           <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
             {loading ? (
               <div className="text-center py-4"><Loader2 className="animate-spin inline text-brand-600" /></div>
             ) : rewards.length === 0 ? (
               <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                 Nenhuma recompensa cadastrada.
               </div>
             ) : (
               rewards.map(reward => (
                 <div key={reward.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-brand-200 transition-colors group">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${reward.type === 'free_product' ? 'bg-purple-100 text-purple-500' : 'bg-green-100 text-green-500'}`}>
                        {reward.type === 'free_product' ? <Gift size={18} /> : <TrendingUp size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{reward.title}</p>
                        <p className="text-xs text-gray-400">{reward.costInPoints} pontos • Nível {reward.minTier || 'Todos'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                      onClick={() => handleOpenModal(reward)}
                      className="text-gray-400 hover:text-blue-600 p-2 rounded hover:bg-blue-50" title="Editar"
                     >
                       <Edit2 size={16} />
                     </button>
                     <button 
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50" title="Excluir"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Modal de Criação/Edição de Recompensa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Recompensa</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Ex: Cupcake Grátis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  placeholder="Ex: Resgate um cupcake de qualquer sabor na loja."
                />
              </div>

              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo (Pontos)</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      value={formData.costInPoints}
                      onChange={e => setFormData({...formData, costInPoints: parseInt(e.target.value)})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível Mínimo</label>
                    <select 
                      value={formData.minTier}
                      onChange={e => setFormData({...formData, minTier: e.target.value as any})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="Bronze">Bronze (Todos)</option>
                      <option value="Prata">Prata</option>
                      <option value="Ouro">Ouro</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Prêmio</label>
                <div className="flex gap-2">
                   <button
                     type="button"
                     onClick={() => setFormData({...formData, type: 'free_product'})}
                     className={`flex-1 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${formData.type === 'free_product' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-gray-200 text-gray-600'}`}
                   >
                     <Gift size={16} /> Produto Grátis
                   </button>
                   <button
                     type="button"
                     onClick={() => setFormData({...formData, type: 'discount_fixed'})}
                     className={`flex-1 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${formData.type === 'discount_fixed' ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600'}`}
                   >
                     <TrendingUp size={16} /> Desconto
                   </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgram;