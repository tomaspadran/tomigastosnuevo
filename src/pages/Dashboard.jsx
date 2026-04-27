import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  PiggyBank,
  LogOut
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import AISuggestions from '../components/dashboard/AISuggestions';
import { ActionSearchBar } from '../components/ui/action-search-bar';
import { GradientCard } from '../components/ui/gradient-card';
import { BarChart2, History } from 'lucide-react';

// Auto-fit component: dynamically scales font-size so the number fits cleanly
// inside the card container. Uses a hybrid approach: binary search with 
// direct DOM measurement for 100% accuracy with OpenType features.
const AutoFitValue = ({ value, prefix = '$', className = '', colorClass = 'text-foreground' }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(24);
  const rafRef = useRef(null);

  // Format with decimal part if it exists (for small numbers or specific cases)
  const formattedValue = useMemo(() => {
    const num = Number(value);
    return `${prefix}${num.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }, [value, prefix]);

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    // 32px total margin (16px each side) for premium breathing room
    const availableWidth = container.clientWidth - 32;
    if (availableWidth <= 0) return;

    const MAX_FONT = 24; // Further reduced from 28 for a cleaner, safer look
    const MIN_FONT = 11;

    let lo = MIN_FONT;
    let hi = MAX_FONT;
    let bestSize = MIN_FONT;

    // We do a small number of iterations (max ~6 for 12-34 range)
    // Direct DOM measurement is very fast for 4 components
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      textElement.style.fontSize = `${mid}px`;
      
      // getBoundingClientRect().width gives sub-pixel accuracy
      const width = textElement.getBoundingClientRect().width;
      
      if (width <= availableWidth) {
        bestSize = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    // Apply a very conservative safety factor (90%)
    textElement.style.fontSize = `${bestSize}px`;
    if (textElement.getBoundingClientRect().width > (availableWidth * 0.90) && bestSize > MIN_FONT) {
      bestSize -= 1;
    }

    setFontSize(bestSize);
  }, [formattedValue]);

  useEffect(() => {
    // Immediate calculation
    calculateFit();

    // Use a small delay to ensure styles and fonts are applied
    const timer = setTimeout(calculateFit, 50);

    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(calculateFit);
    });

    if (containerRef.current) ro.observe(containerRef.current);

    document.fonts?.ready?.then(() => {
      requestAnimationFrame(calculateFit);
    });

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [calculateFit]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden flex items-end min-h-[40px]">
      <span
        ref={textRef}
        className={`font-black tabular-nums leading-none block whitespace-nowrap ${colorClass} ${className}`}
        style={{
          fontSize: `${fontSize}px`,
          letterSpacing: '-0.03em',
          fontFeatureSettings: '"tnum", "lnum"',
          transition: 'font-size 0.15s ease-out',
        }}
      >
        {formattedValue}
      </span>
    </div>
  );
};

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
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-200">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-primary text-xl font-black tracking-tight">${Number(payload[0].value).toLocaleString('es-AR')}</p>
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const perc = stats.total > 0 ? ((payload[0].value / stats.total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-200">
          <p className="text-slate-900 text-[12px] font-black uppercase tracking-tight mb-1">{payload[0].name}</p>
          <p className="text-primary text-lg font-black tracking-tight">{perc}%</p>
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
                <h1 className="text-5xl md:text-6xl font-black tracking-tightest text-foreground font-heading">
                    Hola, <span className="text-primary italic">Tomi & Gabi</span>
                </h1>
                <p className="text-muted-foreground text-sm font-bold tracking-[0.2em] uppercase opacity-70">Control Financiero Inteligente • Premium Suite</p>
            </div>

            <div className="flex-grow max-w-2xl w-full">
                <ActionSearchBar
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    onSearch={(q) => navigate(q.trim() ? `/history?search=${encodeURIComponent(q.trim())}` : '/history')}
                    onActionSelect={(action) => {
                        const routes = {
                            '1': '/add-expense?type=gasto',
                            '2': '/add-expense?type=ingreso',
                            '3': '/add-expense?type=ahorro',
                            '4': '/reports',
                            '5': '/history',
                        };
                        navigate(routes[action.id] || '/dashboard');
                    }}
                />
            </div>
            
            <div className="flex items-center gap-3 bg-card/30 p-2 rounded-2xl border border-border/50 backdrop-blur-sm self-stretch md:self-auto justify-between md:justify-start shadow-4k">
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button 
                        onClick={async () => {
                            if (window.confirm('¿Deseas cerrar sesión?')) {
                                await logout();
                                navigate('/');
                                toast.success('Sesión cerrada');
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all group"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* 1) Balance Total */}
                    <GradientCard glowColor="primary" className="bg-primary/90 cursor-pointer" style={{ minHeight: '160px' }}>
                        <div className="px-4 py-5 flex flex-col justify-between gap-4" style={{ minHeight: '150px' }}>
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-white/50" />
                                </div>
                                <div className="min-w-0 w-full overflow-hidden">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">Balance Total</p>
                                    <AutoFitValue value={stats.totalBalance} colorClass="text-white drop-shadow-md" />
                                </div>
                            </>
                        )}
                        </div>
                    </GradientCard>

                    {/* 2) Ingresos */}
                    <GradientCard glowColor="emerald" className="bg-card/80 backdrop-blur-xl cursor-pointer">
                        <div className="px-4 py-5 flex flex-col justify-between gap-4" style={{ minHeight: '150px' }}>
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/add-expense?type=ingreso'); }}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-transform"
                                        aria-label="Agregar ingreso"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="min-w-0 w-full overflow-hidden">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ingresos</p>
                                    <AutoFitValue value={stats.totalIngresos} />
                                </div>
                            </>
                        )}
                        </div>
                    </GradientCard>

                    {/* 3) Ahorros */}
                    <GradientCard glowColor="blue" className="bg-card/80 backdrop-blur-xl cursor-pointer">
                        <div className="px-4 py-5 flex flex-col justify-between gap-4" style={{ minHeight: '150px' }}>
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                        <PiggyBank className="w-5 h-5" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/add-expense?type=ahorro'); }}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform"
                                        aria-label="Agregar ahorro"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="min-w-0 w-full overflow-hidden">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ahorros</p>
                                    <AutoFitValue value={stats.totalAhorros} />
                                </div>
                            </>
                        )}
                        </div>
                    </GradientCard>

                    {/* 4) Gastos */}
                    <GradientCard glowColor="rose" className="bg-card/80 backdrop-blur-xl cursor-pointer">
                        <div className="px-4 py-5 flex flex-col justify-between gap-4" style={{ minHeight: '150px' }}>
                        {loading ? <RenderLoading /> : (
                            <>
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                                        <Receipt className="w-5 h-5" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/add-expense?type=gasto'); }}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-transform"
                                        aria-label="Agregar gasto"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="min-w-0 w-full overflow-hidden">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Gastos</p>
                                    <AutoFitValue value={stats.totalGastos} />
                                </div>
                            </>
                        )}
                        </div>
                    </GradientCard>
                </div>

                {/* Evolution Chart */}
                <GradientCard glowColor="purple" className="bg-card/80 backdrop-blur-xl">
                <div className="p-8 overflow-hidden relative group">
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
                </GradientCard>

                {/* Recent Transactions */}
                <GradientCard glowColor="purple" className="bg-card/80 backdrop-blur-xl">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-3 text-foreground">
                            <ArrowRightLeft className="w-5 h-5 text-primary" />
                            Movimientos
                        </h3>
                        <button onClick={() => navigate('/history')} className="text-[11px] font-semibold uppercase text-primary px-5 py-2.5 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors tracking-wide">
                            Ver Historial Completo
                        </button>
                    </div>
                    
                    <div className="space-y-1">
                        {stats.filtered
                            .filter(exp => 
                                (exp.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                                (exp.paid_by?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                (exp.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                            )
                            .slice(0, 5).map((expense) => {
                                const catName = expense.category || 'Otros';
                                return (
                                    <div key={expense.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-border/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="relative shrink-0">
                                                <img src={getMemberAvatar(expense.paid_by)} className="w-10 h-10 rounded-full border-2 border-background shadow-md object-cover" alt={expense.paid_by} />
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-white shadow-sm ${getCategoryColor(catName)}`}>
                                                    {getCategoryIcon(catName)}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-[14px] text-foreground leading-snug truncate">{expense.description || 'Sin descripción'}</p>
                                                <p className="text-[11px] font-normal uppercase tracking-[0.15em] text-muted-foreground/60 mt-0.5">{expense.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[11px] font-normal text-muted-foreground tabular-nums">{new Date(expense.date).toLocaleDateString('es-AR')}</p>
                                                <p className="text-[10px] font-medium uppercase text-muted-foreground/40 tracking-wider mt-0.5">{expense.paid_by}</p>
                                            </div>
                                            <span className={`text-base font-semibold tabular-nums tracking-tight ${expense.transaction_type === 'ingreso' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                {expense.transaction_type === 'ingreso' ? '+' : '-'}${Number(expense.amount).toLocaleString('es-AR')}
                                            </span>
                                            <button 
                                                onClick={() => handleDelete(expense.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                aria-label="Eliminar movimiento"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                </GradientCard>
            </div>

            {/* Right Column (Sidebar Extras) */}
            <div className="flex flex-col gap-10">
                <AISuggestions expenses={expenses} />
                
                {/* Distribution Card */}
                <GradientCard glowColor="purple" className="bg-card/80 backdrop-blur-xl sticky top-8">
                <div className="p-8 flex flex-col gap-8">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">Distribución</h3>
                        <p className="text-[11px] font-normal text-muted-foreground tracking-wide uppercase mt-0.5">Top 5 Categorías</p>
                    </div>

                    <div className="space-y-5">
                        {stats.categoryData.slice(0, 5).map((cat, i) => {
                            const perc = stats.total > 0 ? (cat.monto / stats.total) * 100 : 0;
                            return (
                                <div key={i} className="space-y-2.5">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-foreground/80">{cat.name}</span>
                                        <span className="text-[12px] font-semibold tabular-nums text-primary">{perc.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${getCategoryColor(cat.name)}`} style={{ width: `${perc}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex-grow flex items-center justify-center py-4">
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

                    <button onClick={() => navigate('/stats')} className="w-full py-3.5 rounded-xl bg-muted text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:bg-primary hover:text-white transition-colors duration-300">
                        Más Estadísticas
                    </button>
                    
                </div>
                </GradientCard>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
