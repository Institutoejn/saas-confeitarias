import React from 'react';
import { LayoutDashboard, Cake, Gift, LogOut, X, Edit2 } from 'lucide-react';
import { CompanyProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  companyProfile: CompanyProfile;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, companyProfile, onProfileClick, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Novo Pedido', icon: <Cake size={20} /> },
    { id: 'loyalty', label: 'Clube de Vantagens', icon: <Gift size={20} /> },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo da Sidebar: Perfil da Empresa */}
        <div className="p-6 border-b border-gray-100 relative">
          <div className="flex justify-between items-start">
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-3 w-full text-left group hover:bg-gray-50 p-2 -ml-2 rounded-xl transition-all"
              title="Editar Perfil"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-100 shadow-sm">
                  <img 
                    src={companyProfile.avatarUrl} 
                    alt={companyProfile.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit2 size={14} className="text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-800 text-sm truncate">{companyProfile.name}</h2>
                <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block border border-green-100 mt-1">
                  {companyProfile.plan}
                </p>
              </div>
            </button>
            
            {/* Close button for mobile */}
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-700 absolute top-4 right-4">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            <span>Sair da Conta</span>
          </button>
          <div className="px-4 py-2 text-xs text-center text-gray-400">
            v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;