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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../components/ui/select';
import { Search, ChevronRight } from 'lucide-react';

const Reports = () => {
    const { expenses, loading } = useExpenses();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [members, setMembers] = React.useState([]);

    React.useEffect(() => {
        const fetchMembers = async () => {
            const { data } = await supabase.from('members').select('*');
            if (data) setMembers(data);
        };
        fetchMembers();
    }, []);

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
                const sub = curr.subcategory || 'General';
                if (!acc[cat]) acc[cat] = { total: 0, subs: {} };
                acc[cat].total += Number(curr.amount);
                acc[cat].subs[sub] = (acc[cat].subs[sub] || 0) + Number(curr.amount);
                return acc;
            }, {});

        const pieData = Object.keys(breakdown).map(name => ({
            name,
            value: breakdown[name].total
        })).sort((a,b) => b.value - a.value).slice(0, 5);

        const categories = Object.keys(breakdown).sort();

        // Gastos filtrados para el historial de la categoría
        const categoryHistory = selectedCategory !== 'all' 
            ? expenses
                .filter(e => (e.transaction_type === 'gasto' || !e.transaction_type) && (e.category === selectedCategory))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];

        return { monthlyData, pieData, breakdown, categories, categoryHistory };
    }, [expenses, selectedCategory]);

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
                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: '900' }}
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
                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: '900' }}
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
                                        contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: '900' }}
                                        formatter={(val) => `$${Number(val).toLocaleString('es-AR')}`}
                                    />
                                    <Area type="monotone" dataKey="ahorros" name="Ahorros" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAhorro)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* SECCIÓN: Explorador por Categoría (Drill-down) */}
                    <div className="xl:col-span-2 space-y-8 mt-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black tracking-tightest uppercase italic">Explorador de <span className="text-primary">Categorías</span></h3>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase opacity-50">Auditoría detallada de gastos</p>
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
                                        <SelectItem value="all" className="font-bold py-3">Mostrar Todas</SelectItem>
                                        {data.categories.map(cat => (
                                            <SelectItem key={cat} value={cat} className="font-bold py-3">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedCategory === 'all' ? (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {Object.entries(data.breakdown)
                                    .sort((a, b) => b[1].total - a[1].total)
                                    .map(([catName, catData], i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedCategory(catName)}
                                            className="group glass-card p-5 rounded-2xl border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex items-center justify-between group overflow-hidden relative"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                            
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black italic text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                    #{i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{catName}</h4>
                                                    <p className="text-[9px] font-bold text-muted-foreground/50 mt-0.5 uppercase tracking-tighter">Click para auditar historial detallado</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <span className="text-xl font-black tracking-tightest text-foreground">${catData.total.toLocaleString('es-AR')}</span>
                                                    <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500" 
                                                            style={{ width: `${(catData.total / Object.values(data.breakdown).reduce((a,c) => Math.max(a, c.total), 0)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in zoom-in-95 duration-500">
                                {/* Dashboard de la Categoría */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Card className="glass-card border-primary/20 shadow-4k overflow-hidden">
                                        <div className="p-8 bg-primary/5 border-b border-primary/10 text-center">
                                            <h4 className="text-3xl font-black tracking-tighter text-foreground italic uppercase mb-2">{selectedCategory}</h4>
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl font-black text-primary">${data.breakdown[selectedCategory].total.toLocaleString('es-AR')}</span>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-50">Total acumulado</span>
                                            </div>
                                        </div>
                                        <CardContent className="p-8 space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Breakdown por Sub-categoría</p>
                                            {Object.entries(data.breakdown[selectedCategory].subs)
                                                .sort((a,b) => b[1] - a[1])
                                                .map(([subName, subAmount], j) => (
                                                <div key={j} className="space-y-2">
                                                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                                                        <span className="text-muted-foreground">{subName}</span>
                                                        <span className="text-foreground">${subAmount.toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary rounded-full transition-all duration-1000" 
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
                                                Volver a Vista General
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Tabla de Auditoría */}
                                <div className="lg:col-span-2">
                                    <Card className="glass-card border-border/50 shadow-4k h-full overflow-hidden">
                                        <CardHeader className="p-8 border-b border-border/50 bg-slate-50/30 dark:bg-white/1">
                                            <CardTitle className="text-xl font-black uppercase italic tracking-tight">Auditoría de Movimientos</CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Listado íntegro de registros en {selectedCategory}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="max-h-[600px] overflow-y-auto">
                                                {data.categoryHistory.length > 0 ? (
                                                    <table className="w-full">
                                                        <thead className="sticky top-0 bg-card/90 backdrop-blur-xl z-20 border-b border-border">
                                                            <tr>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha</th>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detalle</th>
                                                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Págador</th>
                                                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50">
                                                            {data.categoryHistory.map((exp) => {
                                                                const member = members.find(m => m.name === exp.paid_by);
                                                                return (
                                                                    <tr key={exp.id} className="hover:bg-primary/5 transition-colors group">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className="text-xs font-bold text-muted-foreground">{new Date(exp.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{exp.description || 'Sin detalle'}</span>
                                                                                <span className="text-[9px] text-muted-foreground uppercase italic opacity-50">{exp.subcategory || 'General'}</span>
                                                                            </div>
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
                                                                        <td className="px-6 py-4 text-right">
                                                                            <span className="text-sm font-black text-foreground tracking-tighter">${Number(exp.amount).toLocaleString('es-AR')}</span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-20 text-center flex flex-col items-center gap-4">
                                                        <Wallet className="w-10 h-10 text-muted-foreground/20" />
                                                        <p className="text-muted-foreground italic font-medium">No se registraron movimientos en esta categoría.</p>
                                                    </div>
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
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Análisis por sub-categorías de {selectedCategory}</CardDescription>
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
                                                    <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
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

export default Reports;
