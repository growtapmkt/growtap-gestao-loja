
import React, { useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardCheck,
  Users,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Tag,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProductsOpen, setIsProductsOpen] = React.useState(true);

  // Verifica se o caminho atual pertence ao grupo de produtos
  const isProductsActive = location.pathname.startsWith('/inventory') || location.pathname.startsWith('/categories') || location.pathname.startsWith('/characteristics') || location.pathname.startsWith('/brands');

  // Fecha o submenu se navegar para fora da área de produtos
  useEffect(() => {
    if (!isProductsActive) {
      setIsProductsOpen(false);
    } else {
      setIsProductsOpen(true);
    }
  }, [isProductsActive]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Vendas', icon: ShoppingCart, path: '/sales' },
    { name: 'Condicionais', icon: ClipboardCheck, path: '/conditionals' },
    {
      name: 'Produtos',
      icon: Tag,
      path: '/inventory',
      isSubmenu: true,
      subItems: [
        { name: 'Lista de produtos', path: '/inventory' },
        { name: 'Categorias de Produto', path: '/categories' },
        { name: 'Características', path: '/characteristics' },
        { name: 'Marcas e Fornecedores', path: '/brands' },
      ]
    },
    { name: 'Clientes', icon: Users, path: '/customers' },
    { name: 'Caixa', icon: Wallet, path: '/cashier' },
    { name: 'Relatórios', icon: BarChart3, path: '/reports' },
    { name: 'Catálogo Visual', icon: Store, path: '/catalog-visual' },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 md:w-56 bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between md:justify-center border-b border-slate-50">
          <img src="/logo_preta.png" alt="Logo" className="h-10 w-auto object-contain" />
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            if (item.isSubmenu) {
              return (
                <div key={item.name} className="space-y-1">
                  <div
                    onClick={() => {
                      navigate('/inventory');
                      setIsProductsOpen(true);
                      onClose?.();
                    }}
                    className={`flex items-center justify-between w-full gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer group ${isProductsActive ? 'bg-[#0158ad] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={18} />
                      <span className={`text-sm ${isProductsActive ? 'font-bold' : ''}`}>{item.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProductsOpen(!isProductsOpen);
                      }}
                      className={`p-0.5 rounded-md hover:bg-white/10 transition-colors ${!isProductsActive && 'text-slate-400'}`}
                    >
                      {isProductsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isProductsOpen && (
                    <div className="ml-3 pl-3 border-l-[1px] border-slate-100 mt-0.5 space-y-0.5">
                      {item.subItems?.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => onClose?.()}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs ${isActive
                              ? 'bg-slate-100 text-[#0158ad] font-bold'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`
                          }
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-[#0158ad] text-white font-medium shadow-md shadow-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => onClose?.()}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Settings size={20} />
            <span>Configurações</span>
          </NavLink>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>

        <div className="p-3 bg-slate-50 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-2">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=0158ad&color=fff`}
              className="w-8 h-8 rounded-lg border border-white shadow-sm"
              alt="Profile"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.role === 'ADMIN' ? 'Admin' : 'Func.'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
