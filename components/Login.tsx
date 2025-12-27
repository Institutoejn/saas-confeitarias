import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Cake, Lock, Mail, Loader2, ArrowRight, User, Store } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        // Login com Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // O listener no App.tsx vai detectar a sessão e logar
      } else {
        // Cadastro com Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              store_name: storeName
            }
          }
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado! Verifique seu email ou faça login.');
        setIsLoginView(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4 py-8 md:py-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s'}}></div>
      </div>

      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 md:min-h-[600px]">
        
        <div className="w-full md:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden order-1 md:order-2 flex flex-col justify-between p-8 md:p-12 text-white shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
             <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Cake className="text-white" size={20} />
              </div>
              <span className="text-lg md:text-xl font-bold tracking-wide">SweetSaaS</span>
            </div>

            <div className="space-y-4 md:space-y-6 mt-4 md:mt-24">
               <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                 {isLoginView ? 'Gestão doce para o seu negócio.' : 'Junte-se a +2.000 Confeitarias.'}
               </h1>
               <p className="text-brand-100 text-base md:text-lg leading-relaxed max-w-sm">
                 {isLoginView 
                   ? 'Automatize pedidos, fidelize clientes e foque no que importa: fazer bolos incríveis.' 
                   : 'Crie cardápios digitais, gerencie entregas e crie seu clube de fidelidade em minutos.'}
               </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center order-2 md:order-1 bg-white">
          <div className="mb-6 md:mb-8 mt-4 md:mt-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {isLoginView ? 'Bem-vindo de volta' : 'Comece grátis'}
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              {isLoginView 
                ? 'Por favor, insira seus dados para entrar.' 
                : 'Crie sua conta e revolucione sua confeitaria.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center animate-pulse">
                {error}
              </div>
            )}

            {!isLoginView && (
              <>
                 <div className="space-y-1 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 ml-1">Seu Nome</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Nome Completo"
                      required={!isLoginView}
                    />
                  </div>
                </div>
                 <div className="space-y-1 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 ml-1">Nome da Confeitaria</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Store size={18} />
                    </div>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Ex: Doces da Ana"
                      required={!isLoginView}
                    />
                  </div>
                </div>
              </>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLoginView ? 'Entrar na Plataforma' : 'Criar Conta Grátis'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pb-4 md:pb-0">
            <p className="text-sm text-gray-500">
              {isLoginView ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} {' '}
              <button 
                type="button"
                onClick={toggleView} 
                className="text-brand-600 font-bold hover:underline focus:outline-none transition-colors"
              >
                {isLoginView ? 'Cadastre sua loja' : 'Fazer Login'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;