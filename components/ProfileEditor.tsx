import React, { useState, useEffect, useRef } from 'react';
import { CompanyProfile } from '../types';
import { X, Camera, Save, Upload } from 'lucide-react';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  onSave: (newProfile: CompanyProfile) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Converte a imagem para Base64 para exibir no navegador
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Editar Perfil da Empresa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Avatar Edit (File Upload) */}
          <div className="flex flex-col items-center mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            
            <div 
              onClick={triggerFileInput}
              className="relative group cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                <img 
                  src={formData.avatarUrl || "https://picsum.photos/100/100"} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={triggerFileInput} 
              className="flex items-center gap-2 text-xs font-bold text-brand-600 mt-3 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Upload size={14} /> Alterar foto da galeria
            </button>
          </div>

          <div className="space-y-3">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Confeitaria</label>
               <input 
                 type="text"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                 required
               />
             </div>
             
             {/* Campo de URL da imagem removido conforme solicitado */}

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
               <input 
                 type="email"
                 value={formData.email}
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
               <input 
                 type="tel"
                 value={formData.phone}
                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
                 className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
               />
             </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center justify-center gap-2"
            >
              <Save size={18} /> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;