import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Calendar, History, Trash2, Search, CreditCard, Wallet, BarChart3, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
            acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.keys(agg).map(key => ({ name: key, value: agg[key] }));
    }, [filteredExpenses]);

    const totalSpent = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0), [filteredExpenses]);

    const topCategory = useMemo(() => {
        if (data.length === 0) return null;
        return data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    }, [data]);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
            {/* Header móvil optimizado */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Mis Gastos</h1>
                        <p className="text-sm text-muted-foreground italic">Hola, {user?.username || 'Tomi/Gabi'}</p>
                    </div>
                    <Button asChild size="icon" className="rounded-full h-12 w-12 shadow-lg">
                        <Link to="/add-expense"><Plus className="h-6 w-6" /></Link>
                    </Button>
                </div>

                {/* Filtro de Medio de Pago - Scroll horizontal en móvil */}
                <div className="flex bg-muted p-1 rounded-xl overflow-x-auto no-scrollbar">
                    {['Todo', 'Efectivo', 'Tarjeta'].map((m) => (
                        <Button 
                            key={m}
                            variant={filterMethod === m ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilterMethod(m)}
                            className="flex-1 min-w-[80px] rounded-lg text-xs"
                        >
                            {m}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tarjeta de Total - Grande para móvil */}
            <Card className="border-none bg-primary shadow-xl shadow-primary/20">
                <CardContent className="pt-6">
                    <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Gasto Total {filterMethod !== 'Todo' ? `(${filterMethod})` : ''}</p>
                    <div className="flex items-baseline text-primary-foreground">
                        <span className="text-2xl font-bold mr-1">$</span>
                        <span className="text-5xl font-black tracking-tighter">
                            {totalSpent.toLocaleString('es-AR')}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Selectores de fecha - Uno al lado del otro */}
            <div className="grid grid-cols-2 gap-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={viewMode === 'all_time'}>
                    <SelectTrigger className="bg-card h-12"><SelectValue placeholder="Mes" /></SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear} disabled={viewMode === 'all_time'}>
                    <SelectTrigger className="bg-card h-12"><SelectValue placeholder="Año" /></SelectTrigger>
                    <SelectContent>
                        {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Gráfico - Altura reducida para móviles */}
            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Distribución</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] px-0">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                    {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic">No hay datos</div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de Movimientos - Diseñada como "Cards" táctiles */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="font-bold flex items-center gap-2"><History className="h-4 w-4" /> Movimientos</h2>
                    <span className="text-xs font-medium text-muted-foreground">{filteredExpenses.length} items</span>
                </div>
                
                <div className="grid gap-3">
                    {filteredExpenses.length > 0 ? (
                        [...filteredExpenses].reverse().map((expense) => (
                            <div key={expense.id} className="bg-card p-4 rounded-2xl border shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                        expense.paymentMethod === 'Tarjeta' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                                    )}>
                                        {expense.paymentMethod === 'Tarjeta' ? <CreditCard className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{expense.type}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">
                                            {new Date(expense.date).toLocaleDateString('es-AR')} • {expense.paidBy}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-black text-base">${expense.amount.toLocaleString('es-AR')}</p>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive/40" 
                                        onClick={() => {
                                            if(window.confirm(`¿Eliminar $${expense.amount}?`)) deleteExpense(expense.id)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-2xl">Nada por aquí...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


