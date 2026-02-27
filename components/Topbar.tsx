
import React from 'react';
import { Search, Bell, Menu, ExternalLink, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onLogout, onToggleSidebar }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const storeName = user?.store?.name || 'Growtap';

  // Format date as "05 Mai, 2024"
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ de /g, ' ').replace('.', ',');

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 font-medium transition-colors duration-300">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="max-w-sm w-full relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <Link
          to="/catalog"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 text-[#0158ad] font-medium hover:bg-blue-50 rounded-lg transition-colors text-sm"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">Catálogo Online</span>
        </Link>

        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5 capitalize">{dateStr}</p>
            <p className="text-xs font-bold text-slate-700 leading-none">{storeName}</p>
          </div>
          <button className="bg-[#0158ad] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-800 shadow-md shadow-blue-50 transition-all">
            Suporte
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
