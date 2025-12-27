import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_VIP_CLIENTS } from '../types';
import { ShoppingBag, TrendingUp, Users, Clock } from 'lucide-react';

const data = [
  { name: 'Seg', orders: 12, value: 2400 },
  { name: 'Ter', orders: 19, value: 3800 },
  { name: 'Qua', orders: 15, value: 3000 },
  { name: 'Qui', orders: 22, value: 4400 },
  { name: 'Sex', orders: 35, value: 7000 },
  { name: 'Sab', orders: 48, value: 9600 },
  { name: 'Dom', orders: 28, value: 5600 },
];

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
      <p className={`text-xs mt-1 font-medium ${color === 'green' ? 'text-green-600' : 'text-brand-600'}`}>{sub}</p>
    </div>
    <div className={`p-3 rounded-lg ${color === 'green' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500">Acompanhe o desempenho da sua confeitaria hoje.</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span> Aberto para pedidos
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Pedidos Hoje" 
          value="14" 
          sub="+3 novos na última hora" 
          icon={<ShoppingBag size={20} />} 
          color="brand" 
        />
        <StatCard 
          title="Faturamento (Dia)" 
          value="R$ 1.850" 
          sub="Meta: R$ 2.000" 
          icon={<TrendingUp size={20} />} 
          color="green" 
        />
        <StatCard 
          title="Clientes Ativos" 
          value="128" 
          sub="No Clube de Vantagens" 
          icon={<Users size={20} />} 
          color="brand" 
        />
        <StatCard 
          title="Próximas Entregas" 
          value="5" 
          sub="Para as próximas 2h" 
          icon={<Clock size={20} />} 
          color="green" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pedidos da Semana</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#fce7f3'}}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VIP Clients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Clientes VIP (Clube)</h3>
          <div className="space-y-4">
            {MOCK_VIP_CLIENTS.map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.loyaltyPoints} pontos</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border shrink-0 ${
                  client.loyaltyTier === 'Ouro' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  client.loyaltyTier === 'Prata' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                  'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  {client.loyaltyTier}
                </span>
              </div>
            ))}
            <button className="w-full text-center text-sm text-brand-600 font-medium py-2 hover:bg-brand-50 rounded-lg">
              Ver todos os clientes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;