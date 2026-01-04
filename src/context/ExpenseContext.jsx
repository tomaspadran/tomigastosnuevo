import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR GASTOS
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

  // 2. AGREGAR GASTO
  const addExpense = async (newExpense) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select();

      if (error) throw error;
      setExpenses((prev) => [data[0], ...prev]);
      toast.success('Gasto guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar el gasto');
      throw error;
    }
  };

  // 3. EDITAR GASTO (NUEVO)
  const updateExpense = async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updatedData)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Actualizamos el estado local sin recargar la página
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? data[0] : exp))
      );
      toast.success('Gasto actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el gasto');
      throw error;
    }
  };

  // 4. BORRAR GASTO (NUEVO)
  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Filtramos el gasto borrado del estado local
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
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



