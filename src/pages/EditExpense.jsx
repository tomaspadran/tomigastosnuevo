import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, updateExpense } = useExpenses();
  
  // Estado para controlar los datos del formulario
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    paid_by: '',
    date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscamos el gasto por ID
    const expenseToEdit = expenses.find(e => e.id === id || e.originalId === id);
    if (expenseToEdit) {
      setFormData({
        description: expenseToEdit.description || '',
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || '',
        paid_by: expenseToEdit.paid_by || '',
        date: expenseToEdit.date || ''
      });
      setLoading(false);
    }
  }, [id, expenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateExpense(id, formData);
      toast.success('Gasto actualizado correctamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al actualizar el gasto');
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-black uppercase italic">
        Cargando gasto...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white p-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
            Editar Gasto
          </h2>
        </div>

        {/* Formulario Integrado para evitar errores de importación */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Descripción</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Supermercado"
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Monto ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white font-black text-2xl focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Pagador</label>
              <select
                name="paid_by"
                value={formData.paid_by}
                onChange={handleChange}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white font-bold uppercase text-xs outline-none focus:border-blue-500"
              >
                <option value="Tomi">Tomi</option>
                <option value="Gabi">Gabi</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Fecha</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white font-bold text-xs outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-black uppercase italic tracking-widest mt-4 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <Save className="mr-2 h-5 w-5" /> Guardar Cambios
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
