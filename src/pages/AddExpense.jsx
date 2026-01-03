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
    
    // Mejoramos la inicialización de la fecha para Safari
    const [date, setDate] = useState(() => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    });
    
    const [paidBy, setPaidBy] = useState(user?.username || 'Tomi');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validación extra para evitar el error de pantalla en blanco
        if (!amount || !category || !date) {
            toast.error("Faltan datos obligatorios");
            return;
        }

        try {
            const expenseData = {
                type: category,
                amount: parseFloat(amount),
                date: date,
                paidBy: paidBy,
                paymentMethod: paymentMethod,
                id: Date.now() // Aseguramos un ID único aquí también
            };

            addExpense(expenseData);
            toast.success("Gasto guardado");
            
            // Usamos un pequeño delay para asegurar que el estado se guarde antes de navegar
            setTimeout(() => {
                navigate('/dashboard');
            }, 100);
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("Hubo un error al procesar el gasto");
        }
    };

    const handleAddCustomCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsAddingCustom(false);
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
                    <CardTitle className="text-2xl font-bold">Nuevo Gasto</CardTitle>
                    <CardDescription>Completa los datos del movimiento</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5">
                        {/* Monto con teclado numérico optimizado para móvil */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Monto ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg font-bold h-12"
                                required
                            />
                        </div>

                        {/* Categoría */}
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            {!isAddingCustom ? (
                                <div className="flex gap-2">
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Selecciona una" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TOP_LEVEL_CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                            {customCategories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" variant="outline" className="h-12" onClick={() => setIsAddingCustom(true)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nueva categoría"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="h-12"
                                    />
                                    <Button type="button" className="h-12" onClick={handleAddCustomCategory}>OK</Button>
                                    <Button type="button" variant="ghost" className="h-12" onClick={() => setIsAddingCustom(false)}>X</Button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>¿Quién pagó?</Label>
                                <Select value={paidBy} onValueChange={setPaidBy}>
                                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tomi">Tomi</SelectItem>
                                        <SelectItem value="Gabi">Gabi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Medio</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                        </div>

                        {/* Fecha - Corregida para Safari */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    if (e.target.value) setDate(e.target.value);
                                }}
                                className="h-12"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg">
                            <Save className="mr-2 h-5 w-5" /> Guardar Gasto
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AddExpense;





