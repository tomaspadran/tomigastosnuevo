import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const AddExpense = () => {
  const { addExpense, CATEGORIES_STRUCTURE } = useExpenses();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Casa',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Efectivo',
    paidBy: 'Tomi',
    installments: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Gasto guardado correctamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al guardar el gasto');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Botón Volver */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-slate-400 hover:text-white hover:bg-slate-800 p-2"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Volver al Dashboard
        </Button>

        <Card className="bg-[#1e293b] border-slate-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center text-white tracking-tight">
              NUEVO GASTO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Descripción */}
              <div className="space-y-2">
                <Label className="text-slate-300">¿Qué compraste?</Label>
                <Input 
                  placeholder="Ej: Supermercado Coto"
                  required
                  className="bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-600 h-12"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label className="text-slate-300">Monto ($)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="bg-[#0f172a] border-slate-700 text-white h-12 text-lg font-bold"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              {/* Grid de Categoría y Quién Pagó */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoría</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger className="bg-[#0f172a] border-slate-700 h-12">
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
                  <Label className="text-slate-300">Pagó</Label>
                  <Select 
                    value={formData.paidBy} 
                    onValueChange={(value) => setFormData({...formData, paidBy: value})}
                  >
                    <SelectTrigger className="bg-[#0f172a] border-slate-700 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      <SelectItem value="Tomi">Tomi</SelectItem>
                      <SelectItem value="Gabi">Gabi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label className="text-slate-300">Método de Pago</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                >
                  <SelectTrigger className="bg-[#0f172a] border-slate-700 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta (Crédito)</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label className="text-slate-300">Fecha</Label>
                <Input 
                  type="date"
                  required
                  className="bg-[#0f172a] border-slate-700 text-white h-12 [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              {/* Cuotas (Solo si es Tarjeta) */}
              {formData.paymentMethod === 'Tarjeta' && (
                <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-blue-500/30">
                  <Label className="text-blue-400 font-bold">Cantidad de Cuotas</Label>
                  <Input 
                    type="number" 
                    min="1"
                    max="24"
                    className="bg-[#0f172a] border-slate-700 text-white h-10"
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value)})}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    * Se crearán {formData.installments} gastos automáticos (uno por mes).
                  </p>
                </div>
              )}

              {/* Botón Guardar */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 font-black text-lg mt-4 shadow-lg shadow-blue-900/20"
              >
                {isSubmitting ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="mr-2 h-6 w-6" /> GUARDAR GASTO
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;
