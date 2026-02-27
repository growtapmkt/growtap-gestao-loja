import React, { useState } from 'react';
import { Mail, Lock, LogIn, Store, ShieldCheck, Headphones, Loader2, Eye, EyeOff, User, ShoppingBag } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isRegistering 
      ? `${import.meta.env.VITE_API_URL}/auth/register` 
      : `${import.meta.env.VITE_API_URL}/auth/login`;

    const body = isRegistering 
      ? { name, email, password, storeName } 
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha na operação');
      }

      // Salvar token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Notificar App.tsx para mudar o estado de autenticação
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo_branca.png" alt="Logo" className="h-14 w-auto object-contain" />
        </div>

        <div className="bg-white p-7 rounded-[32px] shadow-xl shadow-black/20 border border-slate-100">
           <div className="mb-6 text-center">
              <h2 className="text-xl font-black text-slate-800">
                {isRegistering ? 'Criar nova conta' : 'Acesse sua conta'}
              </h2>
              {isRegistering && <p className="text-xs text-slate-400 mt-1">Experimente o sistema Multi-Tenant</p>}
           </div>

           {error && (
             <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in slide-in-from-top-2">
               {error}
             </div>
           )}

           <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-300">
                     <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Nome Completo</label>
                     <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0158ad] transition-colors" size={18} />
                        <input 
                          type="text" 
                          placeholder="Seu nome" 
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0158ad] transition-all font-medium text-sm"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={isRegistering}
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5 animate-in slide-in-from-right-2 duration-300 delay-75">
                     <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">Nome da Loja</label>
                     <div className="relative group">
                        <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0158ad] transition-colors" size={18} />
                        <input 
                          type="text" 
                          placeholder="Minha Loja" 
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0158ad] transition-all font-medium text-sm"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          required={isRegistering}
                        />
                     </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                 <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest pl-1">E-mail</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0158ad] transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="seuemail@exemplo.com" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0158ad] transition-all font-medium text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Senha</label>
                    {!isRegistering && <button type="button" className="text-[10px] font-bold text-[#0158ad] hover:underline">Esqueci a senha?</button>}
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0158ad] transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0158ad] transition-all font-medium text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0158ad] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center gap-2 pl-1">
                   <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-200 text-[#0158ad] focus:ring-[#0158ad] cursor-pointer" />
                   <label htmlFor="remember" className="text-xs font-bold text-slate-600 cursor-pointer">Manter conectado</label>
                </div>
              )}

              <button 
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-[#0158ad] text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/30 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                 {isLoading ? (
                   <>Aguarde... <Loader2 className="animate-spin" size={20} /></>
                 ) : (
                   <>{isRegistering ? 'Criar Conta' : 'Entrar'} <LogIn size={20} /></>
                 )}
              </button>
           </form>

           <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400">
                {isRegistering ? 'Já tem uma conta? ' : 'Não tem acesso? '} 
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[#0158ad] hover:underline"
                >
                  {isRegistering ? 'Fazer Login' : 'Criar conta grátis'}
                </button>
              </p>
           </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
           <div className="flex items-center gap-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0158ad]" /> Ambiente Seguro</div>
              <div className="flex items-center gap-1.5"><Headphones size={14} className="text-[#0158ad]" /> Suporte 24/7</div>
           </div>
           <p className="text-[9px] font-bold text-slate-300">V2.4.0 • GROWTAP - GESTÃO DE LOJA</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
