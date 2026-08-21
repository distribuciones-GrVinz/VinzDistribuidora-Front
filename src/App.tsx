import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Catalog } from './pages/Catalog';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLayout } from './layouts/AdminLayout';
import { ProductManager } from './pages/admin/ProductManager';
import { OrderManager } from './pages/admin/OrderManager';
import { SettingsManager } from './pages/admin/SettingsManager';
import { ClientManager } from './pages/admin/ClientManager';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas de Tránsito (Requiere Login, pero NO requiere perfil completado) */}
          <Route path="/completar-perfil" element={
            <ProtectedRoute requireProfile={false}>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Rutas Privadas (Requiere Login Y perfil completado) */}
          <Route path="/catalogo" element={
            <ProtectedRoute requireProfile={true}>
              <Catalog />
            </ProtectedRoute>
          } />
          
          {/* Rutas del Portal Admin (Layout + Submódulos) */}
          <Route path="/admin" element={
            <ProtectedRoute requireProfile={false}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="productos" element={<ProductManager />} />
            <Route path="pedidos" element={<OrderManager />} />
            <Route path="clientes" element={<ClientManager />} />
            <Route path="configuracion" element={<SettingsManager />} />
          </Route>
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
