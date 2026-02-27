import React, { useState, useEffect } from 'react';
import { Save, Store, Package, ShoppingCart, DollarSign, Globe, Users, Shield, Plug, Loader2, ChevronRight, Palette, Upload, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CatalogVisual: React.FC = () => {
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [products, setProducts] = useState<any[]>([]);
   const [settings, setSettings] = useState<any>({
      catalogTheme: 'light',
      catalogPrimaryColor: '#0158ad',
      catalogSecondaryColor: '#1e293b',
      catalogBackgroundColor: '#f8fafc',
      catalogCardColor: '#ffffff',
      catalogTextColor: '#1e293b',
      catalogPriceColor: '#0158ad',
      catalogLayout: 'grid',
      catalogColumns: 4,
      catalogLayoutMobile: 'list',
      catalogCardRadius: 16,
      catalogCardShadow: 'md',
      catalogButtonFormat: 'rounded',
      catalogShowButtonIcon: true,
      catalogButtonText: 'Ver Detalhes',
      catalogShowBannerTitle: true,
      catalogBannerTag: 'New Season',
      catalogBannerTitle: 'Coleção de Verão',
      catalogBannerSubtitle: 'Descubra as últimas tendências e ofertas exclusivas.',
      catalogBannerButtonText: 'Comprar Agora',
      catalogShowBannerButton: true,
      catalogBannerLink: '',
      catalogShowHighlights: true,
      catalogShowNewArrivals: true,
      catalogShowOptional: false,
      catalogHighlightsTitle: 'Mais Vendidos',
      catalogHighlightsSubtitle: 'Os produtos favoritos da semana',
      catalogNewArrivalsTitle: 'Novidades',
      catalogNewArrivalsSubtitle: 'Acabaram de chegar no estoque',
      catalogOptionalTitle: 'Ofertas Imperdíveis',
      catalogOptionalSubtitle: 'Seleção especial para você',
      previewMobile: false
   });

   useEffect(() => { fetchSettings(); fetchProducts(); }, []);

   const fetchSettings = async () => {
      setIsLoading(true);
      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await response.json();
         if (data.success && data.settings) {
            setSettings(prev => ({ ...prev, ...data.settings, previewMobile: false }));
         }
      } catch (error) { console.error('Error loading settings:', error); }
      finally { setIsLoading(false); }
   };

   const fetchProducts = async () => {
      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await response.json();
         if (data.products) setProducts(data.products.filter((p: any) => p.active !== false));
      } catch (error) { console.error('Error loading products:', error); }
   };

   const handleSave = async () => {
      setIsSaving(true);
      try {
         const token = localStorage.getItem('token');
         const { previewMobile, catalogTheme, ...dataToSend } = settings;
         const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dataToSend)
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.debug || data.message || data.error?.message || `Erro no servidor: ${response.status}`);
         }

         if (data.success) {
            alert('Configurações visuais salvas com sucesso!');
            setSettings(prev => ({ ...prev, ...data.settings }));
         } else {
            throw new Error(data.message || 'Erro ao salvar configurações.');
         }
      } catch (error: any) {
         console.error('Error saving:', error);
         alert(`Falha ao salvar: ${error.message}`);
      } finally { setIsSaving(false); }
   };

   const handleChange = (field: string, value: any) => {
      setSettings(prev => ({ ...prev, [field]: value }));
   };

   const handleImageUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         if (file.size > 307200) { // 300KB
            alert('A imagem excede o limite de 300KB. Por favor, otimize a imagem antes de enviar.');
            return;
         }
         const reader = new FileReader();
         reader.onloadend = () => { handleChange(field, reader.result); };
         reader.readAsDataURL(file);
      }
   };

   const getProductsForPreview = (count: number) => {
      const list = [];
      for (let i = 0; i < count; i++) {
         if (products[i]) {
            list.push({ ...products[i], isPlaceholder: false });
         } else {
            list.push({
               id: `mock-${i}`,
               name: `Produto Exemplo ${i + 1}`,
               price: 99.90 + (i * 10),
               image: null,
               isPlaceholder: true
            });
         }
      }
      return list;
   };

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-500 font-bold">Carregando editor visual...</p>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-6 min-h-screen pb-4 fade-in duration-500 h-screen overflow-hidden">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 shrink-0">
            <div>
               <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                  <ChevronRight size={10} />
                  <span className="font-medium text-slate-500">Aparência</span>
               </div>
               <h1 className="text-[26px] font-black text-[#1e293b] tracking-tight flex items-center gap-2">
                  <Palette size={26} className="text-blue-600" />
                  Personalizar Catálogo
               </h1>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
               {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
               {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
         </div>

         <div className="flex flex-col xl:flex-row gap-8 h-full overflow-hidden">
            <div className="w-full xl:w-[400px] flex flex-col gap-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex-shrink-0">
               <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Opções de Estilo</span>
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">1. Tema Geral</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {['light', 'dark'].map(theme => (
                           <button key={theme} onClick={() => {
                              const newSettings = { ...settings, catalogTheme: theme };
                              if (theme === 'light') {
                                 newSettings.catalogPrimaryColor = '#0158ad';
                                 newSettings.catalogSecondaryColor = '#1e293b';
                                 newSettings.catalogBackgroundColor = '#f8fafc';
                                 newSettings.catalogCardColor = '#ffffff';
                                 newSettings.catalogTextColor = '#1e293b';
                                 newSettings.catalogPriceColor = '#0158ad';
                              } else if (theme === 'dark') {
                                 newSettings.catalogPrimaryColor = '#3b82f6';
                                 newSettings.catalogSecondaryColor = '#f8fafc';
                                 newSettings.catalogBackgroundColor = '#0f172a';
                                 newSettings.catalogCardColor = '#1e293b';
                                 newSettings.catalogTextColor = '#f1f5f9';
                                 newSettings.catalogPriceColor = '#60a5fa';
                              }
                              setSettings(newSettings);
                           }}
                              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${(settings.catalogTheme || 'light') === theme ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                                 }`}
                           >
                              {theme === 'light' && <div className="w-full h-8 bg-white border border-slate-200 rounded-md"></div>}
                              {theme === 'dark' && <div className="w-full h-8 bg-slate-900 border border-slate-700 rounded-md"></div>}
                              <span className="text-xs font-bold uppercase">{theme === 'light' ? 'Claro' : 'Escuro'}</span>
                           </button>
                        ))}
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">2. Cores da Marca</h3>
                     <div className="grid grid-cols-1 gap-4">
                        {[
                           { label: 'Cor Primária', key: 'catalogPrimaryColor', default: '#0158ad' },
                           { label: 'Cor Secundária', key: 'catalogSecondaryColor', default: '#1e293b' },
                           { label: 'Fundo da Página', key: 'catalogBackgroundColor', default: '#f8fafc' },
                           { label: 'Fundo dos Cards', key: 'catalogCardColor', default: '#ffffff' },
                           { label: 'Cor do Texto', key: 'catalogTextColor', default: '#1e293b' },
                           { label: 'Cor do Preço', key: 'catalogPriceColor', default: '#0158ad' }
                        ].map(color => (
                           <div key={color.key}>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{color.label}</label>
                              <div className="flex items-center gap-2">
                                 <input type="color" value={settings[color.key] || color.default} onChange={e => handleChange(color.key, e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                                 <input type="text" value={settings[color.key] || color.default} onChange={e => handleChange(color.key, e.target.value)} className="flex-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-2" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">3. Banner Principal</h3>
                     <div className="pt-2 mt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Imagem do Banner Desktop</label>
                        {settings.catalogBannerImage ? (
                           <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 group mb-2">
                              <img src={settings.catalogBannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                              <button onClick={() => handleChange('catalogBannerImage', '')} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm">
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        ) : (
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors mb-2">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                 <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                 <p className="text-xs text-slate-500 font-medium">Desktop (JPEG/PNG)</p>
                              </div>
                              <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleImageUpload('catalogBannerImage')} />
                           </label>
                        )}
                        <p className="text-[9px] text-slate-400 font-medium text-center mt-1">Recomendado: 1920x600px • Max: 300KB</p>
                     </div>

                     <div className="pt-2 mt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Imagem do Banner Mobile</label>
                        {settings.catalogBannerImageMobile ? (
                           <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 group mb-2">
                              <img src={settings.catalogBannerImageMobile} alt="Mobile Banner Preview" className="w-full h-full object-cover" />
                              <button onClick={() => handleChange('catalogBannerImageMobile', '')} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-sm">
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        ) : (
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors mb-2">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                 <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                 <p className="text-xs text-slate-500 font-medium">Mobile (JPEG/PNG)</p>
                              </div>
                              <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleImageUpload('catalogBannerImageMobile')} />
                           </label>
                        )}
                        <p className="text-[9px] text-slate-400 font-medium text-center mt-1">Recomendado: 800x800px • Max: 300KB</p>
                     </div>
                     <div className="pt-2 border-t border-slate-50">
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-bold text-slate-700">Exibir Textos no Banner</label>
                           <input type="checkbox" checked={settings.catalogShowBannerTitle !== false} onChange={e => handleChange('catalogShowBannerTitle', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        </div>
                        {settings.catalogShowBannerTitle !== false && (
                           <div className="space-y-3 pl-2 border-l-2 border-slate-100 mt-2">
                              <input type="text" value={settings.catalogBannerTag || ''} onChange={e => handleChange('catalogBannerTag', e.target.value)} className="w-full px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg" placeholder="Tag (Ex: New Season)" />
                              <input type="text" value={settings.catalogBannerTitle || ''} onChange={e => handleChange('catalogBannerTitle', e.target.value)} className="w-full px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg" placeholder="Título" />
                              <textarea rows={2} value={settings.catalogBannerSubtitle || ''} onChange={e => handleChange('catalogBannerSubtitle', e.target.value)} className="w-full px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg resize-none" placeholder="Subtítulo" />
                              <div className="pt-2">
                                 <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" checked={settings.catalogShowBannerButton !== false} onChange={e => handleChange('catalogShowBannerButton', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                    <span className="text-xs font-bold text-slate-600">Habilitar Botão</span>
                                 </div>
                                 {settings.catalogShowBannerButton !== false && (
                                    <div className="grid grid-cols-2 gap-2">
                                       <input type="text" value={settings.catalogBannerButtonText || 'Comprar Agora'} onChange={e => handleChange('catalogBannerButtonText', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Texto Botão" />
                                       <input type="text" value={settings.catalogBannerLink || ''} onChange={e => handleChange('catalogBannerLink', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Link" />
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">4. Vitrines de Produtos</h3>
                     <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">1. Destaques</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">{settings.catalogShowHighlights !== false ? 'Exibir' : 'Ocultar'}</span>
                                 <input type="checkbox" checked={settings.catalogShowHighlights !== false} onChange={e => handleChange('catalogShowHighlights', e.target.checked)} className="accent-blue-600 w-4 h-4 rounded cursor-pointer" />
                              </div>
                           </div>
                           {settings.catalogShowHighlights !== false && (
                              <div className="pt-2 border-t border-slate-200 space-y-2">
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Título</label>
                                    <input type="text" value={settings.catalogHighlightsTitle || ''} onChange={e => handleChange('catalogHighlightsTitle', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Ex: Mais Vendidos" />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Subtítulo</label>
                                    <input type="text" value={settings.catalogHighlightsSubtitle || ''} onChange={e => handleChange('catalogHighlightsSubtitle', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Ex: Os favoritos da semana" />
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">2. Lançamentos</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">{settings.catalogShowNewArrivals !== false ? 'Exibir' : 'Ocultar'}</span>
                                 <input type="checkbox" checked={settings.catalogShowNewArrivals !== false} onChange={e => handleChange('catalogShowNewArrivals', e.target.checked)} className="accent-blue-600 w-4 h-4 rounded cursor-pointer" />
                              </div>
                           </div>
                           {settings.catalogShowNewArrivals !== false && (
                              <div className="pt-2 border-t border-slate-200 space-y-2">
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Título</label>
                                    <input type="text" value={settings.catalogNewArrivalsTitle || ''} onChange={e => handleChange('catalogNewArrivalsTitle', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Ex: Novidades" />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Subtítulo</label>
                                    <input type="text" value={settings.catalogNewArrivalsSubtitle || ''} onChange={e => handleChange('catalogNewArrivalsSubtitle', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Ex: Recém chegados" />
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">3. Vitrine Opcional</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">{settings.catalogShowOptional ? 'Exibir' : 'Ocultar'}</span>
                                 <input type="checkbox" checked={settings.catalogShowOptional || false} onChange={e => handleChange('catalogShowOptional', e.target.checked)} className="accent-blue-600 w-4 h-4 rounded cursor-pointer" />
                              </div>
                           </div>
                           {settings.catalogShowOptional && (
                              <div className="pt-2 border-t border-slate-200 space-y-2">
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Título</label>
                                    <input type="text" value={settings.catalogOptionalTitle || ''} onChange={e => handleChange('catalogOptionalTitle', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Ex: Ofertas Imperdíveis" />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Subtítulo</label>
                                    <input type="text" value={settings.catalogOptionalSubtitle || ''} onChange={e => handleChange('catalogOptionalSubtitle', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" placeholder="Ex: Seleção especial" />
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">5. Layout dos Produtos</h3>
                     <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase">Colunas no Desktop</label>
                           <span className="text-xs font-bold text-blue-600">{settings.catalogColumns || 4} Colunas</span>
                        </div>
                        <input type="range" min="4" max="8" step="1" value={settings.catalogColumns || 4} onChange={e => handleChange('catalogColumns', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium"><span>4</span><span>6</span><span>8</span></div>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Layout no Mobile</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button onClick={() => handleChange('catalogLayoutMobile', 'list')} className={`p-2 text-xs font-bold uppercase rounded-lg border flex flex-col items-center gap-1 transition-all ${(settings.catalogLayoutMobile || 'list') === 'list' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <span>Lista</span>
                           </button>
                           <button onClick={() => handleChange('catalogLayoutMobile', 'carousel')} className={`p-2 text-xs font-bold uppercase rounded-lg border flex flex-col items-center gap-1 transition-all ${(settings.catalogLayoutMobile || 'list') === 'carousel' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <span>Carrossel</span>
                           </button>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">6. Estilo dos Cards</h3>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Arredondamento</label>
                           <span className="text-xs font-bold text-blue-600">{settings.catalogCardRadius || 16}px</span>
                        </div>
                        <input type="range" min="0" max="30" value={settings.catalogCardRadius || 16} onChange={e => handleChange('catalogCardRadius', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sombra</label>
                        <div className="flex gap-2">
                           {['none', 'sm', 'md', 'lg'].map(shadow => (
                              <button key={shadow} onClick={() => handleChange('catalogCardShadow', shadow)} className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-md border transition-all ${(settings.catalogCardShadow || 'md') === shadow ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                 {shadow === 'none' ? 'Sem' : shadow}
                              </button>
                           ))}
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">7. Botões de Ação</h3>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Formato</label>
                        <div className="flex gap-2 mb-3">
                           {['rect', 'rounded', 'pill'].map(fmt => (
                              <button key={fmt} onClick={() => handleChange('catalogButtonFormat', fmt)} className={`flex-1 py-2 text-xs font-bold border ${fmt === 'rect' ? 'rounded-none' : fmt === 'rounded' ? 'rounded-lg' : 'rounded-full'} ${(settings.catalogButtonFormat || 'rounded') === fmt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                                 Botão
                              </button>
                           ))}
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Texto do Botão</label>
                              <input type="text" value={settings.catalogButtonText || 'Ver Detalhes'} onChange={e => handleChange('catalogButtonText', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg" />
                           </div>
                           <div className="flex items-center gap-2 pt-4">
                              <input type="checkbox" checked={settings.catalogShowButtonIcon !== false} onChange={e => handleChange('catalogShowButtonIcon', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                              <span className="text-xs font-bold text-slate-600">Mostrar Ícone</span>
                           </div>
                        </div>
                     </div>
                  </section>
               </div>
            </div>

            <div className="flex-1 bg-slate-100 rounded-xl border border-slate-300 shadow-xl overflow-hidden flex flex-col relative h-full">
               <div className="bg-slate-800 p-3 flex justify-between items-center text-white px-4 shrink-0">
                  <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                  <span className="text-xs font-medium opacity-70 uppercase tracking-widest">Preview em Tempo Real</span>
                  <button onClick={() => handleChange('previewMobile', !settings.previewMobile)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${settings.previewMobile ? 'bg-white text-slate-900 border-white' : 'text-white border-slate-600 hover:bg-slate-700'}`}>
                     {settings.previewMobile ? '📱 Visualização Mobile' : '🖥️ Visualização Desktop'}
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 md:p-8 flex items-start justify-center">
                  <div className={`transition-all duration-300 bg-white shadow-2xl overflow-hidden flex flex-col ${settings.previewMobile ? 'w-[375px] rounded-[30px] border-[8px] border-slate-900 min-h-[700px]' : 'w-full rounded-lg min-h-[600px] border border-slate-200'}`} style={{ backgroundColor: settings.catalogBackgroundColor || '#f8fafc' }}>

                     <header className="sticky top-0 z-20 border-b border-slate-100 flex items-center justify-between px-4 md:px-6 py-3 shrink-0 gap-4" style={{ backgroundColor: settings.catalogCardColor || '#ffffff', borderColor: settings.catalogTheme === 'dark' ? '#334155' : '#f1f5f9' }}>
                        <div className="flex items-center gap-2 font-black text-lg tracking-tight whitespace-nowrap" style={{ color: settings.catalogSecondaryColor || '#1e293b' }}>
                           <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: settings.catalogPrimaryColor || '#0158ad' }}><Store size={18} /></div>
                           {settings.storeName || 'ModernStore'}
                        </div>
                        {!settings.previewMobile && (
                           <div className="flex-1 max-w-md mx-auto relative hidden md:block">
                              <input type="text" placeholder="Buscar produtos..." className="w-full bg-slate-100 border-none rounded-full py-2 px-10 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400" />
                           </div>
                        )}
                        <div className="flex items-center gap-3 md:gap-6">
                           {!settings.previewMobile && (
                              <nav className="hidden lg:flex items-center gap-6 text-sm font-bold" style={{ color: settings.catalogTextColor || '#64748b' }}>
                                 <a href="#" className="hover:text-blue-600">Home</a><a href="#" className="text-blue-600">Catálogo</a><a href="#" className="hover:text-blue-600">Sobre</a>
                              </nav>
                           )}
                           <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#25D366' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                              <span>WhatsApp</span>
                           </button>
                           <div className="flex items-center gap-3 text-slate-600">
                              <button className="relative hover:text-blue-600 transition-colors"><ShoppingCart size={20} /><span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">2</span></button>
                           </div>
                        </div>
                     </header>

                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="w-full relative shrink-0">
                           <div className="relative w-full overflow-hidden shadow-lg group bg-slate-900 rounded-none h-auto">
                              {(settings.previewMobile && settings.catalogBannerImageMobile) || settings.catalogBannerImage ? (
                                 <img src={(settings.previewMobile && settings.catalogBannerImageMobile) ? settings.catalogBannerImageMobile : settings.catalogBannerImage} className="w-full max-h-[800px] md:max-h-[600px] object-contain transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                              ) : (
                                 <div className="w-full h-[600px] relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
                                    <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Placeholder" />
                                 </div>
                              )}
                              {settings.catalogShowBannerTitle !== false && <div className="absolute inset-0 bg-black/40 z-10"></div>}
                              {settings.catalogShowBannerTitle !== false && (
                                 <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 w-full mx-auto">
                                    {settings.catalogBannerTag && (<div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-md text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 w-fit border border-white/30">{settings.catalogBannerTag}</div>)}
                                    {settings.catalogBannerTitle && (<h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-sm">{settings.catalogBannerTitle}</h2>)}
                                    {settings.catalogBannerSubtitle && (<p className="text-white/80 text-sm md:text-base font-medium mb-8 max-w-sm leading-relaxed hidden md:block">{settings.catalogBannerSubtitle}</p>)}
                                    {settings.catalogShowBannerButton !== false && settings.catalogBannerButtonText && (<button className="px-8 py-3 bg-[#10b981] hover:bg-[#059669] text-white rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 w-fit">{settings.catalogBannerButtonText} <ChevronRight size={14} /></button>)}
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="p-4 md:p-8 space-y-12">
                           {/* Bestsellers */}
                           {settings.catalogShowHighlights !== false && (
                              <section>
                                 <div className="flex items-end justify-between mb-6">
                                    <div><h3 className="text-2xl font-black tracking-tight" style={{ color: settings.catalogTextColor || '#1e293b' }}>{settings.catalogHighlightsTitle || 'Mais Vendidos'}</h3><p className="text-sm font-medium mt-1" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogHighlightsSubtitle || 'Os produtos favoritos da semana'}</p></div>
                                    <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">Ver Todos <ChevronRight size={12} /></button>
                                 </div>
                                 <div className={`gap-6 ${(settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? 'flex overflow-x-auto pb-4 snap-x px-1 scrollbar-hide' : 'grid'}`} style={settings.previewMobile ? (settings.catalogLayoutMobile === 'list' ? { gridTemplateColumns: '1fr' } : {}) : ((settings.catalogColumns || 4) <= 5 ? { gridTemplateColumns: `repeat(${settings.catalogColumns || 4}, 1fr)` } : {})}>
                                    {Array.from({ length: settings.previewMobile ? 8 : (settings.catalogColumns || 4) >= 6 ? (settings.catalogColumns || 4) : (settings.catalogColumns || 4) === 5 ? 10 : 8 }, (_, i) => i + 1).map(i => (
                                       <div key={`best-${i}`} className={`group flex flex-col bg-white transition-all duration-300 hover:-translate-y-1 ${(settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? 'snap-center shrink-0' : ''}`} style={{ borderRadius: `${settings.catalogCardRadius || 16}px`, boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', backgroundColor: settings.catalogCardColor || '#ffffff', width: (settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? (settings.previewMobile ? 'calc((100% - 24px) / 2.15)' : `calc((100% - 96px) / 5)`) : 'auto', flexShrink: 0 }}>
                                          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden rounded-t-[inherit]">
                                             {i === 1 && <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase rounded-sm shadow-sm">Best Value</div>}
                                             <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-slate-50 group-hover:scale-105 transition-transform duration-500"><Package size={48} opacity={0.2} /></div>
                                          </div>
                                          <div className="p-4 flex flex-col flex-1">
                                             <h4 className="font-bold text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: settings.catalogTextColor || '#1e293b' }}>Produto Premium Exemplo {i}</h4>
                                             <div className="mt-auto flex items-center justify-between"><span className="font-black text-lg" style={{ color: settings.catalogPriceColor || '#0158ad' }}>R$ {(149.90 * i).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><button className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: settings.catalogBackgroundColor === '#ffffff' ? '#f1f5f9' : '#ffffff', color: settings.catalogPrimaryColor || '#0158ad', border: `1px solid ${settings.catalogPrimaryColor}20` }}><ShoppingCart size={14} fill="currentColor" className="opacity-20" /></button></div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </section>
                           )}

                           {/* New Arrivals */}
                           {settings.catalogShowNewArrivals !== false && (
                              <section>
                                 <div className="flex items-end justify-between mb-6"><div><h3 className="text-2xl font-black tracking-tight" style={{ color: settings.catalogTextColor || '#1e293b' }}>{settings.catalogNewArrivalsTitle || 'Novidades'}</h3><p className="text-sm font-medium mt-1" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogNewArrivalsSubtitle || 'Acabaram de chegar no estoque'}</p></div></div>
                                 <div className={`gap-6 ${(settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? 'flex overflow-x-auto pb-4 snap-x px-1 scrollbar-hide' : 'grid'}`} style={settings.previewMobile ? (settings.catalogLayoutMobile === 'list' ? { gridTemplateColumns: '1fr' } : {}) : ((settings.catalogColumns || 4) <= 5 ? { gridTemplateColumns: `repeat(${settings.catalogColumns || 4}, 1fr)` } : {})}>
                                    {Array.from({ length: settings.previewMobile ? 8 : (settings.catalogColumns || 4) >= 6 ? (settings.catalogColumns || 4) : (settings.catalogColumns || 4) === 5 ? 10 : 8 }, (_, i) => i + 1).map(i => (
                                       <div key={`new-${i}`} className={`group flex flex-col bg-white transition-all duration-300 hover:-translate-y-1 ${(settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? 'snap-center shrink-0' : ''}`} style={{ borderRadius: `${settings.catalogCardRadius || 16}px`, boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', backgroundColor: settings.catalogCardColor || '#ffffff', width: (settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? (settings.previewMobile ? 'calc((100% - 24px) / 2.15)' : `calc((100% - 96px) / 5)`) : 'auto', flexShrink: 0 }}>
                                          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden rounded-t-[inherit]">
                                             <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-sm shadow-sm">Novo</div>
                                             <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-orange-50/50"><Package size={48} opacity={0.2} /></div>
                                          </div>
                                          <div className="p-4 flex flex-col flex-1">
                                             <h4 className="font-bold text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: settings.catalogTextColor || '#1e293b' }}>Lançamento Exclusivo {i}</h4>
                                             <div className="mt-auto flex items-center justify-between pt-2"><span className="font-black text-lg" style={{ color: settings.catalogPriceColor || '#0158ad' }}>R$ {(89.90 * i).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><button className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 text-slate-600"><ShoppingCart size={14} /></button></div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </section>
                           )}

                           {/* Optional Showcase */}
                           {settings.catalogShowOptional && (
                              <section>
                                 <div className="flex items-end justify-between mb-6"><div><h3 className="text-2xl font-black tracking-tight" style={{ color: settings.catalogTextColor || '#1e293b' }}>{settings.catalogOptionalTitle || 'Ofertas Imperdíveis'}</h3><p className="text-sm font-medium mt-1" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>{settings.catalogOptionalSubtitle || 'Seleção especial para você'}</p></div></div>
                                 <div className={`gap-6 ${(settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? 'flex overflow-x-auto pb-4 snap-x px-1 scrollbar-hide' : 'grid'}`} style={settings.previewMobile ? (settings.catalogLayoutMobile === 'list' ? { gridTemplateColumns: '1fr' } : {}) : ((settings.catalogColumns || 4) <= 5 ? { gridTemplateColumns: `repeat(${settings.catalogColumns || 4}, 1fr)` } : {})}>
                                    {Array.from({ length: settings.previewMobile ? 8 : (settings.catalogColumns || 4) >= 6 ? (settings.catalogColumns || 4) : (settings.catalogColumns || 4) === 5 ? 10 : 8 }, (_, i) => i + 1).map(i => (
                                       <div key={`opt-${i}`} className={`group flex flex-col bg-white transition-all duration-300 hover:-translate-y-1 ${(settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? 'snap-center shrink-0' : ''}`} style={{ borderRadius: `${settings.catalogCardRadius || 16}px`, boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', backgroundColor: settings.catalogCardColor || '#ffffff', width: (settings.previewMobile ? (settings.catalogLayoutMobile === 'carousel') : ((settings.catalogColumns || 4) >= 6)) ? (settings.previewMobile ? 'calc((100% - 24px) / 2.15)' : `calc((100% - 96px) / 5)`) : 'auto', flexShrink: 0 }}>
                                          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden rounded-t-[inherit]">
                                             {i === 2 && <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded-sm shadow-sm">-20%</div>}
                                             <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-blue-50/50"><Package size={48} opacity={0.2} /></div>
                                          </div>
                                          <div className="p-4 flex flex-col flex-1">
                                             <h4 className="font-bold text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: settings.catalogTextColor || '#1e293b' }}>Produto Opcional {i}</h4>
                                             <div className="mt-auto flex items-center justify-between pt-2"><span className="font-black text-lg" style={{ color: settings.catalogPriceColor || '#0158ad' }}>R$ {(59.90 * i).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><button className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 text-slate-600"><ShoppingCart size={14} /></button></div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </section>
                           )}

                           <section className="bg-emerald-50 rounded-2xl p-6 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-100">
                              <div className="text-center md:text-left"><h3 className="text-2xl font-black text-emerald-900 mb-2">Entre para nossa lista VIP</h3><p className="text-emerald-700/80 font-medium max-w-md">Receba ofertas exclusivas, acesso antecipado a novas coleções e suporte instantâneo via WhatsApp.</p></div>
                              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3"><input type="email" placeholder="Seu melhor e-mail" className="px-5 py-3 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-400 outline-none min-w-[260px]" /><button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg">Inscrever-se</button></div>
                           </section>
                        </div>

                        <footer className="border-t border-slate-100 pt-12 pb-6 px-8" style={{ backgroundColor: settings.catalogCardColor || '#ffffff', borderColor: settings.catalogTheme === 'dark' ? '#334155' : '#f1f5f9' }}>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                              <div className="col-span-2 md:col-span-1">
                                 <div className="flex items-center gap-2 font-black text-lg mb-4" style={{ color: settings.catalogSecondaryColor || '#1e293b' }}><div className="w-6 h-6 rounded flex items-center justify-center text-white bg-green-500"><Store size={14} /></div>ModernStore</div>
                                 <p className="text-xs leading-relaxed max-w-xs" style={{ color: settings.catalogTextColor || '#64748b', opacity: 0.7 }}>Sua loja de confiança para produtos de qualidade.</p>
                              </div>
                           </div>
                        </footer>
                     </div>

                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CatalogVisual;
