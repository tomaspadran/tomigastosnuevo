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
  Zap
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
        <aside className="hidden md:flex flex-col w-20 bg-card border-r border-border/50 shrink-0 sticky top-0 h-screen z-20 py-8 items-center shadow-2xl shadow-black/5">
            <div className="mb-12 w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 transition-transform hover:rotate-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <Zap className="w-6 h-6 fill-current" />
            </div>
            
            <nav className="flex flex-col gap-6 flex-grow w-full items-center">
                {menuItems.map((item, idx) => (
                    <button 
                        key={idx}
                        onClick={() => navigate(item.path)}
                        title={item.label}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                            location.pathname === item.path 
                                ? 'bg-primary shadow-lg shadow-primary/30 text-primary-foreground scale-110' 
                                : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                    </button>
                ))}
            </nav>

            <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/profiles')}
                  title="Configuración de Perfiles"
                  className={`w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                    location.pathname === '/profiles' ? 'bg-slate-100 dark:bg-slate-800 text-foreground' : ''
                  }`}
                >
                    <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  title="Cerrar Sesión"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
