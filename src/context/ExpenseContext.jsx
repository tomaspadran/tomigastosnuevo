import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState(() => {
        const savedExpenses = localStorage.getItem('expenses');
        return savedExpenses ? JSON.parse(savedExpenses) : [];
    });

    // Nueva estructura de categorías con subcategorías
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
        if (expenseData.paymentMethod === 'Tarjeta' && expenseData.installments > 1) {
            const installmentAmount = expenseData.amount / expenseData.installments;
            const newExpenses = [];
            const baseDate = new Date(expenseData.date);

            for (let i = 0; i < expenseData.installments; i++) {
                const installmentDate = new Date(baseDate);
                // Sumamos meses para el prorrateo
                installmentDate.setUTCMonth(baseDate.getUTCMonth() + i);
                
                newExpenses.push({
                    ...expenseData,
                    id: `${Date.now()}-${i}`,
                    amount: installmentAmount,
                    date: installmentDate.toISOString().split('T')[0],
                    isInstallment: true,
                    currentInstallment: i + 1,
                    totalInstallments: expenseData.installments
                });
            }
            setExpenses(prev => [...prev, ...newExpenses]);
        } else {
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


