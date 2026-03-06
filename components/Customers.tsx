
import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, Mail, Phone, MapPin, Calendar, Edit3,
  ShoppingBag, ClipboardList, TrendingUp, MoreVertical,
  X, CheckCircle, Loader2, Trash2, Plus, ArrowRight, Clock,
  Banknote, Shirt, User, Filter, Eye, Download, ChevronDown, ShoppingCart
} from 'lucide-react';

const Customers: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'details' | 'form'>('list'); // Novo estado de visualização
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthday: '',
    address: '',
    complement: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    topSize: '',
    bottomSize: '',
    shoesSize: '',
    personalNotes: '',
    favoriteColors: [] as string[]
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.cpf && c.cpf.includes(searchQuery))
    );
    setFilteredClients(filtered);
    setPage(1);
  }, [searchQuery, clients]);

  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedClients = filteredClients.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (selectedClient?.id) {
      fetchClientDetails(selectedClient.id);
      fetchClientStats(selectedClient.id);
    }
  }, [selectedClient?.id]);

  const fetchClientDetails = async (id: string) => {
    setIsClientLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Preservar o client mas atualizar com dados detalhados
        setSelectedClient(data.client);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
    } finally {
      setIsClientLoading(false);
    }
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
        setFilteredClients(data.clients);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientStats = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/${id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleOpenForm = (mode: 'create' | 'edit', client?: any) => {
    setFormMode(mode);
    if (mode === 'edit' && client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone ? formatPhone(client.phone) : '',
        cpf: client.cpf ? formatCPF(client.cpf) : '',
        birthday: client.birthday ? new Date(client.birthday).toISOString().split('T')[0] : '',
        address: client.address || '',
        complement: client.complement || '',
        number: client.number || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        cep: client.cep ? formatCEP(client.cep) : '',
        topSize: client.topSize || '',
        bottomSize: client.bottomSize || '',
        shoesSize: client.shoesSize || '',
        personalNotes: client.personalNotes || '',
        favoriteColors: client.favoriteColors || []
      });
      setSelectedClient(client);
    } else {
      setFormData({
        name: '', email: '', phone: '', cpf: '', birthday: '',
        address: '', complement: '', number: '', neighborhood: '', city: '', state: '', cep: '',
        topSize: '', bottomSize: '', shoesSize: '', personalNotes: '',
        favoriteColors: []
      });
    }
    setView('form');
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: value }));

    const cep = value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = formMode === 'create'
        ? `${import.meta.env.VITE_API_URL}/clients`
        : `${import.meta.env.VITE_API_URL}/clients/${selectedClient.id}`;

      // Remover formatação de CPF e telefone antes de enviar
      const dataToSend: any = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : null,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : null,
        birthday: formData.birthday || null,
        address: formData.address || null,
        complement: formData.complement || null,
        number: formData.number || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        cep: formData.cep ? formData.cep.replace(/\D/g, '') : null,
        topSize: formData.topSize || null,
        bottomSize: formData.bottomSize || null,
        shoesSize: formData.shoesSize || null,
        personalNotes: formData.personalNotes || null,
        favoriteColors: formData.favoriteColors
      };

      console.log('Enviando dados:', dataToSend);

      const response = await fetch(url, {
        method: formMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (data.success) {
        await fetchClients();
        if (formMode === 'edit') {
          setSelectedClient(data.client);
          setView('details');
        } else {
          setView('list');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao processar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientToDelete?: any) => {
    const client = clientToDelete || selectedClient;
    if (!client) return;
    if (!confirm(`Deseja realmente excluir o cliente ${client.name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients/${client.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (!clientToDelete || (selectedClient && selectedClient.id === client.id)) {
          setSelectedClient(null);
          setView('list');
        }
        fetchClients();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Erro ao excluir cliente.');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getClientStatus = (client: any) => {
    // 1. Verificação por vendas recentes (últimos 6 meses)
    if (client.sales && client.sales.length > 0) {
      const lastSale = client.sales.reduce((latest: any, sale: any) => {
        const saleDate = new Date(sale.createdAt);
        return !latest || saleDate > latest ? saleDate : latest;
      }, null);

      if (lastSale) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (lastSale > sixMonthsAgo) return 'Ativo';
      }
    }

    // 2. Verificação por cadastro recente (últimos 30 dias)
    // Isso garante que novos clientes não apareçam como inativos imediatamente
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (new Date(client.createdAt) > thirtyDaysAgo) return 'Ativo';

    return 'Inativo';
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const renderListView = () => (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clientes</h2>
          <p className="text-slate-500 text-xs font-medium">Gerencie seu banco de dados de clientes e histórico.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0158ad] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Pesquisar por nome ou telefone..."
              className="w-full pl-10 pr-4 py-3 md:py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenForm('create')}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 md:py-2.5 bg-[#0158ad] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/10"
          >
            <UserPlus size={18} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-center">Compras</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30 text-slate-400">
                      <Loader2 className="animate-spin" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando clientes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 italic text-xs font-medium">Nenhum cliente encontrado</td>
                </tr>
              ) : (
                paginatedClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{c.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {c.id.substring(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-600">{c.phone ? formatPhone(c.phone) : '---'}</p>
                        <p className="text-[10px] text-slate-400">{c.email || '---'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-[#0158ad] px-2.5 py-1 rounded-lg text-[10px] font-black">{c.sales?.length || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{c.city || 'N/A'}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{c.state || ''}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getClientStatus(c) === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                        <div className={`w-1 h-1 rounded-full ${getClientStatus(c) === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        {getClientStatus(c)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button
                          onClick={() => {
                            setSelectedClient(c);
                            setView('details');
                            fetchClientStats(c.id);
                          }}
                          className="p-2 bg-blue-50 text-[#0158ad] rounded-lg hover:bg-[#0158ad] hover:text-white transition-all shadow-sm"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        {c.phone && (
                          <a
                            href={`https://wa.me/55${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.119.554 4.188 1.604 6.04L0 24l6.111-1.604a11.803 11.803 0 005.934 1.585h.005c6.636 0 12.032-5.391 12.036-12.029a11.812 11.812 0 00-3.376-8.508z" />
                            </svg>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            sessionStorage.setItem('pre_selected_client_id', c.id);
                            window.location.hash = '/sales';
                          }}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title="Venda Rápida"
                        >
                          <ShoppingCart size={16} />
                        </button>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('pre_selected_client_id', c.id);
                            window.location.hash = '/conditionals';
                          }}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Nova Condicional"
                        >
                          <ClipboardList size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenForm('edit', c)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all shadow-sm"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile List (Cards) */}
      <div className="block md:hidden space-y-4 p-4">
        {paginatedClients.map(c => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                  {getInitials(c.name)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.city || 'N/A'} - {c.state || ''}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getClientStatus(c) === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {getClientStatus(c)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black text-slate-400">Celular</span>
                <span className="font-bold">{c.phone ? formatPhone(c.phone) : '-'}</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black text-slate-400">CPF</span>
                <span className="font-bold">{c.cpf ? formatCPF(c.cpf) : '-'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#0158ad] bg-blue-50 px-2 py-1 rounded-lg">
                {c.sales?.length || 0} Compras
              </span>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedClient(c); setView('details'); fetchClientStats(c.id); }} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100">
                  <Eye size={18} />
                </button>
                <button title="Venda Rápida" onClick={() => { sessionStorage.setItem('pre_selected_client_id', c.id); window.location.hash = '/sales'; }} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-100">
                  <ShoppingCart size={18} />
                </button>
                <button title="Nova Condicional" onClick={() => { sessionStorage.setItem('pre_selected_client_id', c.id); window.location.hash = '/conditionals'; }} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-100">
                  <ClipboardList size={18} />
                </button>
                <button title="Editar" onClick={() => handleOpenForm('edit', c)} className="p-2 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-lg border border-slate-100">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDeleteClient(c)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-100">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && !isLoading && (
          <div className="text-center py-10 text-slate-400 italic text-sm">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(paginatedClients.length > 0 || filteredClients.length > 0) && (
        <div className="px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Exibir:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={10}>10 ▼</option>
              <option value={20}>20 ▼</option>
              <option value={30}>30 ▼</option>
            </select>
            <span className="text-xs font-bold text-slate-500 ml-2">
              Mostrando {paginatedClients.length} de {totalItems} itens
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );


  const renderDetailsView = () => (
    <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar pb-10">
      {/* Header Card with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => setView('list')}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest bg-white border border-slate-100 shadow-sm"
        >
          <ArrowRight size={16} className="rotate-180" /> Voltar para lista
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] pointer-events-none transition-all group-hover:bg-blue-500/10"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{selectedClient.name}</h2>
              <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] shadow-sm ${getClientStatus(selectedClient) === 'Ativo' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{getClientStatus(selectedClient)}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><MapPin size={14} className="text-[#0158ad]" /> {selectedClient.city ? `${selectedClient.city}, ${selectedClient.state || ''}` : 'Local não informado'}</div>
              <div className="flex items-center gap-1.5 text-emerald-500"><Calendar size={14} /> Membro desde {new Date(selectedClient.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => handleOpenForm('edit', selectedClient)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-[#0158ad] hover:text-[#0158ad] transition-all shadow-sm"
          >
            <Edit3 size={16} /> Editar
          </button>
          <button
            onClick={() => window.location.hash = '/cashier'}
            className="flex items-center gap-2 px-4 py-2 bg-[#0158ad] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-800 hover:-translate-y-0.5 transition-all shadow-lg"
          >
            Pedido <Plus size={16} />
          </button>
          <button
            onClick={handleDeleteClient}
            className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Gastos', value: stats ? `R$ ${stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...', description: 'LTV Saudável', icon: Banknote, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Freq. Compra', value: stats ? `${(stats.orderCount / 12).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / Mês` : '...', description: 'Consistente', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Taxa Devolução', value: stats ? stats.returnRate : '...', description: 'Muito Baixa', icon: ClipboardList, bg: 'bg-orange-50', color: 'text-orange-600' },
          { label: 'Última Compra', value: stats && stats.lastOrder ? new Date(stats.lastOrder).toLocaleDateString('pt-BR') : 'Sem pedidos', description: 'Ativa', icon: Clock, bg: 'bg-slate-50', color: 'text-slate-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#0158ad]/30 transition-all">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-lg font-black text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-tight">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#0158ad]">
              <Mail size={16} />
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Informações de Contato</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between group border-b border-slate-50 pb-3">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Email</span>
              <span className="text-xs font-bold text-slate-700">{selectedClient.email || 'Não informado'}</span>
            </div>
            <div className="flex items-center justify-between group border-b border-slate-50 pb-3">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Celular</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">{selectedClient.phone ? formatPhone(selectedClient.phone) : 'Não informado'}</span>
                {selectedClient.phone && (
                  <a
                    href={`https://wa.me/55${selectedClient.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-110 shadow-sm"
                    title="Conversar no WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.119.554 4.188 1.604 6.04L0 24l6.111-1.604a11.803 11.803 0 005.934 1.585h.005c6.636 0 12.032-5.391 12.036-12.029a11.812 11.812 0 00-3.376-8.508z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between group border-b border-slate-50 pb-3">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Aniversário</span>
              <span className="text-xs font-bold text-slate-700">{selectedClient.birthday ? new Date(selectedClient.birthday).toLocaleDateString('pt-BR') : 'Não informado'}</span>
            </div>
            <div className="flex items-start justify-between group">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Endereço</span>
              <span className="text-xs font-bold text-slate-700 text-right max-w-[180px] leading-relaxed">
                {selectedClient.address ? `${selectedClient.address}, ${selectedClient.city || ''} - ${selectedClient.state || ''}` : 'Não informado'}
              </span>
            </div>
          </div>
        </div>

        {/* Style & Preferences */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <Shirt size={16} />
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Estilo & Tamanhos</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Parte Superior</p>
              <p className="font-black text-slate-800 text-sm">{selectedClient.topSize || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Parte Inferior</p>
              <p className="font-black text-slate-800 text-sm">{selectedClient.bottomSize || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Calçados</p>
              <p className="font-black text-slate-800 text-sm">{selectedClient.shoesSize || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Preferências</p>
              <div className="flex gap-1.5 mt-0.5">
                {selectedClient.favoriteColors && selectedClient.favoriteColors.length > 0 ? (
                  selectedClient.favoriteColors.map((color: string, i: number) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }}></div>
                  ))
                ) : (
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Não definido</span>
                )}
              </div>
            </div>
          </div>
          {selectedClient.personalNotes && (
            <div className="mt-3 p-4 bg-amber-50/30 border border-dashed border-amber-200 rounded-xl text-[11px] font-medium text-amber-800 leading-normal italic">
              "{selectedClient.personalNotes}"
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <ShoppingBag size={16} />
            </div>
            <div className="flex flex-col">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Histórico de Compras</h4>
              {selectedClient?.sales && (
                <span className="text-[8px] font-bold text-slate-400 uppercase">{selectedClient.sales.length} Pedidos localizados</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchClientDetails(selectedClient.id)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
              title="Atualizar histórico"
            >
              <Clock size={16} />
            </button>
            <button
              onClick={() => window.location.hash = '/sales'}
              className="text-[#0158ad] text-[9px] font-black hover:underline uppercase tracking-widest flex items-center gap-1.5"
            >
              Ver Tudo <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white text-slate-400 text-[8px] font-black uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-6 py-3">ID Venda</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Pagamento</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isClientLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-bold text-xs">Sincronizando...</td>
                </tr>
              ) : (selectedClient && selectedClient.sales && selectedClient.sales.length > 0) ? (
                selectedClient.sales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-slate-800 uppercase tracking-tight">#{sale.id?.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-medium">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('pt-BR') : '---'}</td>
                    <td className="px-6 py-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase">{sale.paymentMethod || 'OUTRO'}</span>
                    </td>
                    <td className="px-6 py-3 text-xs font-black text-slate-800 text-right tracking-tight">R$ {(sale.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-100">PAGO</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic text-xs">Nenhuma compra registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile History List */}
        <div className="block md:hidden space-y-3 p-4">
          {isClientLoading ? (
            <div className="text-center py-8 text-slate-400 font-bold text-xs">Sincronizando...</div>
          ) : (selectedClient && selectedClient.sales && selectedClient.sales.length > 0) ? (
            selectedClient.sales.map((sale: any) => (
              <div key={sale.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase">#{sale.id?.substring(0, 8)}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('pt-BR') : '---'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#0158ad]">R$ {(sale.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="text-[8px] font-bold text-emerald-600 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">Pago</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 italic text-xs">Nenhuma compra registrada.</div>
          )}
        </div>
      </div>

      {/* Active Conditionals Section */}
      {selectedClient.conditionals && selectedClient.conditionals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                <ClipboardList size={16} />
              </div>
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Condicionais Ativas</h4>
            </div>
            <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">{selectedClient.conditionals.length} PENDENTE</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {selectedClient.conditionals.map((cond: any) => (
              <div key={cond.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group hover:border-orange-200 transition-all shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base tracking-tight">Condicional #{cond.id.split('-')[0].toUpperCase()}</p>
                    <div className="flex gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1"><ShoppingBag size={10} /> {cond.items.length} Itens</span>
                      <span className={`flex items-center gap-1 ${new Date(cond.returnDate) < new Date() ? 'text-red-500' : 'text-orange-600'}`}>
                        <Calendar size={10} /> {new Date(cond.returnDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.hash = '/conditionals'}
                    className="flex-1 py-2 bg-white border border-slate-200 rounded-xl font-black text-[8px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Ver Peças
                  </button>
                  <button
                    onClick={() => window.location.hash = '/conditionals'}
                    className="flex-1 py-2 bg-[#0158ad] text-white rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-blue-800 transition-all"
                  >
                    Converter Venda
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFormView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* External Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView('list')}
          className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
          title="Voltar para lista"
        >
          <ArrowRight size={20} className="rotate-180" />
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {formMode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 md:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="space-y-5">
                  <h4 className="text-[9px] font-black text-[#0158ad] uppercase tracking-[0.15em] border-l-4 border-[#0158ad] pl-3">Dados Básicos</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Nome Completo</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                        placeholder="Nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">CPF</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="000.000.000-00"
                          maxLength={14}
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Data de Aniversário</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-[9px] font-black text-[#0158ad] uppercase tracking-[0.15em] border-l-4 border-[#0158ad] pl-3">Contato e Endereço</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Celular</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="(00) 00000-0000"
                          maxLength={16}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Email</label>
                        <input
                          type="email"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="cliente@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">CEP</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="00000-000"
                          maxLength={9}
                          value={formData.cep}
                          onChange={handleCEPChange}
                        />
                      </div>
                      <div className="col-span-9 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Endereço</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="Rua, Avenida..."
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-9 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Complemento</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="Apto, Bloco..."
                          value={formData.complement}
                          onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        />
                      </div>
                      <div className="col-span-3 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Número</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="123"
                          value={formData.number}
                          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Bairro</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="Bairro"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Cidade</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="Cidade"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Estado</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none"
                          placeholder="UF"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-5">
                  <h4 className="text-[9px] font-black text-[#0158ad] uppercase tracking-[0.15em] border-l-4 border-[#0158ad] pl-3">Medidas e Preferências</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase text-center">Tamanho Cima</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none text-center"
                          placeholder="P"
                          value={formData.topSize}
                          onChange={(e) => setFormData({ ...formData, topSize: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase text-center">Tamanho Baixo</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none text-center"
                          placeholder="38"
                          value={formData.bottomSize}
                          onChange={(e) => setFormData({ ...formData, bottomSize: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase text-center">Calçado</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none text-center"
                          placeholder="36"
                          value={formData.shoesSize}
                          onChange={(e) => setFormData({ ...formData, shoesSize: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Cores Favoritas</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['Azul', 'Branco', 'Preto', 'Rosa', 'Verde', 'Amarelo', 'Vermelho'].map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              const current = [...formData.favoriteColors];
                              if (current.includes(color)) {
                                setFormData({ ...formData, favoriteColors: current.filter(c => c !== color) });
                              } else {
                                setFormData({ ...formData, favoriteColors: [...current, color] });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${formData.favoriteColors.includes(color)
                              ? 'bg-[#0158ad] text-white shadow-md'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Observações Pessoais</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-[#0158ad] transition-all outline-none min-h-[120px]"
                        placeholder="Notas sobre o cliente, estilo, restrições..."
                        value={formData.personalNotes}
                        onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Mobile Footer / Static Desktop Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-slate-100 flex items-center justify-end gap-3 z-50 md:static md:p-6 md:pb-6 md:bg-slate-50/30 md:border-t-0 animate-in slide-in-from-bottom-4">
            <button
              type="button"
              onClick={() => setView('list')}
              className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl md:rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm md:shadow-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] md:flex-none px-10 py-3 bg-[#0158ad] text-white rounded-2xl md:rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={14} />...</> : <><CheckCircle size={14} /> {formMode === 'create' ? 'Cadastrar' : 'Salvar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {view === 'list' && renderListView()}
      {view === 'details' && selectedClient && renderDetailsView()}
      {view === 'form' && renderFormView()}
    </div>
  );
};

export default Customers;
