import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Filter,
  CheckCircle, XCircle,
  Tag, Layers, Users, Sun, AlertCircle, Loader2, X, ChevronRight, Info,
  ArrowLeft, Save, ChevronDown, ChevronUp
} from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'PRINCIPAL', // 'PRINCIPAL' or 'SUB'
    parentId: '',
    type: 'ROUPA',
    status: 'ATIVA',
    public: 'UNISSEX',
    seasonality: 'ATEMPORAL'
  });

  // Filter state
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');

  // Expanded categories state (for collapsible subcategories)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao carregar categorias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenForm = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        level: category.parentId ? 'SUB' : 'PRINCIPAL',
        parentId: category.parentId || '',
        type: category.type,
        status: category.status,
        public: category.public,
        seasonality: category.seasonality
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        level: 'PRINCIPAL',
        parentId: '',
        type: 'ROUPA',
        status: 'ATIVA',
        public: 'UNISSEX',
        seasonality: 'ATEMPORAL'
      });
    }
    setView('form');
  };

  const handleCloseForm = () => {
    setView('list');
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingCategory
        ? `${import.meta.env.VITE_API_URL}/categories/${editingCategory.id}`
        : `${import.meta.env.VITE_API_URL}/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.level === 'SUB' ? formData.parentId : null
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchCategories();
        handleCloseForm();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao salvar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir ou inativar a categoria "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao excluir categoria.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Erro ao atualizar status da categoria.');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchName = c.name.toLowerCase().includes(filterName.toLowerCase());
      const matchStatus = filterStatus === 'TODOS' || c.status === filterStatus;
      return matchName && matchStatus;
    });
  }, [categories, filterName, filterStatus]);

  const mainCategories = useMemo(() => {
    return categories.filter(c => !c.parentId);
  }, [categories]);

  // Get hierarchical categories (only parent categories from filtered list)
  const hierarchicalCategories = useMemo(() => {
    return filteredCategories.filter(c => !c.parentId);
  }, [filteredCategories]);

  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return filteredCategories.filter(c => c.parentId === parentId);
  };

  const renderListView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
            <span className="cursor-default">Produtos</span>
            <ChevronRight size={10} />
            <span className="font-medium text-slate-500">Categorias</span>
          </div>
          <h1 className="text-[26px] font-black text-slate-800 tracking-tight">Categorias de Produto</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie a classificação do seu mix de moda</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center justify-center gap-2 bg-[#0158ad] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Layers size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-blue-800">Sobre as Categorias</h4>
          <p className="text-[11px] text-blue-600 font-medium leading-relaxed mt-0.5">
            Organize seus produtos em categorias e subcategorias para facilitar a navegação e o controle de estoque.
            Uma estrutura bem definida ajuda na análise de vendas e reposição.
          </p>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nível</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Público</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Produtos</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-[#0158ad] mx-auto mb-4" size={40} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando categorias...</p>
                  </td>
                </tr>
              ) : hierarchicalCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                <>
                  {hierarchicalCategories.map((category) => {
                    const subcategories = getSubcategories(category.id);
                    const isExpanded = expandedCategories.has(category.id);
                    const hasSubcategories = subcategories.length > 0;

                    return (
                      <React.Fragment key={category.id}>
                        {/* Parent Category Row */}
                        <tr className="hover:bg-slate-50/50 transition-all duration-200 group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              {hasSubcategories && (
                                <button
                                  onClick={() => toggleCategory(category.id)}
                                  className="p-1 hover:bg-slate-200 rounded transition-all"
                                  title={isExpanded ? "Recolher subcategorias" : "Expandir subcategorias"}
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={16} className="text-slate-600" />
                                  ) : (
                                    <ChevronRight size={16} className="text-slate-400" />
                                  )}
                                </button>
                              )}
                              {!hasSubcategories && <div className="w-6" />}
                              <div>
                                <p className="text-sm font-black text-slate-700">{category.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                  {category.description || 'Sem descrição'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-50 text-[#0158ad] text-[9px] font-black uppercase tracking-wider border border-blue-100 rounded-md w-fit">
                                Principal
                              </span>
                              {hasSubcategories && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  ({subcategories.length} sub{subcategories.length > 1 ? 's' : ''})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Users size={12} />
                              <span className="text-[11px] font-bold uppercase tracking-tight">{category.public}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-black text-slate-600">{category._count?.products || 0}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="relative inline-block">
                              <select
                                value={category.status}
                                onChange={(e) => handleStatusChange(category.id, e.target.value)}
                                className={`appearance-none cursor-pointer bg-white pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:border-slate-300 transition-all ${category.status === 'ATIVA'
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                                  }`}
                              >
                                <option value="ATIVA">Ativa</option>
                                <option value="INATIVA">Inativa</option>
                              </select>
                              <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${category.status === 'ATIVA' ? 'text-emerald-600' : 'text-rose-600'
                                }`} />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenForm(category)}
                                className="p-2.5 text-slate-400 hover:text-[#0158ad] hover:bg-blue-50 rounded-xl transition-all"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id, category.name)}
                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Subcategories Rows (only if expanded) */}
                        {isExpanded && subcategories.map((subcat) => (
                          <tr key={subcat.id} className="hover:bg-slate-50/50 transition-all duration-200 group bg-slate-50/30">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 pl-8">
                                <div className="w-0.5 h-8 bg-slate-200 -ml-4 mr-2" />
                                <div>
                                  <p className="text-sm font-bold text-slate-600">{subcat.name}</p>
                                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                    {subcat.description || 'Sem descrição'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider border border-amber-100 rounded-md w-fit">
                                Subcategoria
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Users size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{subcat.public}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-xs font-black text-slate-600">{subcat._count?.products || 0}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="relative inline-block">
                                <select
                                  value={subcat.status}
                                  onChange={(e) => handleStatusChange(subcat.id, e.target.value)}
                                  className={`appearance-none cursor-pointer bg-white pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:border-slate-300 transition-all ${subcat.status === 'ATIVA'
                                    ? 'text-emerald-600'
                                    : 'text-rose-600'
                                    }`}
                                >
                                  <option value="ATIVA">Ativa</option>
                                  <option value="INATIVA">Inativa</option>
                                </select>
                                <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${subcat.status === 'ATIVA' ? 'text-emerald-600' : 'text-rose-600'
                                  }`} />
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenForm(subcat)}
                                  className="p-2.5 text-slate-400 hover:text-[#0158ad] hover:bg-blue-50 rounded-xl transition-all"
                                  title="Editar"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(subcat.id, subcat.name)}
                                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Feed (Cards) */}
      <div className="block md:hidden space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-[#0158ad] mx-auto mb-4" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando categorias...</p>
          </div>
        ) : hierarchicalCategories.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium italic">
            Nenhuma categoria encontrada.
          </div>
        ) : (
          hierarchicalCategories.map((category) => {
            const subcategories = getSubcategories(category.id);
            const hasSubcategories = subcategories.length > 0;
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#0158ad] text-[9px] font-black uppercase tracking-wider border border-blue-100 rounded-md w-fit">
                      Principal
                    </span>
                    <h4 className="text-sm font-black text-slate-700">{category.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{category.description || 'Sem descrição'}</p>
                  </div>
                  <div className="relative inline-block">
                    <select
                      value={category.status}
                      onChange={(e) => handleStatusChange(category.id, e.target.value)}
                      className={`appearance-none cursor-pointer bg-white pl-2 pr-6 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-200 hover:border-slate-300 transition-all ${category.status === 'ATIVA'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                        }`}
                    >
                      <option value="ATIVA">Ativa</option>
                      <option value="INATIVA">Inativa</option>
                    </select>
                    <ChevronDown size={10} className={`absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none ${category.status === 'ATIVA' ? 'text-emerald-600' : 'text-rose-600'
                      }`} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{category.public}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-300 mx-1" />
                  <span className="text-[10px] font-bold text-slate-500">{category._count?.products || 0} produtos</span>
                </div>

                {hasSubcategories && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{subcategories.length} Subcategorias</span>
                      {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {subcategories.map(sub => (
                          <div key={sub.id} className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-700">{sub.name}</p>
                              <p className="text-[9px] text-slate-400 uppercase">{sub.public}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenForm(sub)}
                                className="p-1.5 text-slate-400 hover:text-[#0158ad] bg-slate-50 rounded-lg"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id, sub.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenForm(category)}
                    className="flex-1 py-2 text-slate-500 hover:text-[#0158ad] bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="flex-1 py-2 text-slate-500 hover:text-rose-600 bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderFormView = () => (
    <div className="animate-in slide-in-from-right duration-500">
      {/* External Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCloseForm}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 bg-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span className="cursor-default">Produtos</span>
              <ChevronRight size={10} />
              <span className="font-medium text-slate-500">Categorias</span>
              <ChevronRight size={10} />
              <span className="font-medium text-slate-500">{editingCategory ? 'Editar' : 'Novo'}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Definição de Classificação</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-[#0158ad] uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} /> Nível e Hierarquia
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nível da Categoria <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none cursor-pointer"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option value="PRINCIPAL">Principal</option>
                      <option value="SUB">Subcategoria</option>
                    </select>
                  </div>

                  {formData.level === 'SUB' && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Categoria Principal <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required={formData.level === 'SUB'}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none cursor-pointer"
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      >
                        <option value="">Selecione a categoria pai...</option>
                        {mainCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nome da Categoria ou Sub <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Vestidos, Camisas Polo, Acessórios..."
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição (Opcional)</label>
                  <textarea
                    placeholder="Anotações sobre o que compõe esta categoria..."
                    rows={4}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Other settings */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} /> Configurações
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="ROUPA">Roupa</option>
                      <option value="ACESSORIO">Acessório</option>
                      <option value="CALCADO">Calçado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ATIVA">Ativa</option>
                      <option value="INATIVA">Inativa</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/50 p-8 flex items-center justify-between border-t border-slate-100">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Os campos marcados são obrigatórios para a realização do cadastro.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={handleCloseForm}
              className="flex-1 md:flex-none px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0158ad] hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Categoria
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {view === 'list' ? renderListView() : renderFormView()}
    </div>
  );
};

export default Categories;
