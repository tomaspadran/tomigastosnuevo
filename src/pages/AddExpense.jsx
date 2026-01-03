import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Wallet, CreditCard, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const AddExpense = () => {
    const { addExpense, CATEGORIES_STRUCTURE } = useExpenses();
    const navigate = useNavigate();

    // Estados del formulario
    const [amount, setAmount] = useState('');
    const [mainCategory, setMainCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [installments, setInstallments] = useState('1');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!amount || !mainCategory || !date) {
            toast.error("Por favor completa los campos obligatorios");
            return;
        }

        const categoryLabel = subCategory ? `${mainCategory}: ${subCategory}` : mainCategory;

        try {
            addExpense({
                type: categoryLabel,
                amount: parseFloat(amount),
                date: date,
                paidBy: 'Tomi/Gabi',
                paymentMethod: paymentMethod,
                installments: parseInt(installments)
            });

            toast.success("Gasto guardado correctamente");
            
            // Navegación con delay para asegurar el guardado en Safari
            setTimeout(() => navigate('/dashboard'), 200);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el gasto");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto mb-20">
            <div className="mb-6">
                <Button variant="ghost" asChild className="gap-2">
                    <Link to="/dashboard">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Link>
                </Button>
            </div>

            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Registrar Gasto</CardTitle>
                    <CardDescription>Optimizado para Safari y cuotas</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5">
                        
                        {/* MONTO */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto Total ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-xl font-bold h-12"
                                style={{ fontSize: '16px' }} // Evita zoom en iOS
                                required
                            />
                        </div>

                        {/* CATEGORÍA PRINCIPAL */}
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select onValueChange={(val) => {
                                setMainCategory(val);
                                setSubCategory('');
                            }}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Selecciona categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CATEGORIES_STRUCTURE).map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* SUBCATEGORÍA */}
                        {mainCategory && CATEGORIES_STRUCTURE[mainCategory].length > 0 && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                <Label className="flex items-center gap-2



