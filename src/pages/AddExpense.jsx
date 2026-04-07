import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save, PlusCircle, TrendingUp, PiggyBank, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

// Estructura de categorías y subcategorías
const CATEGORIES_STRUCTURE = {
  "Gasto": {
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
  },
  "Ingreso": {
    "Sueldo": ["General"],
    "Venta": ["General"],
    "Otros": ["General"]
  },
  "Ahorro": {
    "Ahorro Personal": ["General"],
    "Ahorro Compartido": ["General"],
    "Fondo de Emergencia": ["General"]
  }
};

const AddExpense = () => {
  const { addExpense } = useExpenses();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener el tipo de la URL (?type=ingreso/gasto/ahorro)
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type') || 'gasto';
  
  // Mapear el parámetro al nombre correcto de la categoría
  const initialTransactionType = typeParam === 'ingreso' ? 'Ingreso' : (typeParam === 'ahorro' ? 'Ahorro' : 'Gasto');
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transactionType: initialTransactionType,
    category: Object.keys(CATEGORIES_STRUCTURE[initialTransactionType])[0],
    subCategory: CATEGORIES_STRUCTURE[initialTransactionType][Object.keys(CATEGORIES_STRUCTURE[initialTransactionType])[0]][0],
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Efectivo',
    paidBy: 'Tomi',
    installments: 1
  });

  // Efecto para actualizar la subcategoría cuando cambia la categoría principal o el tipo de transacción
  useEffect(() => {
    const availableCategories = Object.keys(CATEGORIES_STRUCTURE[formData.transactionType]);
    
    // Si la categoría actual no pertenece al nuevo tipo de transacción, reseteamos a la primera disponible
    if (!availableCategories.includes(formData.category)) {
      const firstCat = availableCategories[0];
      const firstSub = CATEGORIES_STRUCTURE[formData.transactionType][firstCat][0];
      setFormData(prev => ({
        ...prev,
        category: firstCat,
        subCategory: firstSub
      }));
    } else {
      // Si la categoría es válida, solo actualizamos la subcategoría si es necesario
      const subs = CATEGORIES_STRUCTURE[formData.transactionType][formData.category];
      if (!subs.includes(formData.subCategory)) {
        setFormData(prev => ({
          ...prev,
          subCategory: subs[0]
        }));
      }
    }
  }, [formData.transactionType, formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Para Gastos e Ingresos, usamos el detalle (o motivo). Para Ahorros, usamos la categoría.
    const finalDescription = (formData.transactionType === 'Gasto' || formData.transactionType === 'Ingreso')
      ? formData.description 
      : `${formData.transactionType}: ${formData.category}`;

    if (!finalDescription || !formData.amount) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      // Unimos Categoría + Subcategoría para el campo "type" (compatibilidad visual)
      const finalType = formData.transactionType === 'Gasto' 
        ? (formData.subCategory === 'General' ? formData.category : `${formData.category} - ${formData.subCategory}`)
        : formData.category;
      
      const expenseData = {
        description: finalDescription,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: finalType,
        category: formData.category,
        subcategory: formData.subCategory,
        payment_method: formData.paymentMethod,
        paid_by: formData.paidBy,
        installments: formData.installments,
        transaction_type: formData.transactionType.toLowerCase() // 'gasto', 'ingreso' o 'ahorro'
      };

      await addExpense(expenseData);
      
      toast.success(`${formData.transactionType} guardado correctamente!`);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    }
  };

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

        <Card className="bg-card/90 backdrop-blur border-border shadow-2xl transition-all duration-300">
          <CardContent>
            <div className="flex justify-center mb-6">
              <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 decoration-4 underline-offset-8">
                {formData.transactionType === 'Gasto' ? 'NUEVO GASTO' : 
                 formData.transactionType === 'Ingreso' ? 'NUEVO INGRESO' : 'NUEVO AHORRO'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tipo de Movimiento */}
              <div className="space-y-3">
                <Label className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Tipo de Movimiento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Gasto', icon: Receipt },
                    { type: 'Ingreso', icon: TrendingUp },
                    { type: 'Ahorro', icon: PiggyBank }
                  ].map(({ type, icon: Icon }) => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.transactionType === type ? 'default' : 'outline'}
                      className={`h-12 font-black uppercase text-xs transition-all duration-300 rounded-xl ${
                        formData.transactionType === type 
                          ? 'shadow-lg shadow-primary/25 scale-[1.02] bg-primary' 
                          : 'text-muted-foreground opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                      onClick={() => setFormData({...formData, transactionType: type})}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Condicional: Detalle para Gastos e Ingresos */}
              {(formData.transactionType === 'Gasto' || formData.transactionType === 'Ingreso') && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="description" className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">
                    {formData.transactionType === 'Ingreso' ? 'Motivo' : 'Detalle del Gasto'}
                  </Label>
                  <Input 
                    id="description"
                    required
                    placeholder={formData.transactionType === 'Ingreso' ? 'Ej: Sueldo Marzo' : 'Ej: Expensas Enero'}
                    className="bg-background border-input text-foreground h-12 hover:border-primary/50 transition-colors focus:ring-2 focus:ring-primary/20 rounded-xl"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              )}

              {/* Monto (Siempre presente) */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Monto ($)</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary group-focus-within:scale-110 transition-transform">$</span>
                  <Input 
                    id="amount"
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="bg-slate-50 dark:bg-slate-900 border-none text-foreground h-20 pl-12 text-4xl font-black hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all focus:ring-4 focus:ring-primary/10 rounded-2xl shadow-inner"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>

              {/* Campos Condicionales para Gasto (Categoría, Sub, Pagó, Método) */}
              {formData.transactionType === 'Gasto' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Categoría</Label>
                      <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                        <SelectTrigger className="bg-background border-input text-foreground h-12 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl">
                          {Object.keys(CATEGORIES_STRUCTURE[formData.transactionType]).map(cat => (
                            <SelectItem key={cat} value={cat} className="font-bold py-3">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Sub-categoría</Label>
                      <Select value={formData.subCategory} onValueChange={(val) => setFormData({...formData, subCategory: val})}>
                        <SelectTrigger className="bg-background border-input text-foreground h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl">
                          {CATEGORIES_STRUCTURE[formData.transactionType][formData.category]?.map(sub => (
                            <SelectItem key={sub} value={sub} className="font-medium py-3">{sub}</SelectItem>
                          )) || <SelectItem value="General">General</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Pagó</Label>
                      <Select value={formData.paidBy} onValueChange={(val) => setFormData({...formData, paidBy: val})}>
                        <SelectTrigger className="bg-background border-input text-foreground h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl">
                          <SelectItem value="Tomi" className="font-bold">Tomi</SelectItem>
                          <SelectItem value="Gabi" className="font-bold">Gabi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Método</Label>
                      <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
                        <SelectTrigger className="bg-background border-input text-foreground h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl">
                          <SelectItem value="Efectivo" className="font-medium">Efectivo</SelectItem>
                          <SelectItem value="Credito" className="font-medium">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden fields for Ahorro/Ingreso to ensure data consistency if needed */}
              {formData.transactionType === 'Ahorro' && (
                <>
                  <input type="hidden" name="description" value={formData.description || `Ahorro: ${formData.category}`} />
                  <input type="hidden" name="paidBy" value="Tomi" />
                  <input type="hidden" name="paymentMethod" value="Efectivo" />
                  <input type="hidden" name="installments" value="1" />
                </>
              )}
              {formData.transactionType === 'Ingreso' && (
                <>
                  <input type="hidden" name="paidBy" value="Tomi" />
                  <input type="hidden" name="paymentMethod" value="Efectivo" />
                  <input type="hidden" name="installments" value="1" />
                </>
              )}

              {/* Fecha (Siempre) */}
              <div className="space-y-2">
                <Label className="text-foreground/80 font-bold uppercase tracking-wider text-[10px]">Fecha</Label>
                <Input 
                  type="date"
                  className="bg-slate-50 dark:bg-slate-900 border-none text-foreground h-14 w-full rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all focus:ring-2 focus:ring-primary/20 dark:[color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              {/* Cuotas (Habilitado si es Credito) */}
              {formData.paymentMethod === 'Credito' && (
                <div className="p-4 border border-primary/30 rounded-xl bg-primary/5 animate-in fade-in zoom-in duration-300">
                  <Label className="text-primary font-bold">Cantidad de Cuotas</Label>
                  <Input 
                    type="number" 
                    min="1"
                    className="bg-background border-input text-foreground mt-2 hover:border-primary/50 transition-colors focus:ring-2 focus:ring-primary/20"
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: e.target.value})}
                  />
                  <p className="text-[10px] text-muted-foreground mt-2 italic">* Los gastos con tarjeta de crédito se imputan el primer día del mes siguiente. Se crearán {formData.installments} cuotas mensuales (Ej: si hoy es abril, la primera cuota se imputa en mayo).</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-black uppercase shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                <Save className="mr-2 h-6 w-6" /> Guardar {formData.transactionType}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

export default AddExpense;


