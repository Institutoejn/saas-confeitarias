import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderBuilder from './components/OrderBuilder';
import Checkout from './components/Checkout';
import LoyaltyProgram from './components/LoyaltyProgram';
import ProfileEditor from './components/ProfileEditor';
import ProductManager from './components/ProductManager'; // Importação nova
import Login from './components/Login'; // Importação do Login
import { CustomCakeDetails, Order, CustomCakeDetails as ICakeDetails, CompanyProfile, CatalogItem, MOCK_CATALOG } from './types';
import { Link as LinkIcon, Smartphone, Clock, MapPin, DollarSign, Menu, Package, ListOrdered, ExternalLink, X } from 'lucide-react';

const App: React.FC = () => {
  // Estado de Autenticação (Novo)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado do Perfil da Empresa
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'Confeitaria Delícia',
    email: 'contato@confeitariadelicia.com',
    phone: '(11) 99999-9999',
    avatarUrl: 'https://picsum.photos/100/100',
    plan: 'Plano Pro Ativo'
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Estado para armazenar os pedidos recebidos (Simulando Banco de Dados)
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);

  // Estado do Catálogo de Produtos (Novo)
  const [catalog, setCatalog] = useState<CatalogItem[]>(MOCK_CATALOG);

  // Controle da view interna da aba 'orders' (Admin)
  const [ordersViewMode, setOrdersViewMode] = useState<'incoming' | 'products'>('incoming');

  // Estado para controlar se estamos na visão de gestão ou simulação do cliente
  const [isCustomerView, setIsCustomerView] = useState(false);
  
  const [orderInProgress, setOrderInProgress] = useState<{
    details: CustomCakeDetails | CatalogItem;
    total: number;
  } | null>(null);

  // Link dinâmico para compartilhamento
  const [shareableLink, setShareableLink] = useState('');

  // Efeito para detectar acesso via Link de Cliente e gerar URL correta
  useEffect(() => {
    // 1. Gera o link baseando-se na URL atual do navegador
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin + window.location.pathname;
      setShareableLink(`${baseUrl}?mode=customer`);

      // 2. Verifica se a URL atual tem o parâmetro mode=customer
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'customer') {
        setIsAuthenticated(true); // Pula o login
        setIsCustomerView(true);  // Ativa modo cliente
      }
    }
  }, []);

  // Handler para Login bem-sucedido
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleOrderComplete = (details: CustomCakeDetails | CatalogItem, total: number) => {
    setOrderInProgress({ details, total });
  };

  const handleResetOrder = () => {
    setOrderInProgress(null);
    if (isCustomerView) {
      // Se for cliente, volta pro inicio do builder
    } else {
      setActiveTab('orders'); 
    }
  };

  const handleIncomingOrder = (newOrder: Order) => {
    setIncomingOrders(prev => [newOrder, ...prev]);
  };

  const handleSaveProfile = (newProfile: CompanyProfile) => {
    setCompanyProfile(newProfile);
  };

  // Função para copiar o link
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    alert('Link copiado! Envie para seus clientes.');
  };

  // Se não estiver autenticado, exibe a tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'dashboard' && !isCustomerView) {
      return <Dashboard />;
    }

    if (activeTab === 'orders' || isCustomerView) {
      // 1. Visão do Gestor: Tela para gerar link, ver pedidos e gerenciar produtos
      if (!isCustomerView) {
        return (
          <div className="space-y-6 animate-fade-in">
            
            {/* Seção de Compartilhamento (Funcional) */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-200 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center shrink-0">
                    <LinkIcon className="text-brand-600" size={24} />
                 </div>
                 <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-gray-800">Link do Cardápio Digital</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500 truncate bg-gray-50 px-2 py-1 rounded border border-gray-100 font-mono select-all">
                        {shareableLink}
                      </p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <button 
                  onClick={copyLinkToClipboard}
                  className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 active:scale-95 transition-transform"
                 >
                   Copiar Link
                 </button>
                 <button 
                  onClick={() => setIsCustomerView(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all active:scale-95"
                >
                  <Smartphone size={18} />
                  Simular App
                </button>
              </div>
            </div>

            {/* Sub-navegação interna (Pedidos vs Produtos) */}
            <div className="flex border-b border-gray-200 gap-6">
              <button 
                onClick={() => setOrdersViewMode('incoming')}
                className={`pb-3 font-medium flex items-center gap-2 transition-colors relative ${ordersViewMode === 'incoming' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ListOrdered size={20} /> Pedidos Recebidos
                {ordersViewMode === 'incoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></div>}
              </button>
              <button 
                onClick={() => setOrdersViewMode('products')}
                className={`pb-3 font-medium flex items-center gap-2 transition-colors relative ${ordersViewMode === 'products' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Package size={20} /> Gerenciar Produtos e Cardápio
                {ordersViewMode === 'products' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></div>}
              </button>
            </div>

            {/* Conteúdo da Aba Interna */}
            {ordersViewMode === 'products' ? (
              <ProductManager catalog={catalog} setCatalog={setCatalog} />
            ) : (
              <div className="space-y-4">
                {incomingOrders.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    <p>Nenhum pedido recebido ainda.</p>
                    <p className="text-sm mt-2">Envie o link acima para seus clientes ou</p>
                    <button onClick={() => setIsCustomerView(true)} className="text-brand-600 font-bold hover:underline">simule um pedido aqui</button>.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {incomingOrders.map((order) => {
                      const firstItem = order.items[0];
                      const isCustom = firstItem.type === 'custom_cake';
                      const details = firstItem.details;
                      
                      return (
                        <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-brand-300 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-bold text-lg text-gray-800">{order.id}</span>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                {order.status === 'confirmed' ? 'Confirmado (Sinal Pago)' : order.status}
                              </span>
                            </div>
                            <div className="text-gray-600 mb-1 text-sm md:text-base">
                              {isCustom ? (
                                <>
                                  <span className="font-bold text-brand-600">Bolo {(details as ICakeDetails).shape.name}</span>
                                  <span className="mx-2 hidden md:inline">•</span>
                                  <span className="block md:inline">{(details as ICakeDetails).batter.name} com {(details as ICakeDetails).filling.name}</span>
                                </>
                              ) : (
                                <span className="font-bold text-brand-600">{(details as CatalogItem).name}</span>
                              )}
                            </div>
                            
                            {isCustom && (details as ICakeDetails).extras && (details as ICakeDetails).extras.length > 0 && (
                              <p className="text-sm text-gray-500 mb-2">
                                + {(details as ICakeDetails).extras.map(e => e.name).join(', ')}
                              </p>
                            )}

                            {!isCustom && (
                              <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                                {(details as CatalogItem).description}
                              </p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-3">
                              <span className="flex items-center gap-1"><Clock size={14} /> Entrega: {order.scheduledFor.toLocaleDateString()} às {order.scheduledFor.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="flex items-center gap-1"><MapPin size={14} /> {order.deliveryAddress.split(',')[0]}...</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-start md:items-end justify-center min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                            <p className="text-gray-500 text-sm">Total do Pedido</p>
                            <p className="text-2xl font-bold text-gray-800 mb-1">R$ {order.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                              <DollarSign size={10} /> Sinal 50% Recebido
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      // 2. Visão do Cliente (Checkout / Builder)
      if (orderInProgress) {
        return (
          <Checkout 
            items={orderInProgress.details} 
            totalItemsPrice={orderInProgress.total} 
            onReset={handleResetOrder}
            onOrderPlaced={handleIncomingOrder}
          />
        );
      }
      
      return (
        <div className="space-y-6 animate-fade-in">
           {isCustomerView && (
             <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left shadow-sm">
                <span className="text-sm">👋 Bem-vindo ao Cardápio Digital da <strong>{companyProfile.name}</strong></span>
                {/* Botão de sair apenas se não for link direto (ou seja, se for simulação do admin) */}
                {!window.location.search.includes('mode=customer') && (
                  <button 
                    onClick={() => { setIsCustomerView(false); setOrderInProgress(null); }}
                    className="text-xs font-bold underline hover:text-blue-900 whitespace-nowrap"
                  >
                    Voltar para Admin
                  </button>
                )}
             </div>
           )}

           <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">Cardápio</h2>
           </div>
           
           {/* Passamos o catálogo para o Builder renderizar o menu inicial */}
           <OrderBuilder onComplete={handleOrderComplete} catalog={catalog} />
        </div>
      );
    }

    if (activeTab === 'loyalty') {
      return <LoyaltyProgram />;
    }

    return (
      <div className="p-10 text-center text-gray-500">
        Funcionalidade "{activeTab}" em desenvolvimento.
      </div>
    );
  };

  // Se estiver no modo cliente, removemos a Sidebar para parecer um app mobile/web
  if (isCustomerView) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-brand-200 shadow-md">S</div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 leading-tight">{companyProfile.name}</span>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Aberto Agora</span>
                </div>
             </div>
             {/* Se for Admin simulando, mostra botão de voltar no header também */}
             {!window.location.search.includes('mode=customer') && (
               <button onClick={() => setIsCustomerView(false)} className="md:hidden text-gray-500">
                 <X size={24} />
               </button>
             )}
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    );
  }

  // Layout Padrão (Admin Dashboard)
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Fecha o menu mobile ao selecionar
          if (tab !== 'orders') setOrderInProgress(null);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        companyProfile={companyProfile}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      
      <ProfileEditor 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        profile={companyProfile}
        onSave={handleSaveProfile}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full transition-all duration-300">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden flex items-center justify-between mb-6">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg">
             <Menu size={24} />
           </button>
           <span className="font-bold text-gray-800 text-lg">SweetSaaS</span>
           <div className="w-8"></div> {/* Spacer to center title */}
        </div>

        {/* Desktop Header - CENTRALIZADO */}
        <header className="hidden md:flex justify-center items-center mb-8 relative border-b border-transparent pb-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
             <div className="w-10 h-10 bg-brand-600 rounded-xl shadow-lg shadow-brand-200 flex items-center justify-center text-white font-bold text-xl">
               S
             </div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">SweetSaaS</h1>
          </div>
        </header>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default App;