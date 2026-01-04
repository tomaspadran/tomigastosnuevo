import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
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
        // Obtenemos cuotas (si no existe el campo o es nulo, asumimos 1)
        const installments = parseInt(expense.installments) || 1;
        
        // Si tiene más de 1 cuota, prorrateamos
        if (installments > 1) {
          const amountPerInstallment = Number(expense.amount) / installments;
          
          // Usamos la fecha original para calcular las siguientes
          // Agregamos 'T00:00:00' para evitar problemas de zona horaria local
          const originalDate = new Date(expense.date + 'T00:00:00');

          for (let i = 0; i < installments; i++) {
            const installmentDate = new Date(originalDate);
            // Sumamos i meses a la fecha original
            installmentDate.setMonth(originalDate.getMonth() + i);

            processedExpenses.push({
              ...expense,
              // Creamos un ID virtual para que React no se queje de keys duplicadas
              id: `${expense.id}-virtual-${i}`, 
              // Guardamos el ID real de la base de datos para poder editar/borrar luego
              originalId: expense.id,
              // Dividimos el monto
              amount: amountPerInstallment.toFixed(2),
              // Formateamos la nueva fecha (YYYY-MM-DD)
              date: installmentDate.toISOString().split('T')[0],
              // Modificamos la descripción para saber qué cuota es
              description: `${expense.description} (${i + 1}/${installments})`,
              isInstallment: true
            });
          }
        } else {
          // Si es un gasto normal en 1 cuota, lo pasamos tal cual
          processedExpenses.push({
            ...expense,
            originalId: expense.id // Mantenemos consistencia con la propiedad
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




