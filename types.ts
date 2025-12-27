
// 1. Database Schema Representation

export type UserRole = 'admin' | 'staff' | 'customer';

// Perfil da Empresa
export interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  plan: string;
}

// Catálogo de Produtos (Novos itens gerenciáveis)
export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'combo' | 'cake' | 'sweet' | 'other';
  imageUrl?: string;
  isAvailable: boolean;
}

// Tabela: Users (Clientes e Staff)
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  loyaltyPoints: number; // Para o Clube de Vantagens
  loyaltyTier: 'Bronze' | 'Prata' | 'Ouro';
  addresses: Address[];
}

export interface Address {
  street: string;
  number: string;
  zipCode: string;
  city: string;
  notes?: string;
}

// Tabela: Products (Ingredientes Base para personalização)
export interface ProductComponent {
  id: string;
  type: 'batter' | 'filling' | 'topping' | 'extra' | 'shape';
  name: string;
  price: number; // Preço base ou adicional
  isAvailable: boolean;
  imageUrl?: string;
}

// Tabela: Rewards (Recompensas do Clube)
export interface Reward {
  id: string;
  title: string;
  description: string;
  costInPoints: number;
  type: 'discount_fixed' | 'free_product';
  value?: number; // Ex: 20.00 para desconto
  minTier?: 'Bronze' | 'Prata' | 'Ouro'; // Exclusividade
  imageUrl?: string;
}

// Tabela: Pre-defined Combos (Combos para Festas)
export interface PartyCombo {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  items: {
    name: string;
    quantity: number;
  }[];
}

// Tabela: Orders
export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  scheduledFor: Date; // Agendamento
  createdAt: Date;
  deliveryAddress: string;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
}

export interface OrderItem {
  type: 'custom_cake' | 'combo' | 'product';
  details: CustomCakeDetails | CatalogItem; // Suporta Bolo Personalizado ou Item do Catálogo
  quantity: number;
  priceAtPurchase: number;
}

export interface CustomCakeDetails {
  shape: ProductComponent;
  batter: ProductComponent;
  filling: ProductComponent;
  toppings: ProductComponent[];
  extras: ProductComponent[];
}

// Mock Data for UI
export const MOCK_CATALOG: CatalogItem[] = [
  { 
    id: 'c1', 
    name: 'Kit Festa Família', 
    description: '1 Bolo Vulcão (M) + 50 Brigadeiros + 1 Refrigerante 2L', 
    price: 149.90, 
    category: 'combo', 
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 'p1', 
    name: 'Bolo de Cenoura com Chocolate', 
    description: 'Bolo caseiro fofinho com cobertura de chocolate 50% cacau.', 
    price: 45.00, 
    category: 'cake', 
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 's1', 
    name: 'Caixa de Brigadeiros Gourmet (12 un)', 
    description: 'Sabores sortidos: Tradicional, Ninho e Morango.', 
    price: 32.00, 
    category: 'sweet', 
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1599389717367-91eb97bd75eb?auto=format&fit=crop&q=80&w=400'
  }
];

export const MOCK_VIP_CLIENTS: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@email.com', phone: '1199999999', role: 'customer', loyaltyPoints: 120, loyaltyTier: 'Ouro', addresses: [] },
  { id: '2', name: 'Carlos Souza', email: 'carlos@email.com', phone: '1188888888', role: 'customer', loyaltyPoints: 85, loyaltyTier: 'Prata', addresses: [] },
  { id: '3', name: 'Mariana Lima', email: 'mari@email.com', phone: '1177777777', role: 'customer', loyaltyPoints: 40, loyaltyTier: 'Bronze', addresses: [] },
];

export const MOCK_REWARDS: Reward[] = [
  { id: 'r1', title: 'Cupcake Grátis', description: 'Um delicioso cupcake de qualquer sabor.', costInPoints: 50, type: 'free_product', minTier: 'Bronze' },
  { id: 'r2', title: 'Desconto de R$ 20,00', description: 'Válido para compras acima de R$ 100,00.', costInPoints: 100, type: 'discount_fixed', value: 20, minTier: 'Prata' },
  { id: 'r3', title: 'Entrega Grátis', description: 'Isenção total da taxa de entrega.', costInPoints: 150, type: 'discount_fixed', value: 0, minTier: 'Bronze' },
  { id: 'r4', title: 'Bento Cake Personalizado', description: 'Um mini bolo com frase personalizada.', costInPoints: 300, type: 'free_product', minTier: 'Ouro' },
];

export const CAKE_COMPONENTS: ProductComponent[] = [
  { id: 's1', type: 'shape', name: 'Redondo (20cm)', price: 80, isAvailable: true },
  { id: 's2', type: 'shape', name: 'Quadrado (25cm)', price: 95, isAvailable: true },
  { id: 's3', type: 'shape', name: 'Dois Andares', price: 180, isAvailable: true },
  
  { id: 'b1', type: 'batter', name: 'Baunilha Clássica', price: 0, isAvailable: true },
  { id: 'b2', type: 'batter', name: 'Chocolate 50%', price: 5, isAvailable: true },
  { id: 'b3', type: 'batter', name: 'Red Velvet', price: 15, isAvailable: true },

  { id: 'f1', type: 'filling', name: 'Brigadeiro Gourmet', price: 20, isAvailable: true },
  { id: 'f2', type: 'filling', name: 'Doce de Leite com Nozes', price: 25, isAvailable: true },
  { id: 'f3', type: 'filling', name: 'Frutas Vermelhas', price: 30, isAvailable: true },

  { id: 'e1', type: 'extra', name: 'Topo de Bolo Personalizado', price: 25, isAvailable: true },
  { id: 'e2', type: 'extra', name: 'Velas Especiais', price: 10, isAvailable: true },
];
