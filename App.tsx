
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ServicesView from './components/ServicesView'; // Updated import
import LandingBuilder from './components/LandingBuilder'; 
import LoginPage from './components/LoginPage';
import SupportView from './components/SupportView';
import DomainsView from './components/DomainsView';
import UsersView from './components/UsersView';
import NodesView from './components/NodesView';
import BillingView from './components/BillingView';
import SecurityView from './components/SecurityView';
import SettingsView from './components/SettingsView';
import MaintenancePage from './components/MaintenancePage';
import { 
  Server, 
  User as UserIcon, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Construction, 
  Zap 
} from 'lucide-react';
import { MENU_ITEMS } from './constants';
import { UserRole, User } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing_view'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Developer Mode State (Hidden by default)
  const [isDevMode, setIsDevMode] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    email: 'ceo@qhosting.net',
    aurumId: 'AURUM-CEO-01',
    role: UserRole.CEO
  });

  // Identificar si la vista actual es pública (sin sidebar/header)
  const isPublicPage = ['landing_view', 'login'].includes(currentView);

  if (isMaintenanceMode && currentUser.role === UserRole.CLIENT) {
    return <MaintenancePage />;
  }

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('landing_view');
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => item.roles.includes(currentUser.role));

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard userRole={currentUser.role} />;
      case 'landing_view': return (
        <LandingBuilder 
          // SECURITY FIX: Si no está logueado, forzamos rol CLIENT para ocultar herramientas de Admin (Titan Architect)
          userRole={isLoggedIn ? currentUser.role : UserRole.CLIENT} 
          onOrder={() => setCurrentView('services')}
          onLoginClick={() => setCurrentView('login')} 
        />
      );
      case 'login': return <LoginPage onLogin={handleLogin} />;
      // New Services View (Combines List + Order Wizard)
      case 'services': return <ServicesView />;
      case 'domains': return <DomainsView />;
      case 'users': return <UsersView />;
      case 'infrastructure': return <NodesView />;
      case 'billing': return <BillingView />;
      case 'security': return <SecurityView />;
      case 'settings': return <SettingsView />;
      case 'support': return <SupportView />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 titan-glass rounded-[3rem] border border-slate-800/50 p-20">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-500 border border-slate-800">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-100 italic uppercase italic tracking-tighter">Acceso Restringido</h2>
          <p className="text-slate-500 max-w-sm">Tu nivel de acceso actual ({currentUser.role}) no permite visualizar este módulo del sistema singular.</p>
          <button onClick={() => setCurrentView('dashboard')} className="px-10 py-4 bg-cyan-400 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs shadow-cyan-glow">Regresar al Panel</button>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {!isPublicPage && (
        <aside 
          className={`${
            isSidebarOpen ? 'w-80' : 'w-24'
          } transition-all duration-700 ease-in-out titan-glass border-r border-slate-800/50 hidden md:flex flex-col relative z-20 m-4 rounded-[2.5rem]`}
        >
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-24 w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-cyan-400 hover:scale-110 shadow-cyan-glow transition-transform z-30"
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          <div className="p-8 flex items-center gap-5">
            <div className="min-w-[48px] w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center shadow-cyan-glow transform -rotate-12">
              <Server className="text-slate-950" size={28} />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white italic">Q-SYSTEM</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Institutional Node</span>
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-10">
            {filteredMenuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all group relative overflow-hidden ${
                  currentView === item.id 
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                {currentView === item.id && <div className="absolute left-0 top-0 w-1 h-full active-indicator"></div>}
                <div className={`${currentView === item.id ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-400'} transition-colors`}>
                  {item.icon}
                </div>
                {isSidebarOpen && <span className="font-black text-[11px] uppercase tracking-[0.2em]">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 mt-auto">
            <div className={`p-4 rounded-3xl border border-slate-800/50 bg-slate-900/40 mb-6 ${!isSidebarOpen && 'hidden'}`}>
               <div className="flex items-center gap-3 mb-3">
                 <div className={`w-2 h-2 rounded-full ${isDevMode ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></div>
                 <span className="text-[10px] font-black uppercase text-slate-500">Aurum Sync Active</span>
               </div>
               {/* Secret Developer Trigger */}
               <p 
                 onClick={() => setIsDevMode(!isDevMode)}
                 className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed cursor-pointer hover:text-cyan-400 transition-colors select-none"
                 title="Click to toggle Developer Mode"
               >
                 V.520.741.8 | ARM-01
               </p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-5 p-4 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="font-black text-[11px] uppercase tracking-widest">Desconexión</span>}
            </button>
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isPublicPage ? 'p-0' : 'p-4'}`}>
        {!isPublicPage && (
          <header className="h-20 flex items-center justify-between px-10 titan-glass border border-slate-800/50 rounded-[2.5rem] mb-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-black tracking-tighter text-slate-100 uppercase italic">
                {MENU_ITEMS.find(m => m.id === currentView)?.label || 'Titan System'}
              </h1>
              <div className="h-6 w-px bg-slate-800"></div>
              <div className="flex items-center gap-3 text-cyan-400/50 text-[10px] font-black tracking-[0.3em] uppercase">
                <Zap size={14}/> Nodo Titan Active
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentUser.email}</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">{currentUser.aurumId} | {currentUser.role}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-xl">
                <UserIcon size={24} />
              </div>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPublicPage ? 'p-0' : 'p-2'}`}>
          {renderContent()}
        </div>

        {/* System Role Swapper (Dev Tool) - Only visible if isDevMode is true */}
        {isDevMode && (
          <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
             <div className="titan-glass p-3 rounded-2xl border border-orange-500/30 flex flex-col gap-2 shadow-2xl">
                <p className="text-[8px] font-black text-orange-500 uppercase text-center mb-1">Developer Mode Active</p>
                <div className="flex gap-2">
                  {Object.values(UserRole).map(role => (
                    <button 
                      key={role}
                      onClick={() => setCurrentUser({...currentUser, role: role as UserRole})}
                      className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all border ${currentUser.role === role ? 'bg-cyan-400 border-cyan-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-cyan-400'}`}
                    >
                      {role.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                  className={`w-full py-2 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-2 border ${isMaintenanceMode ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                >
                  <Construction size={12} /> {isMaintenanceMode ? 'MANTENIMIENTO ON' : 'MANTENIMIENTO OFF'}
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
