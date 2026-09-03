import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/notifications/ToastContainer';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Login } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Onboarding } from './pages/Onboarding';

import { ClientLayout } from './layouts/ClientLayout';
import { Catalog } from './pages/Catalog';
import { OrderHistory } from './pages/client/OrderHistory';
import { ClientSettings } from './pages/client/ClientSettings';
import { CartPage } from './pages/client/CartPage';

import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { OrderManager } from './pages/admin/OrderManager';
import { SettingsManager } from './pages/admin/SettingsManager';
import { ClientManager } from './pages/admin/ClientManager';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <ToastContainer />
                <Routes>
                  {/* Rutas Públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
                  
                  {/* Rutas de Tránsito (Requiere Login, pero NO requiere perfil completado) */}
                  <Route path="/completar-perfil" element={
                    <ProtectedRoute requireProfile={false}>
                      <Onboarding />
                    </ProtectedRoute>
                  } />
                  
                  {/* Rutas del Cliente (Layout + Submódulos) */}
                  <Route element={
                    <ProtectedRoute requireProfile={true}>
                      <ClientLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/catalogo" element={<Catalog />} />
                    <Route path="/mis-pedidos" element={<OrderHistory />} />
                    <Route path="/configuracion" element={<ClientSettings />} />
                    <Route path="/carrito" element={<CartPage />} />
                  </Route>
                  
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
            </CartProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
