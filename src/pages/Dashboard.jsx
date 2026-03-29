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
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { toast } from 'sonner';
import AISuggestions from '../components/dashboard/AISuggestions';

const Dashboard = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [members, setMembers] = useState([]);
  const [viewType, setViewType] = useState('month');

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

  const stats = useMemo(() => {
    // Totales por tipo de transacción
    const totalIngresos = expenses
      .filter(e => e.transaction_type === 'ingreso')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const totalGastos = expenses
      .filter(e => e.transaction_type === 'gasto' || !e.transaction_type) // Fallback para gastos viejos
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const totalAhorros = expenses
      .filter(e => e.transaction_type === 'ahorro')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const balance = totalIngresos - totalGastos - totalAhorros;

    // Breakdown por persona (solo para gastos para mantener consistencia con lo anterior)
    const paidExpenses = expenses.filter(e => e.transaction_type === 'gasto' || !e.transaction_type);
    const pagóTomi = paidExpenses.filter(e => e.paid_by === 'Tomi').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóGabi = paidExpenses.filter(e => e.paid_by === 'Gabi').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const diff = pagóTomi - pagóGabi;
    const balanceMsg = diff > 0 ? `Pagó Tomi $${diff.toLocaleString('es-AR')} más` : (diff < 0 ? `Pagó Gabi $${Math.abs(diff).toLocaleString('es-AR')} más` : "Están a mano");

    const categoryData = expenses.reduce((acc, curr) => {
      const mainCat = curr.category || curr.type?.split(' - ')[0] || 'Otros';
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name]
    })).sort((a, b) => b.value - a.value);

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const currentYear = new Date().getFullYear();
    const evolutionData = monthNames.map((name, index) => {
      const monthlyTotal = expenses
        .filter(exp => {
          const d = new Date(exp.date);
          return d.getMonth() === index && d.getFullYear() === currentYear && (exp.transaction_type === 'gasto' || !exp.transaction_type);
        })
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      return { name, total: monthlyTotal };
    });

    return { 
      totalIngresos, 
      totalGastos, 
      totalAhorros, 
      total: totalGastos, // Agregado para compatibilidad con código existente
      balance, 
      pagóTomi, 
      pagóGabi, 
      balanceMsg, 
      chartData, 
      filtered: expenses, 
      evolutionData 
    };
  }, [expenses]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar gasto?')) {
      await deleteExpense(id);
      toast.success('Gasto eliminado');
    }
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const getCategoryIcon = (category) => {
    const cat = category?.split(' - ')[0];
    switch (cat) {
        case "Casa": return <Home className="w-4 h-4" />;
        case "Salud y Cuidado Personal": return <BriefcaseMedical className="w-4 h-4" />;
        case "Supermercado": return <ShoppingCart className="w-4 h-4" />;
        case "Servicios Profesionales": return <Briefcase className="w-4 h-4" />;
        case "Juana": return <Baby className="w-4 h-4" />;
        case "Servicios": return <Zap className="w-4 h-4" />;
        case "Autos": return <Car className="w-4 h-4" />;
        case "Perra": return <Dog className="w-4 h-4" />;
        case "Shopping/Compras": return <ShoppingBag className="w-4 h-4" />;
        case "Salidas": return <Utensils className="w-4 h-4" />;
        case "Ingreso": return <TrendingUp className="w-4 h-4" />;
        default: return <Wallet className="w-4 h-4" />;
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

  const COMPONENT_COLORS = ['#3b82f6', '#818cf8', '#94a3b8', '#cbd5e1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#0ea5e9', '#ef4444'];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-black italic uppercase">Cargando...</div>;

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
        
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-20 bg-card border-r border-border shrink-0 sticky top-0 h-screen z-10 py-6 items-center shadow-sm">
            <div className="mb-10 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 fill-current" />
            </div>
            <nav className="flex flex-col gap-5 flex-grow w-full items-center">
                <button 
                  onClick={() => navigate('/dashboard')}
                  title="Dashboard Principal"
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:scale-110 active:scale-95"
                >
                    <LayoutDashboard className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => navigate('/add-expense')}
                  title="Añadir Movimiento"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:scale-110 active:scale-95"
                >
                    <Wallet className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => navigate('/history')}
                  title="Historial de Movimientos"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:scale-110 active:scale-95"
                >
                    <ArrowRightLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => navigate('/reports')}
                  title="Reportes Mensuales"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:scale-110 active:scale-95"
                >
                    <FileText className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => navigate('/stats')}
                  title="Estadísticas Avanzadas"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:scale-110 active:scale-95"
                >
                    <BarChart3 className="w-6 h-6" />
                </button>
            </nav>
            <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/profiles')}
                  title="Configuración de Perfiles"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hover:scale-110"
                >
                    <Settings className="w-6 h-6" />
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await logout();
                      navigate('/');
                      toast.success('Sesión cerrada');
                    } catch (e) {
                      toast.error('Error al cerrar sesión');
                    }
                  }}
                  title="Cerrar Sesión"
                  className="w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors hover:scale-110"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex flex-col p-4 md:p-6 lg:p-8 xl:p-10 overflow-y-auto w-full max-w-[1600px] mx-auto">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 flex-wrap">
                <div>
                   <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                      <LayoutDashboard className="w-8 h-8 text-primary" />
                      Gastos Tomi-Gabi
                   </h1>
                   <p className="text-muted-foreground text-sm font-medium mt-1">Gestión de finanzas Tomi & Gabi</p>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
                    {/* Botones de acción rápida */}
                    <Button 
                      onClick={() => navigate('/add-expense?type=gasto')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-xs px-4 h-11 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all"
                    >
                      <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      Añadir Gasto
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/add-expense?type=ingreso')}
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 font-black uppercase text-xs px-4 h-11 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Añadir Ingreso
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/add-expense?type=ahorro')}
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 font-black uppercase text-xs px-4 h-11 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <PiggyBank className="w-4 h-4" />
                      Ingresar Ahorro
                    </Button>

                    <div className="h-8 w-[1px] bg-border mx-2 hidden lg:block"></div>
                    
                        <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div 
                            onClick={() => navigate('/profiles')}
                            className="flex items-center gap-2 cursor-pointer hover:bg-card px-2 py-1 rounded-full transition-colors"
                        >
                            <img 
                                src={getMemberAvatar(user?.email?.split('@')[0] || 'Tomi')} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" 
                            />
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Grid (2fr 1fr) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left Column (Main Stats & Charts) */}
                <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-8">
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {/* 1) Balance Card (Primary) */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-5 opacity-20"><Wallet className="w-24 h-24 -mr-8 -mt-8" /></div>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm text-primary-foreground/80 font-bold mb-1 relative z-10 uppercase tracking-widest">Balance</p>
                            <h2 className="text-3xl font-black tracking-tighter relative z-10 text-white">$ {stats.balance.toLocaleString('es-AR')}</h2>
                        </div>
                        
                        {/* 2) Ingresos Card */}
                        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-widest">Ingresos</p>
                                <h2 className="text-2xl font-black text-foreground">$ {stats.totalIngresos.toLocaleString('es-AR')}</h2>
                            </div>
                        </div>

                        {/* 3) Ahorros Card */}
                        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                    <PiggyBank className="w-5 h-5" />
                                </div>
                                <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-widest">Ahorros</p>
                                <h2 className="text-2xl font-black text-foreground">$ {stats.totalAhorros.toLocaleString('es-AR')}</h2>
                            </div>
                        </div>

                        {/* 4) Gastos Card */}
                        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-bold mb-1 uppercase tracking-widest">Gastos</p>
                                <h2 className="text-2xl font-black text-foreground">$ {stats.totalGastos.toLocaleString('es-AR')}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                        
                        {/* Finances Chart (Left, wider) */}
                        <div className="lg:col-span-3 bg-card rounded-2xl p-6 border border-border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-foreground">Evolución Anual</h3>
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Gasto</span>
                                    <select className="bg-transparent border-none text-muted-foreground outline-none cursor-pointer appearance-none pr-4 relative">
                                        <option>Este Año</option>
                                    </select>
                                </div>
                            </div>
                            <div className="h-56 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.evolutionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor={isDark ? "#818cf8" : "#2c4bda"} stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor={isDark ? "#818cf8" : "#2c4bda"} stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} dy={10} />
                                      <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tickFormatter={(value) => `$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
                                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} 
                                      />
                                      <Tooltip 
                                        formatter={(value) => [`$ ${value.toLocaleString('es-AR')}`, 'Gasto']}
                                        contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f8fafc' : '#0f172a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }} 
                                        itemStyle={{ fontWeight: 'bold' }} 
                                      />
                                      <Area type="monotone" dataKey="total" stroke={isDark ? "#818cf8" : "#2c4bda"} strokeWidth={3} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Expenses Doughnut (Right) */}
                        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-foreground">Distribución</h3>
                                <select className="bg-transparent border-none text-muted-foreground outline-none cursor-pointer text-xs font-medium">
                                    <option>Mensual</option>
                                </select>
                            </div>
                            
                            <div className="flex-grow flex items-center justify-center gap-6 mb-4 mt-2">
                                <div className="h-36 w-36 relative">
                                    {stats.chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie 
                                                    data={stats.chartData} 
                                                    innerRadius={45} 
                                                    outerRadius={65} 
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {stats.chartData.map((e, i) => <Cell key={i} fill={COMPONENT_COLORS[i % COMPONENT_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full rounded-full border-4 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">Sin datos</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3 min-w-[100px]">
                                    {stats.chartData.slice(0, 4).map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: COMPONENT_COLORS[index % COMPONENT_COLORS.length] }}></span>
                                            <span className="truncate" title={entry.name}>{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Summary Bottom Row */}
                            <div className="flex justify-between items-center border-t border-border pt-4 mt-auto">
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Categorías</p><p className="font-bold text-sm text-foreground">{stats.chartData.length}</p></div>
                                <div className="text-right"><p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-0.5">Top Gasto</p><p className="font-bold text-sm text-foreground">{stats.chartData[0]?.name || '-'}</p></div>
                            </div>
                        </div>

                    </div>

                    {/* Transactions Section */}
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Movimientos Recientes</h3>
                            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver todos</button>
                        </div>
                        
                        <div className="flex flex-col">
                            {stats.filtered.slice(0, 10).map((expense) => {
                                const categoryName = expense.category || expense.type?.split(" - ")[0] || "Otros";
                                const iconClass = getCategoryColor(categoryName);
                                
                                return (
                                    <div key={expense.id} className="grid grid-cols-[48px_1fr_auto_auto_48px] items-center gap-4 py-4 border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors px-2 -mx-2 rounded-xl group relative">
                                        
                                        {/* Icon & User Photo */}
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-inner ${iconClass}`}>
                                                {getCategoryIcon(categoryName)}
                                            </div>
                                            <img 
                                                src={getMemberAvatar(expense.paid_by || 'Tomi')} 
                                                alt={expense.paid_by}
                                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card object-cover shadow-sm bg-card"
                                                title={expense.paid_by}
                                            />
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex flex-col justify-center min-w-0 pr-4">
                                            <span className="font-semibold text-foreground truncate">{expense.description}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">{expense.type} • {expense.paid_by}</span>
                                        </div>
                                        
                                        {/* Date */}
                                        <div className="hidden sm:flex flex-col text-right pr-6">
                                            <span className="text-sm text-foreground font-medium">{new Date(expense.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short'})}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(expense.date).getFullYear()}</span>
                                        </div>
                                        
                                        {/* Amount */}
                                        <div className="text-right pr-4">
                                            <span className={`text-base font-bold ${expense.transaction_type === 'ingreso' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                {expense.transaction_type === 'ingreso' ? '+' : '-'}$ {Number(expense.amount).toLocaleString('es-AR')}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button onClick={() => navigate(`/edit-expense/${expense.id}`)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit3 className="w-4 h-4" /></button>
                                           <button onClick={() => handleDelete(expense.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {stats.filtered.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm italic">
                                    No hay movimientos recientes.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column (Cards & Budgets) */}
                <div className="flex flex-col gap-6 lg:gap-8">
                    
                    {/* AI Suggestions Box */}
                    <AISuggestions expenses={expenses} />

                    {/* My Cards & Add Expense Area */}
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Cuentas Compartidas</h3>
                            <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer" />
                        </div>
                        
                        {/* Virtual Card Illustration */}
                        <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-[20px] p-6 text-white mb-6 relative overflow-hidden shadow-xl shadow-primary/20">
                            {/* Decorative circles */}
                            <div className="absolute -top-12 -right-6 w-36 h-36 bg-white/10 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-8 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <Zap className="w-8 h-8 opacity-80" />
                                <span className="font-bold tracking-widest text-sm opacity-90 italic">TRACKEXP</span>
                            </div>
                            
                            <div className="font-mono text-xl tracking-[0.2em] mb-4 opacity-90 relative z-10">
                                **** **** **** 2026
                            </div>
                            
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Total Gastos</p>
                                    <p className="font-bold whitespace-nowrap">$ {stats.total.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Cierra</p>
                                    <p className="font-bold font-mono">31/12</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border pt-6 mb-6">
                            <p className="text-sm text-muted-foreground mb-1">Estado de la cuenta compartida</p>
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="text-2xl font-bold text-foreground">Activa</h2>
                                <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> OK
                                </div>
                            </div>
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Moneda</p>
                                    <p className="text-sm font-semibold">ARS Pesos</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Socios</p>
                                    <p className="text-sm font-semibold">Tomi & Gabi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proporción Categorías (Simil Budgets) */}
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex-grow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-foreground">Top Categorías</h3>
                            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><PlusCircle className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex flex-col gap-5">
                            {stats.chartData.slice(0, 4).map((category, idx) => {
                                const percentage = stats.total > 0 ? (category.value / stats.total) * 100 : 0;
                                const iconClass = getCategoryColor(category.name);
                                
                                return (
                                <div key={idx} className="flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${iconClass}`}>
                                                {getCategoryIcon(category.name)}
                                            </div>
                                            <span className="font-medium text-sm text-foreground">{category.name}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-bold text-foreground">$ {Number(category.value).toLocaleString('es-AR')}</span>
                                            <span className="text-muted-foreground text-xs ml-1">({percentage.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${iconClass}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                                );
                            })}
                            
                            {stats.chartData.length === 0 && (
                                <p className="text-sm italic text-muted-foreground text-center">Registra gastos para ver el análisis de categorías.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    </div>
  );
};

export default Dashboard;
