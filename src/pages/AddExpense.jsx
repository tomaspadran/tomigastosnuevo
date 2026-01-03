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
            setTimeout(() => navigate('/dashboard'), 150);
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
                    <CardDescription>Organiza tus gastos por categorías y cuotas</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5">
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
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select onValueChange={(val) => {
                                setMainCategory(val);
                                setSubCategory('');
                            }}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Selecciona categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CATEGORIES_STRUCTURE).map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {mainCategory && CATEGORIES_STRUCTURE[mainCategory].length > 0 && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Layers className="h-3 w-3" /> Subcategoría de {mainCategory}
                                </Label>
                                <Select value={subCategory} onValueChange={setSubCategory}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Selecciona subcategoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES_STRUCTURE[mainCategory].map(sub => (
                                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Método de Pago</Label>
                                <Select value={paymentMethod} onValueChange={(val) => {
                                    setPaymentMethod(val);
                                    if (val === 'Efectivo') setInstallments('1');
                                }}>
                                    <SelectTrigger className="h-12">
                                        <div className="flex items-center gap-2">
                                            {paymentMethod === 'Efectivo' ? <Wallet className="h-4 w-4 text-green-500" /> : <CreditCard className="h-4 w-4 text-blue-500" />}
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {paymentMethod === 'Tarjeta' && (
                                <div className="space-y-2">
                                    <Label>Cuotas</Label>
                                    <Select value={installments} onValueChange={setInstallments}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <SelectItem key={n} value={n.toString()}>{n} cuotas</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha del primer pago</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => { if(e.target.value) setDate(e.target.value) }}
                                className="h-12"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                        <Button type="submit" className="w-full h-14 text-lg font-bold shadow-xl">
                            <Save className="mr-2 h-5 w-5" /> Guardar Movimiento
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {paymentMethod === 'Tarjeta' && parseInt(installments) > 1 && amount > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                    <p>Se imputarán <strong>{installments} cuotas</strong> de <strong>${(amount / installments).toLocaleString('es-AR')}</strong> cada una.</p>
                </div>
            )}
        </div>
    );
};

export default AddExpense;






