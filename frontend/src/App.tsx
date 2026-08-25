import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { InventarioLayout } from "./pages/inventario/InventarioLayout";
import { InsumosPage } from "./pages/inventario/InsumosPage";
import { CategoriasPage } from "./pages/inventario/CategoriasPage";
import { ProductosVentaPage } from "./pages/inventario/ProductosVentaPage";
import { ProductoVentaFormPage } from "./pages/inventario/ProductoVentaFormPage";
import { MesasPage } from "./pages/mesas/MesasPage";
import { MesaDetallePage } from "./pages/mesas/MesaDetallePage";
import { HistorialCuentasPage } from "./pages/mesas/HistorialCuentasPage";
import { ReportesPage } from "./pages/reportes/ReportesPage";
import { UsuariosPage } from "./pages/admin/UsuariosPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/mesas" replace />} />

              <Route path="/mesas" element={<MesasPage />} />
              <Route path="/mesas/:id" element={<MesaDetallePage />} />

              <Route
                path="/historial"
                element={
                  <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                    <HistorialCuentasPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reportes"
                element={
                  <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                    <ReportesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute rolesPermitidos={["ADMIN"]}>
                    <InventarioLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="insumos" replace />} />
                <Route path="insumos" element={<InsumosPage />} />
                <Route path="categorias" element={<CategoriasPage />} />
                <Route path="productos-venta" element={<ProductosVentaPage />} />
                <Route path="productos-venta/nuevo" element={<ProductoVentaFormPage />} />
                <Route path="productos-venta/:id/editar" element={<ProductoVentaFormPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
