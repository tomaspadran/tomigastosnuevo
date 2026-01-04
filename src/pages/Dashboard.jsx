import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../components/ui/dialog';
import { 
  PlusCircle, 
  ShoppingBag,
  Filter,
  LayoutDashboard,
  Trash2,
  Edit3,
  Info,
  Sparkles,
  TrendingUp,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

const Dashboard = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const navigate = useNavigate();

  const [viewType, setViewType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    // 1. Filtrado para el resumen actual
    let filtered = [...expenses];
    if (viewType === 'month') {
      filtered = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
      });
    } else if (viewType === 'year') {
      filtered = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getFullYear() === parseInt(selectedYear);
      });
    }

    const total = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóTomi = filtered.filter(e => e.paid_by === 'Tomi').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóGabi = filtered.filter(e => e.paid_by === 'Gabi').reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 2. Datos para el gráfico de torta
    const categoryData = filtered.reduce((acc, curr) => {
      const mainCat = curr.type.split(' - ')[0];
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name]
    })).sort((a, b) => b.value - a.value);

    // 3. Lógica para el Gráfico de Evolución Mensual (Todo el año actual)
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const evolutionData = monthNames.map((name, index) => {
      const monthlyTotal = expenses
        .filter(exp => {
          const d = new Date(exp.date);
          return d.getMonth() === index && d.getFullYear() === parseInt(selectedYear);
        })
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      
      return { name, total: monthlyTotal };
    });

    // 4. Eventos Calendario
    const events = expenses.map(exp => ({
      id: exp.id,
      title: `${exp.paid_by}: $${Number(exp.amount).toLocaleString('es-AR')}`,
      date: exp.date,
      backgroundColor: exp.paid_by === 'Tomi' ? '#0ea5e9' : '#ec4899',
      borderColor: exp.paid_by === 'Tomi' ? '#0ea5e9' : '#ec4899',
      extendedProps: { ...exp },
      allDay: true
    }));

    const aiSuggestions = [];
    if (total > 0) {
      const diff = Math.abs(pagóTomi - pagóGabi);
      if (diff > (total * 0.15)) {
        const quienDebe = pagóTomi > pagóGabi ? "Gabi" : "Tomi";
        aiSuggestions.push({
          title: "Balance de Gastos",
          text: `Hay una diferencia de $${diff.toLocaleString('es-AR')}. Sería ideal que los próximos gastos los cubra ${quienDebe}.`,
          icon: <TrendingUp className="h-4 w-4 text-amber-400" />
        });
      }
    }

    return { total, chartData, filtered, events, aiSuggestions, evolutionData };
  }, [expenses, viewType, selectedMonth, selectedYear]);

  const handleEventClick = (clickInfo) => {
    setSelectedExpense(clickInfo.event.extendedProps);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Eliminar gasto? Se borrarán todas sus cuotas.')) {
      const idToDelete = selectedExpense.originalId || selectedExpense.id;
      await deleteExpense(idToDelete);
      setIsModalOpen(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic uppercase">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Gastos Tomi-Gabi</h1>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mt-1">
              <LayoutDashboard className="h-3 w-3" />
              {viewType === 'month' && `${new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(selectedYear, selectedMonth))} ${selectedYear}`}
              {viewType === 'year' && `Año Completo ${selectedYear}`}
            </div>
          </div>
          <Button onClick={() => navigate('/add-expense')} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto font-black italic uppercase tracking-tight shadow-lg shadow-blue-900/40">
            <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Gasto
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1e293b] border-slate-700">
            <TabsTrigger value="overview" className="text-xs uppercase font-bold text-white">Resumen</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs uppercase font-bold text-white">Calendario</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Filtros */}
            <Card className="bg-[#1e293b] border-slate-700 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-white" />
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger className="w-[150px] bg-[#0f172a] border-slate-700 text-xs font-bold text-white uppercase"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                    <SelectItem value="month">Mensual</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] bg-[#0f172a] border-slate-700 text-xs font-bold text-white uppercase"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
                {viewType === 'month' && (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[130px] bg-[#0f172a] border-slate-700 text-xs font-bold text-white uppercase"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white max-h-[300px]">
                      {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                        <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </Card>

            {/* Total Periodo */}
            <Card className="bg-[#1e293b] border-slate-700 border-l-4 border-l-blue-500">
              <CardHeader className="pb-2"><CardTitle className="text-white text-[10px] font-bold uppercase tracking-widest">Total Gastado</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-black text-white">${stats.total.toLocaleString('es-AR')}</div></CardContent>
            </Card>

            {/* GRÁFICO DE EVOLUCIÓN (NUEVO) */}
            <Card className="bg-[#1e293b] border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <LineIcon className="h-4 w-4 text-blue-400" /> Evolución {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.evolutionData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorías */}
              <Card className="bg-[#1e293b] border-slate-700">
                <CardHeader><CardTitle className="text-sm font-bold uppercase text-white">Categorías</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {stats.chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                      <Legend wrapperStyle={{ color: '#fff', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Movimientos */}
              <Card className="bg-[#1e293b] border-slate-700">
                <CardHeader><CardTitle className="text-sm font-bold uppercase text-white">Movimientos</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {stats.filtered.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg"><ShoppingBag className="h-4 w-4 text-blue-400" /></div>
                        <div>
                          <p className="font-bold text-sm text-white">{expense.description}</p>
                          <p className="text-[10px] text-white/70 uppercase font-bold">{expense.paid_by}</p>
                        </div>
                      </div>
                      <p className="font-black text-white text-sm">${Number(expense.amount).toLocaleString('es-AR')}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="bg-[#1e293b] border-slate-700 p-2 sm:p-4 shadow-2xl">
              <div className="calendar-container text-white">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                  locale="es"
                  events={stats.events}
                  height="auto"
                  eventClick={handleEventClick}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalle */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#1e293b] border-slate-700 text-white max-w-[95vw] sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 uppercase font-black italic text-white tracking-tighter">
                <Info className="h-5 w-5 text-blue-500" /> Detalle
              </DialogTitle>
            </DialogHeader>
            {selectedExpense && (
              <div className="py-4 space-y-4">
                <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                  <p className="text-[10px] text-white/50 uppercase font-bold">Descripción</p>
                  <p className="text-lg font-bold text-white">{selectedExpense.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Monto</p>
                    <p className="text-xl font-black text-emerald-400">${Number(selectedExpense.amount).toLocaleString('es-AR')}</p>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Pagador</p>
                    <p className="text-sm font-black text-white uppercase">{selectedExpense.paid_by}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-row gap-3">
              <Button variant="destructive" className="flex-1 font-black italic uppercase text-xs" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" /> Borrar</Button>
              <Button className="flex-1 bg-blue-600 font-black italic uppercase text-xs" onClick={() => {
                setIsModalOpen(false);
                navigate(`/edit-expense/${selectedExpense.originalId || selectedExpense.id}`);
              }}><Edit3 className="h-4 w-4 mr-2" /> Editar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <style>{`
        .fc { background: transparent; color: white; border: none; }
        .fc-toolbar-title { font-size: 0.9rem !important; font-weight: 900; text-transform: uppercase; }
        .fc-button { background: #3b82f6 !important; border: none !important; font-size: 0.6rem !important; font-weight: bold; }
        .fc-daygrid-day { border-color: #334155 !important; }
        .fc-col-header-cell { background: #0f172a; color: #fff; font-size: 0.65rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;


