import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Zap,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
      { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
      { icon: Wallet, path: '/add-expense', label: 'Ingresar Gasto' },
      { icon: ArrowRightLeft, path: '/history', label: 'Historial' },
      { icon: FileText, path: '/reports', label: 'Reportes' },
      { icon: BarChart3, path: '/stats', label: 'Estadísticas' }
    ];

    return (
        <aside className="hidden md:flex flex-col w-24 bg-card/40 backdrop-blur-xl border-r border-border/50 shrink-0 sticky top-0 h-screen z-20 py-10 items-center justify-between shadow-2xl">
            <div className="flex flex-col items-center gap-12 w-full">
                {/* Logo */}
                <div 
                    className="group relative w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 cursor-pointer transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden"
                    onClick={() => navigate('/dashboard')}
                >
                    <Zap className="w-8 h-8 fill-current relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Navigation */}
                <nav className="flex flex-col gap-4 w-full px-4">
                    {menuItems.map((item, idx) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div key={idx} className="relative group">
                                <button 
                                    onClick={() => navigate(item.path)}
                                    className={`relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-500 ${
                                        isActive 
                                            ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/25 scale-105' 
                                            : 'text-muted-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-foreground'
                                    }`}
                                >
                                    <item.icon className={`w-6 h-6 transition-transform duration-500 ${!isActive && 'group-hover:scale-110'}`} />
                                    
                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap border border-white/10 shadow-2xl">
                                        {item.label}
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-white/10 rotate-45" />
                                    </div>
                                </button>
                                
                                {isActive && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[4px_0_15px_rgba(var(--primary),0.5)]" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 w-full px-4">
                <button 
                  onClick={() => navigate('/profiles')}
                  className={`group relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-500 ${
                    location.pathname === '/profiles' 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' 
                        : 'text-muted-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-foreground'
                  }`}
                >
                    <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap border border-white/10">
                        Perfiles
                    </div>
                </button>
                
                <button 
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="group relative w-full aspect-square flex items-center justify-center rounded-2xl bg-rose-500/5 text-rose-500/60 hover:text-white hover:bg-rose-500 hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-500 border border-rose-500/10"
                >
                    <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap shadow-2xl">
                        Cerrar Sesión
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
