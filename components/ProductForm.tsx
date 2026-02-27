
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  X,
  UploadCloud,
  Info,
  Layers,
  Package,
  Tag,
  Loader2,
  HelpCircle,
  Settings,
  ChevronDown,
  Plus,
  ChevronRight,
  ArrowLeft,
  Trash2,
  AlertCircle,
  ImageOff,
  GripVertical,
  ChevronUp
} from 'lucide-react';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // States
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newIsCombo, setNewIsCombo] = useState(false);
  const [newIsFractional, setNewIsFractional] = useState(false);
  const [newControlStock, setNewControlStock] = useState(true);
  const [newAvailableQty, setNewAvailableQty] = useState('0');
  const [newMinStockQty, setNewMinStockQty] = useState('0');
  const [newCatalogMinStock, setNewCatalogMinStock] = useState('0');
  const [newReceiptMessage, setNewReceiptMessage] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [suppliersList, setSuppliersList] = useState<string[]>(['Fornecedor A', 'Fornecedor B', 'Fornecedor C']);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [newCost, setNewCost] = useState('');
  const [newProfitPercent, setNewProfitPercent] = useState('0'); // Markup
  const [newRealMargin, setNewRealMargin] = useState('0'); // Margem Real
  const [newProfitAmount, setNewProfitAmount] = useState('0');

  const [newIsPromotionalPrice, setNewIsPromotionalPrice] = useState(false);
  const [newPromotionalDiscount, setNewPromotionalDiscount] = useState('');
  const [newPromotionalPrice, setNewPromotionalPrice] = useState('');
  const [newPromotionalProfitAmount, setNewPromotionalProfitAmount] = useState('0');
  const [newPromotionalMargin, setNewPromotionalMargin] = useState('0');
  const [newShowInCatalog, setNewShowInCatalog] = useState(true);
  const [newIsActive, setNewIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [allCharacteristics, setAllCharacteristics] = useState<any[]>([]);
  const [productCharacteristics, setProductCharacteristics] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States para Variações
  const [variationType, setVariationType] = useState('Sem variação');
  const [primaryChar, setPrimaryChar] = useState('');
  const [secondaryChar, setSecondaryChar] = useState('');
  const [isVarDropdownOpen, setIsVarDropdownOpen] = useState(false);
  const [primaryOptions, setPrimaryOptions] = useState<string[]>([]);
  const [secondaryOptions, setSecondaryOptions] = useState<string[]>([]);
  const [primaryInput, setPrimaryInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [showPrimaryInput, setShowPrimaryInput] = useState(false);
  const [showSecondaryInput, setShowSecondaryInput] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState<any[]>([]);
  const [expandedVariation, setExpandedVariation] = useState<string | null>(null);

  // Unsaved changes state
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Reset isDirty when data is loaded (for editing)
  useEffect(() => {
    if (!isLoading && isEditing) {
      setIsDirty(false);
    }
  }, [isLoading, isEditing]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSafeNavigate = (path: string) => {
    if (isDirty) {
      setPendingPath(path);
      setShowExitModal(true);
    } else {
      navigate(path);
    }
  };

  const confirmExit = () => {
    setIsDirty(false);
    setShowExitModal(false);
    if (pendingPath) {
      navigate(pendingPath);
    }
  };

  const getPotentialVariationsCount = () => {
    if (variationType === 'Variação simples') return primaryOptions.length;
    if (variationType === 'Variação dupla') return primaryOptions.length * secondaryOptions.length;
    return 0;
  };

  const handleGenerateVariations = () => {
    let variants: any[] = [];

    if (variationType === 'Variação simples' && primaryOptions.length > 0) {
      variants = primaryOptions.map((opt, idx) => ({
        id: Date.now() + idx,
        name: `${primaryChar}: ${opt}`,
        primaryValue: opt,
        price: '',
        costPrice: '',
        sku: '',
        barcode: '',
        stock: '0',
        minStock: '0',
        weight: '0',
        height: '0',
        width: '0',
        length: '0',
        images: []
      }));
    } else if (variationType === 'Variação dupla' && primaryOptions.length > 0 && secondaryOptions.length > 0) {
      primaryOptions.forEach((pOpt, pIdx) => {
        secondaryOptions.forEach((sOpt, sIdx) => {
          variants.push({
            id: Date.now() + pIdx * 100 + sIdx,
            name: `${pOpt} / ${sOpt}`,
            primaryValue: pOpt,
            secondaryValue: sOpt,
            price: '',
            costPrice: '',
            sku: '',
            barcode: '',
            stock: '0',
            minStock: '0',
            weight: '0',
            height: '0',
            width: '0',
            length: '0',
            images: []
          });
        });
      });
    }

    // Filtrar duplicatas (por cor e tamanho) antes de concatenar
    const newVariants = variants.filter(nv => {
      const exists = generatedVariations.some(ev =>
        (ev.primaryValue === nv.primaryValue && (!ev.secondaryValue || ev.secondaryValue === nv.secondaryValue)) ||
        (ev.color === nv.primaryValue && (!ev.size || ev.size === nv.secondaryValue))
      );
      return !exists;
    });

    if (newVariants.length === 0 && variants.length > 0) {
      alert('Essas variações já foram adicionadas.');
      return;
    }

    setGeneratedVariations([...generatedVariations, ...newVariants]);
    // Limpar inputs após gerar
    setPrimaryOptions([]);
    setSecondaryOptions([]);
  };

  // Drag and Drop Logic
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Opcional: definir uma imagem fantasma ou dados, se necessário
    // e.dataTransfer.setData("text/html", e.currentTarget.parentNode);
    // e.dataTransfer.setDragImage(e.currentTarget.parentNode, 20, 20);
  };

  const onDragOver = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newVariations = [...generatedVariations];
    const draggedItem = newVariations[draggedItemIndex];
    newVariations.splice(draggedItemIndex, 1);
    newVariations.splice(index, 0, draggedItem);

    setGeneratedVariations(newVariations);
    setDraggedItemIndex(index);
    setIsDirty(true);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories?status=ATIVA`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filtra apenas categorias PAI (sem parentId)
        const parentCategories = data.categories.filter((cat: any) => !cat.parentId);
        setRealCategories(parentCategories);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/brands?status=ATIVA`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
    }
  };

  const fetchCharacteristics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/characteristics?status=ATIVA`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAllCharacteristics(data.characteristics);
      }
    } catch (error) {
      console.error('Erro ao buscar características:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchCharacteristics();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const product = data.products.find((p: any) => p.id === id);
        if (product) {
          setNewName(product.name);
          setNewSku(product.sku);
          setSelectedCategoryId(product.categoryId || '');
          setSelectedBrandId(product.brandId || ''); // Carregar marca
          // Fallback para supplier antigo se necessário, mas prioriza brandId
          // setSelectedSupplier(product.supplier || ''); 
          setNewPrice(product.price.toString());
          setNewDescription(product.description || '');
          setNewBarcode(product.barcode || '');
          setNewIsCombo(!!product.isCombo);
          setNewIsFractional(!!product.isFractional);
          setNewControlStock(!!product.controlStock);
          setNewAvailableQty(String(product.availableQty || 0));
          setNewMinStockQty(String(product.minStockQty || 0));
          setNewCatalogMinStock(String(product.catalogMinStock || 0));
          setNewReceiptMessage(product.receiptMessage || '');
          setNewSupplier(product.supplier || '');
          setNewCost(String(product.cost || 0));
          setNewProfitPercent(String(product.profitPercent || 0));
          setNewProfitAmount(String(product.profitAmount || 0));
          setNewShowInCatalog(!!product.showInCatalog);
          setNewIsActive(product.active !== false);

          setNewIsPromotionalPrice(!!product.isPromotionalPrice);
          if (product.promotionalDiscountPercentage !== null && product.promotionalDiscountPercentage !== undefined) {
            setNewPromotionalDiscount(String(product.promotionalDiscountPercentage));
          }
          if (product.promotionalPrice !== null && product.promotionalPrice !== undefined) {
            setNewPromotionalPrice(String(product.promotionalPrice));
          }

          if (product.images && product.images.length > 0) {
            setImages(product.images);
          } else if (product.image) {
            setImages([product.image]);
          } else {
            setImages([]);
          }

          // Carregar características
          if (product.characteristics) {
            setProductCharacteristics(product.characteristics.map((c: any) => ({
              characteristicId: c.characteristicId,
              value: c.value
            })));
          }

          // Carregar variações se existirem
          if (product.variations && product.variations.length > 0) {
            const vars = product.variations;
            const hasColor = vars.some((v: any) => v.color);
            const hasSize = vars.some((v: any) => v.size);

            if (hasColor && hasSize) {
              setVariationType('Variação dupla');
              setPrimaryChar('Cor');
              setSecondaryChar('Tamanho');

              setPrimaryChar('Cor');
              setSecondaryChar('Tamanho');
              setShowPrimaryInput(true); // Mostrar input automaticamente
              setShowSecondaryInput(true); // Mostrar input automaticamente

              // NÃO preencher options para manter inputs limpos na edição
              setPrimaryOptions([]);
              setSecondaryOptions([]);

              setGeneratedVariations(vars.map((v: any) => ({
                id: v.id,
                name: `${v.color} / ${v.size}`,
                variationCode: v.variationCode, // <--- Adicionado
                primaryValue: v.color,
                secondaryValue: v.size,
                price: '', // Backend não suporta preço por variação ainda
                sku: '',   // Backend não suporta SKU por variação ainda
                stock: String(v.quantity || 0),
                minStock: '0',
                images: v.images || []
              })));
            } else if (hasColor || hasSize) {
              setVariationType('Variação simples');
              const char = hasColor ? 'Cor' : 'Tamanho';
              setPrimaryChar(char);
              setShowPrimaryInput(true); // Mostrar input automaticamente

              // NÃO preencher options para manter inputs limpos na edição
              setPrimaryOptions([]);

              setGeneratedVariations(vars.map((v: any) => ({
                id: v.id,
                name: `${char}: ${hasColor ? v.color : v.size}`,
                variationCode: v.variationCode, // <--- Adicionado
                primaryValue: hasColor ? v.color : v.size,
                price: '',
                sku: '',
                stock: String(v.quantity || 0),
                minStock: '0',
                images: v.images || []
              })));
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfit = (price: string, cost: string, isPromo: boolean, promoPrice: string) => {
    const c = parseFloat(cost) || 0;
    const p = parseFloat(price) || 0;

    // Cálculos Normais
    const amount = p - c;
    const markup = c > 0 ? (amount / c) * 100 : 0;
    const marginReal = p > 0 ? (amount / p) * 100 : 0;

    setNewProfitAmount(amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setNewProfitPercent(markup.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setNewRealMargin(marginReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

    // Cálculos Promocionais
    if (isPromo) {
      const pp = parseFloat(promoPrice) || 0;
      const promoAmount = pp - c;
      const promoMargin = pp > 0 ? (promoAmount / pp) * 100 : 0;
      setNewPromotionalProfitAmount(promoAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setNewPromotionalMargin(promoMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setNewPromotionalProfitAmount('0');
      setNewPromotionalMargin('0');
    }
  };

  useEffect(() => {
    calculateProfit(newPrice, newCost, newIsPromotionalPrice, newPromotionalPrice);
  }, [newPrice, newCost, newIsPromotionalPrice, newPromotionalPrice]);

  // Recalculo inteligente do desconto ou preço promo
  const handleDiscountChange = (val: string) => {
    setNewPromotionalDiscount(val);
    const p = parseFloat(newPrice) || 0;
    const d = parseFloat(val) || 0;
    if (p > 0 && d >= 0 && d <= 100) {
      const newPromo = p - (p * (d / 100));
      setNewPromotionalPrice(newPromo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else if (val === '') {
      setNewPromotionalPrice('');
    }
    setIsDirty(true);
  };

  const handlePromoPriceChange = (val: string) => {
    setNewPromotionalPrice(val);
    const p = parseFloat(newPrice) || 0;
    const pp = parseFloat(val) || 0;
    if (p > 0 && pp >= 0) {
      const d = ((p - pp) / p) * 100;
      setNewPromotionalDiscount(d.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else if (val === '') {
      setNewPromotionalDiscount('');
    }
    setIsDirty(true);
  };

  // Recalcular quando altera o Preço Final (mantendo o desconto)
  useEffect(() => {
    if (newIsPromotionalPrice && newPromotionalDiscount && newPrice) {
      const p = parseFloat(newPrice) || 0;
      const d = parseFloat(newPromotionalDiscount) || 0;
      if (p > 0 && d >= 0) {
        const newPromo = p - (p * (d / 100));
        setNewPromotionalPrice(newPromo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    }
  }, [newPrice]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/products/${id}`
        : `${import.meta.env.VITE_API_URL}/products`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          sku: newSku,
          categoryId: selectedCategoryId,
          price: parseFloat(newPrice) || 0,
          description: newDescription,
          barcode: newBarcode,
          isCombo: newIsCombo,
          isFractional: newIsFractional,
          controlStock: newControlStock,
          availableQty: parseInt(newAvailableQty) || 0,
          minStockQty: parseInt(newMinStockQty) || 0,
          catalogMinStock: parseInt(newCatalogMinStock) || 0,
          receiptMessage: newReceiptMessage,
          brandId: selectedBrandId,
          supplier: newSupplier,
          cost: parseFloat(newCost) || 0,
          profitPercent: parseFloat(newProfitPercent) || 0,
          profitAmount: parseFloat(newProfitAmount) || 0,
          active: newIsActive,
          showInCatalog: newShowInCatalog,
          isPromotionalPrice: newIsPromotionalPrice,
          promotionalDiscountPercentage: newIsPromotionalPrice ? (parseFloat(newPromotionalDiscount) || null) : null,
          promotionalPrice: newIsPromotionalPrice ? (parseFloat(newPromotionalPrice) || null) : null,
          variations: generatedVariations.map(v => {
            // Mapeamento inteligente baseado na escolha do usuário
            let color = null;
            let size = null;
            let explicitMap = false;

            if (variationType === 'Variação simples') {
              if (primaryChar === 'Cor') { color = v.primaryValue; explicitMap = true; }
              if (primaryChar === 'Tamanho') { size = v.primaryValue; explicitMap = true; }
            } else if (variationType === 'Variação dupla') {
              if (primaryChar === 'Cor') color = v.primaryValue;
              if (primaryChar === 'Tamanho') size = v.primaryValue;

              if (secondaryChar === 'Cor') color = v.secondaryValue;
              if (secondaryChar === 'Tamanho') size = v.secondaryValue;
              explicitMap = true;
            }

            // Se não houve mapeamento explícito (ex: chars vazios), usa fallback
            if (!explicitMap) {
              color = v.primaryValue || v.color || null;
              size = v.secondaryValue || v.size || null;
            }

            return {
              ...v,
              primaryValue: undefined,
              secondaryValue: undefined,
              color,
              size,
              images: v.images || []
            };
          }),
          images: images,
          image: images.length > 0 ? images[0] : null, // Mantém compatibilidade com campo antigo
          characteristics: productCharacteristics
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar produto');
      }

      setIsDirty(false);
      navigate('/inventory');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#0158ad]" size={40} />
        <p className="text-slate-500 font-bold text-sm">Carregando dados do produto...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-slate-400 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
        <button onClick={() => handleSafeNavigate('/inventory')} className="hover:text-blue-600 transition-colors">Produtos</button>
        <ChevronRight size={10} />
        <button onClick={() => handleSafeNavigate('/inventory')} className="hover:text-blue-600 transition-colors">Lista de produtos</button>
        <ChevronRight size={10} />
        <span className="font-medium text-slate-500">{isEditing ? 'Editar produto' : 'Adicionar produto'}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => handleSafeNavigate('/inventory')}
            className="p-2 md:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-[26px] font-black text-[#1e293b] tracking-tight leading-tight">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500">Configure as informações gerais e técnicas do item</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => handleSafeNavigate('/inventory')}
            className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={isSubmitting}
            className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-2.5 bg-[#0158ad] text-white rounded-xl font-bold text-sm hover:bg-blue-800 shadow-md shadow-blue-50 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar' : 'Cadastrar')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-20 md:mb-10">
        <form onSubmit={handleSaveProduct} className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20">
          {/* Nome do Produto - Topo Full Width */}
          <div className="space-y-2 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight pl-1">Nome do produto</label>
                <span className="text-rose-500 font-bold">*</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest">{newName.length} / 200</span>
            </div>
            <input
              required
              type="text"
              placeholder="Ex: Camiseta de manga longa"
              className="w-full px-4 md:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm"
              value={newName}
              maxLength={200}
              onChange={(e) => { setNewName(e.target.value); setIsDirty(true); }}
            />
            <p className="text-[9px] text-slate-400 font-medium pl-1">Dê ao seu produto um nome curto e claro.</p>
          </div>

          {/* Section: Status e Visibilidade (Moved to top) */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden mb-6">
            <div className="p-4 flex items-center justify-between hover:bg-white transition-colors cursor-pointer" onClick={() => setNewShowInCatalog(!newShowInCatalog)}>
              <div className="flex gap-3 items-start">
                <div className="mt-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-black text-slate-700">Mostrar produto no catálogo?</span>
                    <HelpCircle size={12} className="text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight max-w-[200px] md:max-w-none">Desabilitando essa opção o produto não aparecerá no seu catálogo.</p>
                </div>
              </div>
              <button
                type="button"
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${newShowInCatalog ? 'bg-[#0158ad]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newShowInCatalog ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Grid: Photos & Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-100 pb-8">
            {/* Left: Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-[#0158ad] uppercase tracking-widest flex items-center gap-2">
                  <UploadCloud size={14} /> Fotos do Produto ({images.length}/4)
                </h4>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 min-h-[140px]">
                {/* Lista de Imagens */}
                {images.map((img, index) => (
                  <div key={index} className="relative w-32 h-32 flex-shrink-0 group">
                    <div className="w-full h-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm relative">
                      <img src={img} alt={`Produto ${index + 1}`} className="w-full h-full object-cover" />

                      {/* Tag Principal */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-white text-[9px] font-black uppercase rounded shadow-sm">
                          Principal
                        </div>
                      )}

                      {/* Botão Remover */}
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = images.filter((_, i) => i !== index);
                          setImages(newImages);
                          setIsDirty(true);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Botão Adicionar */}
                {images.length < 4 && (
                  <div className="w-32 h-32 flex-shrink-0 relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 350 * 1024) { // 350KB Limit
                            alert("A imagem deve ter no máximo 350KB.");
                            return;
                          }

                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setImages([...images, reader.result]);
                              setIsDirty(true);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/10 transition-all">
                      <div className="p-2 bg-slate-100 rounded-xl text-slate-400">
                        <Plus size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">Adicionar<br />imagem</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2">
                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-blue-700">Recomendações:</p>
                  <ul className="text-[9px] text-blue-600/80 list-disc list-inside mt-0.5 space-y-0.5">
                    <li>Tamanho máximo: <strong>350KB</strong> por imagem</li>
                    <li>Resolução ideal: <strong>900x1192px</strong> (formato vertical)</li>
                    <li>Formatos: JPG ou PNG</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Pricing */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} /> Precificação e Lucro
              </h4>

              <div className="bg-blue-50/20 p-5 rounded-3xl border border-blue-100/30 space-y-4 h-full flex flex-col justify-between">

                {/* Toggle de Preço Promocional */}
                <div className="flex items-center justify-between pb-3 border-b border-blue-100/50">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#0158ad] uppercase tracking-wide cursor-pointer select-none" onClick={() => setNewIsPromotionalPrice(!newIsPromotionalPrice)}>
                      Ativar Preço Promocional
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewIsPromotionalPrice(!newIsPromotionalPrice);
                      setIsDirty(true);
                      if (newIsPromotionalPrice) {
                        setNewPromotionalDiscount('');
                        setNewPromotionalPrice('');
                      }
                    }}
                    className={`w-10 h-5 rounded-full relative transition-all shrink-0 ${newIsPromotionalPrice ? 'bg-amber-400' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newIsPromotionalPrice ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight pl-1">Custo Unitário</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-lg text-slate-700"
                        value={newCost}
                        onChange={(e) => { setNewCost(e.target.value); setIsDirty(true); }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold text-blue-600 uppercase tracking-tight pl-1">Preço Final</label>
                      <span className="text-rose-500 font-bold">*</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0158ad] font-bold text-sm">R$</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black text-lg text-[#0158ad] shadow-sm"
                        value={newPrice}
                        onChange={(e) => { setNewPrice(e.target.value); setIsDirty(true); }}
                      />
                    </div>
                  </div>
                </div>

                {/* Area Promocional Animada */}
                {newIsPromotionalPrice && (
                  <div className="grid grid-cols-2 gap-4 pt-2 pb-1 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-amber-500 uppercase tracking-tight pl-1">Desconto (%)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500/50 font-bold text-sm">%</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-black text-lg text-amber-600 shadow-sm"
                          value={newPromotionalDiscount}
                          onChange={(e) => handleDiscountChange(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight pl-1">Preço Promo</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50 font-bold text-sm">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-lg text-emerald-600 shadow-sm"
                          value={newPromotionalPrice}
                          onChange={(e) => handlePromoPriceChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mt-auto pt-4 relative">
                  <div className={`p-3 bg-white rounded-2xl border ${newIsPromotionalPrice ? 'border-amber-100 shadow-amber-50' : 'border-blue-50 shadow-sm'} text-center transition-all`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{newIsPromotionalPrice ? 'Markup (Promo)' : 'Markup'}</p>
                    <p className={`text-lg font-black ${parseFloat(newIsPromotionalPrice && newPromotionalPrice ? newPromotionalMargin /* simplificando, exibimos margin */ : newProfitPercent) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {newIsPromotionalPrice && newPromotionalPrice ? newPromotionalMargin : newProfitPercent}%
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1">{newIsPromotionalPrice ? <s className="text-slate-400">{newProfitPercent}%</s> : 'Markup'}</p>
                  </div>
                  <div className={`p-3 bg-white rounded-2xl border ${newIsPromotionalPrice ? 'border-amber-100 shadow-amber-50' : 'border-blue-50 shadow-sm'} text-center transition-all`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{newIsPromotionalPrice ? 'Margem (Promo)' : 'Margem (%)'}</p>
                    <p className={`text-lg font-black ${parseFloat(newIsPromotionalPrice && newPromotionalPrice ? newPromotionalMargin : newRealMargin) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {newIsPromotionalPrice && newPromotionalPrice ? newPromotionalMargin : newRealMargin}%
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1">{newIsPromotionalPrice ? <s className="text-slate-400">{newRealMargin}%</s> : 'Margem real'}</p>
                  </div>
                  <div className={`p-3 bg-white rounded-2xl border ${newIsPromotionalPrice ? 'border-amber-100 shadow-amber-50' : 'border-blue-50 shadow-sm'} text-center transition-all`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{newIsPromotionalPrice ? 'Lucro (Promo)' : 'Lucro Líquido'}</p>
                    <p className={`text-lg font-black ${parseFloat(newIsPromotionalPrice && newPromotionalPrice ? newPromotionalProfitAmount : newProfitAmount) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      R$ {newIsPromotionalPrice && newPromotionalPrice ? newPromotionalProfitAmount : newProfitAmount}
                    </p>
                    {newIsPromotionalPrice && (
                      <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1"><s className="text-slate-400">R$ {newProfitAmount}</s></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Informações Básicas (Reorganized) */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-[#0158ad] uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Informações Principais
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Referência */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase tracking-tight">Referência / SKU</label>
                  <span className="text-slate-300 font-bold">(opcional)</span>
                </div>
                <input
                  type="text"
                  placeholder="PML-001"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold uppercase text-slate-700 text-sm"
                  value={newSku}
                  onChange={(e) => { setNewSku(e.target.value); setIsDirty(true); }}
                />
              </div>

              {/* GTIN / EAN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase tracking-tight">GTIN / EAN</label>
                <input
                  type="text"
                  placeholder="Código de barras"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm"
                  value={newBarcode}
                  onChange={(e) => { setNewBarcode(e.target.value); setIsDirty(true); }}
                />
              </div>

              {/* Fornecedor / Marca */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase tracking-tight">Fornecedor / Marca</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                    value={selectedBrandId}
                    onChange={(e) => { setSelectedBrandId(e.target.value); setIsDirty(true); }}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Selecione a marca</option>
                    {brands.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate('/brands')}
                    className="w-12 h-12 bg-transparent border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-500 rounded-xl flex items-center justify-center transition-all font-black text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase tracking-tight">Categoria</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 text-sm appearance-none cursor-pointer"
                    value={selectedCategoryId}
                    onChange={(e) => { setSelectedCategoryId(e.target.value); setIsDirty(true); }}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Selecione a categoria</option>
                    {realCategories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    className="w-12 h-12 bg-transparent border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-500 rounded-xl flex items-center justify-center transition-all font-black text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Descrições e Notas */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} /> Descrições e Notas
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight pl-1">Descrição</label>
                <textarea
                  rows={4}
                  placeholder="Digite a descrição do produto"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-600 text-sm resize-none"
                  value={newDescription}
                  onChange={(e) => { setNewDescription(e.target.value); setIsDirty(true); }}
                />
                <p className="text-[9px] text-slate-400 font-medium pl-1">A descrição irá aparecer na descrição do produto no seu catálogo</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight pl-1">Notas</label>
                <textarea
                  rows={4}
                  placeholder="Exemplo: Garantia de 3 meses após a compra"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-600 text-sm resize-none"
                  value={newReceiptMessage}
                  onChange={(e) => { setNewReceiptMessage(e.target.value); setIsDirty(true); }}
                />
                <p className="text-[9px] text-slate-400 font-medium pl-1">Mensagem exibida abaixo do produto no comprovante.</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO DE VARIAÇÕES - APÓS O GRID, DENTRO DO FORM */}
          <div className="pt-10 border-t border-slate-100 mt-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-slate-700">Variações</h3>
                <p className="text-[11px] text-blue-500 font-bold mt-0.5">+ Adicionar variações (Cor e Tamanho)</p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsVarDropdownOpen(!isVarDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 transition-all min-w-[160px]"
                >
                  {variationType}
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isVarDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isVarDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {['Sem variação', 'Variação simples', 'Variação dupla'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${variationType === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        onClick={() => {
                          setVariationType(opt);
                          setIsVarDropdownOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {variationType !== 'Sem variação' && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                {/* Característica Primária */}
                {/* Característica Primária */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/30 border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex flex-col gap-0.5 w-full md:w-auto md:min-w-[140px] mb-4 md:mb-0">
                    <span className="text-xs font-black text-slate-700">Característica</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Primária</span>
                  </div>

                  <div className="flex-1 w-full md:px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
                      <div className="flex-1 w-full md:max-w-[180px]">
                        <select
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600 text-xs appearance-none cursor-pointer"
                          value={primaryChar}
                          onChange={(e) => {
                            setPrimaryChar(e.target.value);
                            if (e.target.value) setShowPrimaryInput(true);
                          }}
                        >
                          <option value="">Selecionar</option>
                          <option value="Cor">Cor</option>
                          <option value="Tamanho">Tamanho</option>
                          <option value="Voltagem">Voltagem</option>
                        </select>
                      </div>

                      {showPrimaryInput && primaryChar && (
                        <div className="flex-1 w-full md:w-auto flex gap-2 animate-in slide-in-from-left-2 duration-300">
                          <input
                            type="text"
                            placeholder={`Nome da ${primaryChar}...`}
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:border-blue-400 outline-none"
                            value={primaryInput}
                            onChange={(e) => setPrimaryInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (primaryInput.trim()) {
                                  const newOpts = primaryInput.split(',').map(o => o.trim()).filter(o => o !== '');
                                  setPrimaryOptions([...primaryOptions, ...newOpts]);
                                  setPrimaryInput('');
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (primaryInput.trim()) {
                                const newOpts = primaryInput.split(',').map(o => o.trim()).filter(o => o !== '');
                                setPrimaryOptions([...primaryOptions, ...newOpts]);
                                setPrimaryInput('');
                              }
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all"
                          >
                            Adicionar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {primaryOptions.map((opt, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-black flex items-center gap-1.5 animate-in zoom-in-50 duration-200">
                          {opt}
                          <button
                            type="button"
                            onClick={() => setPrimaryOptions(primaryOptions.filter((_, i) => i !== index))}
                            className="hover:text-rose-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Característica Secundária */}
                {variationType === 'Variação dupla' && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/30 border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex flex-col gap-0.5 w-full md:w-auto md:min-w-[140px] mb-4 md:mb-0">
                      <span className="text-xs font-black text-slate-700">Característica</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Secundária</span>
                    </div>

                    <div className="flex-1 w-full md:px-4">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
                        <div className="flex-1 w-full md:max-w-[180px]">
                          <select
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600 text-xs appearance-none cursor-pointer"
                            value={secondaryChar}
                            onChange={(e) => {
                              setSecondaryChar(e.target.value);
                              if (e.target.value) setShowSecondaryInput(true);
                            }}
                          >
                            <option value="">Selecionar</option>
                            <option value="Cor">Cor</option>
                            <option value="Tamanho">Tamanho</option>
                            <option value="Material">Material</option>
                          </select>
                        </div>

                        {showSecondaryInput && secondaryChar && (
                          <div className="flex-1 w-full md:w-auto flex gap-2 animate-in slide-in-from-left-2 duration-300">
                            <input
                              type="text"
                              placeholder={`Nome da ${secondaryChar}...`}
                              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:border-blue-400 outline-none"
                              value={secondaryInput}
                              onChange={(e) => setSecondaryInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (secondaryInput.trim()) {
                                    const newOpts = secondaryInput.split(',').map(o => o.trim()).filter(o => o !== '');
                                    setSecondaryOptions([...secondaryOptions, ...newOpts]);
                                    setSecondaryInput('');
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (secondaryInput.trim()) {
                                  const newOpts = secondaryInput.split(',').map(o => o.trim()).filter(o => o !== '');
                                  setSecondaryOptions([...secondaryOptions, ...newOpts]);
                                  setSecondaryInput('');
                                }
                              }}
                              className="px-3 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black hover:bg-purple-600 transition-all"
                            >
                              Adicionar
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {secondaryOptions.map((opt, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-full text-[10px] font-black flex items-center gap-1.5 animate-in zoom-in-50 duration-200">
                            {opt}
                            <button
                              type="button"
                              onClick={() => setSecondaryOptions(secondaryOptions.filter((_, i) => i !== index))}
                              className="hover:text-rose-500 transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between border-t border-slate-100 mt-4 gap-4">
                  <div className="flex items-center gap-2 group relative">
                    <p className="text-[11px] text-slate-500 font-bold">
                      Serão geradas <span className="text-[#0158ad] font-black">{getPotentialVariationsCount()} variações</span> do produto
                    </p>
                    <div className="relative">
                      <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-slate-600 transition-colors" />

                      {/* Custom Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-10">
                        Limite de 100 variações por produto
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateVariations}
                    className="w-full md:w-auto px-10 py-3 bg-[#0158ad] text-white rounded-xl font-black text-xs hover:bg-blue-800 transition-all shadow-md shadow-blue-50 border border-blue-600/20"
                  >
                    Gerar variações
                  </button>
                </div>
              </div>
            )}


            {/* LISTA DE VARIAÇÕES GERADAS */}
            {generatedVariations.length > 0 && (
              <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-700">Variações geradas ({generatedVariations.length})</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{primaryChar}{secondaryChar ? `, ${secondaryChar}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:text-blue-700">
                      Atualização em lote <Info size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedVariation(expandedVariation === null ? -1 : null)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-slate-600"
                    >
                      {expandedVariation === -1 ? 'Recolher todos' : 'Expandir todos'} <ChevronDown size={14} className={expandedVariation === -1 ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedVariations.map((v, idx) => {
                    const isExpanded = expandedVariation === v.id || expandedVariation === -1;
                    return (
                      <div
                        key={v.id}
                        className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${draggedItemIndex === idx ? 'opacity-50 border-blue-400' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, idx)}
                        onDragOver={(e) => {
                          e.preventDefault(); // Necessário para permitir o drop
                          onDragOver(idx);
                        }}
                        onDragEnd={onDragEnd}
                      >
                        {/* Row Header */}
                        <div
                          onClick={() => setExpandedVariation(expandedVariation === v.id ? null : v.id)}
                          className="flex items-center justify-between bg-slate-50/50 p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors group/header"
                        >
                          <div className="flex items-center gap-4">
                            <div className="cursor-grab active:cursor-grabbing p-1 -m-1">
                              <GripVertical size={16} className="text-slate-300 group-hover/header:text-slate-400" />
                            </div>
                            <div className="w-4 h-4 rounded bg-slate-900 border border-slate-800" />
                            <span className="text-xs font-black text-slate-700 group-hover/header:text-blue-600 transition-colors">
                              {/* Exibe o código da variação se existir */}
                              {v.variationCode && (
                                <span className="inline-flex items-center justify-center bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 mr-2 text-[10px] font-bold">
                                  #{v.variationCode}
                                </span>
                              )}
                              {v.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGeneratedVariations(generatedVariations.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="text-slate-400 group-hover/header:text-blue-500 transition-colors p-1">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Quick Edit Fields or Expanded View */}
                        <div className="p-4 md:p-6 transition-all">
                          {!isExpanded ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Preço de venda</label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                  <input
                                    type="text"
                                    placeholder="0,00"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                                    value={v.price || ''}
                                    onChange={(e) => {
                                      const updated = generatedVariations.map(variant =>
                                        variant.id === v.id ? { ...variant, price: e.target.value } : variant
                                      );
                                      setGeneratedVariations(updated);
                                      setIsDirty(true);
                                    }}
                                  />
                                </div>
                                {(!v.price || v.price === '') && (
                                  <p className="text-[9px] text-blue-400 font-bold">O preço ficará sob consulta</p>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Referência</label>
                                <input
                                  type="text"
                                  placeholder="REF-123"
                                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                                  value={v.sku || ''}
                                  onChange={(e) => {
                                    const updated = generatedVariations.map(variant =>
                                      variant.id === v.id ? { ...variant, sku: e.target.value } : variant
                                    );
                                    setGeneratedVariations(updated);
                                    setIsDirty(true);
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Estoque</label>
                                <div className="flex">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0"
                                    value={v.stock || ''}
                                    onChange={(e) => {
                                      const updated = generatedVariations.map(variant =>
                                        variant.id === v.id ? { ...variant, stock: e.target.value } : variant
                                      );
                                      setGeneratedVariations(updated);
                                      setIsDirty(true);
                                    }}
                                  />
                                  <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">UN</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                              {/* Extended Fields Row 1 */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Preço de venda</label>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                    <input
                                      type="text"
                                      placeholder="0,00"
                                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                                      value={v.price || ''}
                                      onChange={(e) => {
                                        const updated = generatedVariations.map(variant =>
                                          variant.id === v.id ? { ...variant, price: e.target.value } : variant
                                        );
                                        setGeneratedVariations(updated);
                                        setIsDirty(true);
                                      }}
                                    />
                                  </div>
                                  {(!v.price || v.price === '') && (
                                    <p className="text-[9px] text-blue-400 font-bold">O preço ficará sob consulta</p>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Referência</label>
                                  <input
                                    type="text"
                                    placeholder="REF-123"
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                                    value={v.sku || ''}
                                    onChange={(e) => {
                                      const updated = generatedVariations.map(variant =>
                                        variant.id === v.id ? { ...variant, sku: e.target.value } : variant
                                      );
                                      setGeneratedVariations(updated);
                                      setIsDirty(true);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Estoque</label>
                                  <div className="flex">
                                    <input
                                      type="number"
                                      placeholder="0"
                                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0"
                                      value={v.stock || ''}
                                      onChange={(e) => {
                                        const updated = generatedVariations.map(variant =>
                                          variant.id === v.id ? { ...variant, stock: e.target.value } : variant
                                        );
                                        setGeneratedVariations(updated);
                                        setIsDirty(true);
                                      }}
                                    />
                                    <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">UN</div>
                                  </div>
                                </div>
                              </div>

                              {/* Extended Fields Row 2 */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Preço de custo</label>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                    <input type="text" placeholder="0,00" className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">EAN/GTIN/UPC <Info size={10} className="inline" /></label>
                                  <div>
                                    <input type="text" placeholder="0000000000000" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700" />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Estoque mínimo</label>
                                  <div className="flex">
                                    <input type="number" placeholder="0" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0" />
                                    <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">UN</div>
                                  </div>
                                </div>
                              </div>

                              {/* Dimensions Row */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Peso</label>
                                  <div className="flex">
                                    <input type="number" placeholder="0" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0" />
                                    <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">GR</div>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Altura</label>
                                  <div className="flex">
                                    <input type="number" placeholder="0" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0" />
                                    <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">CM</div>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Largura</label>
                                  <div className="flex">
                                    <input type="number" placeholder="0" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0" />
                                    <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">CM</div>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Comprimento</label>
                                  <div className="flex">
                                    <input type="number" placeholder="0" className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-l-lg text-xs font-bold text-slate-700 border-r-0" />
                                    <div className="px-3 bg-slate-50 border border-slate-200 rounded-r-lg flex items-center text-[9px] font-black text-slate-400 uppercase">CM</div>
                                  </div>
                                </div>
                              </div>

                              {/* Variation Image Upload */}
                              {/* Variation Image Upload Gallery */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Imagens da variação</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 min-h-[100px]">
                                  {(v.images || []).map((img: string, i: number) => (
                                    <div key={i} className="relative w-24 h-24 flex-shrink-0 group/img">
                                      <div className="w-full h-full rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative">
                                        <img src={img} alt={`Variação ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedImages = (v.images || []).filter((_: string, idx: number) => idx !== i);
                                            const updated = generatedVariations.map(variant =>
                                              variant.id === v.id ? { ...variant, images: updatedImages } : variant
                                            );
                                            setGeneratedVariations(updated);
                                            setIsDirty(true);
                                          }}
                                          className="absolute top-1 right-1 p-1 bg-white text-rose-500 rounded-md shadow-sm opacity-0 group-hover/img:opacity-100 transition-all hover:bg-rose-50"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {(v.images || []).length < 4 && (
                                    <div className="w-24 h-24 flex-shrink-0 relative">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 350 * 1024) {
                                              alert("A imagem deve ter no máximo 350KB.");
                                              return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              if (typeof reader.result === 'string') {
                                                const currentImages = v.images || [];
                                                const updated = generatedVariations.map(variant =>
                                                  variant.id === v.id ? { ...variant, images: [...currentImages, reader.result] } : variant
                                                );
                                                setGeneratedVariations(updated);
                                                setIsDirty(true);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                      <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50/10 transition-all">
                                        <Plus size={16} className="text-slate-400" />
                                        <span className="text-[9px] font-bold text-slate-500">Add Foto</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Bottom Actions - Fixed on Mobile, Static on Desktop */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 z-50 md:static md:p-0 md:mt-12 md:pt-8 md:bg-transparent md:border-t-0 animate-in slide-in-from-bottom-4">
            <button
              type="button"
              onClick={() => handleSafeNavigate('/inventory')}
              className="flex-1 md:flex-none px-8 py-4 md:py-3 bg-white border border-slate-200 rounded-2xl md:rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition-all shadow-sm md:shadow-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              disabled={isSubmitting}
              className="flex-[2] md:flex-none px-10 py-4 md:py-3 bg-[#0158ad] text-white rounded-2xl md:rounded-xl font-black text-sm hover:bg-blue-800 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmação de saída */}
      {showExitModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[440px] w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">Atenção</h3>
              <button
                onClick={() => setShowExitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-8 py-10">
              <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
                Alterações que não foram salvas serão descartadas, deseja prosseguir?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-5 bg-slate-50/50">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-6 py-3 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-sm"
              >
                Continuar editando
              </button>
              <button
                onClick={confirmExit}
                className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-all shadow-md shadow-rose-200"
              >
                Descartar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
