import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./hooks/ProtectedRoute";
import GuestLayout from "./Layouts/GuestLayout";
import AdminLayout from "./Layouts/AdminLayout";
import InternProfile from "./pages/InternProfile";
import InternsList from "./pages/InternsList";
import AllProjects from "./pages/AllProjects";
import UsersManagement from "./pages/UsersList";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import ForceChangePassword from "./pages/Auth/ForceChangePassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Guest routes */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/force-change-password" element={<ForceChangePassword/>}/>
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interns" element={<InternsList />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/auditlogs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/interns/profile/:id" element={<InternProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
