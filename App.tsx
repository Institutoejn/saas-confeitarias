import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderBuilder from './components/OrderBuilder';
import Checkout from './components/Checkout';
import LoyaltyProgram from './components/LoyaltyProgram';
import ProfileEditor from './components/ProfileEditor';
import ProductManager from './components/ProductManager';
import Login from './components/Login';
import { CustomCakeDetails, Order, CustomCakeDetails as ICakeDetails, CompanyProfile, CatalogItem, MOCK_CATALOG } from './types';
import { Link as LinkIcon, Smartphone, Clock, MapPin, DollarSign, Menu, Package, ListOrdered, X, Bell } from 'lucide-react';

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3";

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'Confeitaria',
    email: 'Carregando...',
    phone: '',
    avatarUrl: 'https://picsum.photos/100/100',
    plan: 'Plano Free'
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  
  // O catálogo começa vazio ou com mock, mas será atualizado via useEffect
  const [catalog, setCatalog] = useState<CatalogItem[]>(MOCK_CATALOG);
  
  const [ordersViewMode, setOrdersViewMode] = useState<'incoming' | 'products'>('incoming');
  const [isCustomerView, setIsCustomerView] = useState(false);
  
  const [orderInProgress, setOrderInProgress] = useState<{
    details: CustomCakeDetails | CatalogItem;
    total: number;
  } | null>(null);

  const [shareableLink, setShareableLink] = useState('');

  // 1. Detectar Modo Cliente (URL Params) e Buscar Dados Públicos
  useEffect(() => {
    // Check URL for customer mode
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const storeId = params.get('storeId');
      
      // Gera o link base (será atualizado se o usuário logar)
      const baseUrl = window.location.origin + window.location.pathname;
      setShareableLink(`${baseUrl}?mode=customer`);

      if (mode === 'customer') {
        setIsCustomerView(true);
        if (storeId) {
          fetchPublicCatalog(storeId);
          fetchPublicProfile(storeId);
        }
      }
    }
  }, []);

  // 2. Auth e Sessão do Admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      // Se não estivermos no modo cliente, o loading termina aqui
      if (!window.location.search.includes('mode=customer')) {
         setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Atualizar Link Compartilhável e Perfil quando Admin loga
  useEffect(() => {
    if (session?.user) {
      // Atualiza o link para incluir o ID do usuário logado
      const baseUrl = window.location.origin + window.location.pathname;
      setShareableLink(`${baseUrl}?mode=customer&storeId=${session.user.id}`);

      // Tenta carregar dados do perfil da tabela profiles, fallback para metadata
      fetchOwnerProfile(session.user.id);
      
      // Se for ADMIN, carrega o catálogo dele para gestão
      if (!isCustomerView) {
        fetchPublicCatalog(session.user.id);
      }
    }
  }, [session, isCustomerView]);

  // Busca dados públicos da loja para o cliente
  const fetchPublicProfile = async (storeId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', storeId).single();
      if (data) {
        setCompanyProfile(prev => ({
          ...prev,
          name: data.store_name || 'Confeitaria',
          avatarUrl: data.avatar_url || prev.avatarUrl
        }));
      }
    } catch (e) {
      console.error("Erro ao carregar perfil da loja", e);
    }
  };

  // Busca dados do perfil do dono (Admin)
  const fetchOwnerProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setCompanyProfile(prev => ({
          ...prev,
          name: data.store_name || session?.user?.user_metadata?.store_name || prev.name,
          email: session?.user?.email || prev.email,
          avatarUrl: data.avatar_url || prev.avatarUrl
        }));
      }
    } catch (e) {
       console.error("Erro ao carregar perfil do dono", e);
    }
  };

  // Função para buscar catálogo (usada tanto pelo Admin quanto pelo Cliente Público)
  const fetchPublicCatalog = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .eq('user_id', storeId)
        .eq('is_available', true); // Clientes só veem itens disponíveis

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          imageUrl: item.image_url,
          isAvailable: item.is_available
        }));
        setCatalog(mappedData);
      } else {
        // Se não tiver produtos ou der erro, mantém vazio ou mock dependendo da estratégia
        // Para MVP, se vazio, mantemos vazio para incentivar cadastro
        if (data && data.length === 0) setCatalog([]);
      }
    } catch (error) {
      console.error("Erro ao buscar catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Auth handled by Supabase subscription
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    setIsCustomerView(false);
    window.location.href = window.location.origin; // Limpa URL params ao deslogar
  };

  const handleOrderComplete = (details: CustomCakeDetails | CatalogItem, total: number) => {
    setOrderInProgress({ details, total });
  };

  const handleResetOrder = () => {
    setOrderInProgress(null);
    if (!isCustomerView) {
      setActiveTab('orders'); 
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play error:", e));
    } catch (error) {
      console.error("Audio error", error);
    }
  };

  const handleIncomingOrder = (newOrder: Order) => {
    setIncomingOrders(prev => [newOrder, ...prev]);
    playNotificationSound();
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleSaveProfile = async (newProfile: CompanyProfile) => {
    setCompanyProfile(newProfile); // Atualização otimista da UI
    
    if (session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            store_name: newProfile.name,
            avatar_url: newProfile.avatarUrl
          })
          .eq('id', session.user.id);
        
        if (error) throw error;
      } catch (e) {
        console.error("Erro ao salvar perfil no banco", e);
        alert("Houve um erro ao salvar as alterações do perfil no servidor.");
      }
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    alert('Link copiado! Envie para seus clientes.');
  };

  // Loading State
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-600 font-bold animate-pulse">Carregando SweetSaaS...</div>;
  }

  // Handle Guest/Customer View separately from Auth Check
  if (isCustomerView) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className={`fixed top-4 right-4 z-[100] transform transition-all duration-500 ease-in-out ${showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
           <div className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-700 min-w-[300px]">
             <div className="bg-green-500 p-2.5 rounded-full shadow-lg shadow-green-500/30 animate-pulse"><Bell size={20} className="text-white" fill="white" /></div>
             <div className="flex-1"><h4 className="font-bold text-sm">Pedido Realizado!</h4><p className="text-xs text-gray-300 mt-0.5">A loja recebeu seu pedido.</p></div>
           </div>
        </div>

        <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 overflow-hidden bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-brand-200 shadow-md">
                   {companyProfile.avatarUrl.startsWith('http') ? (
                     <img src={companyProfile.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                   ) : (
                     "S"
                   )}
                </div>
                <div className="flex flex-col">
                  {/* Nota: Em um app real, buscaríamos o nome da loja via ID também na tabela profiles */}
                  <span className="font-bold text-gray-800 leading-tight">{companyProfile.name === 'Confeitaria' ? 'Confeitaria' : companyProfile.name}</span>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Aberto Agora</span>
                </div>
             </div>
             {!window.location.search.includes('mode=customer') && (
               <button onClick={() => setIsCustomerView(false)} className="md:hidden text-gray-500"><X size={24} /></button>
             )}
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 md:p-8">
           {orderInProgress ? (
              <Checkout 
                items={orderInProgress.details} 
                totalItemsPrice={orderInProgress.total} 
                onReset={handleResetOrder}
                onOrderPlaced={handleIncomingOrder}
              />
           ) : (
             <div className="space-y-6 animate-fade-in">
               <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left shadow-sm">
                  <span className="text-sm">👋 Bem-vindo ao nosso Cardápio Digital!</span>
                  {!window.location.search.includes('mode=customer') && (
                    <button onClick={() => setIsCustomerView(false)} className="text-xs font-bold underline hover:text-blue-900 whitespace-nowrap">Voltar para Admin</button>
                  )}
               </div>
               
               {/* Se o catálogo estiver vazio no modo cliente, mostra mensagem */}
               {catalog.length === 0 ? (
                 <div className="text-center py-10">
                   <p className="text-gray-500">Nenhum produto disponível no momento.</p>
                 </div>
               ) : (
                 <>
                   <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Cardápio</h2></div>
                   <OrderBuilder onComplete={handleOrderComplete} catalog={catalog} />
                 </>
               )}
             </div>
           )}
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // --- ADMIN VIEW ---
  
  const NotificationToast = () => (
    <div 
      className={`fixed top-4 right-4 z-[100] transform transition-all duration-500 ease-in-out ${
        showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-700 min-w-[300px]">
        <div className="bg-green-500 p-2.5 rounded-full shadow-lg shadow-green-500/30 animate-pulse">
          <Bell size={20} className="text-white" fill="white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">Novo Pedido Recebido!</h4>
          <p className="text-xs text-gray-300 mt-0.5">Verifique a aba de pedidos.</p>
        </div>
        <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors"><X size={16} /></button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') return <Dashboard storeName={companyProfile.name} orders={incomingOrders} />;

    if (activeTab === 'orders') {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-200 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center shrink-0"><LinkIcon className="text-brand-600" size={24} /></div>
               <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-800">Link do Cardápio Digital</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500 truncate bg-gray-50 px-2 py-1 rounded border border-gray-100 font-mono select-all">{shareableLink}</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <button onClick={copyLinkToClipboard} className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 active:scale-95 transition-transform">Copiar Link</button>
               <button onClick={() => setIsCustomerView(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all active:scale-95"><Smartphone size={18} /> Simular App</button>
            </div>
          </div>

          <div className="flex justify-between items-end border-b border-gray-200">
             <div className="flex gap-6">
              <button onClick={() => setOrdersViewMode('incoming')} className={`pb-3 font-medium flex items-center gap-2 transition-colors relative ${ordersViewMode === 'incoming' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <div className="relative"><ListOrdered size={20} />{incomingOrders.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}</div>
                Pedidos Recebidos
                {ordersViewMode === 'incoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></div>}
              </button>
              <button onClick={() => setOrdersViewMode('products')} className={`pb-3 font-medium flex items-center gap-2 transition-colors relative ${ordersViewMode === 'products' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <Package size={20} /> Gerenciar Produtos e Cardápio
                {ordersViewMode === 'products' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"></div>}
              </button>
            </div>
          </div>

          {ordersViewMode === 'products' ? (
            <ProductManager catalog={catalog} setCatalog={setCatalog} />
          ) : (
            <div className="space-y-4">
              {incomingOrders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                  <p>Nenhum pedido recebido ainda.</p>
                  <p className="text-sm mt-2">Envie o link acima para seus clientes.</p>
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
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">{order.status === 'confirmed' ? 'Confirmado (Sinal Pago)' : order.status}</span>
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
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-3">
                            <span className="flex items-center gap-1"><Clock size={14} /> Entrega: {order.scheduledFor.toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {order.deliveryAddress.split(',')[0]}...</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end justify-center min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                          <p className="text-gray-500 text-sm">Total do Pedido</p>
                          <p className="text-2xl font-bold text-gray-800 mb-1">R$ {order.totalAmount.toFixed(2)}</p>
                          <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><DollarSign size={10} /> Sinal 50% Recebido</p>
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

    if (activeTab === 'loyalty') return <LoyaltyProgram isCustomerView={false} orders={incomingOrders} />;

    return <div className="p-10 text-center text-gray-500">Funcionalidade "{activeTab}" em desenvolvimento.</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative">
      <NotificationToast />
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); if (tab !== 'orders') setOrderInProgress(null); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        companyProfile={companyProfile}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />
      <ProfileEditor isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={companyProfile} onSave={handleSaveProfile} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full transition-all duration-300">
        <div className="md:hidden flex items-center justify-between mb-6">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
           <span className="font-bold text-gray-800 text-lg">SweetSaaS</span>
           <div className="w-8"></div>
        </div>
        <header className="hidden md:flex justify-center items-center mb-8 relative border-b border-transparent pb-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
             <div className="w-10 h-10 bg-brand-600 rounded-xl shadow-lg shadow-brand-200 flex items-center justify-center text-white font-bold text-xl">S</div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">SweetSaaS</h1>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;