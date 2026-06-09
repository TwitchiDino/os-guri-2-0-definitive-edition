import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Redirect from '../pages/Redirect';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from '../context/AuthContext';

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/r/:code" element={<Redirect />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          {/* Rota raiz redireciona para dashboard se autenticado, senão para login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Rota genérica para 404 */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              backgroundColor: '#1a202c',
              color: '#a0aec0',
              fontFamily: 'system-ui, sans-serif'
            }}>
              404 - Página não encontrada
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
