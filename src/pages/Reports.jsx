import React, { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Reports = () => {
    const { expenses, loading } = useExpenses();
    const navigate = useNavigate();

    const data = useMemo(() => {
        // Agrupar por mes
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const monthlyData = monthNames.map((name, index) => {
            const currentYear = new Date().getFullYear();
            const monthlyExpenses = expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === index && d.getFullYear() === currentYear;
            });

            const ingresos = monthlyExpenses.filter(e => e.transaction_type === 'ingreso').reduce((a,c) => a + Number(c.amount), 0);
            const gastos = monthlyExpenses.filter(e => e.transaction_type === 'gasto' || !e.transaction_type).reduce((a,c) => a + Number(c.amount), 0);
            const ahorros = monthlyExpenses.filter(e => e.transaction_type === 'ahorro').reduce((a,c) => a + Number(c.amount), 0);

            return { name, ingresos, gastos, ahorros };
        });

        // Agrupar por categoría y subcategoría para el desglose detallado
        const breakdown = expenses
            .filter(e => e.transaction_type === 'gasto' || !e.transaction_type)
            .reduce((acc, curr) => {
                const cat = curr.category || 'Otros';
                const sub = curr.sub_category || 'General';
                if (!acc[cat]) acc[cat] = { total: 0, subs: {} };
                acc[cat].total += Number(curr.amount);
                acc[cat].subs[sub] = (acc[cat].subs[sub] || 0) + Number(curr.amount);
                return acc;
            }, {});

        const pieData = Object.keys(breakdown).map(name => ({
            name,
            value: breakdown[name].total
        })).sort((a,b) => b.value - a.value).slice(0, 5);

        return { monthlyData, pieData, breakdown };
    }, [expenses]);

    const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

    return (
        <div className="flex flex-col gap-10 animate-reveal pb-20">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-border/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                           <h1 className="text-4xl font-black tracking-tightest uppercase italic text-foreground">
                              Reportes <span className="text-primary">Mensuales</span>
                           </h1>
                           <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-50">Inteligencia Financiera • 4K UHD Suite</p>
                        </div>
                    </div>
                </header>

                {/* Grid Visual */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    
                    {/* Evolución Comparativa */}
                    <Card className="glass-card border-border/50 shadow-4k overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl opacity-50" />
                        <CardHeader>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Ingresos vs Gastos</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Resumen comparativo anual</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff', fontWeight: '900' }}
                                        formatter={(val) => `$${Number(val).toLocaleString('es-AR')}`}
                                    />
                                    <Legend verticalAlign="top" align="right" iconType="circle" />
                                    <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Distribución de Categorías */}
                    <Card className="glass-card border-border/50 shadow-4k overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl opacity-50" />
                        <CardHeader>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Top 5 Categorías</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Distribución porcentual</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px] relative z-10 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={90}
                                        outerRadius={130}
                                        paddingAngle={8}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }}
                                        formatter={(val) => `$${Number(val).toLocaleString('es-AR')}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Evolución del Ahorro */}
                    <Card className="glass-card border-border/50 shadow-4k xl:col-span-2 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
                        <CardHeader>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Flujo de Ahorro</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Capacidad de ahorro mensual</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] relative z-10 px-0 sm:px-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.monthlyData} margin={{ left: -20, right: 30 }}>
                                    <defs>
                                        <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }}
                                        formatter={(val) => `$${Number(val).toLocaleString('es-AR')}`}
                                    />
                                    <Area type="monotone" dataKey="ahorros" name="Ahorros" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAhorro)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* DESGLOSE DETALLADO */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tightest uppercase italic">Desglose <span className="text-primary">Detallado</span></h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(data.breakdown)
                                .sort((a, b) => b[1].total - a[1].total)
                                .map(([catName, catData], i) => (
                                    <Card key={i} className="glass-card border-border/50 shadow-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
                                        <div className="p-6 bg-slate-50/50 dark:bg-white/2 border-b border-border/50 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                                            <h4 className="font-black text-sm uppercase tracking-widest text-foreground">{catName}</h4>
                                            <span className="text-lg font-black text-primary">$ {catData.total.toLocaleString('es-AR')}</span>
                                        </div>
                                        <CardContent className="p-6 space-y-4">
                                            {Object.entries(catData.subs).map(([subName, subAmount], j) => (
                                                <div key={j} className="flex justify-between items-center group/sub">
                                                    <span className="text-xs font-bold text-muted-foreground group-hover/sub:text-foreground transition-colors">{subName}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                                            <div 
                                                                className="h-full bg-primary/40 rounded-full transition-all duration-1000" 
                                                                style={{ width: `${(subAmount / catData.total) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-black text-foreground/80">$ {subAmount.toLocaleString('es-AR')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>

                </div>
        </div>
    );
};

export default Reports;
