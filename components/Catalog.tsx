
import React, { useState, useEffect } from 'react';
import { ShoppingCart, MessageCircle, Heart, Search, Filter, Facebook, Instagram, Twitter, Loader2, X, Share2, Store, ChevronRight, Package, Globe, Users, Star, Minus, Plus, Check, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';

interface Product {
   id: string;
   name: string;
   price: number;
   image: string | null;
   sku: string;
   category?: { name: string };
   variations?: any[];
   tag?: string;
   createdAt?: string;
}

const Catalog: React.FC = () => {
   const [products, setProducts] = useState<Product[]>([]);
   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
   const [categories, setCategories] = useState<string[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
   const [cart, setCart] = useState<Product[]>([]);
   const [isCartOpen, setIsCartOpen] = useState(false);
   const [settings, setSettings] = useState<any>({});

   // Detail View State
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [currentQty, setCurrentQty] = useState(1);
   const [selectedColor, setSelectedColor] = useState<string | null>(null);
   const [selectedSize, setSelectedSize] = useState<string | null>(null);

   useEffect(() => {
      fetchProducts();
      fetchSettings();
   }, []);

   useEffect(() => {
      filterProducts();
   }, [searchTerm, selectedCategory, products]);

   // When opening a product, reset states
   const openProductDetail = (product: Product) => {
      setSelectedProduct(product);
      setCurrentQty(1);
      setSelectedColor(null);
      setSelectedSize(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const closeProductDetail = () => {
      setSelectedProduct(null);
   };

   const incrementQty = () => setCurrentQty(prev => prev + 1);
   const decrementQty = () => setCurrentQty(prev => (prev > 1 ? prev - 1 : 1));

   const handleWhatsAppDetail = () => {
      if (!selectedProduct) return;
      const phoneNumber = '5511999999999'; // Substitua
      let message = `Olá! Gostaria de encomendar o produto:\n\n*${selectedProduct.name}*\nRef: ${selectedProduct.sku}\nPreço Unit.: R$ ${selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

      if (selectedColor) message += `Cor: ${selectedColor}\n`;
      if (selectedSize) message += `Tamanho: ${selectedSize}\n`;
      message += `Quantidade: ${currentQty}\n`;
      message += `\n*Total estimado: R$ ${(selectedProduct.price * currentQty).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*`;

      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
   };

   const fetchProducts = async () => {
      setIsLoading(true);
      try {
         const token = localStorage.getItem('token');
         // Usando query param para trazer apenas ativos e exibir no catálogo se houver essa flag
         // Por enquanto trazemos todos e filtramos no front ou usamos a query string se a API suportar
         const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });

         if (!response.ok) throw new Error('Falha ao carregar produtos');

         const data = await response.json();
         const allProducts = data.products || [];

         // Filtrar apenas produtos ativos e visíveis no catálogo (assumindo que existe essa flag, senão apenas ativos)
         const activeProducts = allProducts.filter((p: any) => p.active !== false); // Ajuste conforme sua regra de negócio

         setProducts(activeProducts);

         // Extrair categorias únicas
         const cats = Array.from(new Set(activeProducts.map((p: any) => p.category?.name).filter(Boolean))) as string[];
         setCategories(cats);

      } catch (error) {
         console.error('Erro ao buscar catálogo:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const filterProducts = () => {
      let filtered = products;

      if (searchTerm) {
         const lowerTerm = searchTerm.toLowerCase();
         filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(lowerTerm) ||
            p.sku.toLowerCase().includes(lowerTerm)
         );
      }

      if (selectedCategory !== 'Todos') {
         filtered = filtered.filter(p => p.category?.name === selectedCategory);
      }

      setFilteredProducts(filtered);
   };

   const handleAddToCart = (product: Product) => {
      setCart([...cart, product]);
      // Feedback visual ou toast poderia ser adicionado aqui
   };

   const handleRemoveFromCart = (index: number) => {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
   };

   const handleWhatsAppOrder = () => {
      if (cart.length === 0) return;

      const phoneNumber = '5511999999999'; // Substitua pelo número da loja configurado
      let message = 'Olá! Gostaria de fazer um pedido:\n\n';

      let total = 0;
      cart.forEach(item => {
         message += `- ${item.name} (${item.sku}): R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
         total += item.price;
      });

      message += `\nTotal: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
   };

   const handleWhatsAppProduct = (product: Product) => {
      openProductDetail(product);
   };

   // Função utilitária para verificar "novidade" (ex: criado nos últimos 30 dias)
   const isNewSeason = (dateString?: string) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date > thirtyDaysAgo;
   };

   const fetchSettings = async () => {
      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
         });
         const data = await response.json();
         if (data.success && data.settings) {
            setSettings(data.settings);
         }
      } catch (error) {
         console.error('Erro ao buscar settings:', error);
      }
   };

   if (settings.catalogActive === false) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-400">
               <Globe size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Catálogo Temporariamente Indisponível</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
               Esta loja desativou o catálogo online no momento. Por favor, entre em contato diretamente com a loja para mais informações.
            </p>
            {settings.catalogWhatsapp && (
               <a
                  href={`https://wa.me/${settings.catalogWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
               >
                  <MessageCircle size={20} /> Falar no WhatsApp
               </a>
            )}
         </div>
      );
   }

   if (selectedProduct) {
      return (
         <div className="min-h-screen font-sans pb-20 bg-white">
            {/* Header Simplificado para Detalhes */}
            <header className="fixed w-full top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 py-3 gap-4 shadow-sm">
               <div className="flex items-center gap-2 font-black text-lg tracking-tight whitespace-nowrap" style={{ color: settings.catalogSecondaryColor || '#1e293b' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white cursor-pointer"
                     style={{ backgroundColor: settings.catalogPrimaryColor || '#0158ad' }}
                     onClick={closeProductDetail}>
                     <ArrowLeft size={18} />
                  </div>
                  <span className="cursor-pointer" onClick={closeProductDetail}>Voltar para Loja</span>
               </div>

               <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative hover:text-blue-600 transition-colors p-2"
               >
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                     <span className="absolute 0 top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                        {cart.length}
                     </span>
                  )}
               </button>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pt-[80px] animate-in slide-in-from-bottom-4 duration-500">
               {/* Breadcrumbs */}
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                  <span onClick={closeProductDetail} className="cursor-pointer hover:text-slate-800">Home</span>
                  <ChevronRight size={12} />
                  <span className="hover:text-slate-800 cursor-pointer">{selectedProduct.category?.name || 'Geral'}</span>
                  <ChevronRight size={12} />
                  <span className="text-slate-800">{selectedProduct.name}</span>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Gallery */}
                  <div className="space-y-4">
                     <div className="aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm">
                        {selectedProduct.image ? (
                           <img src={selectedProduct.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={selectedProduct.name} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">Sem Imagem</div>
                        )}

                        {isNewSeason(selectedProduct.createdAt) && (
                           <div className="absolute top-6 left-6 px-3 py-1.5 bg-[#10b981] text-white text-xs font-black uppercase rounded shadow-lg tracking-wider">
                              New Arrival
                           </div>
                        )}
                        <button className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-lg transition-colors">
                           <Heart size={20} />
                        </button>
                     </div>
                     <div className="grid grid-cols-4 gap-4">
                        {[selectedProduct.image, selectedProduct.image, selectedProduct.image, selectedProduct.image].map((img, i) => (
                           <div key={i} className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === 0 ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-slate-300'}`}>
                              {img ? (
                                 <img src={img} className="w-full h-full object-cover" alt="Thumb" />
                              ) : (
                                 <div className="w-full h-full bg-slate-100" />
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                     <div className="mb-6">
                        <h4 className="text-green-500 font-bold text-xs uppercase tracking-widest mb-2">{selectedProduct.category?.name || 'COLEÇÃO'}</h4>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">{selectedProduct.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                           <div className="flex items-center text-yellow-500 gap-0.5">
                              <Star size={18} fill="currentColor" />
                              <Star size={18} fill="currentColor" />
                              <Star size={18} fill="currentColor" />
                              <Star size={18} fill="currentColor" />
                              <Star size={18} fill="currentColor" className="opacity-50" />
                           </div>
                           <span className="text-sm font-bold text-slate-400">(124 reviews)</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-4xl font-black text-slate-900">R$ {selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                           <span className="text-xl font-bold text-slate-400 line-through">R$ {(selectedProduct.price * 1.2).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                           <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-black rounded uppercase">-20%</span>
                        </div>
                     </div>

                     <p className="text-slate-500 leading-relaxed font-medium mb-8">
                        {/* Descrição mockada se não tiver na API */}
                        Projetado para a vida na cidade. Este produto apresenta materiais resistentes, costura reforçada e tecnologia respirável para mantê-lo confortável em qualquer clima. Perfeito para o seu dia a dia com estilo e qualidade superior.
                     </p>

                     {/* Mock Selectors */}
                     <div className="space-y-6 mb-8 py-8 border-y border-slate-100">
                        <div>
                           <div className="flex justify-between mb-3">
                              <span className="font-bold text-slate-900 text-sm">Cor: <span className="text-slate-500">{selectedColor || 'Selecione'}</span></span>
                           </div>
                           <div className="flex gap-3">
                              {['Verde Militar', 'Azul Marinho', 'Preto Clássico'].map(color => (
                                 <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'
                                       }`}
                                    style={{ backgroundColor: color === 'Verde Militar' ? '#556b2f' : color === 'Azul Marinho' ? '#1e3a8a' : '#000' }}
                                 >
                                    {selectedColor === color && <Check size={16} className="text-white" />}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div>
                           <div className="flex justify-between mb-3">
                              <span className="font-bold text-slate-900 text-sm">Tamanho: <span className="text-slate-500">{selectedSize || 'Selecione'}</span></span>
                              <span className="text-xs font-bold text-green-600 underline cursor-pointer">Guia de Tamanhos</span>
                           </div>
                           <div className="flex gap-3">
                              {['P', 'M', 'G', 'GG'].map(size => (
                                 <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 rounded-lg border-2 font-black text-sm transition-all flex items-center justify-center ${selectedSize === size
                                       ? 'border-slate-900 bg-slate-900 text-white'
                                       : 'border-slate-200 text-slate-600 hover:border-slate-400'
                                       }`}
                                 >
                                    {size}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Quantity & CTA */}
                     <div className="space-y-4">
                        <div className="font-bold text-slate-900 text-sm mb-2">Quantidade</div>
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-1 w-fit">
                           <button onClick={decrementQty} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-slate-900 hover:scale-105 transition-all">
                              <Minus size={16} />
                           </button>
                           <span className="w-8 text-center font-black text-lg">{currentQty}</span>
                           <button onClick={incrementQty} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-slate-900 hover:scale-105 transition-all">
                              <Plus size={16} />
                           </button>
                        </div>

                        <button
                           onClick={handleWhatsAppDetail}
                           className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black uppercase tracking-wide text-sm shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                        >
                           <MessageCircle size={24} /> Confirmar Pedido via WhatsApp
                        </button>
                        <p className="text-center text-xs text-slate-400 font-medium">Resposta rápida • Pagamento Seguro • Suporte Direto</p>
                     </div>

                     {/* Features */}
                     <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                           <Truck className="text-blue-600" size={24} />
                           <div>
                              <div className="font-bold text-slate-900 text-xs">Frete Grátis</div>
                              <div className="text-[10px] text-slate-500">Para compras acima de R$ 299</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                           <ShieldCheck className="text-green-600" size={24} />
                           <div>
                              <div className="font-bold text-slate-900 text-xs">Produto Autêntico</div>
                              <div className="text-[10px] text-slate-500">Garantia de qualidade 100%</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   const renderProductCard = (p: Product) => (
      <div
         key={p.id}
         className="group flex flex-col bg-white transition-all duration-300 hover:-translate-y-1 h-full"
         style={{
            borderRadius: `${settings.catalogCardRadius || 16}px`,
            boxShadow: settings.catalogCardShadow === 'none' ? 'none' : settings.catalogCardShadow === 'sm' ? '0 1px 3px rgba(0,0,0,0.1)' : settings.catalogCardShadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
            backgroundColor: settings.catalogCardColor || '#ffffff',
            color: settings.catalogTextColor || '#1e293b'
         }}
      >
         <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden rounded-t-[inherit] cursor-pointer" onClick={() => handleWhatsAppProduct(p)}>
            <button onClick={(e) => e.stopPropagation()} className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100">
               <Heart size={16} />
            </button>

            {(p.tag || isNewSeason(p.createdAt)) && (
               <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-sm shadow-sm">
                  {p.tag || 'Novo'}
               </div>
            )}

            {p.image ? (
               <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-slate-50">
                  <Package size={48} opacity={0.2} />
               </div>
            )}
         </div>

         <div className="p-4 flex flex-col flex-1">
            <h4 className="font-bold text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: settings.catalogTextColor || '#1e293b' }}>
               {p.name}
            </h4>

            <div className="mt-auto flex items-center justify-between pt-2">
               <span className="font-black text-lg" style={{ color: settings.catalogPriceColor || '#0158ad' }}>
                  R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
               <button
                  onClick={() => { handleAddToCart(p); setIsCartOpen(true); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{
                     backgroundColor: settings.catalogBackgroundColor === '#ffffff' ? '#f1f5f9' : '#ffffff',
                     color: settings.catalogPrimaryColor || '#0158ad',
                     border: `1px solid ${settings.catalogPrimaryColor}20`
                  }}
               >
                  <ShoppingCart size={14} fill="currentColor" className="opacity-20" />
               </button>
            </div>
         </div>
      </div>
   );

   return (
      <div className="min-h-screen font-sans pb-20 fade-in" style={{ backgroundColor: settings.catalogBackgroundColor || '#f8fafc' }}>
         {isCartOpen && (
            <div className="fixed inset-0 z-[60] flex justify-end">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
               <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                     <h2 className="font-black text-slate-800 flex items-center gap-2">
                        <ShoppingCart size={20} /> Seu Pedido
                     </h2>
                     <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                     {cart.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                           <ShoppingCart size={40} className="mx-auto mb-4 opacity-50" />
                           <p>Seu carrinho está vazio.</p>
                        </div>
                     ) : (
                        cart.map((item, idx) => (
                           <div key={idx} className="flex gap-4 items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                              <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                 {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Sem foto</div>}
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</h4>
                                 <p className="font-black text-slate-900 text-sm mt-1">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <button onClick={() => handleRemoveFromCart(idx)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                           </div>
                        ))
                     )}
                  </div>
                  <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                     <div className="flex justify-between items-center text-lg font-black text-slate-800">
                        <span>Total ({cart.length})</span>
                        <span>R$ {cart.reduce((acc, item) => acc + item.price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                     <button onClick={handleWhatsAppOrder} disabled={cart.length === 0} className="w-full py-3.5 bg-green-500 text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-2">
                        <MessageCircle size={18} /> Finalizar no WhatsApp
                     </button>
                  </div>
               </div>
            </div>
         )}

         <header className="fixed w-full top-0 left-0 z-50 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 py-3 gap-4 shadow-sm" style={{ backgroundColor: settings.catalogCardColor || '#ffffff', borderColor: settings.catalogTheme === 'dark' ? '#334155' : '#f1f5f9' }}>
            <div className="flex items-center gap-2 font-black text-lg tracking-tight whitespace-nowrap" style={{ color: settings.catalogSecondaryColor || '#1e293b' }}>
               <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: settings.catalogPrimaryColor || '#0158ad' }}><Store size={18} /></div>
               {settings.storeName || 'ModernStore'}
            </div>

            <div className="flex-1 max-w-md mx-auto relative hidden md:block">
               <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-full py-2 px-10 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>

            <div className="flex items-center gap-3 md:gap-6">
               <nav className="hidden lg:flex items-center gap-6 text-sm font-bold" style={{ color: settings.catalogTextColor || '#64748b' }}>
                  <a href="#" className="hover:text-blue-600">Home</a><a href="#" className="text-blue-600">Catálogo</a><a href="#" className="hover:text-blue-600">Sobre</a>
               </nav>
               <button onClick={() => setIsCartOpen(true)} className="relative hover:text-blue-600 transition-colors" style={{ color: settings.catalogTextColor }}>
                  <ShoppingCart size={20} />
                  {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
               </button>
            </div>
         </header>

         {/* Mobile Search */}
         <div className="p-4 md:hidden sticky top-[60px] z-30 mt-[60px]" style={{ backgroundColor: settings.catalogCardColor || '#ffffff', borderBottom: `1px solid ${settings.catalogTheme === 'dark' ? '#334155' : '#f1f5f9'}` }}>
            <div className="relative">
               <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
         </div>

         <div className="flex-1 w-full pt-[60px] md:pt-[72px]">
            {(!searchTerm && selectedCategory === 'Todos') && (
               <div className="relative w-full overflow-hidden shadow-lg group mb-8 h-auto bg-slate-900 rounded-none">
                  {(settings.catalogBannerImage || settings.catalogBannerImageMobile) ? (
                     <picture className="w-full block">
                        {settings.catalogBannerImageMobile && <source media="(max-width: 768px)" srcSet={settings.catalogBannerImageMobile} />}
                        <img src={settings.catalogBannerImage || settings.catalogBannerImageMobile} className="w-full max-h-[800px] md:max-h-[600px] object-contain transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                     </picture>
                  ) : (
                     <div className="w-full h-[600px] relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Placeholder" />
                     </div>
                  )}
                  {settings.catalogShowBannerTitle !== false && <div className="absolute inset-0 bg-black/40 z-10"></div>}
                  {settings.catalogShowBannerTitle !== false && (
                     <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-[1400px] mx-auto w-full">
                        <div className="max-w-2xl">
                           {settings.catalogBannerTag && (<div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-md text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 w-fit border border-white/30">{settings.catalogBannerTag}</div>)}
                           {settings.catalogBannerTitle && (<h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-sm">{settings.catalogBannerTitle}</h2>)}
                           {settings.catalogBannerSubtitle && (<p className="text-white/80 text-sm md:text-base font-medium mb-8 max-w-sm leading-relaxed hidden md:block">{settings.catalogBannerSubtitle}</p>)}
                           {settings.catalogShowBannerButton !== false && settings.catalogBannerButtonText && (
                              <button onClick={() => document.getElementById('products-start')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 w-fit">
                                 {settings.catalogBannerButtonText} <ChevronRight size={14} />
                              </button>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>

         <div className="flex-1 max-w-[1400px] mx-auto w-full">
            {(!searchTerm && selectedCategory === 'Todos') ? (
               <div className="w-full relative px-4 md:px-8 mt-0 shrink-0">
                  <div id="products-start" className="space-y-12 pb-12">

                     {/* 1. Destaques */}
                     {settings.catalogShowHighlights !== false && (
                        <section>
                           <div className="flex items-end justify-between mb-6">
                              <div><h3 className="text-2xl font-black tracking-tight" style={{ color: settings.catalogTextColor || '#1e293b' }}>{settings.catalogHighlightsTitle || 'Mais Vendidos'}</h3><p className="text-sm font-medium mt-1" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogHighlightsSubtitle || 'Os produtos favoritos da semana'}</p></div>
                           </div>
                           <div
                              className={`gap-6 ${settings.catalogLayoutMobile === 'carousel' ? 'grid-mobile-carousel' : 'grid'}`}
                              style={{
                                 display: 'grid',
                                 gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))`,
                                 ...((window.innerWidth < 768 && settings.catalogLayoutMobile === 'carousel') ? { display: 'flex', overflowX: 'auto', paddingBottom: '1rem' } : {})
                              }}
                           >
                              {/* Using a slice of products for highlights */}
                              {products.slice(0, 4).map(p => (
                                 <div key={p.id} className={settings.catalogLayoutMobile === 'carousel' ? 'min-w-[280px]' : ''}>
                                    {renderProductCard(p)}
                                 </div>
                              ))}
                           </div>
                        </section>
                     )}

                     {/* 2. Lançamentos (New Arrivals) */}
                     {settings.catalogShowNewArrivals !== false && (
                        <section>
                           <div className="flex items-end justify-between mb-6">
                              <div><h3 className="text-2xl font-black tracking-tight" style={{ color: settings.catalogTextColor || '#1e293b' }}>{settings.catalogNewArrivalsTitle || 'Novidades'}</h3><p className="text-sm font-medium mt-1" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogNewArrivalsSubtitle || 'Acabaram de chegar no estoque'}</p></div>
                           </div>
                           <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))` }}>
                              {products.filter(p => isNewSeason(p.createdAt)).slice(0, 8).map(p => renderProductCard(p))}
                           </div>
                        </section>
                     )}

                     {/* 3. Vitrine Opcional */}
                     {settings.catalogShowOptional && (
                        <section>
                           <div className="flex items-end justify-between mb-6">
                              <div><h3 className="text-2xl font-black tracking-tight" style={{ color: settings.catalogTextColor || '#1e293b' }}>{settings.catalogOptionalTitle || 'Ofertas Imperdíveis'}</h3><p className="text-sm font-medium mt-1" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogOptionalSubtitle || 'Seleção especial para você'}</p></div>
                           </div>
                           <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))` }}>
                              {products.slice(4, 8).map(p => renderProductCard(p))}
                           </div>
                        </section>
                     )}

                     <section className="bg-emerald-50 rounded-2xl p-6 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-100">
                        <div className="text-center md:text-left"><h3 className="text-2xl font-black text-emerald-900 mb-2">Entre para nossa lista VIP</h3><p className="text-emerald-700/80 font-medium max-w-md">Receba ofertas exclusivas, acesso antecipado a novas coleções e suporte instantâneo via WhatsApp.</p></div>
                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3"><input type="email" placeholder="Seu melhor e-mail" className="px-5 py-3 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-400 outline-none min-w-[260px]" /><button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg">Inscrever-se</button></div>
                     </section>
                  </div>
               </div>
            ) : (
               /* Search Results / Filtered View - Keeps Generic Grid */
               <div className="p-4 md:p-8">
                  <div className="flex flex-wrap gap-2 mb-8">
                     <button onClick={() => setSelectedCategory('Todos')} className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all ${selectedCategory === 'Todos' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-900'} `}>Todos</button>
                     {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-900'} `}>{cat}</button>
                     ))}
                  </div>

                  {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-20"><Loader2 size={40} className="text-blue-600 animate-spin mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando catálogo...</p></div>
                  ) : filteredProducts.length === 0 ? (
                     <div className="text-center py-20"><p className="text-slate-400 font-bold text-lg">Nenhum produto encontrado :(</p></div>
                  ) : (
                     <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))` }}>
                        {filteredProducts.map(p => renderProductCard(p))}
                     </div>
                  )}
               </div>
            )}
         </div>

         <footer className="border-t border-slate-100 pt-12 pb-6 px-8" style={{ backgroundColor: settings.catalogCardColor || '#ffffff', borderColor: settings.catalogTheme === 'dark' ? '#334155' : '#f1f5f9' }}>
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
               <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 font-black text-lg mb-4" style={{ color: settings.catalogSecondaryColor || '#1e293b' }}><div className="w-6 h-6 rounded flex items-center justify-center text-white bg-green-500"><Store size={14} /></div>{settings.storeName || 'ModernStore'}</div>
                  <p className="text-xs leading-relaxed max-w-xs" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogFooterMessage || 'Sua loja de confiança para produtos de qualidade. Entregamos em todo o país com garantia e segurança.'}</p>
               </div>
               <div>
                  <h4 className="font-bold text-sm mb-4" style={{ color: settings.catalogTextColor || '#1e293b' }}>Contato</h4>
                  <ul className="space-y-2 text-xs font-medium" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.8 }}>
                     <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {settings.catalogContactEmail || 'contato@loja.com'}</li>
                     <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> {settings.catalogWhatsapp || '(11) 99999-9999'}</li>
                  </ul>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Catalog;
