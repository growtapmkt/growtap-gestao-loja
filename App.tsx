
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Conditionals from './components/Conditionals';
import Customers from './components/Customers';
import Cashier from './components/Cashier';
import Reports from './components/Reports';
import Catalog from './components/Catalog';
import Login from './components/Login';
import ProductForm from './components/ProductForm';
import Categories from './components/Categories';
import Characteristics from './components/Characteristics';
import Brands from './components/Brands';
import Settings from './components/Settings';
import CatalogVisual from './components/CatalogVisual';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Verificar se o token existe no localStorage ao carregar
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    // Garantir que o modo escuro esteja desativado no sistema
    document.documentElement.classList.remove('dark');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.location.hash = '/login';
  };

  // Public Catalog check
  const isCatalogPage = window.location.hash.includes('/catalog');

  // Se não estiver autenticado e não for página pública, forçar login
  if (!isAuthenticated && !isCatalogPage) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden pt-0 relative">
        {!isCatalogPage && (
          <Sidebar
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!isCatalogPage && (
            <Topbar
              onLogout={handleLogout}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/new" element={<ProductForm />} />
              <Route path="/inventory/edit/:id" element={<ProductForm />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/characteristics" element={<Characteristics />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/conditionals" element={<Conditionals />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/cashier" element={<Cashier />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog-visual" element={<CatalogVisual />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
