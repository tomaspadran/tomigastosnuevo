import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

// Estructura de categorías y subcategorías
const CATEGORIES_STRUCTURE = {
  "Casa": ["Alquiler", "Expensas", "Servicio Limpieza", "Otros"],
  "Salud y Cuidado Personal": ["General"],
  "Supermercado": ["General"],
  "Servicios Profesionales": ["General"],
  "Juana": ["Colegio", "Pañales", "Leche", "Otros"],
  "Servicios": ["Cable", "Internet", "Servicio Entretenimiento", "Luz", "Gas"],
  "Autos": ["Seguro", "Patente", "Mantenimiento"],
  "Perra": ["General"],
  "Shopping/Compras": ["General"],
  "Salidas": ["General"]
};

const AddExpense = () => {
  const { addExpense } = useExpenses();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Casa',
    subCategory: 'Alquiler',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Efectivo',
    paidBy: 'Tomi',
    installments: 1
  });

  // Efecto para actualizar la subcategoría cuando cambia la categoría principal
  useEffect(() => {
    const subs = CATEGORIES_STRUCTURE[formData.category];
    setFormData(prev => ({
      ...prev,
      subCategory: subs[0]
    }));
  }, [formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      // Unimos Categoría + Subcategoría para el campo "type"
      const finalType = formData.subCategory === 'General' 
        ? formData.category 
        : `${formData.category} - ${formData.subCategory}`;
      
      await addExpense({
        ...formData,
        type: finalType,
        amount: parseFloat(formData.amount)
      });
      
      toast.success('¡Gasto guardado correctamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el gasto');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')} 
          className="mb-6 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
        </Button>

        <Card className="bg-[#1e293b] border-slate-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center text-white uppercase tracking-tighter">
              Nuevo Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Detalle Gasto */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Detalle Gasto</Label>
                <Input 
                  id="description"
                  required
                  placeholder="Ej: Expensas Enero"
                  className="bg-[#0f172a] border-slate-700 text-white h-12"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">Monto ($)</Label>
                <Input 
                  id="amount"
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="bg-[#0f172a] border-slate-700 text-white h-12 text-xl font-bold"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              {/* Categorías y Subcategorías en dos columnas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoría</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="bg-[#0f172a] border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      {Object.keys(CATEGORIES_STRUCTURE).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Sub-categoría</Label>
                  <Select value={formData.subCategory} onValueChange={(val) => setFormData({...formData, subCategory: val})}>
                    <SelectTrigger className="bg-[#0f172a] border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      {CATEGORIES_STRUCTURE[formData.category].map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quién pagó y Método */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Pagó</Label>
                  <Select value={formData.paidBy} onValueChange={(val) => setFormData({...formData, paidBy: val})}>
                    <SelectTrigger className="bg-[#0f172a] border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      <SelectItem value="Tomi">Tomi</SelectItem>
                      <SelectItem value="Gabi">Gabi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Método</Label>
                  <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
                    <SelectTrigger className="bg-[#0f172a] border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Credito">Credito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label className="text-slate-300">Fecha</Label>
                <Input 
                  type="date"
                  className="bg-[#0f172a] border-slate-700 text-white h-12 [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              {/* Cuotas (Habilitado si es Credito) */}
              {formData.paymentMethod === 'Credito' && (
                <div className="p-4 border border-blue-500/30 rounded-xl bg-blue-500/5 animate-in fade-in zoom-in duration-300">
                  <Label className="text-blue-400 font-bold">Cantidad de Cuotas</Label>
                  <Input 
                    type="number" 
                    min="1"
                    className="bg-[#0f172a] border-slate-700 text-white mt-2"
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic">* Se crearán {formData.installments} gastos automáticos (uno por mes).</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-black uppercase shadow-lg shadow-blue-900/40">
                <Save className="mr-2 h-6 w-6" /> Guardar Gasto
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;


