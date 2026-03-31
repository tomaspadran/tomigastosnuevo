import React, { useState, useMemo, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Search, Filter, Trash2, Edit3, 
  ArrowUpCircle, ArrowDownCircle, PiggyBank,
  ChevronLeft, ChevronRight, FileDown, Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select';
import { toast } from 'sonner';

const History = () => {
    const { expenses, deleteExpense, loading: contextLoading } = useExpenses();
    const navigate = useNavigate();
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('todos');
    const [personFilter, setPersonFilter] = useState('todos');
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            const { data } = await supabase.from('members').select('*');
            if (data) setMembers(data);
            setLoadingMembers(false);
        };
        fetchMembers();
    }, []);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'todos' || exp.transaction_type === typeFilter;
            const matchesPerson = personFilter === 'todos' || exp.paid_by === personFilter;
            
            return matchesSearch && matchesType && matchesPerson;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, searchTerm, typeFilter, personFilter]);

    const getMemberAvatar = (name) => {
        const member = members.find(m => m.name === name);
        return member?.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=random`;
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este movimiento?')) {
            try {
                await deleteExpense(id);
                toast.success('Movimiento eliminado');
            } catch (e) {
                toast.error('Error al eliminar');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Superior */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                           <h1 className="text-3xl font-black tracking-tight uppercase italic text-foreground">
                              Historial completo
                           </h1>
                           <p className="text-muted-foreground text-sm font-medium">Gestiona todos tus movimientos registrados</p>
                        </div>
                    </div>
                </div>

                {/* Barra de Filtros */}
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por descripción o categoría..." 
                            className="pl-10 h-11 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[140px] h-11 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los tipos</SelectItem>
                                <SelectItem value="gasto">Gastos</SelectItem>
                                <SelectItem value="ingreso">Ingresos</SelectItem>
                                <SelectItem value="ahorro">Ahorros</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={personFilter} onValueChange={setPersonFilter}>
                            <SelectTrigger className="w-[140px] h-11 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                                <SelectValue placeholder="Persona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Cualquiera</SelectItem>
                                {members.map(m => (
                                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-border">
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Fecha</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Horario</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Pagador</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Descripción</th>
                                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Categoría</th>
                                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">Monto</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">
                                                    {new Date(exp.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-black">{new Date(exp.date).getFullYear()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {exp.created_at ? new Date(exp.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true }) : "10:00 AM"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={getMemberAvatar(exp.paid_by)} 
                                                    className="w-9 h-9 rounded-full border border-border object-cover shadow-sm bg-card" 
                                                    alt={exp.paid_by} 
                                                />
                                                <span className="text-xs font-bold text-foreground">{exp.paid_by}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{exp.description || exp.type || 'Sin detalle'}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase italic opacity-70">{exp.payment_method} • {exp.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs px-2.5 py-1 rounded-lg bg-secondary/30 text-secondary-foreground font-black uppercase tracking-tight">
                                                {exp.category || (exp.transaction_type === 'ahorro' ? 'Ahorro' : 'Ingreso')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-base font-black ${
                                                    exp.transaction_type === 'ingreso' ? 'text-emerald-500' : 
                                                    exp.transaction_type === 'ahorro' ? 'text-blue-500' : 'text-rose-500'
                                                }`}>
                                                    {exp.transaction_type === 'ingreso' ? '+' : '-'}$ {Number(exp.amount).toLocaleString('es-AR')}
                                                </span>
                                                {exp.installments > 1 && (
                                                    <span className="text-[10px] text-muted-foreground">En cuotas</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">
                                                <Check className="w-3 h-3" />
                                                Completado
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    onClick={() => navigate(`/edit-expense/${exp.originalId || exp.id}`)}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    onClick={() => handleDelete(exp.originalId || exp.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredExpenses.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-3">
                            <Calendar className="w-12 h-12 text-muted-foreground/30" />
                            <p className="text-muted-foreground font-medium italic">No se encontraron movimientos con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
                
                {/* Resumen Final en el Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                         <div><p className="text-[10px] font-black uppercase text-emerald-600">Total Ingresos</p><p className="text-lg font-black text-emerald-700">$ {filteredExpenses.filter(e => e.transaction_type === 'ingreso').reduce((a,c) => a + Number(c.amount), 0).toLocaleString('es-AR')}</p></div>
                         <ArrowUpCircle className="w-8 h-8 text-emerald-500 opacity-50" />
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
                         <div><p className="text-[10px] font-black uppercase text-rose-600">Total Gastos</p><p className="text-lg font-black text-rose-700">$ {filteredExpenses.filter(e => e.transaction_type === 'gasto' || !e.transaction_type).reduce((a,c) => a + Number(c.amount), 0).toLocaleString('es-AR')}</p></div>
                         <ArrowDownCircle className="w-8 h-8 text-rose-500 opacity-50" />
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                         <div><p className="text-[10px] font-black uppercase text-blue-600">Total Ahorros</p><p className="text-lg font-black text-blue-700">$ {filteredExpenses.filter(e => e.transaction_type === 'ahorro').reduce((a,c) => a + Number(c.amount), 0).toLocaleString('es-AR')}</p></div>
                         <PiggyBank className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default History;
