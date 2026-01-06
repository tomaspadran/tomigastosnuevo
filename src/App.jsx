import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import ExpenseForm from '../components/ExpenseForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, updateExpense } = useExpenses();
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    // Buscamos el gasto por ID (id de base de datos o id temporal)
    const found = expenses.find(e => e.id === id || e.originalId === id);
    if (found) {
      setExpense(found);
    }
  }, [id, expenses]);

  const handleSubmit = async (updatedData) => {
    try {
      await updateExpense(id, updatedData);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
    }
  };

  if (!expense) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-black uppercase italic">
        Cargando gasto...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
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

        <ExpenseForm 
          onSubmit={handleSubmit} 
          initialData={expense} 
          isEditing={true} 
        />
      </div>
    </div>
  );
};

export default EditExpense;
