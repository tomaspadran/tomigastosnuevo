import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LogOut, 
  Trash2,
  Calendar
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';

const Dashboard = () => {
  const { expenses, deleteExpense, loading } = useExpenses();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Cálculos de totales
  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // Separación por quién pagó (ajustado a tus nombres)
  const paidByTomi = expenses
    .filter(e => e.paidBy === 'Tomi')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const paidByGabi = expenses
    .filter(e => e.paidBy === 'Gabi')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-[#1e293b] border-b border-slate-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-blue-400">GASTOS TOMI-GABI</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-slate-400 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-400">Total Mes</CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-400">Pagó Tomi</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{formatCurrency(paidByTomi)}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-400">Pagó Gabi</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{formatCurrency(paidByGabi)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Gastos */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Últimos Movimientos
          </h2>
          
          <div className="grid gap-3">
            {expenses.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No hay gastos registrados aún.</p>
            ) : (
              expenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="bg-[#1e293b] border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {expense.type}
                      </span>
                      <span className="text-slate-500 text-xs">{expense.date}</span>
                    </div>
                    <p className="font-medium text-white mt-1">{expense.description || 'Sin descripción'}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Pagado por <span className="text-blue-400 font-bold">{expense.paidBy}</span> con {expense.paymentMethod}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-white">{formatCurrency(expense.amount)}</span>
                    <button 
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Botón Flotante para Agregar */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={() => navigate('/add-expense')}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center p-0"
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
