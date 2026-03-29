import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { useLoginHook } from '../../hooks/useLoginHook';

interface DashboardLayoutProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardLayout({ setIsLoggedIn }:DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useLoginHook();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground dark">
      <TopNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* ⚡ The Sidebar is now fully independent and controls its own routing */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-auto bg-background/50 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80 pointer-events-none" />
          <div className="relative h-full w-full p-6">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
}