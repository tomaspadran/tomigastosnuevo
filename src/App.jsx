import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Login from './pages/Login';
import { Toaster } from 'sonner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Cargando...</div>;
  return user ? children : <Navigate replace to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-slate-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/add-expense" element={<PrivateRoute><AddExpense /></PrivateRoute>} />
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
            </Routes>
          </div>
          <Toaster position="top-center" richColors />
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
