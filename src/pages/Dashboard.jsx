import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Calendar, History, Trash2, Search, CreditCard, Wallet, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
    const { expenses, deleteExpense } = useExpenses();
    const { user } = useAuth();

    // Estados de filtrado por Tiempo
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [viewMode, setViewMode] = useState('monthly'); 
    
    // Estado de filtrado por Método de Pago
    const [filterMethod, setFilterMethod] = useState('Todo'); 

    const months = [
        { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' }, { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' }, { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' },
    ];

    // Lógica principal de filtrado
    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const expenseYear = date.getUTCFullYear().toString();
            const expenseMonth = date.getUTCMonth().toString();
            
            // 1. Filtro Temporal
            const matchesTime = viewMode === 'all_time' || 
                               (viewMode === 'yearly' && expenseYear === selectedYear) ||
                               (viewMode === 'monthly' && expenseMonth === selectedMonth && expenseYear === selectedYear);
            
            // 2. Filtro por Método de Pago
            const matchesMethod = filterMethod === 'Todo' || expense.paymentMethod === filterMethod;

            return matchesTime && matchesMethod;
        });
    }, [expenses, selectedMonth, selectedYear, viewMode, filterMethod]);

    // Cálculos para Gráficos y Resumen
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

    const periodText = useMemo(() => {
        if (viewMode === 'all_time') return 'Historial Completo';
        if (viewMode === 'yearly') return `Todo el Año ${selectedYear}`;
        return `${months.find(m => m.value === selectedMonth)?.label || ''} ${selectedYear}`;
    }, [viewMode, selectedMonth, selectedYear]);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header con Filtro de Método de Pago */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Hola, {user?.username || 'Usuario'}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Filtrar por medio de pago</Label>
                    <div className="flex bg-muted p-1 rounded-xl border">
                        {['Todo', 'Efectivo', 'Tarjeta'].map((m) => (
                            <Button 
                                key={m}
                                variant={filterMethod === m ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setFilterMethod(m)}
                                className={cn("px-6 rounded-lg transition-all", filterMethod === m && "shadow-md")}
                            >
                                {m}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="md:col-span-1 border-primary/20 bg-primary/5 shadow-inner">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
                            Gastos en {filterMethod}
                            {filterMethod === 'Tarjeta' ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black flex items-center text-primary">
                            <span className="text-2xl mr-1">$</span>
                            {totalSpent.toLocaleString('es-AR')}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium bg-background/50 p-1 rounded inline-block">
                            PERIODO: {periodText}
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 flex flex-col md:flex-row items-center gap-6 p-6 justify-between bg-card/50">
                    <div className="flex flex-col md:flex-row gap-4 w-full justify-end items-end">
                        <Button 
                            variant={viewMode === 'all_time' ? "default" : "outline"} 
                            onClick={() => setViewMode(viewMode === 'all_time' ? 'monthly' : 'all_time')}
                            className="w-full md:w-auto"
                        >
                            <History className="mr-2 h-4 w-4" />
                            {viewMode === 'all_time' ? "Viendo Todo el Tiempo" : "Ver Histórico"}
                        </Button>
                        
                        <div className="w-full md:w-64 space-y-1">
                            <Label className="text-xs text-muted-foreground ml-1">Seleccionar Periodo</Label>
                            <div className="flex gap-2">
                                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={viewMode === 'all_time'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                        <SelectItem value="all" onClick={() => setViewMode('yearly')}>Todo el año</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedYear} onValueChange={setSelectedYear} disabled={viewMode === 'all_time'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráfico de Categorías */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 shadow-sm border-none bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Distribución de Gastos ({filterMethod})</CardTitle>
                        <CardDescription>Visualización por categorías en el periodo seleccionado</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data} 
                                        cx="50%" cy="50%" 
                                        innerRadius={80} outerRadius={120} 
                                        paddingAngle={5} dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']} 
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl">
                                <AlertCircle className="h-10 w-10 opacity-20 mb-2" />
                                <p>No hay datos para mostrar</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-sm border-none bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-primary" /> Mayor Gasto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Categoría Top</p>
                            <p className="text-3xl font-black text-primary">{topCategory ? topCategory.name : 'N/A'}</p>
                            <p className="text-lg font-semibold mt-2">
                                {topCategory ? `$${topCategory.value.toLocaleString('es-AR')}` : '$0'}
                            </p>
                        </div>
                        <div className="rounded-2xl border p-4 bg-muted/30 flex items-start gap-3 italic">
                            <AlertCircle className="mt-1 h-5 w-5 text-muted-foreground shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                {topCategory ? `Tus gastos en ${topCategory.name} representan la mayor parte de tus consumos en ${filterMethod.toLowerCase()} durante este periodo.` : 'Registra gastos para ver el análisis.'}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full py-6 rounded-xl text-lg shadow-lg shadow-primary/20">
                            <Link to="/add-expense">Registrar Nuevo Gasto</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Administrador de Movimientos (Buscador y Eliminación) */}
            <Card className="shadow-xl border-none">
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" /> Administrar Movimientos
                            </CardTitle>
                            <CardDescription>Busca, filtra y elimina registros de {filterMethod}</CardDescription>
                        </div>
                        <div className="w-full md:w-72">
                            <Label className="text-[10px] uppercase font-bold ml-1">Buscar por día exacto</Label>
                            <Input 
                                type="date" 
                                className="bg-background rounded-xl mt-1"
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    if (!isNaN(date)) {
                                        setSelectedMonth(date.getUTCMonth().toString());
                                        setSelectedYear(date.getUTCFullYear().toString());
                                        setViewMode('monthly');
                                    }
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid gap-0 max-h-[600px] overflow-y-auto">
                        {filteredExpenses.length > 0 ? (
                            [...filteredExpenses].reverse().map((expense) => (
                                <div key={expense.id} className="group flex items-center justify-between p-5 hover:bg-primary/5 transition-all border-b last:border-0">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                                            expense.paymentMethod === 'Tarjeta' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                                        )}>
                                            {expense.paymentMethod === 'Tarjeta' ? <CreditCard className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base leading-none mb-1">{expense.type}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(expense.date).toLocaleDateString('es-AR', {day: '2-digit', month: 'short'})}
                                                </p>
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-muted rounded-full">
                                                    {expense.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-black text-xl leading-none">${expense.amount.toLocaleString('es-AR')}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Pagó {expense.paidBy}</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-destructive opacity-20 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                                            onClick={() => {
                                                if(window.confirm(`¿Borrar el gasto de ${expense.type} por $${expense.amount}?`)) {
                                                    deleteExpense(expense.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                                    <Search className="h-8 w-8" />
                                </div>
                                <p className="text-muted-foreground font-medium">No hay movimientos registrados para estos filtros.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;

