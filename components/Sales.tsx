
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Filter, MoreHorizontal, Eye, CreditCard, Banknote, QrCode, Trash2, Package, CheckCircle2, XCircle, ArrowLeft, Loader2, User, ShoppingCart, Pencil, TrendingUp, ChevronDown, Calendar, UserCheck, RefreshCcw, Eraser } from 'lucide-react';

const Sales: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Checkout States
  const [showPOS, setShowPOS] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [checkoutData, setCheckoutData] = useState({
    clientId: '',
    paymentMethod: 'CASH',
    discountValue: 0,
    discountType: 'FIXED',
    deliveryMethod: 'PICKUP',
    deliveryFee: 0,
    observation: '',
    orderNotes: '',
    clientSearch: ''
  });
  const [clientSearch, setClientSearch] = useState('');
  const [isSearchingClient, setIsSearchingClient] = useState(false);

  // Modal State
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [saleToPay, setSaleToPay] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    paymentMethod: '',
    deliveryMethod: '',
    deliveryFee: 0,
    observation: '',
    orderNotes: '',
    clientId: ''
  });

  // PDV States
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    period: 'all',
    orderType: 'all',
    status: 'all',
    orderId: '',
    customerName: '',
    customerCpf: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      period: 'all',
      orderType: 'all',
      status: 'all',
      orderId: '',
      customerName: '',
      customerCpf: ''
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const preSelectedId = sessionStorage.getItem('pre_selected_client_id');
    if (preSelectedId) {
      setCheckoutData(prev => ({ ...prev, clientId: preSelectedId }));
      setShowPOS(true);
      sessionStorage.removeItem('pre_selected_client_id');
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      const [salesRes, productsRes, clientsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/sales`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/clients`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const salesData = await salesRes.json();
      const productsData = await productsRes.json();
      const clientsData = await clientsRes.json();

      setSales(salesData.sales || []);
      setProducts(productsData.products || []);
      setClients(clientsData.clients || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: any, variation: any) => {
    // Verificar se já existe no carrinho
    const existingIndex = cart.findIndex(item => item.variationId === variation.id);

    if (existingIndex > -1) {
      // Toggle logic: If clicked again, remove from cart
      removeFromCart(variation.id);
    } else {
      if (variation.quantity < 1) {
        alert('Produto sem estoque!');
        return;
      }
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        variationId: variation.id,
        color: variation.color,
        size: variation.size,
        price: product.isPromotionalPrice && product.promotionalPrice ? Number(product.promotionalPrice) : Number(product.price),
        quantity: 1,
        maxStock: variation.quantity
      }]);
    }
  };

  const removeFromCart = (variationId: string) => {
    setCart(cart.filter(item => item.variationId !== variationId));
  };

  const updateCartQuantity = (variationId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.variationId === variationId) {
        const nextQty = item.quantity + delta;
        if (nextQty > 0 && nextQty <= item.maxStock) {
          return { ...item, quantity: nextQty };
        }
      }
      return item;
    });
    setCart(newCart);
  };

  const finalizeSale = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const subtotal = cartTotal;
      let total = subtotal;

      if (checkoutData.discountType === 'PERCENTAGE') {
        total = subtotal - (subtotal * (Number(checkoutData.discountValue) / 100));
      } else {
        total = subtotal - Number(checkoutData.discountValue);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            variationId: item.variationId,
            quantity: item.quantity
          })),
          clientId: checkoutData.clientId || null,
          subtotal: subtotal,
          discount: Number(checkoutData.discountValue),
          discountType: checkoutData.discountType,
          paymentMethod: checkoutData.paymentMethod,
          deliveryMethod: checkoutData.deliveryMethod,
          deliveryFee: Number(checkoutData.deliveryFee),
          observation: checkoutData.observation,
          orderNotes: checkoutData.orderNotes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao finalizar venda');
      }

      setCart([]);
      setShowPOS(false);
      setShowCheckout(false);
      setCheckoutData({
        clientId: '',
        paymentMethod: 'CASH',
        discountValue: 0,
        discountType: 'FIXED',
        deliveryMethod: 'PICKUP',
        deliveryFee: 0,
        observation: ''
      });
      fetchData();
      alert('Venda realizada com sucesso!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmPaySale = async (method: string) => {
    if (!saleToPay) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sales/${saleToPay.id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod: method })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao processar pagamento');

      setShowPayModal(false);
      setSaleToPay(null);
      fetchData();
      alert('Pagamento confirmado!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteRequest = (s: any) => {
    if (s.conditionalId) {
      setSaleToDelete(s);
    } else {
      if (confirm('Deseja realmente excluir esta venda? O estoque será devolvido automaticamente.')) {
        confirmDeleteSale(s.id);
      }
    }
  };

  const confirmDeleteSale = async (id: string, action?: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Tentando excluir venda:', id, action);
      const url = action
        ? `${import.meta.env.VITE_API_URL}/sales/${id}?action=${action}`
        : `${import.meta.env.VITE_API_URL}/sales/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao excluir venda');

      fetchData();
      setSaleToDelete(null);
      alert('Operação concluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert(error.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSale) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Tentando atualizar venda:', selectedSale.id, editForm);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sales/${selectedSale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editForm,
          orderNotes: editForm.orderNotes
        })
      });

      const data = await response.json();
      console.log('Resposta do servidor (update):', data);

      if (!response.ok) throw new Error(data.message || 'Erro ao atualizar venda');

      fetchData();
      setShowViewModal(false);
      setIsEditMode(false);
      alert('Venda atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro na atualização:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredSales = sales.filter(s => {
    const matchesOrderId = !appliedFilters.orderId || s.id.toLowerCase().includes(appliedFilters.orderId.toLowerCase());
    const matchesCustomer = !appliedFilters.customerName || (s.client?.name || '').toLowerCase().includes(appliedFilters.customerName.toLowerCase());
    const matchesCpf = !appliedFilters.customerCpf || (s.client?.cpf || '').includes(appliedFilters.customerCpf);

    // Filtro de Período
    if (appliedFilters.period !== 'all') {
      const saleDate = new Date(s.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > Number(appliedFilters.period)) return false;
    }

    return matchesOrderId && matchesCustomer && matchesCpf;
  });

  const stats = {
    totalOrders: filteredSales.length,
    totalValue: filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0),
    totalItems: filteredSales.reduce((acc, s) => acc + (s.items?.reduce((a: number, i: any) => a + Number(i.quantity || 0), 0) || 0), 0),
    avgTicket: filteredSales.length > 0 ? filteredSales.reduce((acc, s) => acc + Number(s.total || 0), 0) / filteredSales.length : 0
  };

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    const hasStock = p.variations?.some((v: any) => v.quantity > 0);
    return hasStock && ((p.name?.toLowerCase().includes(query)) || (p.sku?.toLowerCase().includes(query)));
  });

  return (
    <div className="space-y-8">
      {!showPOS ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Lista de Vendas</h2>
              <p className="text-slate-500">Acompanhe o histórico de todas as transações.</p>
            </div>
            <button
              onClick={() => setShowPOS(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0158ad] text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-100 transition-all"
            >
              <Plus size={20} />
              Nova Venda (PDV)
            </button>
          </div>

          {/* Stats Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 group hover:border-blue-500/20 transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                  Pedidos <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                </p>
                <p className="text-lg font-black text-slate-800 tracking-tight">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 group hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Banknote size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                  Total dos pedidos <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                </p>
                <p className="text-lg font-black text-slate-800 tracking-tight">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 group hover:border-indigo-500/20 transition-all">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <ShoppingCart size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                  Produtos vendidos <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                </p>
                <p className="text-lg font-black text-slate-800 tracking-tight">{stats.totalItems}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 group hover:border-amber-500/20 transition-all">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                  Ticket médio <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                </p>
                <p className="text-lg font-black text-slate-800 tracking-tight">R$ {stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-sm">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-6 py-4 flex items-center justify-between text-slate-700 font-black hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 text-[#0158ad] uppercase tracking-widest text-[10px]">
                <Filter size={16} />
                <span>Exibir Filtros</span>
              </div>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {showFilters && (
              <div className="px-6 pb-6 space-y-4 border-t border-slate-50 pt-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Período</label>
                    <div className="relative">
                      <select
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                        value={filters.period}
                        onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                      >
                        <option value="all">Sempre</option>
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Listar pedidos</label>
                    <div className="relative">
                      <select
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                        value={filters.orderType}
                        onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
                      >
                        <option value="all">Todos</option>
                        <option value="online">Online</option>
                        <option value="pos">Venda Local</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <div className="relative">
                      <select
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      >
                        <option value="all">Todos</option>
                        <option value="paid">Pago</option>
                        <option value="pending">Pendente</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Código do pedido</label>
                    <input
                      type="text"
                      placeholder="26757"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                      value={filters.orderId}
                      onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome</label>
                    <input
                      type="text"
                      placeholder="Digite o nome do cliente..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                      value={filters.customerName}
                      onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CPF ou CNPJ</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                      value={filters.customerCpf}
                      onChange={(e) => setFilters({ ...filters, customerCpf: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-50">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    <Eraser size={14} /> Limpar Filtros
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="flex items-center gap-2 px-6 py-2 bg-[#0158ad] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-100 transition-all"
                  >
                    <Filter size={14} /> Filtrar Resultados
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left min-w-[900px] whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Venda ID</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Vendedor</th>
                    <th className="px-6 py-4 text-center">Itens</th>
                    <th className="px-6 py-4 text-center">Pagamento</th>
                    <th className="px-6 py-4 text-center">Entrega</th>
                    <th className="px-6 py-4 text-center">Data</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center">
                        <Loader2 className="animate-spin inline-block text-[#0158ad] mb-2" size={32} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Sincronizando registros...</p>
                      </td>
                    </tr>
                  ) : filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center text-slate-400 italic font-medium uppercase text-[10px] tracking-widest">Nenhuma venda encontrada.</td>
                    </tr>
                  ) : filteredSales.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">#{s.id.split('-')[0]}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">{s.client?.name || 'Venda Rápida'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600">{s.user?.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-600 opacity-80">{s.items?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.paymentStatus === 'PENDING' ? (
                          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-orange-100 text-orange-600 uppercase animate-pulse border border-orange-200 shadow-sm">
                            AGUARDANDO PAGAMENTO
                          </span>
                        ) : (
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${s.paymentMethod === 'PIX' ? 'bg-teal-50 text-teal-600' :
                            s.paymentMethod === 'CASH' ? 'bg-green-50 text-green-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                            {s.paymentMethod === 'CASH' ? 'DINHEIRO' : s.paymentMethod === 'CREDIT_CARD' ? 'CARTÃO DE CRÉDITO' : s.paymentMethod === 'DEBIT_CARD' ? 'CARTÃO DE DÉBITO' : s.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                        {s.deliveryMethod === 'PICKUP' ? 'Retirada' : 'Entrega'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">
                        {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right text-lg font-black text-slate-800">
                        R$ {Number(s.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedSale(s);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-[#0158ad] hover:bg-blue-50 rounded-lg transition-all"
                            title="Visualizar"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSale(s);
                              setEditForm({
                                paymentMethod: s.paymentMethod,
                                deliveryMethod: s.deliveryMethod,
                                deliveryFee: s.deliveryFee || 0,
                                observation: s.observation || '',
                                orderNotes: s.orderNotes || '',
                                clientId: s.clientId || ''
                              });
                              setIsEditMode(true);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(s)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                          {s.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSaleToPay(s);
                                setShowPayModal(true);
                              }}
                              className="ml-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase rounded-lg hover:bg-emerald-200 transition-colors shadow-sm"
                              title="Pagar Agora"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List (Cards) */}
            <div className="block md:hidden space-y-4 p-4">
              {filteredSales.length === 0 && !isLoading && (
                <div className="text-center py-10 text-slate-400 italic text-sm">
                  Nenhuma venda encontrada.
                </div>
              )}
              {filteredSales.map((s) => (
                <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">#{s.id.split('-')[0]}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{s.client?.name || 'Venda Rápida'}</h4>
                      <p className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString('pt-BR')} • {new Date(s.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className="text-xl font-black text-[#0158ad]">R$ {Number(s.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {s.paymentStatus === 'PENDING' ? (
                      <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-orange-100 text-orange-600 uppercase border border-orange-200">
                        AGUARDANDO PAGAMENTO
                      </span>
                    ) : (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${s.paymentMethod === 'PIX' ? 'bg-teal-50 text-teal-600' :
                        s.paymentMethod === 'CASH' ? 'bg-green-50 text-green-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                        {s.paymentMethod === 'CASH' ? 'DINHEIRO' : s.paymentMethod === 'CREDIT_CARD' ? 'CARTÃO DE CRÉDITO' : s.paymentMethod === 'DEBIT_CARD' ? 'CARTÃO DE DÉBITO' : s.paymentMethod}
                      </span>
                    )}
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-orange-50 text-orange-600 uppercase border border-orange-100">
                      {s.deliveryMethod === 'PICKUP' ? 'Retirada' : 'Entrega'}
                    </span>
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-purple-50 text-purple-600 uppercase border border-purple-100">
                      {s.items?.length || 0} Itens
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedSale(s);
                        setShowViewModal(true);
                      }}
                      className="p-2 bg-slate-50 text-slate-500 hover:text-[#0158ad] hover:bg-blue-50 rounded-xl transition-all border border-slate-100"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSale(s);
                        setEditForm({
                          paymentMethod: s.paymentMethod,
                          deliveryMethod: s.deliveryMethod,
                          deliveryFee: s.deliveryFee || 0,
                          observation: s.observation || '',
                          orderNotes: s.orderNotes || '',
                          clientId: s.clientId || ''
                        });
                        setIsEditMode(true);
                        setShowViewModal(true);
                      }}
                      className="p-2 bg-slate-50 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-slate-100"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(s)}
                      className="p-2 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
                    >
                      <Trash2 size={20} />
                    </button>
                    {s.paymentStatus === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSaleToPay(s);
                          setShowPayModal(true);
                        }}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 font-black text-xs uppercase rounded-xl hover:bg-emerald-200 transition-colors border border-emerald-200 shadow-sm"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Lado Esquerdo: Busca de Produtos ou Checkout */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {!showCheckout ? (
              <>
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowPOS(false)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-2xl font-black text-slate-800">Ponto de Venda</h3>
                </div>

                <div className="relative sticky top-0 z-20 bg-slate-50 pb-3 pt-1 md:static md:bg-transparent md:p-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou SKU..."
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#0158ad]/10 shadow-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[55vh] md:h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-0">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-bold text-slate-800 leading-tight text-sm line-clamp-2">{p.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">SKU: {p.sku}</p>
                        </div>
                        <div className="text-right">
                          {p.isPromotionalPrice && p.promotionalPrice ? (
                            <>
                              <p className="text-[10px] font-bold text-slate-400 line-through">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              <p className="text-base font-black text-emerald-600 whitespace-nowrap">R$ {p.promotionalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </>
                          ) : (
                            <p className="text-base font-black text-slate-800 whitespace-nowrap">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {p.variations.map((v: any) => {
                          const isSelected = cart.some(item => item.variationId === v.id);
                          return (
                            <button
                              key={v.id}
                              onClick={() => {
                                if (isSelected) {
                                  removeFromCart(v.id);
                                } else {
                                  addToCart(p, v);
                                }
                              }}
                              disabled={v.quantity <= 0}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-0.5 min-w-[50px] ${isSelected
                                ? 'border-[#0158ad] bg-[#0158ad] text-white shadow-md'
                                : v.quantity > 0
                                  ? 'border-slate-100 bg-slate-50 text-slate-700 hover:border-[#0158ad] hover:bg-blue-50 hover:text-[#0158ad]'
                                  : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                                }`}
                            >
                              <span>{v.size} {v.color && `• ${v.color}`}</span>
                              <span className={`text-[8px] ${isSelected ? 'opacity-90' : 'opacity-70'}`}>Q: {v.quantity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Checkout Section (omitted specific lines for brevity, assume unchanged logic)
              <div className="space-y-6 h-full md:h-auto flex flex-col">
                <div className="flex items-center gap-4 bg-slate-50 z-10">
                  <button onClick={() => setShowCheckout(false)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800">Detalhes do Pagamento</h3>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1 md:flex-none overflow-y-auto md:overflow-visible pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                    {/* Row 1: Cliente & Descontos */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                        <User size={14} /> Cliente
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Search size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Buscar cliente..."
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />
                        {clientSearch.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                              <button
                                onClick={() => {
                                  setCheckoutData({ ...checkoutData, clientId: '' });
                                  setClientSearch('');
                                }}
                                className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 transition-colors"
                              >
                                <div>
                                  <p className="text-sm font-black text-[#0158ad]">Venda Rápida</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consumidor Final</p>
                                </div>
                                {!checkoutData.clientId && <CheckCircle2 size={16} className="text-emerald-500" />}
                              </button>

                              {clients
                                .filter(c =>
                                  c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                  (c.cpf && c.cpf.includes(clientSearch))
                                )
                                .map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => {
                                      setCheckoutData({ ...checkoutData, clientId: c.id });
                                      setClientSearch('');
                                    }}
                                    className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                                  >
                                    <div>
                                      <p className="text-sm font-black text-slate-700">{c.name}</p>
                                      {c.cpf && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CPF: {c.cpf}</p>}
                                    </div>
                                    {checkoutData.clientId === c.id && <CheckCircle2 size={16} className="text-emerald-500" />}
                                  </button>
                                ))
                              }

                              {clients.filter(c =>
                                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                (c.cpf && c.cpf.includes(clientSearch))
                              ).length === 0 && (
                                  <div className="p-8 text-center">
                                    <p className="text-sm text-slate-400 font-medium">Nenhum cliente encontrado</p>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                      {!clientSearch && !checkoutData.clientId && (
                        <p className="text-[10px] text-blue-500 font-black uppercase mt-1 px-1 flex items-center gap-1">✓ Selecionado: Venda Rápida</p>
                      )}
                      {!clientSearch && checkoutData.clientId && (
                        <p className="text-[10px] text-emerald-500 font-black uppercase mt-1 px-1 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Selecionado: {clients.find(c => c.id === checkoutData.clientId)?.name}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Tipo Desconto</label>
                        <select
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0158ad]/20"
                          value={checkoutData.discountType}
                          onChange={(e) => setCheckoutData({ ...checkoutData, discountType: e.target.value })}
                        >
                          <option value="FIXED">Valor Fixo</option>
                          <option value="PERCENTAGE">Porcentagem</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Valor Desconto</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0158ad]/20"
                          placeholder="0,00"
                          value={checkoutData.discountValue === 0 ? '' : checkoutData.discountValue}
                          onChange={(e) => setCheckoutData({ ...checkoutData, discountValue: e.target.value === '' ? 0 : Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Row 2: Pagamento & Entrega + Frete */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                        <CreditCard size={14} /> Forma de Pagamento
                      </label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'A_COMBINAR'].map(method => (
                          <button
                            key={method}
                            onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: method })}
                            className={`px-3 py-3 rounded-xl border font-bold text-[10px] transition-all flex items-center justify-center gap-2 ${checkoutData.paymentMethod === method
                              ? method === 'A_COMBINAR'
                                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                                : 'bg-[#0158ad] text-white border-[#0158ad] shadow-lg shadow-blue-500/20'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                              }`}
                          >
                            {method === 'CASH' ? 'DINHEIRO' : method === 'CREDIT_CARD' ? 'CRÉDITO' : method === 'DEBIT_CARD' ? 'DÉBITO' : method === 'A_COMBINAR' ? 'PAGAR DEPOIS' : 'PIX'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                          <Package size={14} className="text-slate-400" /> Tipo de Entrega
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setCheckoutData({ ...checkoutData, deliveryMethod: 'PICKUP', deliveryFee: 0 })}
                            className={`px-3 py-3 rounded-xl border font-bold text-[10px] transition-all ${checkoutData.deliveryMethod === 'PICKUP'
                              ? 'bg-[#0158ad] text-white border-[#0158ad] shadow-lg shadow-blue-500/20'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                              }`}
                          >
                            RETIRADA
                          </button>
                          <button
                            onClick={() => setCheckoutData({ ...checkoutData, deliveryMethod: 'DELIVERY' })}
                            className={`px-3 py-3 rounded-xl border font-bold text-[10px] transition-all ${checkoutData.deliveryMethod === 'DELIVERY'
                              ? 'bg-[#0158ad] text-white border-[#0158ad] shadow-lg shadow-blue-500/20'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                              }`}
                          >
                            ENTREGA
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Frete (R$)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0158ad]/20"
                          placeholder="0,00"
                          value={checkoutData.deliveryFee === 0 ? '' : checkoutData.deliveryFee}
                          onChange={(e) => setCheckoutData({ ...checkoutData, deliveryFee: e.target.value === '' ? 0 : Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Row 3: Notas */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Notas</label>
                      <textarea
                        rows={2}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0158ad]/20"
                        placeholder="..."
                        value={checkoutData.orderNotes}
                        onChange={(e) => setCheckoutData({ ...checkoutData, orderNotes: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Obs. Interna</label>
                      <textarea
                        rows={2}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="..."
                        value={checkoutData.observation}
                        onChange={(e) => setCheckoutData({ ...checkoutData, observation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Floating Bottom Bar — Mobile only, shown when cart has items and not in checkout */}
          {!showCheckout && cart.length > 0 && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 animate-in slide-in-from-bottom-4 duration-300 pb-[env(safe-area-inset-bottom)]">
              <div className="bg-slate-900 mx-3 mb-6 rounded-[24px] px-5 py-4 shadow-2xl flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)} {cart.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'item' : 'itens'} selecionados
                  </span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight leading-tight">
                    R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="shrink-0 px-6 py-3 bg-[#0158ad] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  Continuar <ArrowLeft className="rotate-180" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Lado Direito: Carrinho e Finalização */}
          <div className={`${showCheckout ? 'flex' : 'hidden md:flex'} lg:col-span-5 xl:col-span-4 flex-col h-auto md:sticky md:top-6 md:h-[calc(100vh-140px)]`}>
            <div className={`bg-slate-900 md:rounded-[32px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-8 md:p-8 flex flex-col flex-1 shadow-2xl text-white overflow-hidden ${cart.length === 0 ? 'rounded-[32px]' : 'rounded-t-[32px] md:rounded-l-[32px]'}`}>
              <div className="flex items-center gap-3 mb-6 md:mb-8 shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <ShoppingCart size={20} className="text-emerald-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Carrinho</h3>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 md:space-y-4 pr-2 custom-scrollbar-white max-h-[30vh] md:max-h-none">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30 italic py-10">
                    <Package size={48} />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Vazio</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.variationId} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl group transition-all hover:bg-white/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-bold truncate uppercase tracking-tight">{item.productName}</p>
                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {item.color} • {item.size} <span className="text-emerald-400 ml-1">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-black/40 rounded-lg p-1">
                          <button onClick={() => updateCartQuantity(item.variationId, -1)} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded font-bold">-</button>
                          <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.variationId, 1)} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded font-bold">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.variationId)} className="p-1.5 text-white/50 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                {showCheckout && (
                  <div className="space-y-2 mb-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {checkoutData.discountValue > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-bold text-red-400 uppercase tracking-widest">
                        <span>Desconto ({checkoutData.discountType === 'PERCENTAGE' ? `${checkoutData.discountValue}%` : 'Fixo'})</span>
                        <span>
                          - R$ {checkoutData.discountType === 'PERCENTAGE'
                            ? (cartTotal * (checkoutData.discountValue / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : checkoutData.discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {Number(checkoutData.deliveryFee) > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        <span>Frete</span>
                        <span>+ R$ {Number(checkoutData.deliveryFee).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 !mt-3 !pt-2"></div>
                  </div>
                )}
                <div className="flex justify-between items-center text-white pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor Total</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tight">
                    R$ {(() => {
                      const sub = cartTotal;
                      let total = sub;
                      if (checkoutData.discountType === 'PERCENTAGE') {
                        total = sub - (sub * (checkoutData.discountValue / 100));
                      } else {
                        total = sub - checkoutData.discountValue;
                      }
                      return (total + Number(checkoutData.deliveryFee)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  {!showCheckout ? (
                    <>
                      <button
                        onClick={() => {
                          setCart([]);
                          setShowPOS(false);
                        }}
                        className="flex-1 md:hidden py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        disabled={cart.length === 0}
                        onClick={() => setShowCheckout(true)}
                        className="flex-[2] md:w-full py-4 md:py-5 bg-[#0158ad] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        Continuar <ArrowLeft className="rotate-180" size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 md:hidden py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                      >
                        Voltar
                      </button>
                      <button
                        disabled={cart.length === 0 || isSubmitting}
                        onClick={finalizeSale}
                        className="flex-[2] md:w-full py-4 md:py-5 bg-[#0158ad] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> ...</> : <>Finalizar Venda <CheckCircle2 size={18} /></>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Visualização da Venda */}
      {showViewModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${isEditMode ? 'bg-amber-500' : 'bg-[#0158ad]'} rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors`}>
                  {isEditMode ? <Pencil size={28} /> : <ShoppingCart size={28} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">
                    {isEditMode ? 'Editar Venda' : `Venda #${selectedSale.id.split('-')[0].toUpperCase()}`}
                  </h3>
                  <p className="text-slate-500 font-medium">{new Date(selectedSale.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setIsEditMode(false);
                }}
                className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors"
              >
                <XCircle size={32} />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Grid de Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-[#0158ad]" /> Cliente
                  </label>
                  {isEditMode ? (
                    <select
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editForm.clientId}
                      onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
                    >
                      <option value="">Venda Rápida</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-800">{selectedSale.client?.name || 'Venda Rápida'}</p>
                  )}
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} className="text-[#0158ad]" /> Pagamento
                  </label>
                  {isEditMode ? (
                    <select
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editForm.paymentMethod}
                      onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    >
                      <option value="CASH">Dinheiro</option>
                      <option value="CREDIT_CARD">Cartão de Crédito</option>
                      <option value="DEBIT_CARD">Cartão de Débito</option>
                      <option value="PIX">PIX</option>
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-slate-800">
                      {selectedSale.paymentMethod === 'CASH' ? 'Dinheiro' :
                        selectedSale.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' :
                          selectedSale.paymentMethod === 'DEBIT_CARD' ? 'Cartão de Débito' : 'PIX'}
                    </span>
                  )}
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} className="text-[#0158ad]" /> Entrega
                  </label>
                  {isEditMode ? (
                    <select
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editForm.deliveryMethod}
                      onChange={(e) => setEditForm({ ...editForm, deliveryMethod: e.target.value })}
                    >
                      <option value="PICKUP">Retirada na Loja</option>
                      <option value="DELIVERY">Entrega / Motoboy</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-slate-800">
                      {selectedSale.deliveryMethod === 'PICKUP' ? 'Retirada na Loja' : 'Entrega / Motoboy'}
                    </p>
                  )}
                </div>
              </div>

              {/* Valor do Motoboy no detalhe/edição */}
              {((isEditMode && editForm.deliveryMethod === 'DELIVERY') || (!isEditMode && selectedSale.deliveryMethod === 'DELIVERY')) && (
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-3 animate-in fade-in">
                  <label className="text-[10px] font-black text-[#0158ad] uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} /> Valor da Entrega / Motoboy
                  </label>
                  {isEditMode ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editForm.deliveryFee === 0 ? '' : editForm.deliveryFee}
                      onChange={(e) => setEditForm({ ...editForm, deliveryFee: e.target.value === '' ? 0 : Number(e.target.value) })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-800">
                      {selectedSale.deliveryFee > 0 ? `R$ ${selectedSale.deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Grátis'}
                    </p>
                  )}
                </div>
              )}

              {/* Tabela de Itens (Desabilitada na edição por segurança de estoque) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pl-2">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Itens da Venda</h4>
                  {isEditMode && <span className="text-[10px] text-amber-600 font-black uppercase">Edição de itens desativada (controle de estoque)</span>}
                </div>
                <div className="border border-slate-100 rounded-3xl overflow-hidden opacity-90">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4 text-center">Tamanho</th>
                        <th className="px-6 py-4 text-center">Qtd</th>
                        <th className="px-6 py-4 text-right">Preço Unit.</th>
                        <th className="px-6 py-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {selectedSale.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-bold text-slate-700">{item.variation.product.name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-600">
                              {item.variation.size}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-500">R$ {Number(item.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-800">R$ {Number(item.unitPrice * item.quantity || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observações e Totais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Notas do Pedido</label>
                    {isEditMode ? (
                      <textarea
                        rows={4}
                        className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Notas que aparecem no recibo"
                        value={editForm.orderNotes}
                        onChange={(e) => setEditForm({ ...editForm, orderNotes: e.target.value })}
                      />
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl min-h-[100px]">
                        <p className="text-sm text-slate-600 italic">
                          {selectedSale.orderNotes || 'Sem notas para o pedido.'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center h-4">Observações Internas</label>
                    {isEditMode ? (
                      <textarea
                        rows={2}
                        className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Observações internas"
                        value={editForm.observation}
                        onChange={(e) => setEditForm({ ...editForm, observation: e.target.value })}
                      />
                    ) : (
                      <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl min-h-[60px]">
                        <p className="text-sm text-slate-600 italic">
                          {selectedSale.observation || 'Sem observações internas.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-slate-400 text-sm">
                    <span>Subtotal Bruto</span>
                    <span className="font-bold">
                      R$ {(() => {
                        const calculatedSub = selectedSale.items.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0);
                        return Number(calculatedSub || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      })()}
                    </span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between items-center text-red-400 text-sm">
                      <span>Desconto ({selectedSale.discountType === 'PERCENTAGE' ? `${selectedSale.discount}%` : 'Fixo'})</span>
                      <span className="font-bold">
                        - R$ {selectedSale.discountType === 'PERCENTAGE'
                          ? Number(selectedSale.subtotal * (selectedSale.discount / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : Number(selectedSale.discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {/* Taxa de Entrega Dinâmica na Edição */}
                  {((isEditMode && editForm.deliveryMethod === 'DELIVERY') || (!isEditMode && selectedSale.deliveryMethod === 'DELIVERY')) && (
                    <div className="flex justify-between items-center text-blue-400 text-sm">
                      <span>Taxa de Entrega</span>
                      <span className="font-bold">
                        {isEditMode
                          ? (Number(editForm.deliveryFee) > 0 ? `+ R$ ${Number(editForm.deliveryFee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Grátis')
                          : (selectedSale.deliveryFee > 0 ? `+ R$ ${Number(selectedSale.deliveryFee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Grátis')}
                      </span>
                    </div>
                  )}

                  <div className="h-[1px] bg-white/10 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total da Venda</span>
                    <span className="text-3xl font-black text-emerald-400">
                      R$ {(() => {
                        const calculatedSub = selectedSale.items.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0);
                        const disc = selectedSale.discount || 0;
                        let total = calculatedSub;

                        // Aplicar desconto original
                        if (selectedSale.discountType === 'PERCENTAGE') {
                          total = calculatedSub - (calculatedSub * (disc / 100));
                        } else {
                          total = calculatedSub - disc;
                        }

                        // Aplicar frete atual (seja da edição ou do original)
                        const currentFee = isEditMode ? Number(editForm.deliveryFee) : (selectedSale.deliveryFee || 0);
                        const currentMethod = isEditMode ? editForm.deliveryMethod : selectedSale.deliveryMethod;

                        if (currentMethod === 'DELIVERY') {
                          total += Number(currentFee);
                        }

                        return total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setIsEditMode(false);
                }}
                className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-300 transition-all"
              >
                {isEditMode ? 'Cancelar' : 'Fechar'}
              </button>
              {isEditMode ? (
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Alterações'}
                </button>
              ) : (
                <button className="px-8 py-4 bg-[#0158ad] text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all flex items-center gap-2">
                  Imprimir Comprovante <Banknote size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Reverter Condicional */}
      {saleToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Venda de Condicional</h3>
              <p className="text-sm text-slate-500 font-medium px-4">
                Esta venda possui vínculo com uma condicional. O que você deseja fazer com as peças que foram vendidas?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => confirmDeleteSale(saleToDelete.id, 'REVERT_TO_CONDITIONAL')}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 text-[#0158ad] rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-blue-100 group shadow-sm hover:shadow-md"
              >
                <span className="font-black">Voltar peças para "Aguardando"</span>
                <span className="text-[10px] font-bold opacity-80 text-center">A condicional voltará à tela inicial e passará a conter apenas as peças vinculadas à esta venda. Nada mudará no Estoque.</span>
              </button>

              <button
                onClick={() => confirmDeleteSale(saleToDelete.id, 'DELETE_ALL')}
                className="w-full p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border border-red-100 group"
              >
                <span className="font-black">Excluir tudo e devolver ao Estoque</span>
                <span className="text-[10px] font-bold opacity-70">Anula a Venda e a Condicional.</span>
              </button>
            </div>

            <button
              onClick={() => setSaleToDelete(null)}
              className="w-full p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal Pagamento Pendente */}
      {showPayModal && saleToPay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <Banknote size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirmar Pagamento</h3>
              <p className="text-sm text-slate-500 font-medium">
                Venda de <strong className="text-slate-700">{saleToPay?.client?.name || 'Cliente'}</strong> no valor de <strong className="text-[#0158ad]">R$ {Number(saleToPay?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>. Qual foi a forma de pagamento real?
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Dinheiro', value: 'CASH', icon: Banknote },
                { label: 'Cartão de Crédito', value: 'CREDIT_CARD', icon: CreditCard },
                { label: 'Cartão de Débito', value: 'DEBIT_CARD', icon: CreditCard },
                { label: 'PIX', value: 'PIX', icon: QrCode }
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => confirmPaySale(method.value)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-700 font-black rounded-2xl transition-all border border-slate-100 uppercase tracking-widest text-xs"
                >
                  <div className="flex items-center gap-3">
                    <method.icon size={16} className="text-slate-400" />
                    {method.label}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPayModal(false);
                setSaleToPay(null);
              }}
              className="w-full p-4 text-slate-400 hover:text-slate-600 font-black tracking-widest text-xs uppercase transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sales;
