import React, { useState, useEffect } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AddExpense = () => {
    const { addExpense, customCategories, addCategory, TOP_LEVEL_CATEGORIES } = useExpenses();

    // Form States
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // New Category State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleCategoryChange = (value) => {
        if (value === 'ADD_NEW') {
            setIsAddingCategory(true);
            setType('');
        } else {
            setIsAddingCategory(false);
            setType(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if ((!type && !newCategoryName) || !amount || !paidBy || !date) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Ingrese un monto válido');
            return;
        }

        let finalCategory = type;

        // Handle new category
        if (isAddingCategory) {
            if (!newCategoryName.trim()) {
                toast.error('Ingrese el nombre de la nueva categoría');
                return;
            }
            finalCategory = newCategoryName.trim();
            addCategory(finalCategory); 
        }

        addExpense({
            type: finalCategory,
            amount: numAmount,
            paidBy,
            date
        });

        toast.success('Gasto agregado correctamente');

        // Reset form
        setType('');
        setAmount('');
        setPaidBy('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsAddingCategory(false);
        setNewCategoryName('');
    };

    return (
        <div className="container mx-auto p-6 max-w-md">
            <div className="mb-6">
                <Link to="/dashboard">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
                    </Button>
                </Link>
            </div>

            <Card className="shadow-lg border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Registrar Nuevo Gasto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Selector: Realizado por */}
                        <div className="space-y-2">
                            <Label>Realizado por</Label>
                            <Select onValueChange={setPaidBy} value={paidBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="¿Quién pagó?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tomi">Tomi</SelectItem>
                                    <SelectItem value="Gabi">Gabi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selector: Fecha */}
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        {/* Selector: Categoría (Jerárquico) */}
                        <div className="space-y-2">
                            <Label>Tipo de Gasto</Label>
                            {!isAddingCategory ? (
                                <Select onValueChange={handleCategoryChange} value={type}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {/* Grupos Dinámicos: Juana, Auto, Servicios */}
                                        {Object.entries(TOP_LEVEL_CATEGORIES || {}).map(([group, subgroups]) => {
                                            if (group === "Simple") return null;
                                            return (
                                                <SelectGroup key={group}>
                                                    <SelectLabel className="bg-muted/50 text-primary font-bold">{group}</SelectLabel>
                                                    {subgroups.map(sub => (
                                                        <SelectItem key={`${group}: ${sub}`} value={`${group}: ${sub}`}>
                                                            {sub}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            );
                                        })}

                                        {/* Categorías Simples: Alquiler, Supermercado, etc */}
                                        {TOP_LEVEL_CATEGORIES?.["Simple"] && (
                                            <SelectGroup>
                                                <SelectLabel className="bg-muted/50 text-primary font-bold">General</SelectLabel>
                                                {TOP_LEVEL_CATEGORIES["Simple"].map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}

                                        {/* Categorías Personalizadas */}
                                        {customCategories && customCategories.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel className="bg-muted/50 text-primary font-bold">Personalizadas</SelectLabel>
                                                {customCategories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}

                                        <div className="h-px bg-muted my-2" />
                                        <SelectItem value="ADD_NEW" className="text-primary font-semibold focus:text-primary">
                                            + Agregar nueva categoría
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        placeholder="Nombre de la nueva categoría"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsAddingCategory(false)}
                                    >
                                        ✕
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Input: Monto */}
                        <div className="space-y-2">
                            <Label>Monto Gastado ($)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-7 text-lg font-medium"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full text-lg shadow-md hover:shadow-lg transition-all">
                            Guardar Gasto
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddExpense;


