import React, { useMemo, useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, User, BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Stats = () => {
    const { expenses, loading } = useExpenses();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            const { data } = await supabase.from('members').select('*');
            if (data) setMembers(data);
        };
        fetchMembers();
    }, []);

    const data = useMemo(() => {
        const membersData = members.map(m => {
            const memberExpenses = expenses.filter(e => e.paid_by === m.name && (e.transaction_type === 'gasto' || !e.transaction_type));
            const total = memberExpenses.reduce((a,c) => a + Number(c.amount), 0);
            return { name: m.name, value: total };
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

        const topCats = Object.keys(breakdown).map(name => ({
            category: name,
            total: breakdown[name].total
        })).sort((a,b) => b.total - a.total).slice(0, 10);

        return { membersData, topCats, breakdown };
    }, [expenses, members]);

    const COLORS = ['#6366f1', '#10981b', '#f43f5e', '#facc15', '#8b5cf6'];

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
                              Estadísticas <span className="text-primary">Avanzadas</span>
                           </h1>
                           <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-50">Análisis Profundo • 4K UHD Suite</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    
                    {/* Distribución por Miembro */}
                    <Card className="glass-card border-border/50 shadow-4k overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                        <CardHeader>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Tomi vs Gabi</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Comparativa de gastos</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.membersData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.membersData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff', fontWeight: '900' }}
                                        formatter={(value) => `$${Number(value).toLocaleString('es-AR')}`} 
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Ranking de Categorías */}
                    <Card className="glass-card border-border/50 shadow-4k relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
                        <CardHeader>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Ranking</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Top gastos acumulados</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={data.topCats} margin={{ left: 20, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="category" 
                                        type="category" 
                                        width={120} 
                                        stroke="#94A3B8" 
                                        fontSize={10} 
                                        fontWeight={800}
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        formatter={(val) => `$${Number(val).toLocaleString('es-AR')}`}
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }}
                                    />
                                    <Bar dataKey="total" name="Total Gastado" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Performance Section */}
                    <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: "Ticket Promedio", value: `$ ${(expenses.length ? expenses.reduce((a,c) => a + Number(c.amount), 0) / expenses.length : 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: "text-primary" },
                            { label: "Día de mayor Gasto", value: "Sábados", icon: Target, color: "text-emerald-500" },
                            { label: "Movimientos Totales", value: expenses.length, icon: BarChart3, color: "text-indigo-400" }
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                                <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-1">{stat.label}</p>
                                    <p className="text-4xl font-black text-foreground italic tracking-tighter">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* NUEVO: Desglose Detallado de Categorías */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <Target className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tightest uppercase italic">Desglose <span className="text-primary">Detallado</span></h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(data.breakdown)
                                .sort((a, b) => b[1].total - a[1].total)
                                .map(([catName, catData], i) => (
                                    <Card key={i} className="glass-card border-border/50 shadow-2xl overflow-hidden hover:border-primary/30 transition-all duration-500">
                                        <div className="p-6 bg-slate-50/50 dark:bg-white/2 border-b border-border/50 flex justify-between items-center">
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

export default Stats;
