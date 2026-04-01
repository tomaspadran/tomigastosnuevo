import React, { useState, useMemo, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../components/theme-provider';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { 
  PlusCircle, 
  ShoppingBag,
  Trash2,
  Edit3,
  Moon,
  Sun,
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Utensils,
  Car,
  Check,
  Zap,
  BriefcaseMedical,
  Home,
  ShoppingCart,
  Briefcase,
  Baby,
  Dog,
  ArrowUp,
  Receipt,
  PiggyBank
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';
import AISuggestions from '../components/dashboard/AISuggestions';

const Dashboard = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
        const { data } = await supabase.from('members').select('*');
        if (data) setMembers(data);
    };
    fetchMembers();
  }, []);

  const getMemberAvatar = (name) => {
    const member = members.find(m => m.name === name);
    if (member?.avatar_url) return member.avatar_url;
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&bold=true`;
  };

  const getCategoryIcon = (category) => {
    const cat = category?.split(' - ')[0];
    switch (cat) {
        case "Casa": return <Home />;
        case "Salud y Cuidado Personal": return <BriefcaseMedical />;
        case "Supermercado": return <ShoppingCart />;
        case "Servicios Profesionales": return <Briefcase />;
        case "Juana": return <Baby />;
        case "Servicios": return <Zap />;
        case "Autos": return <Car />;
        case "Perra": return <Dog />;
        case "Shopping/Compras": return <ShoppingBag />;
        case "Salidas": return <Utensils />;
        case "Ingreso": return <TrendingUp />;
        default: return <Wallet />;
    }
  }

  const getCategoryColor = (category) => {
    const cat = category?.split(' - ')[0];
    switch (cat) {
        case "Casa": return "bg-cat-home";
        case "Salud y Cuidado Personal": return "bg-cat-health";
        case "Supermercado": return "bg-cat-food";
        case "Servicios Profesionales": return "bg-cat-services";
        case "Juana": return "bg-cat-kids";
        case "Servicios": return "bg-cat-services";
        case "Autos": return "bg-cat-car";
        case "Perra": return "bg-cat-pets";
        case "Shopping/Compras": return "bg-cat-shopping";
        case "Salidas": return "bg-cat-food";
        case "Ingreso": return "bg-cat-income";
        default: return "bg-primary";
    }
  }

  const stats = useMemo(() => {
    const totalIngresos = expenses
      .filter(e => e.transaction_type === 'ingreso')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const totalGastos = expenses
      .filter(e => e.transaction_type === 'gasto' || !e.transaction_type)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const totalAhorros = expenses
      .filter(e => e.transaction_type === 'ahorro')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const balance = totalIngresos - totalGastos - totalAhorros;

    const categoryMap = expenses.reduce((acc, curr) => {
      const mainCat = curr.category || curr.type?.split(' - ')[0] || 'Otros';
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const categoryData = Object.keys(categoryMap).map(name => ({
      name,
      monto: categoryMap[name]
    })).sort((a, b) => b.monto - a.monto);

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const currentYear = new Date().getFullYear();
    const evolutionData = monthNames.map((name, index) => {
      const monthlyTotal = expenses
        .filter(exp => {
          const d = new Date(exp.date);
          return d.getMonth() === index && d.getFullYear() === currentYear && (exp.transaction_type === 'gasto' || !exp.transaction_type);
        })
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      return { name, monto: monthlyTotal };
    });

    return { 
      totalIngresos, 
      totalGastos, 
      totalAhorros, 
      balance, 
      categoryData, 
      evolutionData,
      total: totalGastos,
      filtered: expenses // Agregamos la referencia a expenses para el filtrado
    };
  }, [expenses]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar registro?')) {
      await deleteExpense(id);
      toast.success('Eliminado correctamente');
    }
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Helper for loading states in cards
  const RenderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full w-full py-10 animate-pulse bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-border/50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sincronizando...</span>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground transition-colors duration-500 font-sans selection:bg-primary/30">
        
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-20 bg-card border-r border-border/50 shrink-0 sticky top-0 h-screen z-20 py-8 items-center shadow-2xl shadow-black/5">
            <div className="mb-12 w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 transition-transform hover:rotate-0">
                <Zap className="w-6 h-6 fill-current" />
            </div>
            <nav className="flex flex-col gap-6 flex-grow w-full items-center">
                {[
                  { icon: LayoutDashboard, path: '/dashboard', active: true },
                  { icon: Wallet, path: '/add-expense' },
                  { icon: ArrowRightLeft, path: '/history' },
                  { icon: FileText, path: '/reports' },
                  { icon: BarChart3, path: '/stats' }
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${item.active ? 'bg-primary shadow-lg shadow-primary/30 text-primary-foreground scale-110' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'}`}
                  >
                      <item.icon className="w-5 h-5" />
                  </button>
                ))}
            </nav>
            <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/profiles')}
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                    <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </aside>

        {/* Main Area */}
        <main className="flex-grow flex flex-col p-6 items-center overflow-y-auto">
            <div className="w-full max-w-7xl flex flex-col gap-8">
                
                {/* Header UHD */}
                <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                    <div className="flex flex-col">
                       <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic flex items-center gap-3 text-foreground font-heading">
                          <LayoutDashboard className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(44,75,218,0.4)]" />
                          Gastos Tomi-Gabi
                       </h1>
                       <p className="text-muted-foreground text-xs font-bold mt-1 tracking-[0.2em] uppercase opacity-60">Control Financiero Inteligente • UHD Edition</p>
                    </div>

                    <div className="flex-grow max-w-2xl w-full">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Busca transacciones, artículos, etc."
                                className="w-full bg-slate-100 dark:bg-slate-800/40 border border-transparent focus:border-primary/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold placeholder:text-muted-foreground/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-4k"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div onClick={() => navigate('/profiles')} className="flex items-center gap-3 cursor-pointer hover:bg-card px-3 py-1.5 rounded-2xl transition-all border border-transparent hover:border-border shadow-sm">
                            <img src={getMemberAvatar('Tomi')} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shadow-md" />
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                </header>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left & Middle Column */}
                    <div className="xl:col-span-2 flex flex-col gap-8">
                        
                        {/* Summary Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Balance Card UHD */}
                            <div className={`col-span-1 sm:col-span-2 bg-gradient-to-br ${stats.balance >= 0 ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/20' : 'from-rose-500 to-rose-600 shadow-rose-500/20'} rounded-[2rem] p-8 text-primary-foreground shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-100 group`}>
                                <div className="absolute -top-12 -right-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                    <Wallet className="w-48 h-48" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-80">Balance Disponible</p>
                                <h2 className="text-5xl font-black tracking-tighter mb-6">$ {stats.balance.toLocaleString('es-AR')}</h2>
                                <div className="flex gap-4">
                                    <button onClick={() => navigate('/add-expense')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase transition-all">Nuevo Gasto</button>
                                    <button onClick={() => navigate('/history')} className="bg-black/10 hover:bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase transition-all">Ver Historial</button>
                                </div>
                            </div>

                            {/* Ingresos Card */}
                            <div className="bg-card rounded-[2rem] p-6 border border-border shadow-4k flex flex-col justify-center gap-1 group overflow-hidden min-h-[140px]">
                                {loading ? <RenderLoading /> : (
                                    <>
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-2 transition-transform group-hover:scale-110">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Ingresos</p>
                                        <h3 className="text-xl font-bold text-emerald-500 font-heading">$ {stats.totalIngresos.toLocaleString('es-AR')}</h3>
                                    </>
                                )}
                            </div>

                            {/* Ahorros Card */}
                            <div className="bg-card rounded-[2rem] p-6 border border-border shadow-4k flex flex-col justify-center gap-1 group overflow-hidden min-h-[140px]">
                                {loading ? <RenderLoading /> : (
                                    <>
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mb-2 transition-transform group-hover:scale-110">
                                            <PiggyBank className="w-5 h-5" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Ahorros</p>
                                        <h3 className="text-xl font-bold text-indigo-500 font-heading">$ {stats.totalAhorros.toLocaleString('es-AR')}</h3>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* High Fidelity Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Area Chart: Evolución UHD */}
                            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-4k overflow-hidden relative group">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 italic">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Evolución Mensual
                                    </h3>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-muted-foreground tracking-tighter">LIVE DATA</span>
                                    </div>
                                </div>
                                <div className="h-72 w-full">
                                    {loading ? <RenderLoading /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.evolutionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="uhdGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={15} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                                <Tooltip 
                                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '15px 20px', fontWeight: '900', fontSize: '14px' }} 
                                                />
                                                <Area type="monotone" dataKey="monto" stroke="var(--primary)" strokeWidth={5} fillOpacity={1} fill="url(#uhdGradient)" animationDuration={2000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Bar Chart: Categorías UHD */}
                            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-4k overflow-hidden relative">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-10 italic">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Top Categorías
                                </h3>
                                <div className="h-72 w-full">
                                    {loading ? <RenderLoading /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.categoryData.slice(0, 5)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={15} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                                <Tooltip 
                                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '15px 20px' }} 
                                                />
                                                <Bar dataKey="monto" radius={[12, 12, 0, 0]} barSize={35} animationDuration={2000}>
                                                    {stats.categoryData.map((entry, index) => (
                                                        <Cell key={index} fill={index === 0 ? 'var(--primary)' : 'rgba(129, 140, 248, 0.4)'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transactions Section UHD */}
                        <div className="bg-card rounded-[2rem] p-8 border border-border shadow-4k mb-8">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-3">
                                    <ArrowRightLeft className="w-7 h-7 text-primary" />
                                    Movimientos UHD
                                </h3>
                                <button onClick={() => navigate('/history')} className="text-xs font-black uppercase text-primary hover:tracking-widest transition-all">Ver todos los registros</button>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="hidden lg:grid grid-cols-[220px_1fr_120px_120px_140px_120px_50px] gap-4 px-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">
                                    <span>Pagador</span>
                                    <span>Descripción</span>
                                    <span className="text-center">Fecha</span>
                                    <span className="text-center">Horario</span>
                                    <span className="text-right">Monto</span>
                                    <span className="text-right">Status</span>
                                    <span></span>
                                </div>

                                {stats.filtered && stats.filtered
                                    .filter(exp => 
                                        (exp.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                                        (exp.paid_by?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                        (exp.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                        (exp.type?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                    )
                                    .slice(0, 8).map((expense) => {
                                        const categoryName = expense.category || expense.type?.split(" - ")[0] || "Otros";
                                        const dateObj = new Date(expense.date);
                                        const timeStr = expense.created_at 
                                            ? new Date(expense.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true })
                                            : "10:30 AM";
                                        
                                        return (
                                            <div key={expense.id} className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[220px_1fr_120px_120px_140px_120px_50px] items-center gap-4 py-4 px-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group relative border border-transparent hover:border-border/50">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="relative shrink-0 transition-transform group-hover:scale-105">
                                                        <img src={getMemberAvatar(expense.paid_by)} className="w-12 h-12 rounded-full border-2 border-background object-cover shadow-lg" alt={expense.paid_by} />
                                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] text-white shadow-md ${getCategoryColor(categoryName)}`}>
                                                            {getCategoryIcon(categoryName)}
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-sm truncate">{expense.paid_by}</span>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm truncate text-foreground/90">{expense.description || expense.type || 'Sin detalle'}</p>
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 tracking-tighter truncate">{expense.type}</p>
                                                </div>

                                                <div className="hidden lg:flex justify-center">
                                                    <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border/50">{dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                                                </div>

                                                <div className="hidden lg:flex justify-center">
                                                    <span className="text-[10px] font-bold text-muted-foreground opacity-60 tracking-widest">{timeStr}</span>
                                                </div>

                                                <div className="text-right">
                                                    <h4 className={`text-lg font-black tracking-tighter ${expense.transaction_type === 'ingreso' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                        {expense.transaction_type === 'ingreso' ? '+' : '-'}${Number(expense.amount).toLocaleString('es-AR')}
                                                    </h4>
                                                </div>

                                                <div className="hidden lg:flex justify-end">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-sm transition-all group-hover:bg-emerald-500 group-hover:text-white">
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">OK</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <ChevronDown className="w-6 h-6 opacity-10 group-hover:opacity-50 transition-all rotate-[-90deg] group-hover:rotate-0" />
                                                </div>
                                            </div>
                                        );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column (Suggestions & Sidebar Cards) */}
                    <div className="flex flex-col gap-8">
                        <AISuggestions expenses={expenses} />
                        
                        {/* Summary Card UHD */}
                        <div className="bg-card rounded-[2rem] p-8 border border-border shadow-4k flex flex-col gap-8 sticky top-8">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-1 italic">Análisis Pro</h3>
                                <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-50">Distribución de Gastos</p>
                            </div>

                            <div className="flex flex-col gap-6">
                                {stats.categoryData.slice(0, 5).map((cat, i) => {
                                    const perc = stats.total > 0 ? (cat.monto / stats.total) * 100 : 0;
                                    return (
                                        <div key={i} className="flex flex-col gap-2 group">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-foreground opacity-80 group-hover:opacity-100 transition-opacity uppercase text-[11px] tracking-widest">{cat.name}</span>
                                                <span className="text-xs font-black text-primary">{perc.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                <div className={`h-full transition-all duration-1000 ease-out ${getCategoryColor(cat.name)}`} style={{ width: `${perc}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={() => navigate('/stats')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:shadow-primary/30 transition-all duration-500">Info Detallada</button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    </div>
  );
};

export default Dashboard;
