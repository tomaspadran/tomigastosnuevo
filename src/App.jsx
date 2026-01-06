import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import { Toaster } from 'sonner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold uppercase tracking-tighter italic">
        Cargando sesión...
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-[#0f172a]">
            <Routes>
              <Route path="/" element={<Login />} />
              
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

              <Route 
                path="/edit-expense/:id" 
                element={
                  <PrivateRoute>
                    <EditExpense />
                  </PrivateRoute>
                } 
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster position="top-center" richColors />
          </div>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
