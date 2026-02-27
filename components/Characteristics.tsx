import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Filter,
  CheckCircle, XCircle,
  Settings2, Loader2, X, Info, ChevronRight, ChevronDown, Save, Tag
} from 'lucide-react';

const Characteristics: React.FC = () => {
  const [characteristics, setCharacteristics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for inline editing/creating
  const [formData, setFormData] = useState({
    name: '',
    options: '',
    status: 'ATIVA',
    order: 0
  });

  // Filter state
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');

  const fetchCharacteristics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/characteristics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCharacteristics(data.characteristics);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao carregar características.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacteristics();
  }, []);

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      options: '',
      status: 'ATIVA',
      order: characteristics.length > 0 ? Math.max(...characteristics.map(c => c.order)) + 1 : 1
    });
  };

  const handleStartEdit = (char: any) => {
    setEditingId(char.id);
    setIsCreating(false);
    setFormData({
      name: char.name,
      options: char.options || '',
      status: char.status,
      order: char.order
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: '',
      options: '',
      status: 'ATIVA',
      order: 0
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('O nome da característica é obrigatório.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/characteristics/${editingId}`
        : `${import.meta.env.VITE_API_URL}/characteristics`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order.toString())
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchCharacteristics();
        handleCancel();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao salvar característica.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a característica "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/characteristics/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchCharacteristics();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao excluir característica.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/characteristics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchCharacteristics();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao atualizar status da característica.');
    }
  };

  const filteredCharacteristics = useMemo(() => {
    return characteristics.filter(c => {
      const matchName = c.name.toLowerCase().includes(filterName.toLowerCase());
      const matchStatus = filterStatus === 'TODOS' || c.status === filterStatus;
      return matchName && matchStatus;
    });
  }, [characteristics, filterName, filterStatus]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
            <span className="cursor-default">Produtos</span>
            <ChevronRight size={10} />
            <span className="font-medium text-slate-500">Características</span>
          </div>
          <h1 className="text-[26px] font-black text-slate-800 tracking-tight">Características do Produto</h1>
          <p className="text-slate-500 text-sm font-medium">Defina especificações técnicas como Composição, Lavagem e outros</p>
        </div>
        <button
          onClick={handleStartCreate}
          disabled={isCreating}
          className="flex items-center justify-center gap-2 bg-[#0158ad] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Nova Característica
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-blue-800">Sobre as Características</h4>
          <p className="text-[11px] text-blue-600 font-medium leading-relaxed mt-0.5">
            Diferente das categorias, as características são especificações detalhadas do produto (Ex: Composição de Tecido, Tipo de Gola).
            Elas aparecerão na ficha técnica do item para auxiliar o vendedor e o cliente.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar característica..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            className="bg-slate-50 border-none rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-blue-100 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="TODOS">Todos Status</option>
            <option value="ATIVA">Ativas</option>
            <option value="INATIVA">Inativas</option>
          </select>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Característica</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Opções</th>

                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Create Form Row */}
              {isCreating && (
                <tr className="bg-blue-50/30 animate-in fade-in zoom-in-95 duration-200">
                  <td className="px-6 py-5">
                    <input
                      type="text"
                      placeholder="Ex: Composição, Tipo de Gola..."
                      className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-5">
                    <input
                      type="text"
                      placeholder="Ex: Algodão, Poliéster, Viscose (separadas por vírgula)"
                      className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={formData.options}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    />
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100 rounded-md">
                      Ativa
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleSave}
                        className="p-2.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all"
                        title="Salvar"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Loading State */}
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-[#0158ad] mx-auto mb-4" size={40} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando características...</p>
                  </td>
                </tr>
              ) : filteredCharacteristics.length === 0 && !isCreating ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    Nenhuma característica encontrada.
                  </td>
                </tr>
              ) : (
                filteredCharacteristics.map((char) => (
                  editingId === char.id ? (
                    // Edit Form Row
                    <tr key={char.id} className="bg-amber-50/30 animate-in fade-in zoom-in-95 duration-200">
                      <td className="px-6 py-5">
                        <input
                          type="text"
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          autoFocus
                        />
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="text"
                          placeholder="Ex: Algodão, Poliéster, Viscose"
                          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                          value={formData.options}
                          onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="appearance-none cursor-pointer bg-white pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:border-slate-300 transition-all"
                        >
                          <option value="ATIVA">Ativa</option>
                          <option value="INATIVA">Inativa</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSave}
                            className="p-2.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all"
                            title="Salvar"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Display Row
                    <tr key={char.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#0158ad] group-hover:text-white transition-all">
                            <Settings2 size={16} />
                          </div>
                          <p className="text-sm font-black text-slate-700">{char.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {char.options ? (
                          <div className="flex flex-wrap gap-1.5">
                            {char.options.split(',').slice(0, 3).map((opt: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                                {opt.trim()}
                              </span>
                            ))}
                            {char.options.split(',').length > 3 && (
                              <span className="px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-md">
                                +{char.options.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">Sem opções</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="relative inline-block">
                          <select
                            value={char.status}
                            onChange={(e) => handleStatusChange(char.id, e.target.value)}
                            className={`appearance-none cursor-pointer bg-white pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:border-slate-300 transition-all ${char.status === 'ATIVA'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                              }`}
                          >
                            <option value="ATIVA">Ativa</option>
                            <option value="INATIVA">Inativa</option>
                          </select>
                          <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${char.status === 'ATIVA' ? 'text-emerald-600' : 'text-rose-600'
                            }`} />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStartEdit(char)}
                            className="p-2.5 text-slate-400 hover:text-[#0158ad] hover:bg-blue-50 rounded-xl transition-all"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(char.id, char.name)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile ListView (Cards) */}
      <div className="block md:hidden space-y-4">
        {isCreating && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 space-y-4 shadow-sm animate-in fade-in zoom-in-95">
            <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">Nova Característica</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nome</label>
                <input
                  type="text"
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cor, Tecido..."
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Opções (separadas por vírgula)</label>
                <textarea
                  rows={2}
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  placeholder="Ex: Azul, Verde, Vermelho"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-[#0158ad] mx-auto mb-4" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando características...</p>
          </div>
        ) : filteredCharacteristics.length === 0 && !isCreating ? (
          <div className="py-20 text-center text-slate-400 font-medium italic">
            Nenhuma característica encontrada.
          </div>
        ) : (
          filteredCharacteristics.map((char) => (
            editingId === char.id ? (
              <div key={char.id} className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-4 shadow-sm animate-in fade-in zoom-in-95">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Editar Característica</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Opções</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-100 transition-all outline-none resize-none"
                      value={formData.options}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                    >
                      <option value="ATIVA">Ativa</option>
                      <option value="INATIVA">Inativa</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={char.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                      <Settings2 size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-700">{char.name}</h4>
                  </div>
                  <div className="relative inline-block">
                    <select
                      value={char.status}
                      onChange={(e) => handleStatusChange(char.id, e.target.value)}
                      className={`appearance-none cursor-pointer bg-white pl-2 pr-6 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200 hover:border-slate-300 transition-all ${char.status === 'ATIVA'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                        }`}
                    >
                      <option value="ATIVA">Ativa</option>
                      <option value="INATIVA">Inativa</option>
                    </select>
                    <ChevronDown size={10} className={`absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none ${char.status === 'ATIVA' ? 'text-emerald-600' : 'text-rose-600'
                      }`} />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opções Disponíveis</p>
                  {char.options ? (
                    <div className="flex flex-wrap gap-1.5">
                      {char.options.split(',').slice(0, 5).map((opt: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-md shadow-sm">
                          {opt.trim()}
                        </span>
                      ))}
                      {char.options.split(',').length > 5 && (
                        <span className="px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-md">
                          +{char.options.split(',').length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 italic">Nenhuma opção cadastrada</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleStartEdit(char)}
                    className="flex-1 py-2 text-slate-500 hover:text-[#0158ad] bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(char.id, char.name)}
                    className="flex-1 py-2 text-slate-500 hover:text-rose-600 bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
};

export default Characteristics;
