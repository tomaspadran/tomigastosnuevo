import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Importamos la conexión

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

    // 1. CARGAR GASTOS DE LA NUBE
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

    // 2. GUARDAR GASTO EN LA NUBE
    const addExpense = async (expenseData) => {
        try {
            let itemsToInsert = [];

            if (expenseData.paymentMethod === 'Tarjeta' && expenseData.installments > 1) {
                const installmentAmount = expenseData.amount / expenseData.installments;
                const baseDate = new Date(expenseData.date + 'T00:00:00');

                for (let i = 0; i < expenseData.installments; i++) {
                    const installmentDate = new Date(baseDate);
                    installmentDate.setMonth(baseDate.getMonth() + i);
                    
                    itemsToInsert.push({
                        type: expenseData.type,
                        description: expenseData.description,
                        amount: installmentAmount,
                        date: installmentDate.toISOString().split('T')[0],
                        paymentMethod: expenseData.paymentMethod,
                        paidBy: expenseData.paidBy,
                        installments: expenseData.installments,
                        // Agregamos info de cuotas para el historial
                        description: `${expenseData.description || ''} (Cuota ${i + 1}/${expenseData.installments})`.trim()
                    });
                }
            } else {
                itemsToInsert.push({
                    type: expenseData.type,
                    description: expenseData.description,
                    amount: expenseData.amount,
                    date: expenseData.date,
                    paymentMethod: expenseData.paymentMethod,
                    paidBy: expenseData.paidBy,
                    installments: 1
                });
            }

            const { error } = await supabase.from('expenses').insert(itemsToInsert);
            if (error) throw error;

            // Refrescamos la lista local
            fetchExpenses();
        } catch (error) {
            console.error('Error al guardar:', error.message);
            alert("No se pudo guardar en la nube: " + error.message);
        }
    };

    // 3. ELIMINAR GASTO DE LA NUBE
    const deleteExpense = async (id) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setExpenses(prev => prev.filter(ex => ex.id !== id));
        } catch (error) {
            console.error('Error al eliminar:', error.message);
        }
    };

    return (
        <ExpenseContext.Provider value={{ 
            expenses, 
            addExpense, 
            deleteExpense, 
            CATEGORIES_STRUCTURE,
            loading 
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => useContext(ExpenseContext);




