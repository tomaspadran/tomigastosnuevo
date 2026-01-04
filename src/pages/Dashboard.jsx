import React, { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  User,
  ShoppingBag
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

const Dashboard = () => {
  const { expenses, loading } = useExpenses();
  const navigate = useNavigate();

  // Filtros de fecha para el mes actual
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const total = monthlyExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóTomi = monthlyExpenses.filter(e => e.paid_by === 'Tomi').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóGabi = monthlyExpenses.filter(e => e.paid_by === 'Gabi').reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Agrupar por categoría para el gráfico
    const categoryData = monthlyExpenses.reduce((acc, curr) => {
      // Extraemos solo la categoría principal (lo que está antes del "-")
      const mainCat = curr.type.split(' - ')[0];
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name]
    }));

    return { total, pagóTomi, pagóGabi, chartData, monthlyExpenses };
  }, [expenses]);

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Gastos Tomi-Gabi</h1>
            <p className="text-slate-400 text-sm flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> {new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date())}
            </p>
          </div>
          <Button onClick={() => navigate('/add-expense')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20">
            <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Gasto
          </Button>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1e293b] border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-wider flex justify-between">
                Total Mes <Wallet className="h-4 w-4 text-blue-500" />
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
              <CardTitle className="text-sm font-bold uppercase">Distribución por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      innerRadius={60}
                      outerRadius={80}
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
                <div className="h-full flex items-center justify-center text-slate-500">No hay datos este mes</div>
              )}
            </CardContent>
          </Card>

          {/* Últimos Movimientos */}
          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase">Últimos Movimientos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-80 overflow-y-auto">
              {stats.monthlyExpenses.length > 0 ? (
                stats.monthlyExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
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
                <div className="text-center py-10 text-slate-500 text-sm">No hay gastos registrados aún.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

