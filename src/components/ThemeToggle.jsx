import React from 'react';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  // Determinamos si estamos en tema oscuro de forma robusta
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-10 h-10 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-500 animate-in zoom-in duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 animate-in zoom-in duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
