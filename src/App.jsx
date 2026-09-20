import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import DashboardHome from "./pages/DashboardHome";
import Boutique from "./pages/Boutique";
import Produits from "./pages/Produits";
import Demandes from "./pages/Demandes";
import Horaires from "./pages/Horaires";
import BoutiquesAdmin from "./pages/BoutiquesAdmin";
import Signalements from "./pages/Signalements";
import CategoriesAdmin from "./pages/CategoriesAdmin";
import JournalAuditAdmin from "./pages/JournalAuditAdmin";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardHome />
          </Protected>
        }
      />

      {!isAdmin && (
        <>
          <Route
            path="/boutique"
            element={
              <Protected>
                <Boutique />
              </Protected>
            }
          />
          <Route
            path="/produits"
            element={
              <Protected>
                <Produits />
              </Protected>
            }
          />
          <Route
            path="/demandes"
            element={
              <Protected>
                <Demandes />
              </Protected>
            }
          />
          <Route
            path="/horaires"
            element={
              <Protected>
                <Horaires />
              </Protected>
            }
          />
        </>
      )}

      {isAdmin && (
        <>
          <Route
            path="/boutiques"
            element={
              <Protected>
                <BoutiquesAdmin />
              </Protected>
            }
          />
          <Route
            path="/signalements"
            element={
              <Protected>
                <Signalements />
              </Protected>
            }
          />
          <Route
            path="/categories-admin"
            element={
              <Protected>
                <CategoriesAdmin />
              </Protected>
            }
          />
          <Route
            path="/journaux-audit"
            element={
              <Protected>
                <JournalAuditAdmin />
              </Protected>
            }
          />
        </>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}