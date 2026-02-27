import React, { useState, useEffect } from 'react';
import {
  Wallet, ShoppingBag, TrendingUp, Plus, Loader2, DollarSign, Target,
  Calendar, ArrowUpRight, AlertCircle, Package, Star, ClipboardList
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [userName, setUserName] = useState('Lojista');

  useEffect(() => {
    // Carregar nome do usuário
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Pega o primeiro nome
        setUserName(user.name?.split(' ')[0] || 'Lojista');
      }
    } catch (e) {
      console.error('Erro ao ler usuário', e);
    }
    handleFilterChange(dateFilter);
  }, []);

  const handleFilterChange = async (filter: string) => {
    setDateFilter(filter);

    let start = '';
    let end = '';
    const now = new Date();

    if (filter === 'today') {
      start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    } else if (filter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      start = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
      end = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
    } else if (filter === '7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      start = new Date(sevenDaysAgo.setHours(0, 0, 0, 0)).toISOString();
      end = new Date().toISOString();
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      start = new Date(thirtyDaysAgo.setHours(0, 0, 0, 0)).toISOString();
      end = new Date().toISOString();
    } else if (filter === 'custom' && customDates.start && customDates.end) {
      start = new Date(customDates.start).toISOString();
      end = new Date(customDates.end).toISOString();
    }

    if (filter !== 'custom' || (customDates.start && customDates.end)) {
      fetchDashboardData(start, end);
    }
  };

  const fetchDashboardData = async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // URL assumes backend is on port 5000. 
      let urlStats = `${import.meta.env.VITE_API_URL}/dashboard/stats`;
      if (startDate && endDate) {
        urlStats += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const urlUsage = `${import.meta.env.VITE_API_URL}/dashboard/usage`;

      const [resStats, resUsage] = await Promise.all([
        fetch(urlStats, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(urlUsage, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const dataStats = await resStats.json();
      const dataUsage = await resUsage.json();

      if (dataStats.success) {
        setStats(dataStats.stats);
      }
      if (dataUsage.success) {
        setUsage(dataUsage);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDayLabel = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getPeriodLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Hoje';
      case 'yesterday': return 'Ontem';
      case '7days': return '7 Dias';
      case '30days': return '30 Dias';
      case 'custom': return 'Personalizado';
      default: return 'Período';
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#0158ad]" size={48} />
        <p className="text-slate-500 font-bold">Carregando inteligência de vendas...</p>
      </div>
    );
  }

  // Goal logic
  const GOAL = 10000; // Meta fixa temporária
  const goalProgress = Math.min((stats.monthlyRevenue / GOAL) * 100, 100);
  const remainingGoal = Math.max(GOAL - stats.monthlyRevenue, 0);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">

      {/* 1. Header Humanizado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {getGreeting()}, {userName}!
          </h1>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <Calendar size={14} />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{getDayLabel()}</span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">Aqui está o resumo da sua loja.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-full md:w-auto overflow-x-auto">
            {['today', 'yesterday', '7days', '30days', 'custom'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${dateFilter === f
                  ? 'bg-[#0158ad] text-white shadow-md transform scale-105'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                {f === 'today' ? 'Hoje' : f === 'yesterday' ? 'Ontem' : f === '7days' ? '7 Dias' : f === '30days' ? '30 Dias' : 'Personal.'}
              </button>
            ))}
          </div>
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300 w-full justify-end">
              <input type="date" className="p-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-100"
                value={customDates.start} onChange={e => setCustomDates({ ...customDates, start: e.target.value })} />
              <span className="text-[10px] uppercase font-bold text-slate-400">até</span>
              <input type="date" className="p-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-100"
                value={customDates.end} onChange={e => setCustomDates({ ...customDates, end: e.target.value })} />
              <button onClick={() => handleFilterChange('custom')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <TrendingUp size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Grid de Indicadores Estratégicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* NEW: Lucro Card (Destaque) */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl shadow-lg shadow-emerald-200 text-white relative overflow-hidden group hover:shadow-emerald-300 transition-all duration-300">
          <div className="absolute -top-6 -right-6 p-6 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700">
            <DollarSign size={80} className="text-white/20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-emerald-100">
              <TrendingUp size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Lucro Estimado</span>
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-1 drop-shadow-sm">
              {formatCurrency(stats.periodProfit)}
            </h3>
            <p className="text-[11px] font-medium text-emerald-100/90 leading-tight pr-8">
              Margem calculada sobre vendas {getPeriodLabel().toLowerCase()}
            </p>
          </div>
        </div>

        {/* Faturamento Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento</p>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-[#0158ad] transition-colors">
                {formatCurrency(stats.periodRevenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-[#0158ad] transition-colors">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
            <ArrowUpRight size={12} strokeWidth={3} />
            <span>{stats.periodSalesCount} vendas realizadas</span>
          </div>
        </div>

        {/* Meta Mensal (Improved) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Mensal</p>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Target size={14} strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-xl font-black text-slate-800">{formatCurrency(stats.monthlyRevenue)}</h3>
            <span className="text-[10px] font-bold text-slate-400">/ {formatCurrency(GOAL)}</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${goalProgress}%` }}
            ></div>
          </div>

          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
            {remainingGoal > 0
              ? <>🔥 Faltam <span className="text-purple-600">{formatCurrency(remainingGoal)}</span></>
              : <span className="text-green-600">🚀 Meta batida! Parabéns!</span>}
          </p>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                {formatCurrency(stats.periodAverageTicket)}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Média por venda no período</p>
        </div>
      </div>

      {/* NEW: Uso do Plano (Soft Billing) */}
      {usage && usage.monthlySales.limit !== null && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-slate-800 text-sm uppercase flex items-center gap-2">
              <Target size={16} className="text-[#0158ad]" /> Uso do Plano {usage.plan}
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Vendas este mês: <strong className="text-slate-800">{usage.monthlySales.current} / {usage.monthlySales.limit}</strong>
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out 
                ${usage.monthlySales.percentageUsed > 90 ? 'bg-red-500' :
                  usage.monthlySales.percentageUsed > 70 ? 'bg-amber-500' : 'bg-[#0158ad]'}`}
              style={{ width: `${Math.min(usage.monthlySales.percentageUsed, 100)}%` }}
            ></div>
          </div>

          <p className={`text-[11px] font-bold mt-2 ${usage.monthlySales.percentageUsed >= 100 ? 'text-red-600' : 'text-slate-500'}`}>
            {usage.monthlySales.percentageUsed >= 100 
              ? "Você atingiu o limite mensal do plano gratuito." 
              : `Você utilizou ${usage.monthlySales.percentageUsed}% do limite mensal de vendas livres.`}
          </p>
        </div>
      )}

      {/* 3. Ações Rápidas (Preservadas e Melhoradas) */}
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-800 mb-3 px-1">Acesso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/sales" className="flex flex-col items-center justify-center p-4 bg-[#0158ad] text-white rounded-2xl shadow-lg shadow-blue-200/50 hover:bg-blue-800 hover:shadow-blue-300/50 hover:-translate-y-1 transition-all group">
            <Plus size={24} className="mb-2 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Nova Venda</span>
          </Link>
          <Link to="/inventory" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-blue-300 hover:text-blue-600 hover:-translate-y-1 transition-all shadow-sm group">
            <Package size={24} className="mb-2 group-hover:text-blue-500 transition-colors" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Estoque</span>
          </Link>
          <Link to="/conditionals" className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-purple-300 hover:text-purple-600 hover:-translate-y-1 transition-all shadow-sm group">
            <ClipboardList size={24} className="mb-2 group-hover:text-purple-500 transition-colors" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Condicional</span>
          </Link>
          <Link to="/reports" className="hidden md:flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-orange-300 hover:text-orange-600 hover:-translate-y-1 transition-all shadow-sm group">
            <TrendingUp size={24} className="mb-2 group-hover:text-orange-500 transition-colors" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Relatórios</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 4. Insights Inteligentes & Alertas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Star className="text-amber-400 fill-amber-400" size={16} />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Insights & Alertas</h3>
          </div>

          {/* Card de Alerta de Estoque */}
          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full -mr-6 -mt-6 z-0 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-red-600">
                <AlertCircle size={18} strokeWidth={2.5} />
                <h4 className="font-black text-xs uppercase tracking-widest">Atenção ao Estoque</h4>
              </div>

              {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Identificamos <strong className="text-red-600">{stats.lowStockProducts.length} produtos</strong> com estoque crítico. Reponha para evitar perder vendas.
                  </p>
                  <ul className="space-y-2">
                    {stats.lowStockProducts.map((p: any, i: number) => (
                      <li key={i} className="flex justify-between items-center text-xs p-2.5 bg-red-50/30 rounded-lg border border-red-50">
                        <span className="font-bold text-slate-700 truncate max-w-[70%]">{p.name}</span>
                        <span className="font-black text-red-600 bg-white px-2 py-0.5 rounded-md shadow-sm border border-red-100">{p.availableQty} un</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/inventory" className="inline-flex items-center gap-1 mt-2 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                    Ver estoque completo <ArrowUpRight size={10} />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 shadow-sm">
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Estoque Saudável</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Nenhum produto crítico identificado no momento.</p>
                </div>
              )}
            </div>
          </div>

          {/* Estratégia / Dica */}
          {stats.topProducts && stats.topProducts.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-5">
                <Star size={80} />
              </div>
              <h4 className="font-black text-[10px] text-[#0158ad] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Star size={12} strokeWidth={3} /> Dica Estratégica
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed relative z-10">
                O produto <strong className="text-[#0158ad]">{stats.topProducts[0]?.name}</strong> é o campeão de vendas {getPeriodLabel().toLowerCase()}. Que tal criar uma promoção com ele?
              </p>
            </div>
          )}
        </div>

        {/* 5. Gráfico e Ranking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} className="text-[#0158ad]" />
                Tendência de Vendas
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">{getPeriodLabel()}</span>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesByDay}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0158ad" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0158ad" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold', padding: '12px' }}
                    itemStyle={{ color: '#0158ad' }}
                    cursor={{ stroke: '#0158ad', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0158ad" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0158ad' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Products */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-orange-500" />
                Campeões de Vendas
              </h3>
              <span className="text-[#0158ad] text-[9px] font-black uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">TOP 5</span>
            </div>

            <div className="divide-y divide-slate-50">
              {stats.topProducts.map((p: any, i: number) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-transform group-hover:scale-110 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                        {p.variation}
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        {p.quantity} un.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#0158ad]">{formatCurrency(p.revenue)}</p>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#0158ad] rounded-full" style={{ width: `${Math.min((p.revenue / (stats.periodRevenue || 1)) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-xs italic flex flex-col items-center">
                  <Package size={24} className="mb-2 text-slate-300" />
                  Nenhuma venda registrada neste período.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
