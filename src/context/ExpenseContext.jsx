import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const ExpenseContext = createContext();

// Estructura de categorías definida por el usuario
export const CATEGORIES_STRUCTURE = {
  "Casa": ["Alquiler", "Expensas", "Servicio Limpieza", "Otros"],
  "Salud y Cuidado Personal": ["General"],
  "Supermercado": ["General"],
  "Servicios Profesionales": ["General"],
  "Juana": ["Colegio", "Pañales", "Leche", "Otros"],
  "Servicios": ["Cable", "Internet", "Servicio Entretenimiento", "Luz", "Gas"],
  "Autos": ["Seguro", "Patente", "Mantenimiento"],
  "Perra": ["General"],
  "Shopping/Compras": ["General"],
  "Salidas": ["General"]
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar gastos desde Supabase
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
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

  // Función para agregar un gasto (soporta cuotas)
  const addExpense = async (expenseData) => {
    try {
      const installments = parseInt(expenseData.installments) || 1;
      const amountPerInstallment = parseFloat(expenseData.amount) / installments;
      const newExpenses = [];

      // Crear registros para cada cuota
      for (let i = 0; i < installments; i++) {
        const expenseDate = new Date(expenseData.date);
        expenseDate.setMonth(expenseDate.getMonth() + i);

        newExpenses.push({
          description: installments > 1 
            ? `${expenseData.description} (${i + 1}/${installments})` 
            : expenseData.description,
          amount: amountPerInstallment,
          type: expenseData.type, // Aquí ya viene "Categoría - Subcategoría"
          date: expenseDate.toISOString().split('T')[0],
          payment_method: expenseData.paymentMethod,
          paid_by: expenseData.paidBy,
          installments: installments
        });
      }

      const { error } = await supabase.from('expenses').insert(newExpenses);
      if (error) throw error;

      await fetchExpenses(); // Recargar lista
      return { success: true };
    } catch (error) {
      console.error('Error al guardar:', error.message);
      throw error;
    }
  };

  // Función para eliminar un gasto
  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success('Gasto eliminado');
    } catch (error) {
      toast.error('Error al eliminar el gasto');
    }
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      loading, 
      addExpense, 
      deleteExpense, 
      fetchExpenses,
      CATEGORIES_STRUCTURE 
    }}>
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



