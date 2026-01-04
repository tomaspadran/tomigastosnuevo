import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ShoppingBag,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

const Dashboard = () => {
  const { expenses, loading } = useExpenses();
  const navigate = useNavigate();

  // Estados para controlar los 3 filtros
  const [viewType, setViewType] = useState('month'); // 'month', 'year', 'all'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Lógica de filtrado y estadísticas
  const stats = useMemo(() => {
    let filtered = [...expenses];

    // 1. Filtro por Mes/Año específico
    if (viewType === 'month') {
      filtered = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
      });
    } 
    // 2. Filtro por Año completo
    else if (viewType === 'year') {
      filtered = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getFullYear() === parseInt(selectedYear);
      });
    }
    // 3. Historial completo (no filtra nada, usa 'filtered' tal cual)

    const total = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóTomi = filtered.filter(e => e.paid_by === 'Tomi').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóGabi = filtered.filter(e => e.paid_by === 'Gabi').reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Agrupar por categoría para el gráfico
    const categoryData = filtered.reduce((acc, curr) => {
      const mainCat = curr.type.split(' - ')[0];
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name]
    })).sort((a, b) => b.value - a.value);

    return { total, pagóTomi, pagóGabi, chartData, filtered };
  }, [expenses, viewType, selectedMonth, selectedYear]);

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Gastos Tomi-Gabi</h1>
            <p className="text-blue-400 text-xs font-bold flex items-center uppercase mt-1">
              <Calendar className="h-3 w-3 mr-1" /> 
              {viewType === 'month' && `${new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(2024, selectedMonth))} ${selectedYear}`}
              {viewType === 'year' && `Año Completo ${selectedYear}`}
              {viewType === 'all' && "Historial Completo"}
            </p>
          </div>
          <Button onClick={() => navigate('/add-expense')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Gasto
          </Button>
        </div>

        {/* BARRA DE FILTROS */}
        <Card className="bg-[#1e293b] border-slate-700 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
            
            {/* Selector de tipo de vista */}
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-[150px] bg-[#0f172a] border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                <SelectItem value="month">Por Mes</SelectItem>
                <SelectItem value="year">Año Completo</SelectItem>
                <SelectItem value="all">Todo el Historial</SelectItem>
              </SelectContent>
            </Select>

            {/* Selector de Año (solo si no es Historial Completo) */}
            {viewType !== 'all' && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] bg-[#0f172a] border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Selector de Mes (solo si es vista mensual) */}
            {viewType === 'month' && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px] bg-[#0f172a] border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                  {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                    <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1e293b] border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-wider flex justify-between">
                Total Periodo <Wallet className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">${stats.total.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-wider flex justify-between">
                Pagó Tomi <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">${stats.pagóTomi.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-wider flex justify-between">
                Pagó Gabi <TrendingDown className="h-4 w-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">${stats.pagóGabi.toLocaleString('es-AR')}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico Circular */}
          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase">Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <p className="text-sm italic">No hay datos en este periodo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movimientos del periodo */}
          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase">Movimientos</CardTitle>
              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold">
                {stats.filtered.length} ITEMS
              </span>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              {stats.filtered.length > 0 ? (
                stats.filtered.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <ShoppingBag className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{expense.description}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                          {expense.type} • {expense.paid_by}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white text-sm">${Number(expense.amount).toLocaleString('es-AR')}</p>
                      <p className="text-[10px] text-slate-500">{new Date(expense.date).toLocaleDateString('es-AR')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">Sin movimientos.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


