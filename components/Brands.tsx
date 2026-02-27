import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2,
  CheckCircle, XCircle,
  Truck, Loader2, X, Info, Store,
  ArrowRight, Mail, Phone, MapPin, Globe, FileText, User as UserIcon,
  ChevronDown, ExternalLink, ChevronRight, MessageCircle
} from 'lucide-react';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingBrand, setEditingBrand] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    contactPerson: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    website: '',
    notes: '',
    active: true,
    whatsapp: '',
    instagram: '',
    registrationType: 'COMPLETE'
  });

  // Filter state
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao carregar marcas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenForm = (brand: any = null, type: string = 'COMPLETE') => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || '',
        cnpj: brand.cnpj ? formatCNPJ(brand.cnpj) : '',
        email: brand.email || '',
        phone: brand.phone ? formatPhone(brand.phone) : '',
        contactPerson: brand.contactPerson || '',
        cep: brand.cep ? formatCEP(brand.cep) : '',
        address: brand.address || '',
        number: brand.number || '',
        complement: brand.complement || '',
        neighborhood: brand.neighborhood || '',
        city: brand.city || '',
        state: brand.state || '',
        website: brand.website || '',
        notes: brand.notes || '',
        active: brand.active ?? true,
        whatsapp: brand.whatsapp ? formatPhone(brand.whatsapp) : '',
        instagram: brand.instagram || '',
        registrationType: brand.registrationType || 'COMPLETE'
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '', cnpj: '', email: '', phone: '', contactPerson: '',
        cep: '', address: '', number: '', complement: '', neighborhood: '',
        city: '', state: '', website: '', notes: '', active: true,
        whatsapp: '', instagram: '', registrationType: type
      });
    }
    setView('form');
  };

  const handleCloseForm = () => {
    setView('list');
    setEditingBrand(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingBrand
        ? `${import.meta.env.VITE_API_URL}/brands/${editingBrand.id}`
        : `${import.meta.env.VITE_API_URL}/brands`;

      const method = editingBrand ? 'PUT' : 'POST';

      // Clean numbers before sending
      const dataToSend = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, '')
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (data.success) {
        fetchBrands();
        handleCloseForm();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao salvar marca/fornecedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchBrands();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao excluir marca.');
    }
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

  // Formatters
  const formatCNPJ = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) { // CPF handling if needed
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18);
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length === 11) return v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    if (v.length === 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return v;
  };

  const formatCEP = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9);
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      const matchName = b.name.toLowerCase().includes(filterName.toLowerCase());
      const matchStatus = filterStatus === 'TODOS'
        ? true
        : filterStatus === 'ATIVA' ? b.active : !b.active;
      return matchName && matchStatus;
    });
  }, [brands, filterName, filterStatus]);

  const renderListView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
            <span className="cursor-default">Produtos</span>
            <ChevronRight size={10} />
            <span className="font-medium text-slate-500">Marcas e Fornecedores</span>
          </div>
          <h1 className="text-[26px] font-black text-slate-800 tracking-tight">Marcas e Fornecedores</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie as marcas e fornecedores dos seus produtos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenForm(null, 'QUICK')}
            className="flex items-center justify-center gap-2 bg-white border border-[#0158ad] text-[#0158ad] px-4 py-2 text-xs rounded-lg font-bold transition-all shadow-sm hover:bg-blue-50 active:scale-95"
          >
            <Plus size={14} />
            Registro Rápido
          </button>
          <button
            onClick={() => handleOpenForm(null, 'COMPLETE')}
            className="flex items-center justify-center gap-2 bg-[#0158ad] hover:bg-blue-700 text-white px-4 py-2 text-xs rounded-lg font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={14} />
            Registro Completo
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Truck size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-blue-800">Fornecedores e Marcas</h4>
          <p className="text-[11px] text-blue-600 font-medium leading-relaxed mt-0.5">
            Aqui você cadastra as origens dos seus produtos. Isso facilitará a reposição de estoque e relatórios de vendas por marca.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou CNPJ..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-slate-50 border-none rounded-xl text-sm font-bold px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="TODOS">Todos Status</option>
            <option value="ATIVA">Ativos</option>
            <option value="INATIVA">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Marca / Fornecedor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contato</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Localização</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    Nenhuma marca encontrada.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#0158ad] group-hover:text-white transition-all">
                          <Store size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700">{brand.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{brand.cnpj ? formatCNPJ(brand.cnpj) : 'CNPJ não informado'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-300" /> {(brand.phone || brand.whatsapp) ? formatPhone(brand.phone || brand.whatsapp) : '---'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-300" /> {brand.email || brand.instagram || '---'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-600 uppercase">
                          {brand.city || '---'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 capitalize">
                          {brand.state || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${brand.registrationType === 'QUICK'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {brand.registrationType === 'QUICK' ? 'Rápido' : 'Completo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {brand.active ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                          <XCircle size={14} className="text-slate-300" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-wider ${brand.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {brand.active ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {(brand.whatsapp || brand.phone) && (
                          <a
                            href={`https://wa.me/55${(brand.whatsapp || brand.phone).replace(/\D/g, '')}?text=Ol%C3%A1,%20estou%20entrando%20em%20contato%20pela%20GrowTap.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="WhatsApp"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenForm(brand)}
                          className="p-2 text-slate-400 hover:text-[#0158ad] hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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

      {/* Mobile Feed (Cards) */}
      <div className="block md:hidden space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium italic">
            Nenhuma marca encontrada.
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{brand.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{brand.cnpj ? formatCNPJ(brand.cnpj) : 'S/ CNPJ'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {brand.active ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : (
                    <XCircle size={14} className="text-slate-300" />
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-300" /> {(brand.phone || brand.whatsapp) ? formatPhone(brand.phone || brand.whatsapp) : '---'}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 break-all">
                    <Mail size={12} className="text-slate-300 min-w-[12px]" /> {brand.email || brand.instagram || '---'}
                  </p>
                </div>
                <div className="w-full h-px bg-slate-200/60" />
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-600 uppercase">
                      {brand.city || '---'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">
                      {brand.state || ''}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${brand.registrationType === 'QUICK'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {brand.registrationType === 'QUICK' ? 'Rápido' : 'Completo'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {(brand.whatsapp || brand.phone) && (
                  <a
                    href={`https://wa.me/55${(brand.whatsapp || brand.phone).replace(/\D/g, '')}?text=Ol%C3%A1,%20estou%20entrando%20em%20contato%20pela%20GrowTap.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-emerald-500 hover:bg-emerald-50 bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                    </svg> Zap
                  </a>
                )}
                <button
                  onClick={() => handleOpenForm(brand)}
                  className="flex-1 py-2 text-slate-500 hover:text-[#0158ad] bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(brand.id, brand.name)}
                  className="flex-1 py-2 text-slate-500 hover:text-rose-600 bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFormView = () => {
    const isQuick = formData.registrationType === 'QUICK';

    const handleConvertToComplete = () => {
      setFormData(prev => ({ ...prev, registrationType: 'COMPLETE' }));
    };

    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCloseForm}
            className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center group"
            title="Voltar"
          >
            <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span className="cursor-default">Produtos</span>
              <ChevronRight size={10} />
              <span className="font-medium text-slate-500">Marcas e Fornecedores</span>
              <ChevronRight size={10} />
              <span className="font-medium text-slate-500">{editingBrand ? 'Editar' : 'Novo'}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {editingBrand ? 'Editar Marca/Fornecedor' : isQuick ? 'Registro Rápido' : 'Novo Cadastro Completo'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Detalhes da Empresa</p>
          </div>

          {isQuick && editingBrand && (
            <button
              type="button"
              onClick={handleConvertToComplete}
              className="ml-auto px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-all"
            >
              Converter para Completo
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-10">

              {/* Section: Basic Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                  <FileText size={18} className="text-blue-500" />
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Informações Básicas</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nome Fantasia / Razão Social <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                      placeholder="Ex: Nike do Brasil Ltd."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {isQuick && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        WhatsApp (Opcional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                          placeholder="(00) 00000-0000"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {!isQuick && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                        placeholder="00.000.000/0001-00"
                        maxLength={18}
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                      />
                    </div>
                  )}
                </div>

                {!isQuick && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pessoa de Contato</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                          placeholder="Nome do Gerente / Vendedor"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / Fixo</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                          placeholder="(00) 0000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="email"
                          className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                          placeholder="contato@empresa.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Address (Only for Complete) */}
              {!isQuick && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
                    <MapPin size={18} className="text-amber-500" />
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Endereço e Localização</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none"
                        placeholder="00000-000"
                        maxLength={9}
                        value={formData.cep}
                        onChange={handleCEPChange}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Logradouro (Rua/Av)</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none"
                        placeholder="Rua das Marcas"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none"
                        placeholder="123"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none"
                        placeholder="Centro"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none"
                        placeholder="São Paulo"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado (UF)</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-amber-50 focus:border-amber-400 transition-all outline-none"
                        placeholder="SP"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Additional Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                  <Globe size={18} className="text-emerald-500" />
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Digital e Outros</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {isQuick ? 'Instagram (Opcional)' : 'Site / Instagram'}
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 transition-all outline-none"
                        placeholder={isQuick ? "@sua.marca" : "www.marca.com.br"}
                        value={isQuick ? formData.instagram : formData.website}
                        onChange={(e) => isQuick ? setFormData({ ...formData, instagram: e.target.value }) : setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                  {!isQuick && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3.5 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all outline-none"
                          placeholder="(00) 00000-0000"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status de Atividade</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 transition-all outline-none"
                        value={formData.active ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                      >
                        <option value="true">Ativo para Novos Vínculos</option>
                        <option value="false">Inativo / Bloqueado</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações Internas</label>
                  <textarea
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-slate-100 focus:border-slate-300 transition-all outline-none resize-none"
                    placeholder="Anote aqui informações importantes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-slate-50/50 p-8 flex items-center justify-between border-t border-slate-100">
              <div className="hidden md:flex items-center gap-2 text-slate-400">
                <Info size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Os campos marcados são obrigatórios.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 md:px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] md:px-6 py-2 bg-[#0158ad] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : editingBrand ? 'Salvar Alterações' : isQuick ? 'Finalizar Cadastro Rápido' : 'Finalizar Cadastro'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };


  return (
    <div className="w-full">
      {view === 'list' ? renderListView() : renderFormView()}
    </div>
  );
};

export default Brands;
