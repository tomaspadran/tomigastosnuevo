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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../components/ui/select';
import { Search, ChevronRight } from 'lucide-react';

const Stats = () => {
    const { expenses, loading } = useExpenses();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

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
                const sub = curr.subcategory || 'General';
                if (!acc[cat]) acc[cat] = { total: 0, subs: {} };
                acc[cat].total += Number(curr.amount);
                acc[cat].subs[sub] = (acc[cat].subs[sub] || 0) + Number(curr.amount);
                return acc;
            }, {});

        const topCats = Object.keys(breakdown).map(name => ({
            category: name,
            total: breakdown[name].total
        })).sort((a,b) => b.total - a.total).slice(0, 10);

        const categories = Object.keys(breakdown).sort();

        // Gastos filtrados por la categoría seleccionada para el historial
        const categoryHistory = selectedCategory !== 'all' 
            ? expenses
                .filter(e => (e.transaction_type === 'gasto' || !e.transaction_type) && (e.category === selectedCategory))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];

        return { membersData, topCats, breakdown, categories, categoryHistory };
    }, [expenses, members, selectedCategory]);

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
                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: '900' }}
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
                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: '900' }}
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

                    {/* SECCIÓN: Análisis por Categoría (Drill-down) */}
                    <div className="xl:col-span-2 space-y-8 mt-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black tracking-tightest uppercase italic">Explorador de <span className="text-primary">Gastos</span></h3>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase opacity-50">Análisis detallado por categoría</p>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-72">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-14 bg-card/50 backdrop-blur-xl border-border/50 rounded-2xl text-sm font-black uppercase tracking-tight shadow-xl">
                                        <div className="flex items-center gap-3">
                                            <Search className="w-4 h-4 text-primary" />
                                            <SelectValue placeholder="Seleccionar Categoría" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-card/95 backdrop-blur-2xl border-border shadow-2xl rounded-2xl">
                                        <SelectItem value="all" className="font-bold py-3">Resumen General</SelectItem>
                                        {data.categories.map(cat => (
                                            <SelectItem key={cat} value={cat} className="font-bold py-3">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedCategory === 'all' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {Object.entries(data.breakdown)
                                    .sort((a, b) => b[1].total - a[1].total)
                                    .slice(0, 6)
                                    .map(([catName, catData], i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedCategory(catName)}
                                            className="group glass-card p-6 rounded-3xl border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                                <span className="text-xl font-black tracking-tighter text-foreground">${catData.total.toLocaleString('es-AR')}</span>
                                            </div>
                                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{catName}</h4>
                                            <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in zoom-in-95 duration-500">
                                {/* Detalle de la Categoría Seleccionada */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="glass-card border-primary/20 shadow-4k overflow-hidden">
                                        <div className="p-8 bg-primary/5 border-b border-primary/10">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Categoría</p>
                                            <h4 className="text-4xl font-black tracking-tighter text-foreground italic uppercase mb-4">{selectedCategory}</h4>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-foreground">${data.breakdown[selectedCategory].total.toLocaleString('es-AR')}</span>
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Total gastado</span>
                                            </div>
                                        </div>
                                        <CardContent className="p-8 space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Sub-categorías</p>
                                            {Object.entries(data.breakdown[selectedCategory].subs)
                                                .sort((a,b) => b[1] - a[1])
                                                .map(([subName, subAmount], j) => (
                                                <div key={j} className="space-y-2 group/sub">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-black uppercase tracking-tight text-foreground/70 group-hover/sub:text-primary transition-colors">{subName}</span>
                                                        <span className="text-xs font-black text-foreground">${subAmount.toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary rounded-full transition-all duration-1000 shadow-lg shadow-primary/20" 
                                                            style={{ width: `${(subAmount / data.breakdown[selectedCategory].total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <Button 
                                                variant="outline" 
                                                className="w-full mt-6 rounded-xl border-dashed border-primary/30 hover:bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest"
                                                onClick={() => setSelectedCategory('all')}
                                            >
                                                Cerrar Detalle
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Historial de la Categoría */}
                                <div className="lg:col-span-2">
                                    <Card className="glass-card border-border/50 shadow-4k h-full overflow-hidden">
                                        <CardHeader className="p-8 border-b border-border/50">
                                            <CardTitle className="text-xl font-black uppercase italic tracking-tight">Historial de <span className="text-primary">{selectedCategory}</span></CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Movimientos ordenados por fecha</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="max-h-[600px] overflow-y-auto">
                                                {data.categoryHistory.length > 0 ? (
                                                    <table className="w-full">
                                                        <thead className="sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-border">
                                                            <tr>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción</th>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pagador</th>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sub-cat</th>
                                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monto</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50">
                                                            {data.categoryHistory.map((exp) => {
                                                                const member = members.find(m => m.name === exp.paid_by);
                                                                return (
                                                                    <tr key={exp.id} className="hover:bg-primary/5 transition-colors group">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className="text-xs font-bold text-muted-foreground">{new Date(exp.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{exp.description || 'Sin detalle'}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-2">
                                                                                {member?.avatar_url ? (
                                                                                    <img src={member.avatar_url} alt={exp.paid_by} className="w-6 h-6 rounded-full border border-border/50 object-cover" />
                                                                                ) : (
                                                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                                                        {exp.paid_by?.charAt(0)}
                                                                                    </div>
                                                                                )}
                                                                                <span className="text-[10px] font-bold text-muted-foreground">{exp.paid_by}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{exp.subcategory || 'General'}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <span className="text-sm font-black text-foreground tracking-tighter">${Number(exp.amount).toLocaleString('es-AR')}</span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-20 text-center text-muted-foreground italic font-medium">No hay registros para esta categoría</div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Gráfico de Sub-categorías */}
                                <div className="lg:col-span-3 mt-4">
                                    <Card className="glass-card border-border/50 shadow-4k overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-black uppercase italic tracking-tight">Distribución Técnica</CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Análisis detallado por sub-categorías de {selectedCategory}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart 
                                                    layout="vertical" 
                                                    data={Object.entries(data.breakdown[selectedCategory].subs)
                                                        .map(([name, total]) => ({ name, total }))
                                                        .sort((a,b) => b.total - a.total)
                                                    }
                                                    margin={{ left: 40, right: 40 }}
                                                >
                                                    <XAxis type="number" hide />
                                                    <YAxis 
                                                        dataKey="name" 
                                                        type="category" 
                                                        stroke="#94A3B8" 
                                                        fontSize={10} 
                                                        fontWeight={800}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        width={100}
                                                    />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                                        itemStyle={{ color: '#1e293b', fontWeight: '900' }}
                                                        formatter={(val) => `$${Number(val).toLocaleString('es-AR')}`}
                                                    />
                                                    <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
        </div>
    );
};

export default Stats;
