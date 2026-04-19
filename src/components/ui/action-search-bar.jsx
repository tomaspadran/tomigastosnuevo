import { useState, useEffect } from "react";
import { Input } from "./input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Receipt,
  TrendingUp,
  PiggyBank,
  BarChart2,
  History,
  Plus,
} from "lucide-react";

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const defaultActions = [
  {
    id: "1",
    label: "Agregar Gasto",
    icon: <Receipt className="h-4 w-4 text-rose-500" />,
    description: "Nuevo registro",
    short: "",
    end: "Acción",
  },
  {
    id: "2",
    label: "Agregar Ingreso",
    icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    description: "Nuevo registro",
    short: "",
    end: "Acción",
  },
  {
    id: "3",
    label: "Agregar Ahorro",
    icon: <PiggyBank className="h-4 w-4 text-blue-500" />,
    description: "Nuevo registro",
    short: "",
    end: "Acción",
  },
  {
    id: "4",
    label: "Ver Reportes",
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: "Análisis financiero",
    short: "",
    end: "Página",
  },
  {
    id: "5",
    label: "Ver Historial",
    icon: <History className="h-4 w-4 text-purple-500" />,
    description: "Todos los movimientos",
    short: "",
    end: "Página",
  },
];

function ActionSearchBar({
  actions = defaultActions,
  onSearch,
  onActionSelect,
  searchTerm: externalSearchTerm,
  onSearchTermChange,
}) {
  const [query, setQuery] = useState(externalSearchTerm || "");
  const [result, setResult] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const debouncedQuery = useDebounce(query, 200);

  // Sync with external search term
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setQuery(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = actions.filter((action) => {
      const searchableText = action.label.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setResult({ actions: filteredActions });
  }, [debouncedQuery, isFocused, actions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearchTermChange) {
      onSearchTermChange(value);
    }
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setIsFocused(false);
    if (onActionSelect) {
      onActionSelect(action);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsFocused(false);
    if (onSearch) {
      onSearch(query);
    }
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar transacciones, categorías..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-11 pr-10 py-5 h-14 text-sm font-medium rounded-2xl bg-card/60 backdrop-blur-xl border-border/50 shadow-4k focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary/30 placeholder:text-muted-foreground/40 transition-all"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4">
            <Search className="w-4 h-4 text-muted-foreground/50" />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4">
            <AnimatePresence mode="popLayout">
              {query.length > 0 ? (
                <motion.div
                  key="send"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-muted-foreground/30" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isFocused && result && !selectedAction && (
          <motion.div
            className="absolute top-full left-0 right-0 z-50 mt-2 border border-border/50 rounded-xl shadow-2xl overflow-hidden bg-card/95 backdrop-blur-2xl"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.ul className="py-1">
              {result.actions.map((action) => (
                <motion.li
                  key={action.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-primary/5 cursor-pointer transition-colors mx-1 rounded-lg"
                  variants={item}
                  layout
                  onClick={() => handleActionClick(action)}
                >
                  <div className="flex items-center gap-3">
                    <span>{action.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {action.label}
                      </span>
                      {action.description && (
                        <span className="text-xs text-muted-foreground/60 ml-2">
                          {action.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {action.short && (
                      <span className="text-[10px] text-muted-foreground/40 font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                        {action.short}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                      {action.end}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-4 py-2.5 border-t border-border/30 bg-muted/20">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
                <span>Enter para buscar en historial</span>
                <span>ESC para cerrar</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ActionSearchBar };
export default ActionSearchBar;
