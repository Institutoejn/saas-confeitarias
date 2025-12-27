import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { CatalogItem } from '../types';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProductManagerProps {
  catalog: CatalogItem[];
  setCatalog: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
}

const ProductManager: React.FC<ProductManagerProps> = ({ catalog, setCatalog }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [session, setSession] = useState<any>(null);
  
  const initialFormState: CatalogItem = {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'combo',
    imageUrl: '',
    isAvailable: true
  };
  
  const [formData, setFormData] = useState<CatalogItem>(initialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Session and Catalog from Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchCatalog(session.user.id);
      }
    });
  }, []);

  const fetchCatalog = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('catalog')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao buscar catálogo:', error);
    } else if (data) {
      // Mapeia os campos do DB (snake_case) para o frontend (camelCase) se necessário
      // Como criamos a tabela baseada no tipo, assumimos compatibilidade ou ajustamos aqui.
      // Vou assumir que o banco usa snake_case (padrão SQL) e fazer o map.
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
    }
    setLoading(false);
  };

  const handleOpenModal = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ ...initialFormState });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase
        .from('catalog')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao excluir: ' + error.message);
      } else {
        setCatalog(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setLoading(true);

    const payload = {
      user_id: session.user.id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      image_url: formData.imageUrl,
      is_available: formData.isAvailable
    };

    try {
      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('catalog')
          .update(payload)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        setCatalog(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id } : item));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('catalog')
          .insert([payload])
          .select();
        
        if (error) throw error;
        
        if (data) {
          const newItem = {
            id: data[0].id,
            name: data[0].name,
            description: data[0].description,
            price: data[0].price,
            category: data[0].category,
            imageUrl: data[0].image_url,
            isAvailable: data[0].is_available
          };
          setCatalog(prev => [newItem, ...prev]);
        }
      }
      handleCloseModal();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Nota: Salvar Base64 direto no Banco não é ideal para produção (melhor usar Supabase Storage),
        // mas funciona perfeitamente para este MVP sem complicar a configuração.
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Meus Produtos e Cardápio</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {loading && catalog.length === 0 ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:border-brand-300 transition-all">
              <div className="h-40 bg-gray-100 relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-lg shadow-sm">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </div>
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full border ${
                  item.category === 'combo' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  item.category === 'cake' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {item.category === 'combo' ? 'Combo' : item.category === 'cake' ? 'Bolo' : item.category === 'sweet' ? 'Doce' : 'Outro'}
                </span>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                  <span className="font-bold text-brand-600 whitespace-nowrap">R$ {item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingItem ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-4">
                <div 
                  className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 overflow-hidden relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-gray-400" size={24} />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-white text-xs font-bold">Alterar</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Ex: Bolo de Chocolate"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                       <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value as any})}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                       >
                         <option value="combo">Combo</option>
                         <option value="cake">Bolo</option>
                         <option value="sweet">Doce</option>
                         <option value="other">Outro</option>
                       </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  placeholder="Descreva os ingredientes..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;