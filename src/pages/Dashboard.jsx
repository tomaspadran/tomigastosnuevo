import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, History, Trash2, CreditCard, Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];

const Dashboard = () => {
    const { expenses, deleteExpense } = useExpenses();
    const { user } = useAuth();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getUTCMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getUTCFullYear().toString());
    const [filterMethod, setFilterMethod] = useState('Todo'); 

    const months = [
        { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' }, { value: '2', label: 'Marzo' }, { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' }, { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' }, { value: '9', label: 'Octubre' }, { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' },
    ];

    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const matchesTime = date.getUTCFullYear().toString() === selectedYear && date.getUTCMonth().toString() === selectedMonth;
            const matchesMethod = filterMethod === 'Todo' || expense.paymentMethod === filterMethod;
            return matchesTime && matchesMethod;
        });
    }, [expenses, selectedMonth, selectedYear, filterMethod]);

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
                <h1 className="text-2xl font-black tracking-tight">Mis Gastos</h1>
                <Button asChild size="icon" className="rounded-full h-12 w-12 shadow-lg"><Link to="/add-expense"><Plus className="h-6 w-6" /></Link></Button>
            </div>

            <Card className="border-none bg-primary text-primary-foreground shadow-2xl relative overflow-hidden">
                <CardContent className="pt-8 pb-8">
                    <p className="text-primary-foreground/60 text-xs font-bold uppercase mb-1">Total del Mes</p>
                    <div className="flex items-baseline"><span className="text-2xl font-medium mr-1">$</span><span className="text-5xl font-black tracking-tighter">{totalSpent.toLocaleString('es-AR')}</span></div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="bg-card border-none shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-card border-none shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{['2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                <h2 className="font-black text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Historial</h2>
                <div className="grid gap-3">
                    {filteredExpenses.length > 0 ? [...filteredExpenses].reverse().map((expense) => (
                        <div key={expense.id} className="bg-card p-4 rounded-3xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", expense.paymentMethod === 'Tarjeta' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600")}>
                                    {expense.paymentMethod === 'Tarjeta' ? <CreditCard size={20} /> : <Wallet size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-tight">{expense.type}</p>
                                    {expense.description && <p className="text-[12px] text-blue-600 font-medium italic">"{expense.description}"</p>}
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" />{new Date(expense.date).toLocaleDateString('es-AR')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="font-black text-base">${expense.amount.toLocaleString('es-AR')}</p>
                                <Button variant="ghost" size="icon" className="text-destructive/20" onClick={() => { if(confirm('¿Eliminar?')) deleteExpense(expense.id) }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )) : <div className="text-center py-10 text-muted-foreground italic">No hay gastos este mes</div>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
