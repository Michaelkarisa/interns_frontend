import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/Pages/Auth/Login.jsx";
import Register from "@/Pages/Auth/Register.jsx";
import Dashboard from "@/Pages/Dashboard.jsx";
import ProtectedRoute from "@/hooks/ProtectedRoute.jsx";
import GuestLayout from "@/Layouts/GuestLayout.jsx";
import AdminLayout from "@/Layouts/AdminLayout.jsx";
import InternProfile from "@/Pages/InternProfile.jsx";
import InternsList from "@/Pages/InternsList.jsx";
import AllProjects from "@/Pages/AllProjects.jsx";
import UsersManagement from "@/Pages/UsersList.jsx";
import AuditLogs from "@/Pages/AuditLogs.jsx";
import Settings from "@/Pages/Settings.jsx";
import ForceChangePassword from "@/Pages/Auth/ForceChangePassword.jsx";

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
