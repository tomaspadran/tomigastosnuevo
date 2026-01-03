import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState(() => {
        const savedExpenses = localStorage.getItem('expenses');
        return savedExpenses ? JSON.parse(savedExpenses) : [];
    });

    // Tu nueva estructura de categorías y subcategorías
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
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = (expenseData) => {
        // LÓGICA DE CUOTAS Y PRORRATEO
        if (expenseData.paymentMethod === 'Tarjeta' && expenseData.installments > 1) {
            const installmentAmount = expenseData.amount / expenseData.installments;
            const newExpenses = [];
            
            // Usamos la fecha elegida como base
            const baseDate = new Date(expenseData.date + 'T00:00:00');

            for (let i = 0; i < expenseData.installments; i++) {
                const installmentDate = new Date(baseDate);
                // Sumamos i meses a la fecha original
                installmentDate.setMonth(baseDate.getMonth() + i);
                
                newExpenses.push({
                    ...expenseData,
                    id: `${Date.now()}-${i}`, // ID único para cada cuota
                    amount: installmentAmount,
                    date: installmentDate.toISOString().split('T')[0],
                    isInstallment: true,
                    currentInstallment: i + 1,
                    totalInstallments: expenseData.installments
                });
            }
            setExpenses(prev => [...prev, ...newExpenses]);
        } else {
            // GASTO NORMAL (1 cuota o Efectivo)
            setExpenses(prev => [...prev, { ...expenseData, id: Date.now() }]);
        }
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    return (
        <ExpenseContext.Provider value={{ 
            expenses, 
            addExpense, 
            deleteExpense, 
            CATEGORIES_STRUCTURE 
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => useContext(ExpenseContext);



