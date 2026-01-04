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
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon, 
  ShoppingBag,
  Filter,
  LayoutDashboard,
  Trash2,
  Edit3,
  Info,
  Sparkles // Icono para la IA
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
    // 1. Lógica de filtrado
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

    // 2. Cálculos básicos
    const total = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóTomi = filtered.filter(e => e.paid_by === 'Tomi').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pagóGabi = filtered.filter(e => e.paid_by === 'Gabi').reduce((acc, curr) => acc + Number(curr.amount), 0);

    const categoryData = filtered.reduce((acc, curr) => {
      const mainCat = curr.type.split(' - ')[0];
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name]
    })).sort((a, b) => b.value - a.value);

    // 3. Eventos Calendario
    const events = expenses.map(exp => ({
      id: exp.id,
      title: `${exp.paid_by}: $${Number(exp.amount).toLocaleString('es-AR')}`,
      date: exp.date,
      backgroundColor: exp.paid_by === 'Tomi' ? '#0ea5e9' : '#ec4899',
      borderColor: exp.paid_by === 'Tomi' ? '#0ea5e9' : '#ec4899',
      extendedProps: { ...exp },
      allDay: true
    }));

    // 4. GENERACIÓN DE SUGERENCIAS IA (Lógica Simulada)
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

      const comidaGasto = categoryData["Comida"] || 0;
      if (comidaGasto > (total * 0.4)) {
        aiSuggestions.push({
          title: "Alerta de Categoría",
          text: "El gasto en Comida representa más del 40% del total. Podrían ahorrar cocinando más en casa.",
          icon: <ShoppingBag className="h-4 w-4 text-red-400" />
        });
      }
    }

    if (aiSuggestions.length === 0 && filtered.length > 0) {
      aiSuggestions.push({
        title: "Finanzas en Orden",
        text: "¡Excelente equilibrio! Sigan manteniendo este ritmo de gastos compartidos.",
        icon: <Sparkles className="h-4 w-4 text-emerald-400" />
      });
    }

    return { total, pagóTomi, pagóGabi, chartData, filtered, events, aiSuggestions };
  }, [expenses, viewType, selectedMonth, selectedYear]);

  const handleEventClick = (clickInfo) => {
    setSelectedExpense(clickInfo.event.extendedProps);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      await deleteExpense(selectedExpense.id);
      setIsModalOpen(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold tracking-widest uppercase italic">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Gastos Tomi-Gabi</h1>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mt-1">
              <LayoutDashboard className="h-3 w-3" />
              {viewType === 'month' && `${new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(2024, selectedMonth))} ${selectedYear}`}
              {viewType === 'year' && `Año Completo ${selectedYear}`}
              {viewType === 'all' && "Historial Completo"}
            </div>
          </div>
          <Button onClick={() => navigate('/add-expense')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 w-full md:w-auto font-black italic uppercase tracking-tight">
            <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Gasto
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1e293b] border-slate-700">
            <TabsTrigger value="overview" className="text-xs uppercase font-bold">Resumen Estadístico</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs uppercase font-bold">Vista Calendario</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-[#1e293b] border-slate-700 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger className="w-[150px] bg-[#0f172a] border-slate-700 text-xs font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                    <SelectItem value="month">Por Mes</SelectItem>
                    <SelectItem value="year">Año Completo</SelectItem>
                    <SelectItem value="all">Historial Completo</SelectItem>
                  </SelectContent>
                </Select>

                {viewType !== 'all' && (
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px] bg-[#0f172a] border-slate-700 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {viewType === 'month' && (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[130px] bg-[#0f172a] border-slate-700 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-white">
                      {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                        <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1e293b] border-slate-700 border-l-4 border-l-blue-500">
                <CardHeader className="pb-2"><CardTitle className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Periodo</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black text-white">${stats.total.toLocaleString('es-AR')}</div></CardContent>
              </Card>
              <Card className="bg-[#1e293b] border-slate-700 border-l-4 border-l-sky-400">
                <CardHeader className="pb-2"><CardTitle className="text-sky-400 text-[10px] font-bold uppercase tracking-widest">Aportó Tomi</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-sky-400">${stats.pagóTomi.toLocaleString('es-AR')}</div></CardContent>
              </Card>
              <Card className="bg-[#1e293b] border-slate-700 border-l-4 border-l-pink-400">
                <CardHeader className="pb-2"><CardTitle className="text-pink-400 text-[10px] font-bold uppercase tracking-widest">Aportó Gabi</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-pink-400">${stats.pagóGabi.toLocaleString('es-AR')}</div></CardContent>
              </Card>
            </div>

            {/* SECCIÓN DE SUGERENCIAS IA */}
            <Card className="bg-gradient-to-br from-[#1e293b] to-[#1e1b4b] border-blue-500/30 shadow-xl overflow-hidden">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-xs font-black uppercase italic tracking-widest flex items-center gap-2 text-blue-400">
                  <Sparkles className="h-4 w-4" /> Sugerencias IA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {stats.aiSuggestions.map((sug, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 items-start">
                    <div className="mt-0.5">{sug.icon}</div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-tight">{sug.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">{sug.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1e293b] border-slate-700">
                <CardHeader><CardTitle className="text-sm font-bold uppercase">Distribución por Categoría</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.chartData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {stats.chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1e293b] border-slate-700">
                <CardHeader><CardTitle className="text-sm font-bold uppercase">Movimientos del Periodo</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {stats.filtered.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg"><ShoppingBag className="h-4 w-4 text-blue-400" /></div>
                        <div>
                          <p className="font-bold text-sm text-white">{expense.description}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{expense.type} • {expense.paid_by}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-sm">${Number(expense.amount).toLocaleString('es-AR')}</p>
                        <p className="text-[10px] text-slate-500">{new Date(expense.date).toLocaleDateString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="bg-[#1e293b] border-slate-700 p-2 sm:p-4 overflow-hidden shadow-2xl">
              <div className="calendar-container text-white">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                  }}
                  locale="es"
                  events={stats.events}
                  height="auto"
                  eventClick={handleEventClick}
                  buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana' }}
                  eventContent={(eventInfo) => (
                    <div className="px-1 py-0.5 text-[9px] sm:text-[11px] font-bold truncate cursor-pointer">
                      {eventInfo.event.title}
                    </div>
                  )}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MODAL DE DETALLES DEL GASTO */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#1e293b] border-slate-700 text-white max-w-[95vw] sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 uppercase font-black italic tracking-tighter">
                <Info className="h-5 w-5 text-blue-500" /> Detalle del Gasto
              </DialogTitle>
            </DialogHeader>
            
            {selectedExpense && (
              <div className="py-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Descripción</p>
                    <p className="text-lg font-bold">{selectedExpense.description}</p>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Monto</p>
                    <p className="text-xl font-black text-emerald-400">${Number(selectedExpense.amount).toLocaleString('es-AR')}</p>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha</p>
                    <p className="text-sm font-bold">{new Date(selectedExpense.date).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Categoría</p>
                    <p className="text-xs font-bold text-blue-400 uppercase">{selectedExpense.type}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${selectedExpense.paid_by === 'Tomi' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-pink-500/10 border-pink-500/30'}`}>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pagado por</p>
                    <p className={`text-sm font-black uppercase ${selectedExpense.paid_by === 'Tomi' ? 'text-sky-400' : 'text-pink-400'}`}>
                      {selectedExpense.paid_by}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-row gap-3">
              <Button 
                variant="destructive" 
                className="flex-1 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 uppercase font-bold italic text-xs"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 uppercase font-bold italic text-xs"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate(`/edit-expense/${selectedExpense.id}`);
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <style>{`
        .fc { background: transparent; color: white; border: none; font-family: inherit; }
        .fc-toolbar-title { font-size: 1rem !important; font-weight: 900; text-transform: uppercase; }
        .fc-button { background: #3b82f6 !important; border: none !important; text-transform: uppercase; font-size: 0.6rem !important; font-weight: bold; }
        .fc-daygrid-day { border-color: #334155 !important; }
        .fc-day-today { background: rgba(59, 130, 246, 0.1) !important; }
        .fc-col-header-cell { background: #0f172a; padding: 8px 0 !important; font-size: 0.65rem; color: #94a3b8; }
        .fc-event { border: none !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #334155 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;

