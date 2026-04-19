import React, { useState, useMemo, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../components/theme-provider';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  PlusCircle, 
  Trash2,
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Search,
  ChevronDown,
  MoreVertical,
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
  Receipt,
  PiggyBank
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import AISuggestions from '../components/dashboard/AISuggestions';

const Dashboard = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
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
        case "Casa": return <Home className="w-4 h-4" />;
        case "Salud y Cuidado Personal": return <BriefcaseMedical className="w-4 h-4" />;
        case "Supermercado": return <ShoppingCart className="w-4 h-4" />;
        case "Servicios Profesionales": return <Briefcase className="w-4 h-4" />;
        case "Juana": return <Baby className="w-4 h-4" />;
        case "Servicios": return <Zap className="w-4 h-4" />;
        case "Autos": return <Car className="w-4 h-4" />;
        case "Perra": return <Dog className="w-4 h-4" />;
        case "Shopping/Compras": return <Receipt className="w-4 h-4" />;
        case "Salidas": return <Utensils className="w-4 h-4" />;
        case "Gastos Tarjetas": return <CreditCard className="w-4 h-4" />;
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
      totalBalance: balance, 
      categoryData, 
      evolutionData,
      total: totalGastos,
      filtered: expenses
    };
  }, [expenses]);


  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const RenderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full w-full py-10 animate-pulse bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-border/50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sincronizando...</span>
    </div>
  );

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
    <div className="flex flex-col gap-10 animate-reveal">
        {/* Header UHD Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        Financial Overview
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tightest text-foreground font-heading">
                    Hola, <span className="text-primary italic">Tomi & Gabi</span>
                </h1>
                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase opacity-60">Control Financiero Inteligente • Premium Suite</p>
            </div>

            <div className="flex-grow max-w-2xl w-full">
                <form 
                    className="relative group"
                    onSubmit={(e) => {
                        e.preventDefault();
                        navigate(searchTerm.trim() ? `/history?search=${encodeURIComponent(searchTerm.trim())}` : '/history');
                    }}
                >
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-500" />
                    <input 
                        type="text"
                        placeholder="Buscar transacciones, categorías..."
                        className="w-full bg-slate-100/50 dark:bg-slate-800/40 border-2 border-transparent focus:border-primary/20 rounded-[2rem] py-5 pl-16 pr-6 text-sm font-semibold placeholder:text-muted-foreground/30 focus:shadow-2xl focus:shadow-primary/5 outline-none transition-all duration-500 shadow-4k"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>
            
            <div className="flex items-center gap-3 bg-card/30 p-2 rounded-2xl border border-border/50 backdrop-blur-sm self-stretch md:self-auto justify-between md:justify-start">
                <ThemeToggle />
                <div className="h-8 w-[1px] bg-border mx-1" />
                <div 
                    onClick={() => navigate('/profiles')} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-primary/10"
                >
                    <div className="flex -space-x-3 hover:space-x-1 transition-all duration-500 px-2">
                        {members.map(m => (
                            <img 
                                key={m.id} 
                                src={getMemberAvatar(m.name)} 
                                alt={m.name} 
                                className="w-9 h-9 rounded-full border-2 border-background shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer object-cover"
                                title={m.name}
                            />
                        ))}
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>
        </header>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            
            {/* Left Content Area (Charts + Transactions) */}
            <div className="xl:col-span-2 flex flex-col gap-10">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1) Balance Total */}
                    <div className="relative glass-card rounded-3xl p-6 overflow-hidden group hover:scale-[1.02] cursor-pointer aspect-square flex flex-col justify-between border-primary/20">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                        {loading ? <RenderLoading /> : (
                            <>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                            <Zap className="w-6 h-6 fill-current" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-emerald-500 opacity-20" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Balance Total</p>
                                        <h3 className="text-3xl font-black tracking-tighter text-foreground">${stats.totalBalance.toLocaleString('es-AR')}</h3>
                                    </div>
                            </>
                        )}
                    </div>

                    {/* 2) Ingresos */}
                    <div className="relative glass-card rounded-3xl p-6 overflow-hidden group hover:scale-[1.02] cursor-pointer aspect-square flex flex-col justify-between">
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/add-expense?type=ingreso'); }}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ingresos</p>
                                    <h3 className="text-3xl font-black tracking-tighter text-foreground">${stats.totalIngresos.toLocaleString('es-AR')}</h3>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 3) Ahorros */}
                    <div className="relative glass-card rounded-3xl p-6 overflow-hidden group hover:scale-[1.02] cursor-pointer aspect-square flex flex-col justify-between">
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                                        <PiggyBank className="w-6 h-6" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/add-expense?type=ahorro'); }}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ahorros</p>
                                    <h3 className="text-3xl font-black tracking-tighter text-foreground">${stats.totalAhorros.toLocaleString('es-AR')}</h3>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 4) Gastos */}
                    <div className="relative glass-card rounded-3xl p-6 overflow-hidden group hover:scale-[1.02] cursor-pointer aspect-square flex flex-col justify-between">
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/add-expense?type=gasto'); }}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Gastos</p>
                                    <h3 className="text-3xl font-black tracking-tighter text-foreground">${stats.totalGastos.toLocaleString('es-AR')}</h3>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Evolution Chart */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-4k overflow-hidden relative group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Evolución Mensual
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground mt-1 opacity-50">HISTORIAL DE GASTOS ANUAL</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-[10px] font-bold text-muted-foreground tracking-widest">LIVE SYNC</span>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        {loading ? <RenderLoading /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                    <Tooltip content={<EvolutionTooltip />} />
                                    <Area type="monotone" dataKey="monto" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#areaGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-4k">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <ArrowRightLeft className="w-8 h-8 text-primary" />
                            Movimientos
                        </h3>
                        <button onClick={() => navigate('/history')} className="text-[10px] font-black uppercase text-primary hover:tracking-widest transition-all px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">Ver Historial Completo</button>
                    </div>
                    
                    <div className="space-y-4">
                        {stats.filtered
                            .filter(exp => 
                                (exp.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                                (exp.paid_by?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                (exp.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                            )
                            .slice(0, 5).map((expense) => {
                                const catName = expense.category || 'Otros';
                                return (
                                    <div key={expense.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-border hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={getMemberAvatar(expense.paid_by)} className="w-12 h-12 rounded-full border-2 border-background shadow-xl object-cover" alt={expense.paid_by} />
                                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-white shadow-lg ${getCategoryColor(catName)}`}>
                                                    {getCategoryIcon(catName)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{expense.description || 'Sin descripción'}</p>
                                                <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">{expense.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-bold text-muted-foreground">{new Date(expense.date).toLocaleDateString('es-AR')}</p>
                                                <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">{expense.paid_by}</p>
                                            </div>
                                            <span className={`text-xl font-black tracking-tighter ${expense.transaction_type === 'ingreso' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                {expense.transaction_type === 'ingreso' ? '+' : '-'}${Number(expense.amount).toLocaleString('es-AR')}
                                            </span>
                                            <button 
                                                onClick={() => handleDelete(expense.id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Right Column (Sidebar Extras) */}
            <div className="flex flex-col gap-10">
                <AISuggestions />
                
                {/* Distribution Card */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-4k flex flex-col gap-8 sticky top-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Distribución</h3>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase opacity-50">Top 5 Categorías</p>
                    </div>

                    <div className="space-y-6">
                        {stats.categoryData.slice(0, 5).map((cat, i) => {
                            const perc = stats.total > 0 ? (cat.monto / stats.total) * 100 : 0;
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-70">{cat.name}</span>
                                        <span className="text-xs font-black text-primary">{perc.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${getCategoryColor(cat.name)}`} style={{ width: `${perc}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex-grow flex items-center justify-center py-6">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={stats.categoryData.slice(0, 5)}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="monto"
                                >
                                    {stats.categoryData.slice(0, 5).map((entry, index) => (
                                        <Cell key={index} fill={['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#94a3b8'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CategoryTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <button onClick={() => navigate('/stats')} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-primary hover:text-white transition-all duration-500">Más Estadísticas</button>
                    
                    <button 
                        onClick={async () => {
                            await logout();
                            navigate('/');
                        }}
                        className="w-full py-4 rounded-2xl bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
