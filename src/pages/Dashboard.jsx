import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
  LineChart as LineIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

const Dashboard = () => {
  const { expenses, loading, deleteExpense } = useExpenses();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [viewType, setViewType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [selectedExpense, setSelectedExpense] = useState(null);

  const stats = useMemo(() => {
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

    const categoryData = filtered.reduce((acc, curr) => {
      const mainCat = curr.type?.split(' - ')[0] || 'Otros';
      acc[mainCat] = (acc[mainCat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(categoryData).map(name => ({
      name,
      value: categoryData[name]
    })).sort((a, b) => b.value - a.value);

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
      if (diff > (total * 0.10)) {
        const quienDebe = pagóTomi > pagóGabi ? "Gabi" : "Tomi";
        aiSuggestions.push({
          title: "Balance de Gastos",
          text: `Hay una diferencia de $${diff.toLocaleString('es-AR')}. Sería ideal que los próximos gastos los cubra ${quienDebe}.`,
          icon: <TrendingUp className="h-4 w-4 text-amber-400" />
        });
      } else {
        aiSuggestions.push({
          title: "Finanzas Equilibradas",
          text: "¡Vienen muy parejos este mes! Sigan así para mantener las cuentas claras.",
          icon: <Sparkles className="h-4 w-4 text-emerald-400" />
        });
      }
    }

    return { total, chartData, filtered, events, aiSuggestions, evolutionData };
  }, [expenses, viewType, selectedMonth, selectedYear]);

  const handleEventClick = (clickInfo) => {
    const data = clickInfo.event.extendedProps;
    if (window.confirm(`Gasto: ${data.description}\nMonto: $${data.amount}\n¿Deseas editarlo?`)) {
        navigate(`/edit-expense/${data.id}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar gasto?')) {
      await deleteExpense(id);
      toast.success('Gasto eliminado');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic uppercase">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">TrackExp</h1>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mt-1">
              <LayoutDashboard className="h-3 w-3" />
              Dashboard Principal
            </div>
          </div>
          <Button onClick={() => navigate('/add-expense')} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto font-black italic uppercase tracking-tight">
            <PlusCircle className="mr-2 h-5 w-5" /> Nuevo Gasto
          </Button>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-[#1e293b] p-1 rounded-lg w-fit border border-slate-700">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-black uppercase italic rounded-md transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Resumen
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-black uppercase italic rounded-md transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Calendario
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Filtros */}
            <Card className="bg-[#1e293b] border-slate-700 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-white" />
                <select 
                  value={viewType} 
                  onChange={(e) => setViewType(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 text-white text-xs font-bold p-2 rounded-md uppercase"
                >
                  <option value="month">Mensual</option>
                  <option value="year">Anual</option>
                </select>
                
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#0f172a] border border-slate-700 text-white text-xs font-bold p-2 rounded-md uppercase"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>

                {viewType === 'month' && (
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-[#0f172a] border border-slate-700 text-white text-xs font-bold p-2 rounded-md uppercase"
                  >
                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => (
                      <option key={m} value={i.toString()}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
            </Card>

            {/* Total */}
            <Card className="bg-[#1e293b] border-slate-700 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Total Gastado</p>
                <div className="text-4xl font-black text-white italic">${stats.total.toLocaleString('es-AR')}</div>
              </CardContent>
            </Card>

            {/* Sugerencias */}
            {stats.aiSuggestions.map((sug, i) => (
              <div key={i} className="bg-gradient-to-r from-blue-900/40 to-transparent p-4 rounded-xl border border-blue-500/30 flex gap-4 items-center">
                {sug.icon}
                <div>
                  <h4 className="text-xs font-black text-white uppercase">{sug.title}</h4>
                  <p className="text-xs text-slate-300 italic">{sug.text}</p>
                </div>
              </div>
            ))}

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1e293b] border-slate-700 p-4">
                <CardTitle className="text-xs font-black uppercase text-white mb-4">Evolución Gastos</CardTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(value) => `$${value/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="bg-[#1e293b] border-slate-700 p-4">
                <CardTitle className="text-xs font-black uppercase text-white mb-4">Distribución</CardTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.chartData} innerRadius={60} outerRadius={80} dataKey="value">
                        {stats.chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Lista */}
            <div className="space-y-3">
               <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Movimientos recientes</h3>
               {stats.filtered.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg"><ShoppingBag className="h-4 w-4 text-blue-400" /></div>
                    <div>
                      <p className="font-bold text-sm text-white italic uppercase">{expense.description}</p>
                      <p className="text-[10px] text-blue-400 font-black uppercase">{expense.paid_by} • {expense.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black text-white text-lg italic">${Number(expense.amount).toLocaleString('es-AR')}</p>
                    <div className="flex gap-1">
                       <button onClick={() => navigate(`/edit-expense/${expense.id}`)} className="p-2 text-slate-400 hover:text-white"><Edit3 className="h-4 w-4" /></button>
                       <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-[#1e293b] border-slate-700 p-4">
             <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="es"
                events={stats.events}
                eventClick={handleEventClick}
                headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                height="auto"
              />
          </Card>
        )}
      </div>

      <style>{`
        .fc { background: transparent; color: white !important; font-family: inherit; }
        .fc-toolbar-title { font-size: 1rem !important; font-weight: 900; text-transform: uppercase; font-style: italic; }
        .fc-button { background: #3b82f6 !important; border: none !important; text-transform: uppercase; font-size: 0.7rem !important; font-weight: 900; }
        .fc-daygrid-day { border-color: #334155 !important; }
        .fc-col-header-cell { background: #0f172a; padding: 8px 0 !important; }
        .fc-daygrid-day-number { font-size: 0.8rem; font-weight: bold; padding: 4px !important; }
        .fc-event { cursor: pointer; border-radius: 4px; padding: 2px 4px; font-size: 0.7rem; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default Dashboard;



