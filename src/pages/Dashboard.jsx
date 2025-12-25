// src/Pages/Dashboard.jsx
// ===========================
// ZUSTAND STORE (INLINE FOR SINGLE FILE)
// ===========================
import { create } from 'zustand';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/Layouts1/ui/card';
import AnimatedNumber from '@/Layouts/AnimatedNumber';
import { CheckCircle, AlertCircle } from 'lucide-react';
import InternCard from '@/Pages/interns/InternCard';
import { useAdminStore } from '@/Stores/adminStore';
import api from '@/api/apiClient';

// ===========================
// TOAST COMPONENT
// ===========================
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const Icon = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-3 flex-shrink-0 text-gray-500 hover:text-gray-700"
          aria-label="Close notification"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
};

// ===========================
// STAT CARD COMPONENT
// ===========================
const StatCard = ({ title, value, color, textColor, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className={`${color} rounded-2xl shadow-sm border-0`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-sm font-medium ${textColor}`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${textColor}`}>
            <AnimatedNumber value={value} duration={1000} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ===========================
// ZUSTAND STORE FOR DASHBOARD
// ===========================
const useDashboardStore = create((set) => ({
  // State
  stats: {
    total: 0,
    active: 0,
    completed: 0,
    recommended: 0,
  },
  topInterns: [],
  loading: false,
  error: null,
  toast: null,

  // Actions
  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/dashboard');
      const data = response.data;
      
      // ✅ FIXED: Access data directly from data.data (your API structure)
      const dashboardData = data.data; // This contains your stats
      console.log("dashboardData: ", dashboardData);
      
      set({
        stats: {
          total: dashboardData?.totalInterns ?? 0,
          active: dashboardData?.activeInterns ?? 0,
          completed: dashboardData?.completedInterns ?? 0,
          recommended: dashboardData?.recommendedInterns ?? 0,
        },
        topInterns: Array.isArray(dashboardData?.topInterns) ? dashboardData.topInterns : [],
        loading: false,
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load dashboard data';
      set({ error: message, loading: false });
      console.error('API Error:', err);
    }
  },

  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));

// ===========================
// DASHBOARD CONTENT
// ===========================
const DashboardContent = ({ isSidebarCollapsed, stats, topInterns }) => {
  const getInternGridClass = () => {
    return isSidebarCollapsed
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2';
  };

  const statCards = [
    { title: 'Total Interns', value: stats.total, color: 'bg-blue-100', textColor: 'text-blue-700' },
    { title: 'Currently Active', value: stats.active, color: 'bg-green-100', textColor: 'text-green-700' },
    { title: 'Completed', value: stats.completed, color: 'bg-amber-100', textColor: 'text-amber-700' },
    { title: 'Recommended', value: stats.recommended, color: 'bg-purple-100', textColor: 'text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Intern Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            color={card.color}
            textColor={card.textColor}
            index={idx}
          />
        ))}
      </div>

      {/* Top Interns Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Interns</h2>
        {topInterns.length > 0 ? (
          <div className={`grid ${getInternGridClass()} gap-6`}>
            {topInterns.slice(0, 3).map((intern) => (
              <motion.div
                key={intern.id ?? `intern-${Math.random()}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <InternCard intern={intern} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 italic">No interns to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================
// MAIN DASHBOARD COMPONENT
// ===========================
const Dashboard = () => {
  const { stats, topInterns, loading, error, fetchDashboardData, toast, hideToast } = useDashboardStore();
  const { collapsed } = useAdminStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Intern Dashboard</h1>

      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Intern Dashboard</h1>

      <div className="p-6 text-center text-red-600">
        <p className="mb-4">⚠️ {error}</p>
        <button
          onClick={fetchDashboardData}
          className="text-blue-600 hover:underline font-medium"
        >
          Retry
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Dashboard Content */}
      <DashboardContent
        isSidebarCollapsed={collapsed}
        stats={stats}
        topInterns={topInterns}
      />
    </div>
  );
};

export default Dashboard;