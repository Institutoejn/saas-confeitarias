import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Order } from '../types';
import { ShoppingBag, TrendingUp, Users, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal, Inbox } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
      <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
    </div>
  </div>
);

interface DashboardProps {
  storeName?: string;
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ storeName, orders }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // --- CÁLCULOS REAIS ---
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    // Filtros
    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'confirmed'); // Confirmed assumimos como já processado no fluxo simples
    
    // Totais
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const count = orders.length;
    const avgTicket = count > 0 ? totalRevenue / count : 0;

    return {
      countToday: ordersToday.length,
      revenue: totalRevenue,
      avgTicket: avgTicket,
      pendingCount: pendingOrders.length
    };
  }, [orders]);

  // Dados do Gráfico (Zerado se não houver pedidos, ou simulando os dias da semana)
  const chartData = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    if (orders.length === 0) {
      return days.map(day => ({ name: day, value: 0 }));
    }
    // Lógica simples para preencher o gráfico com o total atual no dia 'Hoje' (apenas visual para este MVP)
    // Em produção, agruparíamos orders por data real.
    return days.map((day, idx) => ({ 
      name: day, 
      value: idx === 6 ? stats.revenue : 0 // Joga o valor no último dia apenas para visualização
    }));
  }, [orders, stats.revenue]);

  // Top Clientes (Extraído dos pedidos reais)
  const topClients = useMemo(() => {
    if (orders.length === 0) return [];
    
    // Agrupa gastos por cliente (simulado pelo ID já que não temos Auth de cliente completo ainda)
    const clientMap = new Map();
    orders.forEach(order => {
      const current = clientMap.get(order.customerId) || { name: 'Cliente Visitante', spent: 0, points: 0 };
      clientMap.set(order.customerId, {
        name: order.customerId === 'guest-123' ? 'Cliente Visitante' : order.customerId,
        spent: current.spent + order.totalAmount,
        points: current.points + Math.floor(order.totalAmount) // 1 ponto por real
      });
    });
    
    return Array.from(clientMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 3);
  }, [orders]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {greeting}, {storeName || 'Confeitaria'}!
          </h1>
          <p className="text-gray-500 mt-1">Aqui está o resumo real da sua operação.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
           </span>
           <span className="text-sm font-bold text-gray-700">Loja Aberta</span>
           <div className="h-4 w-px bg-gray-200 mx-1"></div>
           <span className="text-xs text-gray-500">Fecha às 19:00</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Pedidos Hoje" 
          value={stats.countToday.toString()} 
          icon={<ShoppingBag size={22} className="text-brand-600" />} 
          colorClass="bg-brand-50" 
        />
        <StatCard 
          title="Faturamento Total" 
          value={`R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<TrendingUp size={22} className="text-emerald-600" />} 
          colorClass="bg-emerald-50" 
        />
        <StatCard 
          title="Ticket Médio" 
          value={`R$ ${stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
          icon={<Users size={22} className="text-blue-600" />} 
          colorClass="bg-blue-50" 
        />
        <StatCard 
          title="Entregas Pend." 
          value={stats.pendingCount.toString()} 
          icon={<Clock size={22} className="text-orange-600" />} 
          colorClass="bg-orange-50" 
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Performance de Vendas</h3>
              <p className="text-sm text-gray-500">Receita bruta em tempo real</p>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="h-[300px] w-full">
            {orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <TrendingUp size={48} className="mb-2 opacity-50" />
                <p className="font-medium">Ainda não há vendas registradas.</p>
                <p className="text-sm">Compartilhe seu link para começar!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    cursor={{stroke: '#ec4899', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ec4899" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* VIP List Section */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Clientes</h3>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md cursor-pointer hover:bg-brand-100 transition-colors">
              Ver Clube
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {topClients.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Inbox size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum cliente comprou ainda.</p>
              </div>
            ) : (
              topClients.map((client, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group border border-transparent hover:border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-transform group-hover:scale-105 shadow-sm bg-brand-50 text-brand-600`}>
                    {client.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-gray-900 truncate">{client.name}</p>
                      <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full" 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-brand-600 whitespace-nowrap">
                        {client.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-bold hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center gap-2">
            <Users size={16} /> Ver lista completa
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;