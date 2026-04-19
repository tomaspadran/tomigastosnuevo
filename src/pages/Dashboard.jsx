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

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este movimiento?')) {
        try {
            await deleteExpense(id);
            toast.success('Movimiento eliminado');
        } catch (e) {
            toast.error('Error al eliminar');
        }
    }
  };

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
        case "Gastos Tarjetas": return <CreditCard />;
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
        case "Gastos Tarjetas": return "bg-cat-cards";
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

    const categoryMap = expenses
      .filter(e => e.transaction_type === 'gasto' || !e.transaction_type)
      .reduce((acc, curr) => {
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


  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Helper for loading states in cards
  const RenderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full w-full py-10 animate-pulse bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-border/50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sincronizando...</span>
    </div>
  );

  // Custom Tooltip — Evolución Mensual
  const EvolutionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/50">
          <p className="text-indigo-300 text-[11px] font-medium mb-1">{label}</p>
          <p className="text-indigo-400 text-xl font-black tracking-tight">${Number(payload[0].value).toLocaleString('es-AR')}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip — Categorías (donut)
  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const perc = stats.total > 0 ? ((payload[0].value / stats.total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/50">
          <p className="text-white text-[12px] font-bold mb-1">{payload[0].name}</p>
          <p className="text-indigo-400 text-lg font-black tracking-tight">{perc}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
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
                        <form 
                            className="relative group"
                            onSubmit={(e) => {
                                e.preventDefault();
                                navigate(searchTerm.trim() ? `/history?search=${encodeURIComponent(searchTerm.trim())}` : '/history');
                            }}
                        >
                            <button 
                                type="submit"
                                className="absolute left-5 top-1/2 -translate-y-1/2 z-10 cursor-pointer hover:scale-110 transition-transform"
                            >
                                <Search className="w-5 h-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                            </button>
                            <input 
                                type="text"
                                placeholder="Busca transacciones, categorías, pagadores..."
                                className="w-full bg-slate-100 dark:bg-slate-800/40 border border-transparent focus:border-primary/20 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold placeholder:text-muted-foreground/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-4k"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div onClick={() => navigate('/profiles')} className="flex items-center gap-3 cursor-pointer hover:bg-card px-3 py-1.5 rounded-2xl transition-all border border-transparent hover:border-border shadow-sm">
                            <img src={getMemberAvatar('Tomi')} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shadow-md" />
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <button 
                            onClick={async () => {
                                try {
                                    await logout();
                                    navigate('/');
                                } catch (e) {
                                    toast.error('Error al cerrar sesión');
                                }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-500/10"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left & Middle Column */}
                    <div className="xl:col-span-2 flex flex-col gap-8">
                        
                        {/* Summary Stats Row — 4 tarjetas cuadradas */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* 1) Balance */}
                            <div className={`relative bg-gradient-to-br ${stats.balance >= 0 ? 'from-indigo-500 to-indigo-600' : 'from-rose-500 to-rose-600'} rounded-2xl p-5 text-white shadow-lg overflow-hidden group hover:scale-[1.03] transition-transform cursor-pointer aspect-square flex flex-col justify-between`}>
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <button 
                                        onClick={() => navigate('/history')}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
                                        title="Ver Historial de Balance"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold opacity-80 mb-1">Balance</p>
                                    <h3 className="text-2xl font-black tracking-tight">${stats.balance.toLocaleString('es-AR')}</h3>
                                </div>
                            </div>

                            {/* 2) Ingresos */}
                            <div className="relative bg-card rounded-2xl p-5 border border-border shadow-4k overflow-hidden group hover:scale-[1.03] transition-transform cursor-pointer aspect-square flex flex-col justify-between">
                                {loading ? <RenderLoading /> : (
                                    <>
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/add-expense?type=ingreso');
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        title="Agregar Ingreso"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/history?type=ingreso');
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground/50 hover:text-foreground transition-all"
                                                        title="Ver Historial de Ingresos"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-1">Ingresos</p>
                                                <h3 className="text-2xl font-black tracking-tight text-foreground">${stats.totalIngresos.toLocaleString('es-AR')}</h3>
                                            </div>
                                    </>
                                )}
                            </div>

                            {/* 3) Ahorros */}
                            <div className="relative bg-card rounded-2xl p-5 border border-border shadow-4k overflow-hidden group hover:scale-[1.03] transition-transform cursor-pointer aspect-square flex flex-col justify-between">
                                {loading ? <RenderLoading /> : (
                                    <>
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                                    <PiggyBank className="w-5 h-5" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/add-expense?type=ahorro');
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        title="Agregar Ahorro"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/history?type=ahorro');
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground/50 hover:text-foreground transition-all"
                                                        title="Ver Historial de Ahorros"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-1">Ahorros</p>
                                                <h3 className="text-2xl font-black tracking-tight text-foreground">${stats.totalAhorros.toLocaleString('es-AR')}</h3>
                                            </div>
                                    </>
                                )}
                            </div>

                            {/* 4) Gastos */}
                            <div className="relative bg-card rounded-2xl p-5 border border-border shadow-4k overflow-hidden group hover:scale-[1.03] transition-transform cursor-pointer aspect-square flex flex-col justify-between">
                                {loading ? <RenderLoading /> : (
                                    <>
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                                    <Receipt className="w-5 h-5" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/add-expense?type=gasto');
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        title="Agregar Gasto"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/history?type=gasto');
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground/50 hover:text-foreground transition-all"
                                                        title="Ver Historial de Gastos"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground mb-1">Gastos</p>
                                                <h3 className="text-2xl font-black tracking-tight text-foreground">${stats.totalGastos.toLocaleString('es-AR')}</h3>
                                            </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Charts Row: Rectangular + Cuadrado */}
                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                            {/* Area Chart: Evolución Mensual — Rectangular */}
                            <div className="bg-card rounded-2xl p-6 border border-border shadow-4k overflow-hidden relative group">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Evolución Mensual
                                    </h3>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-muted-foreground tracking-tighter">LIVE DATA</span>
                                    </div>
                                </div>
                                <div className="h-64 w-full">
                                    {loading ? <RenderLoading /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.evolutionData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="uhdGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                                <Tooltip 
                                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                                                    content={<EvolutionTooltip />}
                                                />
                                                <Area type="monotone" dataKey="monto" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#uhdGradient)" animationDuration={1500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Donut Chart: Categorías — Cuadrado */}
                            <div className="bg-card rounded-2xl p-6 border border-border shadow-4k overflow-hidden relative flex flex-col">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <PieChart className="w-5 h-5 text-primary" />
                                    Categorías
                                </h3>
                                <div className="flex-grow flex flex-col items-center justify-center">
                                    {loading ? <RenderLoading /> : (
                                        <>
                                            <div className="w-full h-48">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.categoryData.slice(0, 5)}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={80}
                                                            paddingAngle={3}
                                                            dataKey="monto"
                                                            animationDuration={1500}
                                                            stroke="none"
                                                        >
                                                            {stats.categoryData.slice(0, 5).map((entry, index) => {
                                                                const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#94a3b8'];
                                                                return <Cell key={index} fill={colors[index % colors.length]} />;
                                                            })}
                                                        </Pie>
                                                        <Tooltip 
                                                            content={<CategoryTooltip />}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Leyenda con porcentajes */}
                                            <div className="flex flex-col gap-2 w-full mt-2 px-2">
                                                {stats.categoryData.slice(0, 5).map((cat, i) => {
                                                    const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#94a3b8'];
                                                    const perc = stats.total > 0 ? ((cat.monto / stats.total) * 100).toFixed(1) : 0;
                                                    return (
                                                        <div key={i} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }}></div>
                                                                <span className="font-semibold text-muted-foreground truncate">{cat.name}</span>
                                                            </div>
                                                            <span className="font-black text-foreground">{perc}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transactions Section */}
                        <div className="bg-card rounded-[2rem] p-8 border border-border shadow-4k mb-8 mt-2">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                    <ArrowRightLeft className="w-8 h-8 text-primary" />
                                    Movimientos
                                </h3>
                                <button onClick={() => navigate('/history')} className="text-xs font-black uppercase text-primary hover:tracking-widest transition-all">Ver todos los registros</button>
                            </div>
                            
                            {/* Tabla HTML para alineación perfecta */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="hidden lg:table-row">
                                            <th className="text-left text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 pb-4 pl-4" style={{width:'180px'}}>Pagador</th>
                                            <th className="text-left text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 pb-4">Descripción</th>
                                            <th className="text-center text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 pb-4" style={{width:'100px'}}>Fecha</th>
                                            <th className="text-center text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 pb-4" style={{width:'120px'}}>Horario</th>
                                            <th className="text-center text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 pb-4" style={{width:'130px'}}>Monto</th>
                                            <th className="text-center text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 pb-4" style={{width:'150px'}}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
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
                                                    <tr key={expense.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-border/10 last:border-b-0">
                                                        {/* Pagador */}
                                                        <td className="py-4 pl-4">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="relative shrink-0 transition-transform group-hover:scale-105">
                                                                    <img src={getMemberAvatar(expense.paid_by)} className="w-11 h-11 rounded-full border-2 border-background object-cover shadow-lg" alt={expense.paid_by} />
                                                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[8px] text-white shadow-md ${getCategoryColor(categoryName)}`}>
                                                                        {getCategoryIcon(categoryName)}
                                                                    </div>
                                                                </div>
                                                                <span className="font-bold text-sm truncate">{expense.paid_by}</span>
                                                            </div>
                                                        </td>

                                                        {/* Descripción */}
                                                        <td className="py-4">
                                                            <p className="font-bold text-sm truncate text-foreground/90">{expense.description || expense.type || 'Sin detalle'}</p>
                                                            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 tracking-tighter truncate">{expense.type}</p>
                                                        </td>

                                                        {/* Fecha */}
                                                        <td className="hidden lg:table-cell py-4 text-center">
                                                            <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border/50 whitespace-nowrap">{dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                                                        </td>

                                                        {/* Horario */}
                                                        <td className="hidden lg:table-cell py-4 text-center">
                                                            <span className="text-[10px] font-bold text-muted-foreground opacity-60 tracking-widest whitespace-nowrap">{timeStr}</span>
                                                        </td>

                                                        {/* Monto */}
                                                        <td className="py-4 text-center">
                                                            <span className={`text-lg font-black tracking-tighter whitespace-nowrap ${expense.transaction_type === 'ingreso' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                                {expense.transaction_type === 'ingreso' ? '+' : '-'}${Number(expense.amount).toLocaleString('es-AR')}
                                                            </span>
                                                        </td>

                                                        {/* Acciones (Status + Trash) */}
                                                        <td className="py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-sm transition-all group-hover:bg-emerald-500 group-hover:text-white">
                                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                    <span className="text-[9px] font-black uppercase tracking-wider">OK</span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleDelete(expense.originalId || expense.id)}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                                    title="Eliminar Movimiento"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                        })}
                                    </tbody>
                                </table>
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
    </>
  );
};

export default Dashboard;
