
import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Plus, Minus, Share2, MoreHorizontal, CreditCard, Wallet, QrCode, Search, Filter, Calendar, Loader2, X, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const Cashier: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Extrato');
  const [filterPeriod, setFilterPeriod] = useState('Hoje');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'IN' | 'OUT'>('IN');
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    method: 'CASH',
    value: '',
    date: new Date().toISOString().slice(0, 16),
    subDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterPeriod]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      const summaryRes = await fetch(`${import.meta.env.VITE_API_URL}/transactions/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();

      if (data.success) setTransactions(data.transactions);
      if (summaryData.success) setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao buscar dados do caixa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          type: modalType,
          value: parseFloat(formData.value.replace(',', '.'))
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          description: '',
          category: '',
          method: 'CASH',
          value: '',
          date: new Date().toISOString().slice(0, 16),
          subDescription: ''
        });
        fetchData();
      }
    } catch (error) {
      alert('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Deseja realmente excluir este lançamento?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchData();
    } catch (error) {
      alert('Erro ao excluir');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'Entradas') return t.type === 'IN';
    if (activeTab === 'Despesas') return t.type === 'OUT';
    return true;
  });

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return <CreditCard size={14} className="text-blue-400" />;
      case 'DEBIT_CARD': return <CreditCard size={14} className="text-indigo-400" />;
      case 'PIX': return <QrCode size={14} className="text-emerald-400" />;
      case 'CASH': return <Wallet size={14} className="text-amber-400" />;
      default: return <Wallet size={14} className="text-slate-400" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Crédito';
      case 'DEBIT_CARD': return 'Débito';
      case 'PIX': return 'PIX';
      case 'CASH': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gestão de Caixa</h2>
          <p className="text-slate-500 text-xs font-medium">Monitore e registre as atividades financeiras diárias da sua loja.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setModalType('IN'); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Lançar Entrada
          </button>
          <button
            onClick={() => { setModalType('OUT'); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all hover:-translate-y-0.5"
          >
            <Minus size={16} />
            Lançar Despesa
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 relative overflow-hidden group shadow-sm">
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Landmark size={180} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50">
                <p className="font-black text-emerald-800 text-[9px] uppercase tracking-widest">Saldo Disponível</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-md border border-emerald-50 transition-transform group-hover:rotate-12">
                <Landmark size={22} />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-800 tracking-tighter">
                R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-3 text-emerald-600 font-bold bg-white/40 w-fit px-2.5 py-1 rounded-full text-[10px]">
                <TrendingUp size={14} />
                <span>Movimentação saudável</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Calendar size={100} />
          </div>
          <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest">Total Saídas</p>
          <div className="mt-4">
            <p className="text-3xl font-black text-rose-500 tracking-tighter">
              R$ {summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Acumulado do período</p>
          </div>
          <button className="w-full py-3 bg-slate-50 text-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 mt-6">
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            {['Extrato', 'Entradas', 'Despesas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-50' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 p-1 rounded-xl">
              {['Hoje', 'Semana', 'Mês'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${filterPeriod === p ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 bg-slate-50/50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">
              <Calendar size={12} /> Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Data/Hora</th>
                <th className="px-8 py-4">Descrição</th>
                <th className="px-8 py-4">Categoria</th>
                <th className="px-8 py-4 text-center">Método</th>
                <th className="px-8 py-4 text-right">Valor</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto mb-3" size={24} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carregando...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <AlertCircle className="text-slate-200 mx-auto mb-3" size={40} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nenhuma movimentação</p>
                  </td>
                </tr>
              ) : filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{new Date(t.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{t.description}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t.subDescription || '-'}</p>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase ${t.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                      {t.category || (t.type === 'IN' ? 'Entrada' : 'Saída')}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        {getMethodIcon(t.method)}
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{getMethodLabel(t.method)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className={`flex items-center justify-end gap-1 font-black text-base tracking-tighter ${t.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                      <span className="text-xs">{t.type === 'IN' ? '+' : '-'}</span>
                      <span>R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    {!t.saleId ? (
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-[7px] font-black text-slate-300 uppercase italic">Automático</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List (Cards) */}
        <div className="block md:hidden p-4 space-y-3">
          {isLoading ? (
            <div className="py-10 text-center">
              <Loader2 className="animate-spin text-emerald-500 mx-auto mb-3" size={24} />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carregando...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-10 text-center">
              <AlertCircle className="text-slate-200 mx-auto mb-3" size={40} />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nenhuma movimentação</p>
            </div>
          ) : filteredTransactions.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

              <div className="flex justify-between items-start mb-3">
                <div className="pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="font-black text-slate-800 text-sm leading-tight">{t.description}</h4>
                  {t.subDescription && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.subDescription}</p>}
                </div>
                <div className={`flex flex-col items-end font-black text-lg tracking-tighter ${t.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <span>{t.type === 'IN' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pl-2 flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className={`text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase ${t.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                    {t.category || (t.type === 'IN' ? 'Entrada' : 'Saída')}
                  </span>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    {getMethodIcon(t.method)}
                    <span className="text-[9px] font-black uppercase tracking-widest">{getMethodLabel(t.method)}</span>
                  </div>
                </div>

                {!t.saleId && (
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry/Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`p-6 flex items-center justify-between ${modalType === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  {modalType === 'IN' ? <Plus size={20} /> : <Minus size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-widest">{modalType === 'IN' ? 'Nova Entrada' : 'Nova Despesa'}</h3>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-tight">Registro manual</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Venda Avulsa..."
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input
                    required
                    type="text"
                    placeholder="0,00"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Método</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    <option value="CASH">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="CREDIT_CARD">Crédito</option>
                    <option value="DEBIT_CARD">Débito</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data/Hora</label>
                  <input
                    type="datetime-local"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Venda..."
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  className={`w-full py-4 ${modalType === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'} text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : `Confirmar`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashier;
