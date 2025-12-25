import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/Pages/Auth/Login";
import Register from "@/Pages/Auth/Register";
import Dashboard from "@/Pages/Dashboard";
import ProtectedRoute from "@/hooks/ProtectedRoute";
import GuestLayout from "@/Layouts/GuestLayout";
import AdminLayout from "@/Layouts/AdminLayout";
import InternProfile from "@/Pages/InternProfile";
import InternsList from "@/Pages/InternsList";
import AllProjects from "@/Pages/AllProjects";
import UsersManagement from "@/Pages/UsersList";
import AuditLogs from "@/Pages/AuditLogs";
import Settings from "@/Pages/Settings";
import ForceChangePassword from "@/Pages/Auth/ForceChangePassword";

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
