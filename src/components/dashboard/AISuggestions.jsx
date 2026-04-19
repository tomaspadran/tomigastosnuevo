import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Brain, Loader2, ArrowRight, TrendingDown, Target, Zap } from 'lucide-react';
import { Button } from '../ui/button';

const AISuggestions = ({ expenses = [] }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  const generateSuggestions = () => {
    setLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const gasta = expenses.filter(e => e.transaction_type === 'gasto' || !e.transaction_type);
      if (gasta.length === 0) {
        setSuggestions([
          {
            title: "Comienza a registrar",
            description: "Aún no tengo suficientes datos para darte consejos. Registra tus primeros gastos para empezar.",
            icon: <Target className="w-4 h-4 text-indigo-400" />
          }
        ]);
        setLoading(false);
        return;
      }

      // 1. High Spending Category
      const catTotals = gasta.reduce((acc, curr) => {
        const cat = curr.category || 'Otros';
        acc[cat] = (acc[cat] || 0) + Number(curr.amount);
        return acc;
      }, {});

      const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
      const topCat = sortedCats[0];
      
      const newSuggestions = [];

      // Logic for top category
      if (topCat) {
        newSuggestions.push({
          title: `Optimiza ${topCat[0]}`,
          description: `Tu mayor gasto este mes es en ${topCat[0]} ($${topCat[1].toLocaleString('es-AR')}). Podrías ahorrar un 10% si buscas alternativas más económicas.`,
          icon: <TrendingDown className="w-4 h-4 text-rose-400" />
        });
      }

      // 2. Frequency Logic
      const recentExpenses = gasta.slice(0, 5);
      const frequency = recentExpenses.length;
      if (frequency >= 3) {
        newSuggestions.push({
          title: "Gasto Hormiga Detectado",
          description: "Has realizado varios gastos pequeños seguidos. Sumados, representan una parte importante de tu presupuesto semanal.",
          icon: <Zap className="w-4 h-4 text-amber-400" />
        });
      }

      // 3. Balance Logic
      const ingresos = expenses.filter(e => e.transaction_type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const totalGasto = gasta.reduce((acc, curr) => acc + Number(curr.amount), 0);
      if (totalGasto > ingresos * 0.8 && ingresos > 0) {
         newSuggestions.push({
          title: "Alerta de Presupuesto",
          description: "Tus gastos están alcanzando el 80% de tus ingresos. Sería prudente pausar compras no esenciales esta semana.",
          icon: <Sparkles className="w-4 h-4 text-primary" />
        });
      } else {
        newSuggestions.push({
          title: "Capacidad de Ahorro",
          description: "¡Buen trabajo! Tu balance es positivo. Podrías destinar un 15% extra a tu fondo de emergencia este mes.",
          icon: <Brain className="w-4 h-4 text-emerald-400" />
        });
      }

      setSuggestions(newSuggestions);
      setLoading(false);
      setLastAnalyzedCount(expenses.length);
    }, 1500);
  };

  useEffect(() => {
    if (expenses.length > 0 && lastAnalyzedCount === 0) {
      generateSuggestions();
    }
  }, [expenses]);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-lg font-semibold text-foreground italic uppercase flex items-center gap-2">
              Sugerencias IA
            </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateSuggestions} 
          disabled={loading}
          className="text-xs font-bold text-primary px-2 hover:bg-primary/5"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
          ACTUALIZAR
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="relative">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <Brain className="w-5 h-5 text-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-muted-foreground font-black uppercase animate-pulse">Analizando comportamientos...</p>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((s, i) => (
            <div key={i} className="flex gap-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-primary/20 transition-all group/item">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-border flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                {s.icon}
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-sm text-foreground">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground italic">Presiona el botón para generar sugerencias.</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors">
          Aprender más sobre mis finanzas <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AISuggestions;
