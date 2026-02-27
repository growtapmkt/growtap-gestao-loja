import React, { useState, useEffect } from 'react';
import { Save, Store, Package, ShoppingCart, DollarSign, Globe, Users, Shield, Plug, Loader2, ChevronRight, Instagram, Image, Mail, ExternalLink, Type, UploadCloud, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    // Defaults matching schema
    allowProductWithoutSku: false,
    controlStock: true,
    allowSellZeroStock: false,
    allowNegativeStock: false,
    catalogShowPrice: true,
    catalogShowStock: false,
    catalogShowVariations: true,
    catalogAllowDirectOrder: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.settings) {
        // Garantir defaults para cores se vierem nulos
        const loadedSettings = {
           ...data.settings,
           catalogPrimaryColor: data.settings.catalogPrimaryColor || '#0158ad',
           catalogSecondaryColor: data.settings.catalogSecondaryColor || '#1e293b',
           catalogBackgroundColor: data.settings.catalogBackgroundColor || '#f8fafc',
           catalogCardColor: data.settings.catalogCardColor || '#ffffff',
           catalogTextColor: data.settings.catalogTextColor || '#1e293b',
           catalogPriceColor: data.settings.catalogPriceColor || '#0158ad',
           catalogCardRadius: data.settings.catalogCardRadius ?? 16
        };
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        // Feedback visual (toast seria ideal, mas alerta serve por agora)
        alert('Configurações salvas com sucesso!');
        setSettings(data.settings);
      } else {
        alert(data.message || 'Erro ao salvar configurações.');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro de conexão ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleChange('catalogLogo', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Store },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'catalogo', label: 'Catálogo Online', icon: Globe },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'integracoes', label: 'Integrações', icon: Plug },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-bold">Carregando configurações...</p>
      </div>
    );
  }

  const renderActionButtons = (isFooter = false) => (
    <div className={`flex items-center justify-end gap-3 ${isFooter ? '' : 'mt-6 pt-6 border-t border-slate-100'}`}>
      <button
        onClick={() => fetchSettings()}
        className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-20 fade-in duration-500">

      {/* Header & Breadcrumbs matching Inventory.tsx */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
            <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <ChevronRight size={10} />
            <span className="font-medium text-slate-500">Configurações</span>
          </div>
          <h1 className="text-[26px] font-black text-[#1e293b] tracking-tight">Configurações do Sistema</h1>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Abas */}
        <div className="w-full lg:w-64 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit flex-shrink-0 sticky top-0 lg:top-4 z-10">
          <div className="p-4 bg-slate-50 border-b border-slate-100 hidden lg:block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Menu de Opções</span>
          </div>
          <div className="p-2 flex lg:flex-col overflow-x-auto gap-2 lg:gap-0 no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-none lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-4 lg:py-3 text-sm font-bold transition-all rounded-lg mb-0 lg:mb-1 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100 lg:ring-0'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* GERAL */}
            {activeTab === 'geral' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Dados da Loja</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome da Loja</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.storeName || ''}
                      onChange={e => handleChange('storeName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Fantasia</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.fantasyName || ''}
                      onChange={e => handleChange('fantasyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">CNPJ / CPF</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.document || ''}
                      onChange={e => handleChange('document', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Logo URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.logo || ''}
                      onChange={e => handleChange('logo', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.phone || ''}
                      onChange={e => handleChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.whatsapp || ''}
                      onChange={e => handleChange('whatsapp', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.address || ''}
                      onChange={e => handleChange('address', e.target.value)}
                    />
                  </div>
                </div>
                {renderActionButtons()}
              </div>
            )}

            {/* PRODUTOS */}
            {activeTab === 'produtos' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Configuração de Produtos</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-700">Permitir produto sem SKU?</h4>
                      <p className="text-xs text-slate-500">Se ativo, o sistema gerará um SKU automático se não informado.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.allowProductWithoutSku || false}
                        onChange={e => handleChange('allowProductWithoutSku', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-700">Controlar estoque globalmente?</h4>
                      <p className="text-xs text-slate-500">Desative para não decrementar estoque em vendas (não recomendado).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.controlStock !== false} // Default true
                        onChange={e => handleChange('controlStock', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                {renderActionButtons()}
              </div>
            )}

            {/* VENDAS */}
            {activeTab === 'vendas' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Regras de Venda</h2>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-700">Permitir venda com estoque zerado?</h4>
                      <p className="text-xs text-slate-500">Permite finalizar vendas mesmo sem saldo no sistema.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.allowSellZeroStock || false}
                        onChange={e => handleChange('allowSellZeroStock', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-700">Permitir estoque negativo?</h4>
                      <p className="text-xs text-slate-500">Se ativo, o saldo ficará negativo após vendas sem estoque.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.allowNegativeStock || false}
                        onChange={e => handleChange('allowNegativeStock', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-1 mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Mensagem Padrão do Recibo</label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px]"
                      value={settings.receiptMessage || ''}
                      onChange={e => handleChange('receiptMessage', e.target.value)}
                      placeholder="Ex: Obrigado pela preferência! Trocas somente em até 7 dias."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Percentual Máximo de Desconto (%)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.maxDiscountPercent || ''}
                      onChange={e => handleChange('maxDiscountPercent', parseFloat(e.target.value))}
                      placeholder="Ex: 10"
                    />
                  </div>
                </div>
                {renderActionButtons()}
              </div>
            )}

            {/* FINANCEIRO */}
            {activeTab === 'financeiro' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Parâmetros Financeiros</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Taxa Padrão Cartão (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.defaultCardFee || ''}
                      onChange={e => handleChange('defaultCardFee', parseFloat(e.target.value))}
                      placeholder="Ex: 2.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Prazo de Compensação (Dias)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      value={settings.defaultCardCompensationDays || ''}
                      onChange={e => handleChange('defaultCardCompensationDays', parseInt(e.target.value))}
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>
                {renderActionButtons()}
              </div>
            )}

            {/* CATÁLOGO */}
            {activeTab === 'catalogo' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" /> Catálogo Online
                  </h2>
                  <p className="text-xs text-slate-500 -mt-3 mb-6">Configure como seus clientes visualizam e interagem com sua loja online.</p>
                </div>

                {/* Seção 1 – Status */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Seção 1 – Status</h3>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-all">
                    <div>
                      <h4 className="font-bold text-slate-700">Catálogo Online Ativo</h4>
                      <p className="text-xs text-slate-500">Se desativado, o link do catálogo não carregará para o público.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.catalogActive !== false}
                        onChange={e => handleChange('catalogActive', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                      <span className="ml-3 text-xs font-bold text-slate-600 uppercase w-14">
                        {settings.catalogActive !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </label>
                  </div>
                </section>

                {/* Seção 2 – Identidade do Catálogo */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Seção 2 – Identidade do Catálogo</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <ExternalLink size={14} /> Link do Catálogo
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">growtap.com/</span>
                        <input
                          type="text"
                          className="w-full pl-[95px] pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700"
                          value={settings.catalogSlug || ''}
                          onChange={e => handleChange('catalogSlug', e.target.value)}
                          placeholder="minhaloja"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">O link é como as pessoas vão acessar seu catálogo. Recomendamos utilizar o nome da loja sem espaços e acentos.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Instagram size={14} /> Instagram da Loja
                      </label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        value={settings.catalogInstagram || ''}
                        onChange={e => handleChange('catalogInstagram', e.target.value)}
                        placeholder="https://instagram.com/minhaloja"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Mail size={14} /> Email para Contato
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        value={settings.catalogContactEmail || ''}
                        onChange={e => handleChange('catalogContactEmail', e.target.value)}
                        placeholder="contato@minhaloja.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <ShoppingCart size={14} /> WhatsApp para Pedidos
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        value={settings.catalogWhatsapp || ''}
                        onChange={e => handleChange('catalogWhatsapp', e.target.value)}
                        placeholder="5511999999999"
                      />
                    </div>
                  </div>
                </section>

                {/* Seção 3 – Aparência */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Seção 3 – Aparência</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Image size={14} /> Logo da Loja
                      </label>
                      <div className="flex items-start gap-4">
                        <div className="relative w-32 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0 group">
                          {settings.catalogLogo ? (
                            <>
                              <img src={settings.catalogLogo} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                              <button
                                onClick={() => handleChange('catalogLogo', null)}
                                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400">
                              <UploadCloud size={20} />
                              <span className="text-[9px] font-bold">Upload</span>
                            </div>
                          )}
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/png, image/jpeg"
                            onChange={handleLogoUpload}
                          />
                        </div>
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] text-slate-500 leading-tight">Formatos aceitos: <strong>PNG ou JPG</strong></p>
                          <p className="text-[10px] text-slate-500 leading-tight">Recomendado: <strong>282px x 80px</strong></p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Type size={14} /> Frase do Rodapé
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm min-h-[80px]"
                        value={settings.catalogFooterMessage || ''}
                        onChange={e => handleChange('catalogFooterMessage', e.target.value)}
                        placeholder="Esta frase aparecerá abaixo da logo no rodapé do catálogo."
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Exibição e Comportamento (Existing settings, regrouped) */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opções de Exibição</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-xs text-slate-700">Mostrar Preço</span>
                      <input type="checkbox" checked={settings.catalogShowPrice !== false} onChange={e => handleChange('catalogShowPrice', e.target.checked)} className="toggle" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-xs text-slate-700">Mostrar Estoque</span>
                      <input type="checkbox" checked={settings.catalogShowStock || false} onChange={e => handleChange('catalogShowStock', e.target.checked)} className="toggle" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-xs text-slate-700">Mostrar Variações</span>
                      <input type="checkbox" checked={settings.catalogShowVariations !== false} onChange={e => handleChange('catalogShowVariations', e.target.checked)} className="toggle" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-xs text-slate-700">Permitir Pedido Direto</span>
                      <input type="checkbox" checked={settings.catalogAllowDirectOrder || false} onChange={e => handleChange('catalogAllowDirectOrder', e.target.checked)} className="toggle" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Mensagem Automática de Atendimento</label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                      value={settings.catalogAutoMessage || ''}
                      onChange={e => handleChange('catalogAutoMessage', e.target.value)}
                      placeholder="Olá! Recebemos seu pedido e já vamos te atender."
                    />
                  </div>
                </section>
                {renderActionButtons()}
              </div>
            )}

            {/* USUÁRIOS */}
            {activeTab === 'usuarios' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Gerenciamento de Usuários</h2>
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Users size={40} className="mx-auto text-slate-300 mb-2" />
                  <h3 className="font-bold text-slate-600">Em Desenvolvimento</h3>
                  <p className="text-xs text-slate-400">O gerenciamento avançado de usuários estará disponível na próxima atualização.</p>
                </div>
                {renderActionButtons()}
              </div>
            )}

            {/* INTEGRAÇÕES */}
            {activeTab === 'integracoes' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Integrações Externas</h2>
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Plug size={40} className="mx-auto text-slate-300 mb-2" />
                  <h3 className="font-bold text-slate-600">🚧 Em Breve</h3>
                  <p className="text-xs text-slate-400">Conecte sua loja com marketplaces e sistemas externos.</p>
                </div>
                {renderActionButtons()}
              </div>
            )}




            {/* SEGURANÇA */}
            {activeTab === 'seguranca' && (
              <div className="space-y-6">
                <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Segurança e Auditoria</h2>

                <div className="space-y-4">
                  <button className="w-full md:w-auto px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Alterar Minha Senha
                  </button>

                  <div className="mt-8">
                    <h3 className="font-bold text-sm text-slate-700 mb-2">Histórico de Atividades</h3>
                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-2">Data</th>
                            <th className="px-4 py-2">Usuário</th>
                            <th className="px-4 py-2">Ação</th>
                            <th className="px-4 py-2">Detalhes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-white">
                            <td className="px-4 py-2 text-slate-500">Hoje, 14:30</td>
                            <td className="px-4 py-2 font-bold">Admin</td>
                            <td className="px-4 py-2 text-blue-600 font-medium">Login</td>
                            <td className="px-4 py-2 text-slate-400 text-xs">Acesso ao sistema</td>
                          </tr>
                          {/* Placeholder rows */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {renderActionButtons()}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
