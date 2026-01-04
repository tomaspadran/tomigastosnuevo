import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const CATEGORIES_STRUCTURE = {
        "Casa": ["Alquiler", "Expensas", "Servicio Limpieza", "Otros"],
        "Salud y Cuidado Personal": [],
        "Supermercado": [],
        "Servicios Profesionales": [],
        "Juana": ["Colegio", "Pañales", "Leche", "Otros"],
        "Servicios": ["Cable", "Internet", "Servicio Entretenimiento", "Luz", "Gas"],
        "Autos": ["Seguro", "Patente", "Mantenimiento"],
        "Perra": [],
        "Shopping/Compras": [],
        "Salidas": []
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

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
            console.error('Error cargando gastos:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (expenseData) => {
        try {
            let itemsToInsert = [];

            if (expenseData.paymentMethod === 'Tarjeta' && expenseData.installments > 1) {
                const installmentAmount = expenseData.amount / expenseData.installments;
                const baseDate = new Date(expenseData.date + 'T00:00:00');

                for (let i = 0; i < expenseData.installments; i++) {
                    const installmentDate = new Date(baseDate);
                    installmentDate.setMonth(baseDate.getMonth() + i);
                    
                    // CORRECCIÓN AQUÍ: Se eliminó la línea duplicada de description
                    itemsToInsert.push({
                        type: expenseData.type,
                        amount: installmentAmount,
                        date: installmentDate.toISOString().split('T')[0],
                        paymentMethod: expenseData.paymentMethod,
                        paidBy: expenseData.paidBy,
                        installments: expenseData.installments,
                        description: `${expenseData.description || ''} (Cuota ${i + 1}/${expenseData.installments})`.trim()
                    });
                }
            } else {
                itemsToInsert.push({
                    type: expenseData.type,
                    description: expenseData.description || '',
                    amount: expenseData.amount,
                    date: expenseData.date,
                    paymentMethod: expenseData.paymentMethod,
                    paidBy: expenseData.paidBy,
                    installments: 1
                });
            }

            const { error } = await supabase.from('expenses').insert(itemsToInsert);
            if (error) throw error;

            fetchExpenses();
        } catch (error) {
            console.error('Error al guardar:', error.message);
            alert("No se pudo guardar en la nube: " + error.message);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            setExpenses(prev => prev.filter(ex => ex.id !== id));
        } catch (error) {
            console.error('Error al eliminar:', error.message);
        }
    };

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, CATEGORIES_STRUCTURE, loading }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => useContext(ExpenseContext);


