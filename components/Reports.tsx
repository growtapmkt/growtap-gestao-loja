
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, FileSpreadsheet, ChevronRight, ShoppingCart, PackageOpen, LayoutGrid, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, AreaChart, Area } from 'recharts';

const Reports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Receita\n";
    data.salesOverTime.forEach((row: any) => {
      csvContent += `${row.name},${row.revenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_vendas_${dateRange.startDate}_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Gerando relatórios e analisando dados...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const salesOverTime = data?.salesOverTime || [];
  const topProducts = data?.topProducts || [];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Relatórios & Analytics</h2>
          <p className="text-slate-500 text-xs font-medium">Desempenho da sua boutique em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <input 
              type="date" 
              className="text-[10px] font-bold text-slate-600 focus:outline-none"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <span className="text-slate-300 text-[10px]">|</span>
            <input 
              type="date" 
              className="text-[10px] font-bold text-slate-600 focus:outline-none"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5"
          >
            <FileSpreadsheet size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Faturamento Total', 
            value: `R$ ${stats.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            trend: `${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend?.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, 
            icon: BarChart3, 
            color: stats.revenueTrend >= 0 ? 'text-emerald-600' : 'text-rose-600', 
            bg: stats.revenueTrend >= 0 ? 'bg-emerald-50' : 'bg-rose-50' 
          },
          { 
            label: 'Total de Pedidos', 
            value: stats.totalOrders?.toString(), 
            trend: `${stats.ordersTrend >= 0 ? '+' : ''}${stats.ordersTrend?.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, 
            icon: ShoppingCart, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Ticket Médio', 
            value: `R$ ${stats.averageTicket?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            trend: 'Médio', 
            icon: Target, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50' 
          },
          { 
            label: 'Performance', 
            value: 'Alta', 
            trend: 'Estável', 
            icon: TrendingUp, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
               <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                 <stat.icon size={20} />
               </div>
               <span className={`text-[9px] font-black px-2 py-1 rounded-full ${stat.color} ${stat.bg} uppercase tracking-tight`}>
                 {stat.trend}
               </span>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-black text-slate-800 mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Vendas no Período</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tendência de faturamento diário</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Receita</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={salesOverTime}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontWeight: 800, fontSize: 9}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontWeight: 800, fontSize: 9}}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '10px' }}
                    itemStyle={{ fontWeight: 'black', color: '#059669', fontSize: '10px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '2px', fontSize: '10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    dot={{r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}}
                    activeDot={{r: 6, strokeWidth: 0}}
                  />
               </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col group">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Top Produtos</h3>
          <div className="space-y-6 flex-1">
            {topProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <PackageOpen size={48} className="mb-3" />
                    <p className="text-[9px] font-black uppercase">Sem dados</p>
                </div>
            ) : topProducts.map((item: any, i: number) => (
              <div key={i} className="space-y-2 group/item">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700 uppercase group-hover/item:text-emerald-600 transition-colors">{item.name}</span>
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">{item.units} un.</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(item.units / (topProducts[0].units || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 mt-6 bg-slate-50 text-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-2 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500">
            Inventário Completo <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Resumo Operacional</h3>
              <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-full uppercase">Overview</span>
            </div>
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ticket Médio</p>
                        <p className="text-lg font-black text-slate-800">R$ {stats.averageTicket?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-50">
                        <Target size={20} />
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total de Pedidos</p>
                        <p className="text-lg font-black text-slate-800">{stats.totalOrders}</p>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                        <ShoppingCart size={20} />
                    </div>
                </div>
            </div>
         </div>

         <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col items-center justify-center text-center group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
               <LayoutGrid size={100} />
            </div>
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-emerald-500/40 relative z-10 transition-transform group-hover:rotate-12">
               <TrendingUp size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-black mb-2 relative z-10 uppercase tracking-tight">Relatórios Prontos!</h3>
            <p className="text-slate-400 max-w-xs mb-6 relative z-10 font-medium text-xs">
              Acompanhe seu crescimento em tempo real com dados de vendas reais.
            </p>
            <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:scale-105 transition-transform relative z-10 shadow-lg">
               Sincronizar
            </button>
         </div>
      </div>
    </div>
  );
};

export default Reports;
