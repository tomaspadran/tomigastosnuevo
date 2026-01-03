import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Calendar, History, Trash2, Search, CreditCard, Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];

const Dashboard = () => {
    const { expenses, deleteExpense } = useExpenses();
    const { user } = useAuth();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getUTCMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getUTCFullYear().toString());
    const [viewMode, setViewMode] = useState('monthly'); 
    const [filterMethod, setFilterMethod] = useState('Todo'); 

    const months = [
        { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' }, { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' }, { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' },
    ];

    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const expenseYear = date.getUTCFullYear().toString();
            const expenseMonth = date.getUTCMonth().toString();
            const matchesTime = viewMode === 'all_time' || 
                               (viewMode === 'yearly' && expenseYear === selectedYear) ||
                               (viewMode === 'monthly' && expenseMonth === selectedMonth && expenseYear === selectedYear);
            const matchesMethod = filterMethod === 'Todo' || expense.paymentMethod === filterMethod;
            return matchesTime && matchesMethod;
        });
    }, [expenses, selectedMonth, selectedYear, viewMode, filterMethod]);

    const data = useMemo(() => {
        const agg = filteredExpenses.reduce((acc, curr) => {
            const mainCat = curr.type.split(':')[0];
            acc[mainCat] = (acc[mainCat] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.keys(agg).map(key => ({ name: key, value: agg[key] }));
    }, [filteredExpenses]);

    const totalSpent = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0), [filteredExpenses]);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-28">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Mis Gastos</h1>
                    <p className="text-sm text-muted-foreground">Periodo: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                </div>
                <Button asChild size="icon" className="rounded-full h-12 w-12 shadow-lg bg-primary">
                    <Link to="/add-expense"><Plus className="h-6 w-6" /></Link>
                </Button>
            </div>

            <Card className="border-none bg-primary text-primary-foreground shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ArrowUpRight size={80} />
                </div>
                <CardContent className="pt-8 pb-8">
                    <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-widest mb-1">Total Gastado</p>
                    <div className="flex items-baseline">
                        <span className="text-2xl font-medium mr-1">$</span>
                        <span className="text-5xl font-black tracking-tighter">
                            {totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase">
                            {filterMethod}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                <div className="flex bg-muted p-1 rounded-xl overflow-x-auto no-scrollbar gap-1">
                    {['Todo', 'Efectivo', 'Tarjeta'].map((m) => (
                        <Button 
                            key={m}
                            variant={filterMethod === m ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilterMethod(m)}
                            className="flex-1 min-w-[90px] rounded-lg text-xs font-bold"
                        >
                            {m}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="bg-card h-12 border-none shadow-sm font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="bg-card h-12 border-none shadow-sm font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Distribución</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px] p-0">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" strokeWidth={0}>
                                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic">Sin gastos</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="font-black text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Historial</h2>
                    <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded-full text-muted-foreground">{filteredExpenses.length} MOV.</span>
                </div>
                <div className="grid gap-3">
                    {filteredExpenses.length > 0 ? (
                        [...filteredExpenses].reverse().map((expense) => (
                            <div key={expense.id} className="bg-card p-4 rounded-3xl border-none shadow-sm flex items-center justify-between active:scale-[0.97]">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner", expense.paymentMethod === 'Tarjeta' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600")}>
                                        {expense.paymentMethod === 'Tarjeta' ? <CreditCard className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight mb-1">{expense.type}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(expense.date).toLocaleDateString('es-AR')}</p>
                                            {expense.isInstallment && <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md">Cuota {expense.currentInstallment}/{expense.totalInstallments}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-base">${expense.amount.toLocaleString('es-AR')}</p>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive/20" onClick={() => { if(window.confirm(`¿Eliminar?`)) deleteExpense(expense.id) }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed italic text-muted-foreground text-sm">No hay gastos</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
                               (




