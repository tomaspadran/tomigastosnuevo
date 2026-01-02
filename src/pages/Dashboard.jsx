import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Importante para el buscador
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Calendar, History, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
    const { expenses, deleteExpense } = useExpenses();
    const { user } = useAuth();

    // Estados de filtrado
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [viewMode, setViewMode] = useState('monthly'); 

    const months = [
        { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' }, { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' }, { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' },
    ];

    const handleMonthChange = (val) => {
        if (val === 'all') {
            setViewMode('yearly');
            setSelectedMonth('all');
        } else {
            setViewMode('monthly');
            setSelectedMonth(val);
        }
    };

    const toggleAllTime = () => {
        if (viewMode === 'all_time') {
            setViewMode('monthly');
            setSelectedMonth(new Date().getMonth().toString());
        } else {
            setViewMode('all_time');
        }
    };

    // Lógica de filtrado de gastos
    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        if (viewMode === 'all_time') return expenses;
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const expenseYear = date.getUTCFullYear().toString();
            if (viewMode === 'yearly') return expenseYear === selectedYear;
            return date.getUTCMonth().toString() === selectedMonth && expenseYear === selectedYear;
        });
    }, [expenses, selectedMonth, selectedYear, viewMode]);

    // Datos para el gráfico
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

    const suggestion = useMemo(() => {
        if (filteredExpenses.length === 0) return "No hay gastos registrados en este período.";
        if (!topCategory) return "Comienza a registrar tus gastos para obtener sugerencias.";
        const percentage = totalSpent > 0 ? Math.round((topCategory.value / totalSpent) * 100) : 0;
        let contextText = viewMode === 'all_time' ? "históricamente" : viewMode === 'yearly' ? "este año" : "este mes";
        return `Tu mayor gasto ${contextText} es en ${topCategory.name} (${percentage}%).`;
    }, [topCategory, totalSpent, viewMode, filteredExpenses.length]);

    const periodText = useMemo(() => {
        if (viewMode === 'all_time') return 'Historial Completo';
        if (viewMode === 'yearly') return `Todo el Año ${selectedYear}`;
        return `${months.find(m => m.value === selectedMonth)?.label || ''} ${selectedYear}`;
    }, [viewMode, selectedMonth, selectedYear]);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
                    <p className="text-muted-foreground">Hola, {user?.username || 'Usuario'}. Aquí está tu resumen.</p>
                </div>
            </div>

            {/* Resumen Superior */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className={cn("md:col-span-1 border-primary/20", viewMode === 'all_time' ? "bg-purple-50/10 border-purple-500" : "bg-primary/5")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Total Gastado
                            {viewMode === 'all_time' && <History className="h-4 w-4 text-purple-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold flex items-center">
                            <DollarSign className={cn("h-8 w-8 mr-2", viewMode === 'all_time' ? "text-purple-500" : "text-primary")} />
                            {totalSpent.toLocaleString('es-AR')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{periodText}</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 flex flex-col md:flex-row items-center gap-4 p-6 justify-between bg-card/50">
                    <div className="flex flex-col md:flex-row gap-4 w-full justify-end items-end">
                        <Button 
                            variant={viewMode === 'all_time' ? "default" : "outline"} 
                            onClick={toggleAllTime}
                            className={cn(viewMode === 'all_time' && "bg-purple-600 hover:bg-purple-700")}
                        >
                            <History className="mr-2 h-4 w-4" />
                            {viewMode === 'all_time' ? "Viendo Historial" : "Ver Todo"}
                        </Button>
                        <div className="w-full md:w-48">
                            <Label className="mb-1 text-xs text-muted-foreground">Mes</Label>
                            <Select value={selectedMonth} onValueChange={handleMonthChange} disabled={viewMode === 'all_time'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                    <SelectItem value="all" className="font-semibold text-primary">Todo el año</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <Label className="mb-1 text-xs text-muted-foreground">Año</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear} disabled={viewMode === 'all_time'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráficos y Análisis */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Distribución por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                <p>Sin datos en este período</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-primary" /> Análisis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-muted/50 rounded-xl border">
                            <p className="text-sm text-muted-foreground">Mayor Gasto:</p>
                            <p className="text-2xl font-bold">{topCategory ? topCategory.name : 'N/A'}</p>
                            <p className="text-primary font-bold">{topCategory ? `$${topCategory.value.toLocaleString('es-AR')}` : '$0'}</p>
                        </div>
                        <div className="rounded-xl border p-4 bg-primary/5 flex items-start gap-3">
                            <AlertCircle className="mt-1 h-5 w-5 text-primary shrink-0" />
                            <p className="text-sm">{suggestion}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link to="/add-expense">Nuevo Gasto</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Buscador y Gestión de Gastos */}
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" /> Administrar Movimientos
                            </CardTitle>
                            <CardDescription>Busca por fecha y elimina registros</CardDescription>
                        </div>
                        <div className="w-full md:w-64">
                            <Label className="text-xs">Buscar por día exacto</Label>
                            <Input 
                                type="date" 
                                className="bg-background"
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
                <CardContent>
                    <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {filteredExpenses.length > 0 ? (
                            [...filteredExpenses].reverse().map((expense) => (
                                <div key={expense.id} className="group flex items-center justify-between p-4 bg-card hover:bg-accent/50 transition-all rounded-xl border shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {expense.paidBy[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{expense.type}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(expense.date).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-lg">${expense.amount.toLocaleString('es-AR')}</p>
                                            <p className="text-[10px] uppercase text-muted-foreground">Pagó {expense.paidBy}</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if(window.confirm(`¿Eliminar "${expense.type}" por $${expense.amount}?`)) {
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
                            <div className="text-center py-10 border border-dashed rounded-xl">
                                <p className="text-muted-foreground">No hay gastos para mostrar en este período.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;

