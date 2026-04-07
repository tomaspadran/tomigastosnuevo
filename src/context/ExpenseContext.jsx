import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // RUTA CORREGIDA PARA VERCEL
import { toast } from 'sonner';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR Y PROCESAR GASTOS (CON LÓGICA DE CUOTAS)
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const processedExpenses = [];

      data.forEach(expense => {
        const installments = parseInt(expense.installments) || 1;
        const isCredit = expense.payment_method === 'Credito';
        
        // Si es crédito o tiene más de 1 cuota, aplicamos lógica de prorrateo/delay
        if (installments > 1 || isCredit) {
          const amountPerInstallment = Number(expense.amount) / installments;
          const originalDate = new Date(expense.date + 'T00:00:00');

          for (let i = 0; i < installments; i++) {
            const installmentDate = new Date(originalDate);
            // Si es crédito, empezamos a contar desde el mes siguiente (+1)
            const monthOffset = isCredit ? (i + 1) : i;
            installmentDate.setMonth(originalDate.getMonth() + monthOffset);

            processedExpenses.push({
              ...expense,
              id: `${expense.id}-virtual-${i}`, 
              originalId: expense.id,
              amount: amountPerInstallment.toFixed(2),
              date: installmentDate.toISOString().split('T')[0],
              description: installments > 1 
                ? `${expense.description} (${i + 1}/${installments})`
                : expense.description,
              isInstallment: true
            });
          }
        } else {
          // Gasto normal (Efectivo/Otros y 1 cuota)
          processedExpenses.push({
            ...expense,
            originalId: expense.id
          });
        }
      });

      setExpenses(processedExpenses);
    } catch (error) {
      console.error('Error al cargar gastos:', error.message);
      toast.error('No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 2. AGREGAR GASTO
  const addExpense = async (newExpense) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([newExpense]);

      if (error) throw error;
      
      // Recargamos todos los gastos para que se procesen las cuotas nuevas
      await fetchExpenses();
      toast.success('Gasto guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar el gasto');
      throw error;
    }
  };

  // 3. EDITAR GASTO
  const updateExpense = async (id, updatedData) => {
    try {
      // Importante: Al editar usamos el ID real de la DB, no el virtual
      const { error } = await supabase
        .from('expenses')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      // Recargamos para recalcular el prorrateo si cambiaron las cuotas o el monto
      await fetchExpenses();
      toast.success('Gasto actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el gasto');
      throw error;
    }
  };

  // 4. BORRAR GASTO
  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Recargamos para limpiar las cuotas virtuales del estado
      await fetchExpenses();
      toast.success('Gasto eliminado');
    } catch (error) {
      toast.error('No se pudo eliminar el gasto');
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider 
      value={{ 
        expenses, 
        loading, 
        addExpense, 
        updateExpense, 
        deleteExpense, 
        fetchExpenses 
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses debe usarse dentro de un ExpenseProvider');
  }
  return context;
};





