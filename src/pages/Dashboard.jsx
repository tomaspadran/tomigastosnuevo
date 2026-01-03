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

    // Estados de filtrado
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

    // Filtrado de gastos (Aquí es donde ocurre la magia del prorrateo)
    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const expenseYear = date.getUTCFullYear().toString();
            const expenseMonth = date.getUTCMonth().toString();
            
            const matchesTime = viewMode === 'all_time' || 
                               (



