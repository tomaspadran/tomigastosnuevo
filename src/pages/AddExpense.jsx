import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Save, Wallet, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const AddExpense = () => {
    const { addExpense, customCategories, addCategory, TOP_LEVEL_CATEGORIES } = useExpenses();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados del formulario
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paidBy, setPaidBy] = useState(user?.username || 'Tomi');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo'); // NUEVO ESTADO

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!amount || !category || !paidBy) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        const expenseData = {
            type: category,
            amount: parseFloat(amount),
            date: date,
            paidBy: paidBy,
            paymentMethod: paymentMethod, // GUARDAMOS EL MÉTODO
        };

        addExpense(expenseData);
        toast.success("Gasto registrado correctamente");
        navigate('/dashboard');
    };

    const handleAddCustomCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsAddingCustom(false);
            toast.success("Categoría agregada");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="gap-2">
                    <Link to="/dashboard">
                        <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
                    </Link>
                </Button>
            </div>

            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="text-2xl">Registrar Gasto</CardTitle>
                    <CardDescription>Ingresa los detalles del movimiento financiero</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5">
                        {/* Monto */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg font-bold"
                                required
                            />
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            {!isAddingCustom ? (
                                <div className="flex gap-2">
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>



