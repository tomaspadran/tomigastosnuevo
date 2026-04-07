import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { ArrowLeft, Save } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

// Estructura de categorías y subcategorías (Debe ser igual a la de AddExpense)
const CATEGORIES_STRUCTURE = {
  "Casa": ["Alquiler", "Expensas", "Servicio Limpieza", "Otros"],
  "Salud y Cuidado Personal": ["General"],
  "Supermercado": ["General"],
  "Servicios Profesionales": ["General"],
  "Juana": ["Colegio", "Pañales", "Leche", "Otros"],
  "Servicios": ["Cable", "Internet", "Servicio Entretenimiento", "Luz", "Gas"],
  "Autos": ["Nafta", "Seguro", "Patente", "Mantenimiento"],
  "Perra": ["General"],
  "Shopping/Compras": ["General"],
  "Salidas": ["General"]
};

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, updateExpense } = useExpenses();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Casa',
    subcategory: 'Alquiler',
    paid_by: 'Tomi',
    date: '',
    payment_method: 'Efectivo',
    installments: 1,
    transaction_type: 'gasto'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expense = expenses.find(e => e.id === id || e.originalId === id);
    if (expense) {
      // Si el gasto no tiene category/subcategory pero sí type, intentamos parsear
      let cat = expense.category || 'Casa';
      let sub = expense.subcategory || 'Alquiler';
      
      if (!expense.category && expense.type) {
        const parts = expense.type.split(' - ');
        cat = parts[0];
        sub = parts.length > 1 ? parts[1] : 'General';
      }

      setFormData({
        description: expense.description || '',
        amount: expense.amount || '',
        category: cat,
        subcategory: sub,
        paid_by: expense.paid_by || 'Tomi',
        date: expense.date || '',
        payment_method: expense.payment_method || 'Efectivo',
        installments: expense.installments || 1,
        transaction_type: expense.transaction_type || 'gasto'
      });
      setLoading(false);
    }
  }, [id, expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Reconstruimos el campo "type" para compatibilidad visual
      const finalType = formData.subcategory === 'General' 
        ? formData.category 
        : `${formData.category} - ${formData.subcategory}`;

      const updateData = {
        ...formData,
        amount: parseFloat(formData.amount),
        type: finalType,
        transaction_type: formData.transaction_type
      };

      await updateExpense(id, updateData);
      toast.success('Gasto actualizado');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al actualizar');
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-black italic uppercase">Cargando...</div>;

  return (
    <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')} 
            className="text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
          </Button>
          <ThemeToggle />
        </div>

        <Card className="bg-card/90 backdrop-blur border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center text-foreground uppercase tracking-tighter">
              Editar Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground/80">Descripción</Label>
                <Input 
                  id="description"
                  required
                  className="bg-background border-input text-foreground h-12"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground/80">Monto ($)</Label>
                <Input 
                  id="amount"
                  type="number" 
                  step="0.01"
                  required
                  className="bg-background border-input text-foreground h-12 text-xl font-black"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Categoría</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="bg-background border-input text-foreground h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORIES_STRUCTURE).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/80">Sub-categoría</Label>
                  <Select value={formData.subcategory} onValueChange={(val) => setFormData({...formData, subcategory: val})}>
                    <SelectTrigger className="bg-background border-input text-foreground h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES_STRUCTURE[formData.category]?.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      )) || <SelectItem value="General">General</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Pagador</Label>
                  <Select value={formData.paid_by} onValueChange={(val) => setFormData({...formData, paid_by: val})}>
                    <SelectTrigger className="bg-background border-input text-foreground h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tomi">Tomi</SelectItem>
                      <SelectItem value="Gabi">Gabi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Fecha</Label>
                  <Input 
                    type="date"
                    className="bg-background border-input text-foreground h-12 dark:[color-scheme:dark]"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-black uppercase shadow-lg shadow-primary/20">
                <Save className="mr-2 h-6 w-6" /> Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

export default EditExpense;
