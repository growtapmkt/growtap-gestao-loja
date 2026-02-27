
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  AlertCircle,
  FileDown,
  Loader2,
  Eye,
  Edit3,
  Settings,
  RefreshCw,
  Eraser,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  History,
  ExternalLink,
  Download,
  X,
  UploadCloud,
  Barcode,
  Tag,
  Info,
  Package,
  PlusCircle,
  Truck,
  Layers,
  CheckCircle2,
  AlertCircle as AlertIcon,
  ImageOff,
  Check,
  ArrowUpDown,
  Save,
  Save as SaveIcon
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [intelligentData, setIntelligentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // States para variações
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [vColor, setVColor] = useState('');
  const [vSize, setVSize] = useState('');
  const [vQty, setVQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States para edição de variação
  const [editingVariationId, setEditingVariationId] = useState<string | null>(null);
  const [expandedVariationId, setExpandedVariationId] = useState<string | null>(null);
  const [editVColor, setEditVColor] = useState('');
  const [editVSize, setEditVSize] = useState('');
  const [editVQty, setEditVQty] = useState('');

  const [showFilters, setShowFilters] = useState(window.innerWidth >= 768);
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterVisibility, setFilterVisibility] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterStock, setFilterStock] = useState('Todos');

  // States para Ordenação
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Paginação e Bulk Actions
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [location.key, page, limit]); // Recarrega sempre que a localização mudar (ex: voltar da edição) ou paginação

  // Resetar seleção ao mudar página ou limite
  useEffect(() => {
    setSelectedProductIds([]);
  }, [page, limit]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      }).toString();

      const [resProducts, resIntelligent] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/products?${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/inventory/intelligent`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!resProducts.ok) throw new Error('Falha ao carregar produtos');

      const dataProducts = await resProducts.json();
      setProducts(dataProducts.products || []);
      setTotalPages(dataProducts.pages || 1);
      setTotalItems(dataProducts.total || 0);

      if (resIntelligent.ok) {
        const dataIntelligent = await resIntelligent.json();
        setIntelligentData(dataIntelligent.inventory || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalStock = (product: any) => {
    if (product.variations && product.variations.length > 0) {
      return product.variations.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
    }
    return product.availableQty || 0;
  };

  const handleAddVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${selectedProduct.id}/variations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          color: vColor,
          size: vSize,
          quantity: parseInt(vQty)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao adicionar variação');
      }

      setShowVariationForm(false);
      setVColor('');
      setVSize('');
      setVQty('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir produto');
      }

      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredAndSortedProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectToggle = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status: 'Ativo' | 'Inativo') => {
    if (selectedProductIds.length === 0) return;
    setIsBulkLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedProductIds, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao alterar status em massa');
      alert('Status atualizado com sucesso!'); // Idealmente toast
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (deleteConfirmText !== 'CONFIRMAR') {
      alert('Texto de confirmação incorreto.');
      return;
    }
    if (selectedProductIds.length === 0) return;

    setIsBulkLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids: selectedProductIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao deletar produtos');
      alert(data.message); // Idealmente toast
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkLoading(false);
    }
  };



  const handleDeleteVariation = async (variationId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta variação?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/variations/${variationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao excluir variação');
      }

      // Atualizar lista localmente ou recarregar
      if (selectedProduct) {
        const updatedVariations = selectedProduct.variations.filter((v: any) => v.id !== variationId);
        setSelectedProduct({ ...selectedProduct, variations: updatedVariations });

        // Atualizar também na lista principal de produtos
        setProducts(products.map(p =>
          p.id === selectedProduct.id
            ? { ...p, variations: updatedVariations }
            : p
        ));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStartEditVariation = (variation: any) => {
    setEditingVariationId(variation.id);
    setEditVColor(variation.color || '');
    setEditVSize(variation.size || '');
    setEditVQty(variation.quantity.toString());
  };

  const handleCancelEditVariation = () => {
    setEditingVariationId(null);
    setEditVColor('');
    setEditVSize('');
    setEditVQty('');
  };

  const handleSaveVariation = async (variationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/variations/${variationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: parseInt(editVQty)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar variação');
      }

      // Atualizar lista localmente
      if (selectedProduct) {
        const updatedVariations = selectedProduct.variations.map((v: any) =>
          v.id === variationId
            ? { ...v, quantity: parseInt(editVQty) }
            : v
        );
        setSelectedProduct({ ...selectedProduct, variations: updatedVariations });

        // Atualizar também na lista principal de produtos
        setProducts(products.map(p =>
          p.id === selectedProduct.id
            ? { ...p, variations: updatedVariations }
            : p
        ));
      }

      handleCancelEditVariation();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          active: !product.active
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setFilterCode('');
    setFilterName('');
    setFilterStatus('Todos');
    setFilterVisibility('Todos');
    setFilterCategory('Todas');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterStock('Todos');
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Produto', 'Categoria', 'Preço', 'Estoque', 'Status'];
    const rows = filteredAndSortedProducts.map(p => [
      p.sku,
      p.name,
      p.category || '',
      p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      calculateTotalStock(p),
      p.active !== false ? 'Ativo' : 'Inativo'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `estoque-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const enrichedProducts = useMemo(() => {
    return products.map(p => {
      const pVariations = intelligentData.filter(v => v.productId === p.id);

      let bestABC = 'C';
      if (pVariations.some(v => v.abc === 'A')) bestABC = 'A';
      else if (pVariations.some(v => v.abc === 'B')) bestABC = 'B';

      const maxIdle = Math.max(...pVariations.map(v => v.idleDays), 0);
      const totalSales90 = pVariations.reduce((acc, v) => acc + (v.metrics?.last90 || 0), 0);
      const isUrgent = pVariations.some(v => v.insight?.type === 'URGENT');
      const isDanger = pVariations.some(v => v.insight?.type === 'DANGER');

      return {
        ...p,
        intelligent: {
          abc: bestABC,
          idleDays: maxIdle,
          sales90: totalSales90,
          isUrgent,
          isDanger,
          variations: pVariations
        }
      };
    });
  }, [products, intelligentData]);

  const filteredAndSortedProducts = useMemo(() => {
    return enrichedProducts
      .filter(p => {
        // Filtro por Código
        if (filterCode && !p.sku.toLowerCase().includes(filterCode.toLowerCase())) return false;

        // Filtro por Nome
        if (filterName && !p.name.toLowerCase().includes(filterName.toLowerCase())) return false;

        // Filtro por Status
        if (filterStatus !== 'Todos') {
          const isActive = p.active !== false;
          if (filterStatus === 'Ativo' && !isActive) return false;
          if (filterStatus === 'Inativo' && isActive) return false;
        }

        // Filtro por Exibir na loja
        if (filterVisibility !== 'Todos') {
          const isVisible = p.active !== false;
          if (filterVisibility === 'Sim' && !isVisible) return false;
          if (filterVisibility === 'Não' && isVisible) return false;
        }

        // Filtro por Categoria
        if (filterCategory !== 'Todas' && p.category?.name !== filterCategory) return false;

        // Filtro por Preço
        const price = p.price;
        if (filterMinPrice && price < parseFloat(filterMinPrice)) return false;
        if (filterMaxPrice && price > parseFloat(filterMaxPrice)) return false;

        // Filtro por Estoque
        const totalStock = calculateTotalStock(p);
        if (filterStock === 'Com estoque' && totalStock <= 0) return false;
        if (filterStock === 'Sem estoque' && totalStock > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (!sortField) return 0;

        let valA, valB;

        switch (sortField) {
          case 'sku': valA = a.sku; valB = b.sku; break;
          case 'name': valA = a.name; valB = b.name; break;
          case 'category': valA = a.category || ''; valB = b.category || ''; break;
          case 'price': valA = a.price; valB = b.price; break;
          case 'stock': valA = calculateTotalStock(a); valB = calculateTotalStock(b); break;
          case 'sales': valA = a._count?.saleItems || 0; valB = b._count?.saleItems || 0; break;
          case 'active': valA = a.active !== false ? 1 : 0; valB = b.active !== false ? 1 : 0; break;
          case 'mais_vendido': valA = a.intelligent?.sales90 || 0; valB = b.intelligent?.sales90 || 0; break;
          case 'mais_parado': valA = a.intelligent?.idleDays || 0; valB = b.intelligent?.idleDays || 0; break;
          case 'estoque_baixo': valA = calculateTotalStock(a); valB = calculateTotalStock(b); break;
          default: return 0;
        }

        // Ordenação invertida para métricas de "mais" (desc por padrão no primeiro clique)
        if (['mais_vendido', 'mais_parado', 'estoque_baixo'].includes(sortField as string)) {
          if (valA < valB) return sortDirection === 'asc' ? 1 : -1;
          if (valA > valB) return sortDirection === 'asc' ? -1 : 1;
          return 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, filterCode, filterName, filterStatus, filterVisibility, filterCategory, filterMinPrice, filterMaxPrice, filterStock, sortField, sortDirection]);

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-10">
      {/* Breadcrumbs and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
            <Link to="/inventory" className="hover:text-blue-600 transition-colors">Produtos</Link>
            <ChevronRight size={10} />
            <span className="font-medium text-slate-500">Lista de produtos</span>
          </div>
          <h1 className="text-[26px] font-black text-[#1e293b] tracking-tight">Lista de produtos</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={() => navigate('/inventory/new')}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <Plus size={18} /> Adicionar produto
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500">
        <div
          className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest pl-1">Filtros avançados</span>
          </div>
          <button className="text-slate-400 focus:outline-none">
            <ChevronDown size={18} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`transition-all duration-300 ${!showFilters ? 'hidden' : 'block'}`}>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Código ou referência</label>
              <input
                type="text"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                placeholder="Ex: PML-001"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Nome do produto</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ex: Camisola alça"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium"
              >
                <option>Todos</option>
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Exibir na loja</label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer font-medium"
              >
                <option>Todos</option>
                <option>Sim</option>
                <option>Não</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Categorias</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer font-medium"
              >
                <option>Todas</option>
                {Array.from(new Set(products.map(p => p.category?.name).filter(Boolean))).map(catName => (
                  <option key={catName as string}>{catName as string}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Preço do produto</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">até</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Estoque</label>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer font-medium"
              >
                <option>Todos</option>
                <option>Com estoque</option>
                <option>Sem estoque</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Fornecedor / Marca</label>
              <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer font-medium">
                <option>Todos</option>
              </select>
            </div>
          </div>

          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button className="p-2 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <History size={16} />
              </button>
              <button className="p-2 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <Settings size={16} />
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                Limpar filtros
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-blue-100 shadow-lg"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">

        {/* Bulk Actions Bar */}
        {selectedProductIds.length > 0 && (
          <div className="bg-blue-50/50 border-b border-blue-100 p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {selectedProductIds.length}
              </span>
              <span className="text-sm font-bold text-blue-900">
                Produto{selectedProductIds.length > 1 ? 's' : ''} selecionado{selectedProductIds.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => {
                  const val = e.target.value as 'Ativo' | 'Inativo' | '';
                  if (val) handleBulkStatusChange(val);
                  e.target.value = ''; // Reset
                }}
                className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 focus:outline-none transition-colors cursor-pointer shadow-sm"
                disabled={isBulkLoading}
              >
                <option value="">Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 rounded-lg text-sm font-bold transition-colors shadow-sm"
                disabled={isBulkLoading}
              >
                Deletar
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={filteredAndSortedProducts.length > 0 && selectedProductIds.length === filteredAndSortedProducts.length}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedProductIds.length > 0 && selectedProductIds.length < filteredAndSortedProducts.length;
                      }
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('sku')}>
                  Código {sortField === 'sku' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                  {sortField !== 'sku' && <RefreshCw size={10} className="inline ml-1 text-slate-200" />}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('name')}>
                  Produto {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                  {sortField !== 'name' && <RefreshCw size={10} className="inline ml-1 text-slate-200" />}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('category')}>
                  Categoria {sortField === 'category' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                  {sortField !== 'category' && <RefreshCw size={10} className="inline ml-1 text-slate-200" />}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('price')}>
                  Preço {sortField === 'price' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                  {sortField !== 'price' && <RefreshCw size={10} className="inline ml-1 text-slate-200" />}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('stock')}>
                  Estoque {sortField === 'stock' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                  {sortField !== 'stock' && <RefreshCw size={10} className="inline ml-1 text-slate-200" />}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('mais_vendido')}>
                  Giro (90d) {sortField === 'mais_vendido' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                  {sortField !== 'mais_vendido' && <RefreshCw size={10} className="inline ml-1 text-slate-200" />}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleToggleSort('active')}>
                  Status {sortField === 'active' && (sortDirection === 'asc' ? <ChevronUp size={10} className="inline ml-1" /> : <ChevronDown size={10} className="inline ml-1" />)}
                </th>
                <th className="px-6 py-4 text-center">Inteligência</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sincronizando dados...</p>
                  </td>
                </tr>
              ) : filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                    Nenhum produto encontrado. Adicione seu primeiro item no botão acima.
                  </td>
                </tr>
              ) : (
                filteredAndSortedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 cursor-pointer"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => handleSelectToggle(p.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#1e293b] leading-tight">{p.displayId ? `#${p.displayId}` : p.sku.split('-')[0] || p.sku}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Ref: {p.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-[50px] h-[70px] rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            if (p.image) setZoomedImage(p.image);
                          }}
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          ) : (
                            <div className="text-slate-300">
                              <ImageOff size={24} strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-700 leading-snug flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                            {p.name}
                            <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                          </h4>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded uppercase border border-slate-200">
                              {(p.variations || []).length} variações
                            </span>
                            {p.isPromotionalPrice && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-[10px] font-black text-emerald-600 rounded uppercase border border-emerald-200 animate-pulse">
                                OFERTA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">{p.category?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.isPromotionalPrice && p.promotionalPrice ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#1e293b]">R$ {p.promotionalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[10px] font-bold text-slate-400 line-through">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-black text-[#1e293b]">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${calculateTotalStock(p) > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
                        {calculateTotalStock(p) || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-600">{p.intelligent?.sales90 || p._count?.saleItems || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-white shadow-sm flex items-center justify-center w-fit ${p.active !== false ? 'bg-emerald-400' : 'bg-rose-400'}`}>
                        {p.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black border shadow-sm ${p.intelligent?.abc === 'A' ? 'bg-emerald-500 border-emerald-600 text-white' :
                            p.intelligent?.abc === 'B' ? 'bg-amber-400 border-amber-500 text-white' :
                              'bg-slate-200 border-slate-300 text-slate-500'
                            }`}>
                            {p.intelligent?.abc || '-'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">ABC</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setShowVariationForm(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Gerenciar Estoque"
                        >
                          <History size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/inventory/edit/${p.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Eraser size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Exibir:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Resetar página ao mudar limite
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={10}>10 ▼</option>
              <option value={20}>20 ▼</option>
              <option value={30}>30 ▼</option>
            </select>
            <span className="text-xs font-bold text-slate-500 ml-2">
              Mostrando {products.length} de {totalItems} itens
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

        {/* Lista Mobile (Cards) */}
        <div className="block md:hidden space-y-4 p-4">
          {
            isLoading ? (
              <div className="py-20 text-center" >
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sincronizando dados...</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic font-medium">
                Nenhum produto encontrado. Adicione seu primeiro item no botão acima.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <input
                    type="checkbox"
                    id="selectAllMobile"
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                    checked={filteredAndSortedProducts.length > 0 && selectedProductIds.length === filteredAndSortedProducts.length}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedProductIds.length > 0 && selectedProductIds.length < filteredAndSortedProducts.length;
                      }
                    }}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="selectAllMobile" className="text-sm font-bold text-slate-600 cursor-pointer hover:text-slate-800">
                    Selecionar itens visíveis
                  </label>
                </div>
                {filteredAndSortedProducts.map((product) => (
                  <div key={product.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                    <div className="absolute top-4 right-4 z-10">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => handleSelectToggle(product.id)}
                      />
                    </div>
                    <div className="flex gap-4 items-start pr-10">
                      {/* Mobile Image */}
                      <div
                        className="w-[60px] h-[80px] rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm flex items-center justify-center cursor-pointer relative group"
                        onClick={() => {
                          if (product.image) setZoomedImage(product.image);
                        }}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            alt={product.name}
                          />
                        ) : (
                          <div className="text-slate-300">
                            <ImageOff size={20} strokeWidth={1.5} />
                          </div>
                        )}
                        {product.isPromotionalPrice && (
                          <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg shadow-sm uppercase tracking-tighter">
                            SALE
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight line-clamp-2">{product.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU: {product.sku}</p>
                            <span className="text-[10px] text-slate-300">•</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category?.name || '-'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {product.isPromotionalPrice && product.promotionalPrice ? (
                            <div className="flex flex-col items-end">
                              <p className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">R$ {product.promotionalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              <p className="text-xs font-bold text-slate-400 line-through whitespace-nowrap">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                          ) : (
                            <p className="text-lg font-black text-slate-800 tracking-tight whitespace-nowrap">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variações em Estoque</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variations && product.variations.length > 0 ? product.variations.map((v: any, idx: number) => (
                          <div key={idx} className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-bold uppercase tracking-tight flex items-center gap-1 ${v.quantity < 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                            <span>{v.size}</span>
                            {v.color && <span className="text-slate-400">• {v.color}</span>}
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${v.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>{v.quantity}</span>
                          </div>
                        )) : <span className="text-[10px] text-slate-400">-</span>}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${calculateTotalStock(product) > 0
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                        {calculateTotalStock(product) > 0 ? 'Em Estoque' : 'Esgotado'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowVariationForm(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                          title="Gerência Estoque"
                        >
                          <History size={20} />
                        </button>
                        <button
                          onClick={() => navigate(`/inventory/edit/${product.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                          title="Editar"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                          title="Excluir"
                        >
                          <Eraser size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Variation Form Modal */}
      {
        showVariationForm && selectedProduct && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowVariationForm(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Variações</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 max-w-[280px] truncate" title={selectedProduct.name}>
                    {selectedProduct.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowVariationForm(false)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content / List (Accordion) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lista de Variações</h4>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">
                    {selectedProduct.variations?.length || 0} itens
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedProduct.variations && selectedProduct.variations.length > 0 ? (
                    selectedProduct.variations.map((variation: any) => {
                      const isExpanded = expandedVariationId === variation.id;
                      return (
                        <div
                          key={variation.id}
                          className="bg-white border border-slate-100 rounded-lg overflow-hidden transition-all"
                        >
                          {/* Header (Always Visible) */}
                          <div
                            onClick={() => setExpandedVariationId(isExpanded ? null : variation.id)}
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            {/* Left Info */}
                            <div className="flex items-center gap-3">
                              {variation.color ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: variation.color.toLowerCase() }} />
                                  <span className="text-xs font-bold text-slate-700">{variation.color}</span>
                                  <span className="text-slate-300 text-[10px]">|</span>
                                </div>
                              ) : null}
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Tam:</span>
                                <span className="text-xs font-black text-slate-700">{variation.size}</span>
                              </div>
                            </div>

                            {/* Right: Quantity + Chevron */}
                            <div className="flex items-center gap-3">
                              {intelligentData.find(iv => iv.id === variation.id) && (
                                <div className="flex items-center gap-2 mr-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border uppercase ${intelligentData.find(iv => iv.id === variation.id)?.abc === 'A' ? 'bg-emerald-500 border-emerald-600 text-white' :
                                    intelligentData.find(iv => iv.id === variation.id)?.abc === 'B' ? 'bg-amber-400 border-amber-500 text-white' :
                                      'bg-slate-100 border-slate-200 text-slate-400'
                                    }`}>
                                    ABC: {intelligentData.find(iv => iv.id === variation.id)?.abc}
                                  </span>
                                  {intelligentData.find(iv => iv.id === variation.id)!.idleDays > 30 && (
                                    <span className="text-[8px] font-bold text-rose-400 bg-rose-50 px-1 py-0.5 rounded">
                                      {intelligentData.find(iv => iv.id === variation.id)!.idleDays}d parado
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="text-xs font-medium text-slate-600">
                                {variation.quantity} <span className="text-[9px] text-slate-400">un</span>
                              </div>
                              <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>
                          </div>

                          {/* Expanded Content (Edit Fields) */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                              {/* Insight de Inteligência */}
                              {intelligentData.find(iv => iv.id === variation.id)?.insight && (
                                <div className={`mb-3 p-2.5 rounded-lg border ${intelligentData.find(iv => iv.id === variation.id)?.insight.type === 'URGENT' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                  intelligentData.find(iv => iv.id === variation.id)?.insight.type === 'DANGER' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                    'bg-blue-50 border-blue-100 text-blue-700'
                                  }`}>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <AlertCircle size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{intelligentData.find(iv => iv.id === variation.id)?.insight.status}</span>
                                  </div>
                                  <p className="text-[10px] font-bold leading-tight opacity-80">
                                    {intelligentData.find(iv => iv.id === variation.id)?.insight.suggestion}
                                  </p>
                                </div>
                              )}

                              <div className="flex gap-3 items-start">
                                {/* Preço de Venda */}
                                <div className="flex-1 space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Preço de Venda</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">R$</span>
                                    <input
                                      type="text"
                                      placeholder="0,00"
                                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                      defaultValue=""
                                    />
                                  </div>
                                </div>

                                {/* Referência */}
                                <div className="flex-1 space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Referência</label>
                                  <input
                                    type="text"
                                    placeholder="REF-123"
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    defaultValue=""
                                  />
                                </div>

                                {/* Estoque */}
                                <div className="w-28 space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Estoque</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="0"
                                      className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                      value={editingVariationId === variation.id ? editVQty : variation.quantity}
                                      onChange={(e) => {
                                        setEditingVariationId(variation.id);
                                        setEditVQty(e.target.value);
                                      }}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">un</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="text-xs text-slate-400 font-medium">Nenhuma variação encontrada.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer / Action Buttons */}
              <div className="bg-white border-t border-slate-100 p-6 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowVariationForm(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVariationForm(false)}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 active:scale-[0.98] transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all"
          >
            <X size={24} />
          </button>
          <img
            src={zoomedImage}
            alt="Zoom do produto"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Strict Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteConfirmText('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2 shrink-0">
              <AlertCircle size={24} className="text-rose-600" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Tem certeza que deseja deletar os produtos selecionados?
              </h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Essa ação não poderá ser desfeita.<br />
                Digite <span className="font-bold text-slate-800">CONFIRMAR</span> para continuar.
              </p>
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite CONFIRMAR"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-center font-bold tracking-widest focus:outline-none focus:ring-2 transition-all ${deleteConfirmText === 'CONFIRMAR'
                  ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100 text-emerald-700'
                  : deleteConfirmText.length > 0
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 text-rose-700'
                    : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 text-slate-700'
                  }`}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all"
                disabled={isBulkLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleteConfirmText !== 'CONFIRMAR' || isBulkLoading}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50 disabled:bg-rose-400 transition-all flex items-center justify-center gap-2"
              >
                {isBulkLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
