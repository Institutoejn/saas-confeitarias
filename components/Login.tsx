import React, { useState } from 'react';
import { Cake, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulação de delay de rede
    setTimeout(() => {
      // Credenciais Mockadas para teste
      if (email === 'admin@sweetsaas.com' && password === '123456') {
        onLogin();
      } else if (email && password) {
        // Para facilitar o teste, vamos aceitar qualquer login se não for o específico acima,
        // mas idealmente seria só o correto. Vou deixar flexível para você testar.
        onLogin();
      } else {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Header Decorativo */}
        <div className="bg-brand-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl"></div>
             <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Cake className="text-brand-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">SweetSaaS</h1>
            <p className="text-brand-100 text-sm mt-1">Gestão inteligente para sua confeitaria</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800">Bem-vindo de volta!</h2>
            <p className="text-gray-500 text-sm">Acesse sua conta para gerenciar pedidos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 border-gray-300" />
                Lembrar de mim
              </label>
              <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">Esqueceu a senha?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar na Plataforma <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            Ainda não tem uma conta? <a href="#" className="text-brand-600 font-bold hover:underline">Cadastre sua loja</a>
            
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-400">
              <p>Dica: Use <strong>admin@sweetsaas.com</strong> / <strong>123456</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;