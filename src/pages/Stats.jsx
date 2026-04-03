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

        // Top 10 categorías acumuladas histórico
        const cats = expenses
            .filter(e => e.transaction_type === 'gasto' || !e.transaction_type)
            .reduce((acc, curr) => {
                const cat = curr.category || 'Otros';
                acc[cat] = (acc[cat] || 0) + Number(curr.amount);
                return acc;
            }, {});

        const topCats = Object.keys(cats).map(name => ({
            category: name,
            total: cats[name]
        })).sort((a,b) => b.total - a.total).slice(0, 8);

        return { membersData, topCats };
    }, [expenses, members]);

    const COLORS = ['#6366f1', '#10981b', '#f43f5e', '#facc15', '#8b5cf6'];

    return (
        <>
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                       <h1 className="text-4xl font-black tracking-tight uppercase italic text-foreground">
                          Estadísticas Avanzadas
                       </h1>
                       <p className="text-muted-foreground font-medium text-lg italic tracking-tighter uppercase italic">Insights Profundos Tomi & Gabi</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-foreground">
                    
                    {/* Distribución por Miembro */}
                    <Card className="border-border shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <User className="text-primary w-6 h-6" />
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Distribución Tomi vs Gabi</CardTitle>
                                    <CardDescription>Comparativa de gastos por persona</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.membersData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.membersData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-AR')}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Ranking de Categorías */}
                    <Card className="border-border shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-emerald-500 w-6 h-6" />
                                <div>
                                    <CardTitle className="uppercase font-black text-xl italic tracking-tight">Ranking de Categorías</CardTitle>
                                    <CardDescription>Top gastos acumulados</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={data.topCats}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="category" 
                                        type="category" 
                                        width={100} 
                                        stroke="#94A3B8" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="total" name="Total Gastado" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-xl xl:col-span-2 overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                         <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                         
                         <CardHeader>
                             <CardTitle className="uppercase font-black text-2xl italic text-center tracking-tight">Resumen de Performance</CardTitle>
                         </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 relative z-10">
                              <div className="text-center space-y-2">
                                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Ticket Promedio</p>
                                  <p className="text-4xl font-black text-foreground italic">$ {(expenses.length ? expenses.reduce((a,c) => a + Number(c.amount), 0) / expenses.length : 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                              </div>
                              <div className="text-center space-y-2">
                                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Día de mayor Gasto</p>
                                  <p className="text-4xl font-black text-primary italic uppercase italic">Sábados</p>
                              </div>
                              <div className="text-center space-y-2">
                                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Movimientos Totales</p>
                                  <p className="text-4xl font-black text-foreground italic">{expenses.length}</p>
                              </div>
                         </CardContent>
                    </Card>

                </div>
        </>
    );
};

export default Stats;
