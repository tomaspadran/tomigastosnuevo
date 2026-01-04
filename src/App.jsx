import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import { Toaster } from 'sonner';

// Componente para proteger rutas (si no hay usuario, manda al login)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Cargando sesión...
      </div>
    );
  }

  return user ? children : <Navigate transition to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-[#0f172a]">
            <Routes>
              {/* Ruta Pública: Login */}
              <Route path="/" element={<Login />} />

              {/* Rutas Privadas: Solo accesibles si estás logueado */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/add-expense" 
                element={
                  <PrivateRoute>
                    <AddExpense />
                  </PrivateRoute>
                } 
              />

              {/* Redirección por defecto si la ruta no existe */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            
            {/* Notificaciones flotantes (toast) */}
            <Toaster position="top-center" richColors />
          </div>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
