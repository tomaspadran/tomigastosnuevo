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

          <Card className="bg-[#1e
