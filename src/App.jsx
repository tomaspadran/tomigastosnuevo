import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import Profiles from './pages/Profiles';
import History from './pages/History';
import Reports from './pages/Reports';
import Stats from './pages/Stats';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold uppercase tracking-tighter italic">
        Cargando sesión...
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="tomigastos-theme">
      <AuthProvider>
        <ExpenseProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative">
              <div className="grain" />
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

                <Route 
                  path="/profiles" 
                  element={
                    <PrivateRoute>
                      <Profiles />
                    </PrivateRoute>
                  } 
                />

                <Route 
                  path="/history" 
                  element={
                    <PrivateRoute>
                      <History />
                    </PrivateRoute>
                  } 
                />

                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  } 
                />

                <Route 
                  path="/stats" 
                  element={
                    <PrivateRoute>
                      <Stats />
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
    </ThemeProvider>
  );
}

export default App;
