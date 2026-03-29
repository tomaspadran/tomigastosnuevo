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

        // Agrupar por categoría (top 5)
        const categoryGroups = expenses.reduce((acc, curr) => {
            const cat = curr.category || 'Otros';
            acc[cat] = (acc[cat] || 0) + Number(curr.amount);
            return acc;
        }, {});

        const pieData = Object.keys(categoryGroups).map(name => ({
            name,
            value: categoryGroups[name]
        })).sort((a,b) => b.value - a.value).slice(0, 5);

        return { monthlyData, pieData };
    }, [expenses]);

    const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                       <h1 className="text-4xl font-black tracking-tight uppercase italic text-foreground">
                          Reportes Mensuales
                       </h1>
                       <p className="text-muted-foreground font-medium text-lg italic">Analiza el rendimiento de tus finanzas</p>
                    </div>
                </div>

                {/* Grid Visual */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-foreground">
                    
                    {/* Evolución Comparativa */}
                    <Card className="border-border shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-primary w-6 h-6" />
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Ingresos vs Gastos</CardTitle>
                                    <CardDescription>Resumen comparativo anual</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    />
                                    <Legend verticalAlign="top" align="right" />
                                    <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Distribución de Categorías */}
                    <Card className="border-border shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Wallet className="text-orange-500 w-6 h-6" />
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Top 5 Categorías</CardTitle>
                                    <CardDescription>Distribución porcentual de gastos</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Evolución del Ahorro */}
                    <Card className="border-border shadow-xl xl:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Target className="text-blue-500 w-6 h-6" />
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Flujo de Ahorro</CardTitle>
                                    <CardDescription>Seguimiento de capacidad de ahorro mensual</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.monthlyData}>
                                    <defs>
                                        <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="ahorros" name="Ahorros" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAhorro)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default Reports;
